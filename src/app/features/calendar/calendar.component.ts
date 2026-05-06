import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CalendarService, CalendarEvent } from '../../core/services/calendar.service';
import { AddEventModalComponent } from '../../shared/components/add-event-modal/add-event-modal.component';

interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="calendar-container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Calendar</h1>
          <p class="page-subtitle">Add or manage events and schedules.</p>
        </div>
        <button mat-flat-button color="primary" class="add-event-btn shadow-sm" (click)="addEvent()">
          <mat-icon>add</mat-icon> Add Event
        </button>
      </div>

      <div class="calendar-card">
        <div class="calendar-header">
          <div class="month-title">
            {{ currentMonthName() }} {{ currentYear() }}
          </div>
          <div class="calendar-controls">
            <button mat-stroked-button (click)="goToToday()">Today</button>
            <button mat-icon-button (click)="previousMonth()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button mat-icon-button (click)="nextMonth()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>

        <div class="calendar-grid">
          <div class="weekday-header">Sun</div>
          <div class="weekday-header">Mon</div>
          <div class="weekday-header">Tue</div>
          <div class="weekday-header">Wed</div>
          <div class="weekday-header">Thu</div>
          <div class="weekday-header">Fri</div>
          <div class="weekday-header">Sat</div>

          @for (day of calendarDays(); track day.date.getTime()) {
            <div class="calendar-cell" [class.not-current-month]="!day.isCurrentMonth">
              <div class="day-number" [class.today]="day.isToday">{{ day.date.getDate() }}</div>
              
              <div class="events-container" *ngIf="day.events.length > 0">
                @for (event of day.events; track event.id) {
                  <div class="event-capsule" [ngClass]="event.colorClass">
                     {{ event.title }}
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .calendar-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 8px;
    }

    .page-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin: 0 0 4px;
      color: var(--text-main);
      background: linear-gradient(135deg, var(--text-main), var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .page-subtitle {
      color: var(--text-muted);
      margin: 0;
      font-size: 15px;
      font-weight: 500;
    }

    .add-event-btn {
      padding: 0 24px !important;
      height: 48px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      letter-spacing: 0.2px !important;
      background: linear-gradient(135deg, var(--primary), #8B5CF6) !important;
      color: white !important;
      box-shadow: 0 8px 20px var(--primary-glow) !important;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px var(--primary-glow) !important;
      }
    }

    .calendar-card {
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-highlight);
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      background: var(--surface);
      padding: 12px 24px;
      border-radius: 16px;
      border: 1px solid var(--border-color);
    }

    .month-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .calendar-controls {
      display: flex;
      align-items: center;
      gap: 8px;

      button[mat-stroked-button] {
        border-color: var(--border-color) !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        color: var(--text-main) !important;
      }

      ::ng-deep .mat-mdc-icon-button {
        color: var(--text-main);
        opacity: 0.7;
        width: 40px !important;
        height: 40px !important;
        border-radius: 10px !important;
        &:hover { opacity: 1; background: var(--bg-color); }
      }
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: var(--border-color);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
    }

    .weekday-header {
      background: rgba(0, 0, 0, 0.02);
      padding: 16px 12px;
      text-align: center;
      font-weight: 700;
      font-size: 13px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dark-theme .weekday-header {
      background: rgba(255, 255, 255, 0.02);
    }

    .calendar-cell {
      background: var(--surface);
      min-height: 140px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: background-color 0.2s ease;

      &:hover {
        background: var(--bg-color);
      }

      &.not-current-month {
        background: rgba(0, 0, 0, 0.01);
        .day-number {
          opacity: 0.3;
        }
        &:hover {
          background: rgba(0, 0, 0, 0.02);
        }
      }
    }

    .dark-theme .calendar-cell.not-current-month {
      background: rgba(255, 255, 255, 0.01);
      &:hover {
        background: rgba(255, 255, 255, 0.02);
      }
    }

    .day-number {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin-bottom: 4px;
      transition: all 0.2s ease;

      &.today {
        background: var(--primary);
        color: white;
        box-shadow: 0 4px 12px var(--primary-glow);
      }
    }

    .events-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }

    .event-capsule {
      font-size: 12px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      border: 1px solid transparent;

      &:hover {
        transform: translateY(-1px);
        filter: brightness(1.1);
      }

      &.bg-blue { background: rgba(72, 128, 255, 0.1); color: #4880FF; border-color: rgba(72, 128, 255, 0.2); }
      &.bg-orange { background: rgba(255, 143, 107, 0.1); color: #FF8F6B; border-color: rgba(255, 143, 107, 0.2); }
      &.bg-green { background: rgba(16, 185, 129, 0.1); color: #10B981; border-color: rgba(16, 185, 129, 0.2); }
      &.bg-purple { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; border-color: rgba(139, 92, 246, 0.2); }
      &.bg-red { background: rgba(225, 29, 72, 0.1); color: #E11D48; border-color: rgba(225, 29, 72, 0.2); }
    }
  `]
})
export class CalendarComponent {
  private dialog = inject(MatDialog);
  private calendarService = inject(CalendarService);
  
  currentDate = signal(new Date());

  currentMonthName = computed(() => {
    return this.currentDate().toLocaleString('default', { month: 'long' });
  });

  currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0-6
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Day[] = [];
    const allEvents = this.calendarService.events();
    
    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const cellDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: cellDate,
        isCurrentMonth: false,
        isToday: false,
        events: allEvents.filter(e => e.date.toDateString() === cellDate.toDateString())
      });
    }

    // Current month's days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
       const cellDate = new Date(year, month, i);
       
       days.push({
         date: cellDate,
         isCurrentMonth: true,
         isToday: cellDate.toDateString() === today.toDateString(),
         events: allEvents.filter(e => e.date.toDateString() === cellDate.toDateString())
       });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
       const cellDate = new Date(year, month + 1, i);
       days.push({
         date: cellDate,
         isCurrentMonth: false,
         isToday: false,
         events: allEvents.filter(e => e.date.toDateString() === cellDate.toDateString())
       });
    }

    return days;
  });

  previousMonth() {
    this.currentDate.update(date => {
      return new Date(date.getFullYear(), date.getMonth() - 1, 1);
    });
  }

  nextMonth() {
    this.currentDate.update(date => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    });
  }

  goToToday() {
    this.currentDate.set(new Date());
  }

  addEvent() {
    this.dialog.open(AddEventModalComponent, {
      width: '420px',
      maxWidth: '95vw',
      panelClass: 'add-event-dialog'
    });
  }
}

