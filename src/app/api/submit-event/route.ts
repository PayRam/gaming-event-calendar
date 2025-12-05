// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const NOTION_EVENTS_DATABASE_ID = process.env.NOTION_EVENTS_DATABASE_ID!;

interface Event {
  eventName: string;
  month: string;
  location: string;
  link: string;
  unprocessedDate: string;
  description: string;
  website: string;
  startDate: string;
  endDate: string;
}

interface NotionEvent {
  id: string;
  properties: {
    link: { rich_text: Array<{ plain_text: string }> };
  };
}

// Helper function to truncate text to Notion's limit
function truncateText(text: string, maxLength: number = 2000): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event: Event = body;

    // Validate required fields
    if (!event.eventName || !event.link) {
      return NextResponse.json(
        { error: "Invalid payload: eventName and link are required" },
        { status: 400 }
      );
    }

    // Check if event with this link already exists
    const existingEvent = await findEventByLink(event.link);

    let result;
    let action: "created" | "updated";

    if (existingEvent) {
      // Update existing event
      result = await updateNotionEvent(existingEvent.id, event);
      action = "updated";
    } else {
      // Create new event
      result = await createNotionEvent(event);
      action = "created";
    }

    return NextResponse.json({
      success: true,
      message: `Event ${action} successfully`,
      action,
      eventId: result.id,
    });
  } catch (error) {
    console.error("Error processing event:", error);
    return NextResponse.json(
      {
        error: "Failed to process event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function findEventByLink(link: string): Promise<NotionEvent | null> {
  try {
    const response: any = await notion.databases.query({
      database_id: NOTION_EVENTS_DATABASE_ID,
      filter: {
        property: "link",
        rich_text: {
          equals: link,
        },
      },
    });

    return response.results.length > 0 ? response.results[0] : null;
  } catch (error) {
    console.error("Error finding event by link:", error);
    return null;
  }
}

async function createNotionEvent(event: Event) {
  return notion.pages.create({
    parent: { database_id: NOTION_EVENTS_DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: truncateText(event.eventName, 2000) } }],
      },
      description: {
        rich_text: [
          { text: { content: truncateText(event.description || "", 2000) } },
        ],
      },
      endDate: {
        rich_text: [
          { text: { content: truncateText(event.endDate || "", 2000) } },
        ],
      },
      eventName: {
        rich_text: [{ text: { content: truncateText(event.eventName, 2000) } }],
      },
      link: {
        rich_text: [{ text: { content: truncateText(event.link, 2000) } }],
      },
      location: {
        rich_text: [
          { text: { content: truncateText(event.location || "", 2000) } },
        ],
      },
      month: {
        rich_text: [
          { text: { content: truncateText(event.month || "", 2000) } },
        ],
      },
      startDate: {
        rich_text: [
          { text: { content: truncateText(event.startDate || "", 2000) } },
        ],
      },
      unprocessedDate: {
        rich_text: [
          {
            text: { content: truncateText(event.unprocessedDate || "", 2000) },
          },
        ],
      },
      website: {
        rich_text: [
          { text: { content: truncateText(event.website || "", 2000) } },
        ],
      },
      status: {
        select: { name: "under-review" },
      },
    },
  });
}

async function updateNotionEvent(pageId: string, event: Event) {
  return notion.pages.update({
    page_id: pageId,
    properties: {
      Name: {
        title: [{ text: { content: truncateText(event.eventName, 2000) } }],
      },
      description: {
        rich_text: [
          { text: { content: truncateText(event.description || "", 2000) } },
        ],
      },
      endDate: {
        rich_text: [
          { text: { content: truncateText(event.endDate || "", 2000) } },
        ],
      },
      eventName: {
        rich_text: [{ text: { content: truncateText(event.eventName, 2000) } }],
      },
      link: {
        rich_text: [{ text: { content: truncateText(event.link, 2000) } }],
      },
      location: {
        rich_text: [
          { text: { content: truncateText(event.location || "", 2000) } },
        ],
      },
      month: {
        rich_text: [
          { text: { content: truncateText(event.month || "", 2000) } },
        ],
      },
      startDate: {
        rich_text: [
          { text: { content: truncateText(event.startDate || "", 2000) } },
        ],
      },
      unprocessedDate: {
        rich_text: [
          {
            text: { content: truncateText(event.unprocessedDate || "", 2000) },
          },
        ],
      },
      website: {
        rich_text: [
          { text: { content: truncateText(event.website || "", 2000) } },
        ],
      },
      status: {
        select: { name: "under-review" },
      },
    },
  });
}
