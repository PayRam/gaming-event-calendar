import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const NOTION_EVENTS_DATABASE_ID = process.env.NOTION_EVENTS_DATABASE_ID!;

interface NotionPage {
  id: string;
  properties: {
    Name?: { title: Array<{ plain_text: string }> };
    description?: { rich_text: Array<{ plain_text: string }> };
    endDate?: { rich_text: Array<{ plain_text: string }> };
    eventName?: { rich_text: Array<{ plain_text: string }> };
    link?: { rich_text: Array<{ plain_text: string }> };
    location?: { rich_text: Array<{ plain_text: string }> };
    month?: { rich_text: Array<{ plain_text: string }> };
    startDate?: { rich_text: Array<{ plain_text: string }> };
    unprocessedDate?: { rich_text: Array<{ plain_text: string }> };
    website?: { rich_text: Array<{ plain_text: string }> };
    status?: { select: { name: string } | null };
  };
}

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

// Helper function to safely extract text from Notion properties
function extractText(
  property: { rich_text: Array<{ plain_text: string }> } | undefined
): string {
  return property?.rich_text?.[0]?.plain_text || "";
}

function extractTitle(
  property: { title: Array<{ plain_text: string }> } | undefined
): string {
  return property?.title?.[0]?.plain_text || "";
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NOTION_SECRET) {
      return NextResponse.json(
        { error: "NOTION_SECRET is not configured" },
        { status: 500 }
      );
    }

    if (!NOTION_EVENTS_DATABASE_ID) {
      return NextResponse.json(
        { error: "NOTION_EVENTS_DATABASE_ID is not configured" },
        { status: 500 }
      );
    }

    // Fetch all reviewed events from Notion database
    const reviewedEvents = await getReviewedEvents();

    // Transform Notion pages to event objects
    const events: Event[] = reviewedEvents.map((page: NotionPage) => ({
      eventName: extractText(page.properties.eventName),
      month: extractText(page.properties.month),
      location: extractText(page.properties.location),
      link: extractText(page.properties.link),
      unprocessedDate: extractText(page.properties.unprocessedDate),
      description: extractText(page.properties.description),
      website: extractText(page.properties.website),
      startDate: extractText(page.properties.startDate),
      endDate: extractText(page.properties.endDate),
    }));

    return NextResponse.json({
      events,
    });
  } catch (error) {
    console.error("Error fetching reviewed events:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch reviewed events",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function getReviewedEvents(): Promise<NotionPage[]> {
  const allEvents: NotionPage[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response: any = await notion.databases.query({
      database_id: NOTION_EVENTS_DATABASE_ID,
      filter: {
        property: "status",
        select: {
          equals: "reviewed",
        },
      },
      start_cursor: startCursor,
    });

    allEvents.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allEvents;
}
