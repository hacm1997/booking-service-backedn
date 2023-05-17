import * as microsoftGraph from '@microsoft/microsoft-graph-client';

interface Reservation {
  startDate: Date
  endDate: Date
}

interface CalendarEvent {
  subject: string
  start: { dateTime: string }
  end: { dateTime: string }
}

async function getCalendarEvents (start: Date, end: Date, client: microsoftGraph.Client): Promise<CalendarEvent[]> {
  const events = await client.api('/me/calendarView')
    .query({ startDateTime: start.toISOString(), endDateTime: end.toISOString() })
    .select('subject,start,end')
    .get();

  return events.value;
}

function findConflictingEvents (reservations: Reservation[], events: CalendarEvent[]): any[] {
  const conflictingEvents = [];

  for (const reservation of reservations) {
    for (const event of events) {
      const reservationStart = reservation.startDate.getTime();
      const reservationEnd = reservation.endDate.getTime();
      const eventStart = new Date(event.start.dateTime).getTime();
      const eventEnd = new Date(event.end.dateTime).getTime();

      if (reservationStart <= eventEnd && reservationEnd >= eventStart) {
        conflictingEvents.push(event);
      }
    }
  }
  return conflictingEvents;
}

export { findConflictingEvents, getCalendarEvents };
