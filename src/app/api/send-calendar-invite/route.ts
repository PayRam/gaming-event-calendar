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
    const formatDateForCalendar = (dateStr: string): string => {
      const [day, month, year] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
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
    const endDateFormatted = formatDateForCalendar(endDate);
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
    }
    .header {
      background: linear-gradient(135deg, #6A0DAD 0%, #FF00FF 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #ddd;
      border-radius: 0 0 10px 10px;
    }
    .event-details {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #CAFF54;
    }
    .detail-row {
      margin: 15px 0;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-label {
      font-weight: bold;
      color: #6A0DAD;
      display: inline-block;
      min-width: 100px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #CAFF54;
      color: #000;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎮 Gaming Event Calendar Invite</h1>
    <p>From PayRam</p>
  </div>
  
  <div class="content">
    <p>Hi ${userName},</p>
    
    <p>Thank you for your interest in <strong>${eventName}</strong>! We're excited to share this event with you.</p>
    
    <div class="event-details">
      <h2 style="color: #6A0DAD; margin-top: 0;">${eventName}</h2>
      
      <div class="detail-row">
        <span class="detail-label">📍 Location:</span>
        <span>${eventLocation}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">📅 Start Date:</span>
        <span>${startDateDisplay}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">📅 End Date:</span>
        <span>${endDateDisplay}</span>
      </div>
      
      ${
        eventWebsite
          ? `
      <div class="detail-row">
        <span class="detail-label">🌐 Website:</span>
        <a href="${eventWebsite}" style="color: #FF00FF;">${eventWebsite}</a>
      </div>
      `
          : ""
      }
      
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">📝 Description:</span>
        <p style="margin: 10px 0 0 0; color: #666;">${eventDescription.substring(
          0,
          300
        )}${eventDescription.length > 300 ? "..." : ""}</p>
      </div>
    </div>
    
    <p><strong>The calendar invite is attached to this email.</strong> Simply open the attachment to add this event to your calendar.</p>
    
    ${
      eventWebsite
        ? `
    <center>
      <a href="${eventWebsite}" class="button">VISIT EVENT WEBSITE</a>
    </center>
    `
        : ""
    }
    
    <p style="margin-top: 30px;">Looking forward to seeing you at the event!</p>
    
    <p>Best regards,<br><strong>The PayRam Team</strong></p>
  </div>
  
  <div class="footer">
    <p>This email was sent because you requested a calendar invite for ${eventName}</p>
    <p>Industry: ${userIndustry}</p>
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
