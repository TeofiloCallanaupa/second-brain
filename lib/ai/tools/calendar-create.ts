import { tool, zodSchema } from "ai";
import { z } from "zod";
import { google } from "googleapis";
import { getGoogleAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";

export function createCalendarCreateTool(userId: string) {
  return tool({
    description:
      "Create a new event on the user's Google Calendar. The user will be asked to approve before creating.",
    inputSchema: zodSchema(
      z.object({
        summary: z.string().describe("Event title"),
        description: z
          .string()
          .optional()
          .describe("Event description or notes"),
        startDateTime: z
          .string()
          .describe(
            "Start date/time in ISO 8601 format (e.g. 2026-04-10T14:00:00-04:00)"
          ),
        endDateTime: z
          .string()
          .describe(
            "End date/time in ISO 8601 format (e.g. 2026-04-10T15:00:00-04:00)"
          ),
        location: z
          .string()
          .optional()
          .describe("Event location (physical address or virtual link)"),
        attendees: z
          .array(z.string())
          .optional()
          .describe("List of attendee email addresses"),
      })
    ),
    needsApproval: true,
    execute: async ({
      summary,
      description,
      startDateTime,
      endDateTime,
      location,
      attendees,
    }) => {
      try {
        const accessToken = await getGoogleAccessToken();
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: "v3", auth });

        const event: any = {
          summary,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        };

        if (description) event.description = description;
        if (location) event.location = location;
        if (attendees) {
          event.attendees = attendees.map((email) => ({ email }));
        }

        const response = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
        });

        const createdEvent = response.data;

        await logAction({
          userId,
          action: "calendar.create",
          toolName: "calendar-create",
          riskLevel: "high",
          status: "success",
          inputSummary: `Create event: "${summary}" on ${startDateTime}`,
          outputSummary: `Event created: ${createdEvent.htmlLink}`,
        });

        return `Calendar event "${summary}" created successfully. Link: ${createdEvent.htmlLink}`;
      } catch (error: any) {
        await logAction({
          userId,
          action: "calendar.create",
          toolName: "calendar-create",
          riskLevel: "high",
          status: "failed",
          inputSummary: `Create event: "${summary}" on ${startDateTime}`,
          outputSummary: error?.message || "Failed to create event",
        });
        return `Failed to create calendar event: ${error?.message}`;
      }
    },
  });
}
