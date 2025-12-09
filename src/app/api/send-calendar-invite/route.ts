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
METHOD:PUBLISH
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
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        .main-container {
            box-sizing: border-box;
            width: 100%;
            padding: 64px 32px;
        }

        .content-container {
            box-sizing: border-box;
            max-width: 610px;
            width: 100%;
            margin: 0 auto;
        }

        .body-content {
            box-sizing: border-box;
            padding: 24px 32px 56px;
            width: 100%;
        }

        .divider {
            width: 100%;
            min-width: 0;
            max-width: 100%;
            margin: 0 0 24px 0;
        }

        @media only screen and (max-width: 600px) {
            .main-container {
                padding: 32px 8px !important;
            }

            .content-container {
                max-width: 100% !important;
                padding: 0 !important;
            }

            .body-content {
                padding: 16px 8px 32px !important;
            }

            .divider {
                width: 100% !important;
                margin: 0 0 16px 0 !important;
            }

            h1 {
                font-size: 20px !important;
                line-height: 30px !important;
            }

            p,
            .body-text {
                font-size: 14px !important;
                line-height: 24px !important;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div class="main-container" style="width: 100%; padding: 64px 32px; background: #F2F6F9;">
        <div class="content-container"
            style="max-width: 610px; width: 100%; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);">
            <table width="100%" cellpadding="0" cellspacing="0"
                style="background: rgba(0, 0, 0, 0.04); padding: 0 0 12px; border-collapse:collapse;">
                <tr>
                    <td colspan="2" style="height:8px; background: #01e46f ;"></td>
                </tr>
                <tr style="background-color: #F0FDF6; width: 100%; padding: 20px 32px;">
                    <td width="20%" style="padding: 20px 32px; width: 20%; min-width: 88px; max-width: 120px;">
                        <div align="center"
                            style="width:88px; height:88px; background:white; border-radius:16px; border:1px solid rgba(0,0,0,0.24); text-align:center;">
                            <span
                                style="display:inline-block; vertical-align:middle; font-size:40px; font-weight:700; line-height:88px; height:88px; width:88px;"><img
                                    src="https://cdn.prod.website-files.com/666d5edad629fd8ec028a7b3/68bc2e8d1628e46944864857_payram_logoIconVividGreen.png"
                                    alt="PayRam Logo"
                                    style="max-width: 100%; max-height: 100%; border-radius: 16px;"></span>
                        </div>
                    </td>
                    <td width="80%"
                        style="font-size:32px; font-weight:700; line-height:38.40px; text-align:left; vertical-align:middle; padding:20px 32px 20px 0; width: 80%;">
                        Payram </td>
                </tr>
            </table>

            <!-- Body Content -->
            <div class="body-content" style="padding: 24px 32px 56px">
                <h1 style="font-size: 24px; font-weight: 900; font-style: italic; line-height: 38px; margin: 0 0 24px;">
                    ${eventName}
                </h1>

                <hr class="divider" style="width: 100%; height: 1px; background: rgba(0, 0, 0, 0.16); border: none; margin: 0 0 24px;">

                <p class="body-text" style="font-size: 16px; line-height: 26px; margin: 0 0 24px">
                    Hi ${firstName},
                </p>

                <p style="font-size: 16px; line-height: 26px; margin: 0 0 24px">
                    Thank you for your interest in <strong>${eventName}</strong>.
                </p>

                <p style="font-size: 16px; line-height: 26px; margin: 0 0 16px">
                    Here are event details:
                </p>

                <ul style="font-size: 16px; line-height: 26px; margin: 0 0 24px; padding-left: 20px;">
                    <li style="margin-bottom: 8px;"><strong>Date:</strong> ${dateRange}</li>
                    <li style="margin-bottom: 8px;"><strong>Location:</strong> ${eventLocation}</li>
                    ${
                      eventWebsite
                        ? `<li style="margin-bottom: 8px;"><strong>Website & tickets info:</strong> <a href="${eventWebsite}" target="_blank" style="color: #01e46f; text-decoration: none;">${eventWebsite}</a></li>`
                        : ""
                    }
                </ul>

                <p style="font-size: 16px; line-height: 26px; margin: 0 0 8px">
                    Regards,<br>
                    <strong>Krishna Teja</strong>
                </p>

                <p style="font-size: 14px; line-height: 22px; color: rgba(0, 0, 0, 0.6); margin: 32px 0 0;">
                    This email is sent via the <strong>iGaming Events Calendar</strong>, supported by <strong>PayRam</strong>, a self-hosted stablecoin payment gateway for borderless onchain payments. Learn more at <a href="https://payram.com" target="_blank" style="color: #01e46f; text-decoration: none;">https://payram.com</a>.
                </p>
            </div>

            <div>
                <hr class="divider" style="width: 100%; height: 1px; background: rgba(0, 0, 0, 0.16); border: none; margin: 0 0 24px 0;">
                <div style="text-align: center; margin-bottom: 24px; padding: 0 32px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 7px; margin-bottom: 12px;">
                        <span style="font-size: 14px; line-height: 19.60px; display: table;">
                            <span style="display: table-cell;">Powered By</span>
                            <a href="https://payram.com/?utm_source=merchant&utm_medium=website&utm_campaign=txemail"
                                target="_blank" style="display: table-cell; text-decoration: none;">
                                <h2 style="margin: 0 0 0 8px; font-style: italic; font-size: 14px;"> Payram </h2>
                            </a>
                        </span>
                    </div>
                </div>
                <div style="width: 100%; height: 6px; background: #01E46F;"></div>
            </div>
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
            contentType: "text/calendar; charset=utf-8; method=PUBLISH",
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
