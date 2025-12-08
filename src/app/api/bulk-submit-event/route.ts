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

interface PayloadEvent extends Event {
  status: string;
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
  // Truncate and add ellipsis
  return text.substring(0, maxLength - 3) + "...";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Invalid payload: events array is required" },
        { status: 400 }
      );
    }

    // Add status property to all payload events
    const payloadEvents: PayloadEvent[] = events.map((event) => ({
      ...event,
      status: "reviewed",
    }));

    // Fetch all existing events from Notion database (single API call)
    const existingEvents = await getAllNotionEvents();

    // Create a map of existing events by link for quick lookup
    const existingEventsMap = new Map<string, string>();
    existingEvents.forEach((event: NotionEvent) => {
      const link = event.properties.link?.rich_text[0]?.plain_text || "";
      if (link) {
        existingEventsMap.set(link, event.id);
      }
    });

    // Separate events into update and create batches
    const eventsToUpdate: Array<{ pageId: string; event: PayloadEvent }> = [];
    const eventsToCreate: PayloadEvent[] = [];

    payloadEvents.forEach((event) => {
      const existingPageId = existingEventsMap.get(event.link);
      if (existingPageId) {
        eventsToUpdate.push({ pageId: existingPageId, event });
      } else {
        eventsToCreate.push(event);
      }
    });

    // Perform batch operations
    const updatePromises = eventsToUpdate.map(({ pageId, event }) =>
      updateNotionEvent(pageId, event)
    );

    const createPromises = eventsToCreate.map((event) =>
      createNotionEvent(event)
    );

    // Execute all operations in parallel
    const [updateResults, createResults] = await Promise.allSettled([
      Promise.allSettled(updatePromises),
      Promise.allSettled(createPromises),
    ]);

    return NextResponse.json({
      success: true,
      message: "Events processed successfully",
      summary: {
        total: payloadEvents.length,
        updated: eventsToUpdate.length,
        created: eventsToCreate.length,
      },
    });
  } catch (error) {
    console.error("Error processing events:", error);
    return NextResponse.json(
      { error: "Failed to process events" },
      { status: 500 }
    );
  }
}

async function getAllNotionEvents(): Promise<NotionEvent[]> {
  const allEvents: NotionEvent[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response: any = await notion.databases.query({
      database_id: NOTION_EVENTS_DATABASE_ID,
      start_cursor: startCursor,
    });

    allEvents.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allEvents;
}

async function createNotionEvent(event: PayloadEvent) {
  return notion.pages.create({
    parent: { database_id: NOTION_EVENTS_DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: truncateText(event.eventName, 2000) } }],
      },
      description: {
        rich_text: [
          { text: { content: truncateText(event.description, 2000) } },
        ],
      },
      endDate: {
        rich_text: [{ text: { content: truncateText(event.endDate, 2000) } }],
      },
      eventName: {
        rich_text: [{ text: { content: truncateText(event.eventName, 2000) } }],
      },
      link: {
        rich_text: [{ text: { content: truncateText(event.link, 2000) } }],
      },
      location: {
        rich_text: [{ text: { content: truncateText(event.location, 2000) } }],
      },
      month: {
        rich_text: [{ text: { content: truncateText(event.month, 2000) } }],
      },
      startDate: {
        rich_text: [{ text: { content: truncateText(event.startDate, 2000) } }],
      },
      unprocessedDate: {
        rich_text: [
          { text: { content: truncateText(event.unprocessedDate, 2000) } },
        ],
      },
      website: {
        rich_text: [{ text: { content: truncateText(event.website, 2000) } }],
      },
      status: {
        select: { name: event.status },
      },
    },
  });
}

async function updateNotionEvent(pageId: string, event: PayloadEvent) {
  return notion.pages.update({
    page_id: pageId,
    properties: {
      Name: {
        title: [{ text: { content: truncateText(event.eventName, 2000) } }],
      },
      description: {
        rich_text: [
          { text: { content: truncateText(event.description, 2000) } },
        ],
      },
      endDate: {
        rich_text: [{ text: { content: truncateText(event.endDate, 2000) } }],
      },
      eventName: {
        rich_text: [{ text: { content: truncateText(event.eventName, 2000) } }],
      },
      link: {
        rich_text: [{ text: { content: truncateText(event.link, 2000) } }],
      },
      location: {
        rich_text: [{ text: { content: truncateText(event.location, 2000) } }],
      },
      month: {
        rich_text: [{ text: { content: truncateText(event.month, 2000) } }],
      },
      startDate: {
        rich_text: [{ text: { content: truncateText(event.startDate, 2000) } }],
      },
      unprocessedDate: {
        rich_text: [
          { text: { content: truncateText(event.unprocessedDate, 2000) } },
        ],
      },
      website: {
        rich_text: [{ text: { content: truncateText(event.website, 2000) } }],
      },
      status: {
        select: { name: event.status },
      },
    },
  });
}
