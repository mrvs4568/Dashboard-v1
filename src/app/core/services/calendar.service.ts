import { Injectable, signal } from '@angular/core';

export interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  colorClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventsSignal = signal<CalendarEvent[]>([
    { id: 1, title: 'Product Review', date: new Date(new Date().getFullYear(), new Date().getMonth(), 4), colorClass: 'bg-blue' },
    { id: 2, title: 'Team Meeting', date: new Date(new Date().getFullYear(), new Date().getMonth(), 4), colorClass: 'bg-orange' },
    { id: 3, title: 'Design Sync', date: new Date(new Date().getFullYear(), new Date().getMonth(), 12), colorClass: 'bg-purple' },
    { id: 4, title: 'Client Call', date: new Date(new Date().getFullYear(), new Date().getMonth(), 18), colorClass: 'bg-green' },
    { id: 5, title: 'UI Kit Update', date: new Date(new Date().getFullYear(), new Date().getMonth(), 22), colorClass: 'bg-red' },
    { id: 6, title: 'Development', date: new Date(new Date().getFullYear(), new Date().getMonth(), 26), colorClass: 'bg-blue' }
  ]);

  events = this.eventsSignal.asReadonly();

  addEvent(event: Omit<CalendarEvent, 'id'>) {
    this.eventsSignal.update(events => [
      ...events,
      { ...event, id: Date.now() }
    ]);
  }
}
