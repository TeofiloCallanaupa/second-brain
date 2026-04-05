import { tool, zodSchema } from "ai";
import { z } from "zod";
import { google } from "googleapis";
import { getGoogleAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

export function createCalendarReadTool(userId: string) {
  return tool({
    description:
      "Read upcoming events from the user's Google Calendar. Can filter by time range.",
    inputSchema: zodSchema(
      z.object({
        maxResults: z
          .number()
          .optional()
          .default(10)
          .describe("Maximum number of events to return (default: 10)"),
        daysAhead: z
          .number()
          .optional()
          .default(7)
          .describe(
            "Number of days ahead to look for events (default: 7)"
          ),
      })
    ),
    execute: async ({ maxResults, daysAhead }) => {
      try {
        const accessToken = await getGoogleAccessToken();

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: "v3", auth });

        const now = new Date();
        const timeMax = new Date();
        timeMax.setDate(now.getDate() + (daysAhead || 7));

        const response = await calendar.events.list({
          calendarId: "primary",
          timeMin: now.toISOString(),
          timeMax: timeMax.toISOString(),
          maxResults: maxResults || 10,
          singleEvents: true,
          orderBy: "startTime",
        });

        const events = (response.data.items || []).map((event) => ({
          id: event.id,
          summary: event.summary || "(No title)",
          start: event.start?.dateTime || event.start?.date || "",
          end: event.end?.dateTime || event.end?.date || "",
          location: event.location || "",
          description: event.description
            ? event.description.substring(0, 200)
            : "",
          attendees: (event.attendees || [])
            .slice(0, 5)
            .map((a) => a.email)
            .join(", "),
        }));

        await logAction({
          userId,
          action: "calendar.read",
          toolName: "calendar-read",
          riskLevel: "low",
          status: "success",
          inputSummary: `Read calendar events (next ${daysAhead} days, max: ${maxResults})`,
          outputSummary: `Found ${events.length} upcoming events`,
        });

        return { events, count: events.length };
      } catch (error: any) {
        console.error("[calendar-read] Error:", error?.message || error);

        await logAction({
          userId,
          action: "calendar.read",
          toolName: "calendar-read",
          riskLevel: "low",
          status: "failed",
          inputSummary: `Read calendar events (next ${daysAhead} days)`,
          outputSummary: `Error: ${error?.message || "Unknown error"}`,
        });

        return {
          error:
            "Could not access Google Calendar. The user needs to connect their Google account first.",
        };
      }
    },
  });
}
