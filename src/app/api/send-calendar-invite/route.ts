import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const NOTION_REGISTERATION_DATABASE_ID =
  process.env.NOTION_REGISTERATION_DATABASE_ID!;

export async function POST(request: NextRequest) {
  try {
    const {
      userName,
      userEmail,
      userIndustry,
      eventName,
      eventDescription,
      eventLocation,
      startDate,
      endDate,
      eventWebsite,
    } = await request.json();

    // Validate required fields
    if (
      !userName ||
      !userEmail ||
      !userIndustry ||
      !eventName ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format dates for calendar invite
    const formatDateForCalendar = (
      dateStr: string,
      addDay: boolean = false
    ): string => {
      const [day, month, year] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      // Add one day to the end date to make it inclusive
      if (addDay) {
        date.setDate(date.getDate() + 1);
      }

      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const formatDateForDisplay = (dateStr: string): string => {
      const [day, month, year] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const startDateFormatted = formatDateForCalendar(startDate);
    // Add one day to end date to make it inclusive
    const endDateFormatted = formatDateForCalendar(endDate, true);
    const startDateDisplay = formatDateForDisplay(startDate);
    const endDateDisplay = formatDateForDisplay(endDate);

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Create calendar event in ICS format
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PayRam//Gaming Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTART:${startDateFormatted}
DTEND:${endDateFormatted}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
ORGANIZER;CN=PayRam:mailto:${process.env.GMAIL_USER}
UID:${Date.now()}@payram.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${userName}:mailto:${userEmail}
SUMMARY:${eventName}
DESCRIPTION:${eventDescription.replace(/\n/g, "\\n")}${
      eventWebsite ? `\\n\\nWebsite: ${eventWebsite}` : ""
    }
LOCATION:${eventLocation}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${eventName}
END:VALARM
END:VEVENT
END:VCALENDAR`;

    // Extract first name from userName
    const firstName = userName.split(" ")[0];

    // Format date range for display
    const dateRange =
      startDate === endDate
        ? startDateDisplay
        : `${startDateDisplay} - ${endDateDisplay}`;

    // Email HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .content {
      margin: 20px 0;
    }
    .event-details {
      margin: 20px 0;
      padding-left: 20px;
    }
    .event-details li {
      margin: 10px 0;
      color: #333;
    }
    .event-details strong {
      color: #000;
    }
    .signature {
      margin-top: 30px;
      color: #333;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 13px;
      line-height: 1.5;
    }
    .footer a {
      color: #6A0DAD;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="content">
      <p>Hi ${firstName},</p>
      
      <p>Thank you for your interest in <strong>${eventName}</strong>.</p>
      
      <p>Here are event details:</p>
      
      <ul class="event-details">
        <li><strong>Date:</strong> ${dateRange}</li>
        <li><strong>Location:</strong> ${eventLocation}</li>
        ${
          eventWebsite
            ? `<li><strong>Website & tickets info:</strong> <a href="${eventWebsite}" style="color: #6A0DAD;">${eventWebsite}</a></li>`
            : ""
        }
      </ul>
      
      <div class="signature">
        <p>Regards,<br>
        <strong>Krishna Teja</strong></p>
      </div>
    </div>
    
    <div class="footer">
      <p>This email is sent via the <strong>iGaming Events Calendar</strong>, supported by <strong>PayRam</strong>, a self-hosted stablecoin payment gateway for borderless onchain payments. Learn more at <a href="https://payram.com" target="_blank">https://payram.com</a>.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email with calendar attachment and create registration record in parallel
    const [emailResult, registrationResult] = await Promise.allSettled([
      transporter.sendMail({
        from: `PayRam Gaming Events <${process.env.GMAIL_USER}>`,
        to: userEmail,
        subject: `Calendar Invite: ${eventName}`,
        html: htmlContent,
        attachments: [
          {
            filename: "event.ics",
            content: icsContent,
            contentType: "text/calendar; charset=utf-8; method=REQUEST",
          },
        ],
      }),
      createRegistrationRecord(userName, userEmail, userIndustry),
    ]);

    // Check if email sending failed
    if (emailResult.status === "rejected") {
      throw new Error("Failed to send calendar invite email");
    }

    // Log the user details for analytics
    console.log("Calendar invite sent to:", {
      userName,
      userEmail,
      userIndustry,
      eventName,
      registrationRecorded: registrationResult.status === "fulfilled",
    });

    return NextResponse.json({
      success: true,
      message: "Calendar invite sent successfully",
      registrationId:
        registrationResult.status === "fulfilled"
          ? registrationResult.value.id
          : null,
    });
  } catch (error) {
    console.error("Error sending calendar invite:", error);
    return NextResponse.json(
      { error: "Failed to send calendar invite" },
      { status: 500 }
    );
  }
}

async function createRegistrationRecord(
  name: string,
  email: string,
  industry: string
) {
  return notion.pages.create({
    parent: { database_id: NOTION_REGISTERATION_DATABASE_ID },
    properties: {
      name: {
        title: [{ text: { content: name } }],
      },
      email: {
        email: email,
      },
      industry: {
        rich_text: [{ text: { content: industry } }],
      },
    },
  });
}
