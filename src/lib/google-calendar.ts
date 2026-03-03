import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const calendarId = process.env.GOOGLE_CALENDAR_ID;

export async function createCalendarEvent(details: {
    summary: string;
    description: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    attendeeEmail: string;
}) {
    if (!clientEmail || !privateKey || !calendarId) {
        console.error('Missing Google Calendar credentials');
        return null;
    }

    try {
        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: SCOPES
        });

        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: details.summary,
            description: details.description,
            start: {
                dateTime: details.startTime,
                timeZone: 'Asia/Ho_Chi_Minh',
            },
            end: {
                dateTime: details.endTime,
                timeZone: 'Asia/Ho_Chi_Minh',
            },
            attendees: [{ email: details.attendeeEmail }],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: event,
        });

        return response.data.id;
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        return null;
    }
}
