import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CalendarService } from '../../../core/services/calendar.service';

@Component({
  selector: 'app-add-event-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule
  ],
  template: `
    <div class="modal-container bg-white relative">
      <!-- Decorative background blur -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>

      <div class="header relative p-8 pb-6 border-b border-gray-100/60">
        <div class="flex justify-between items-start z-10 relative">
          <div class="flex items-center gap-5">
            <div class="icon-box w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 text-primary">
              <mat-icon class="text-[28px] w-[28px] h-[28px]">event_note</mat-icon>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900 m-0 tracking-tight font-sans">New Event</h2>
              <p class="text-[14px] text-gray-500 mt-1 font-medium">Schedule a new activity</p>
            </div>
          </div>
          <button type="button" (click)="onClose()" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors border border-gray-200/50">
            <mat-icon class="text-[20px] w-[20px] h-[20px]">close</mat-icon>
          </button>
        </div>
      </div>

      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="flex flex-col p-8 pt-6 gap-6 relative z-10">

        <!-- Title Input -->
        <div class="form-group flex flex-col gap-2.5">
          <label class="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Event Title</label>
          <div class="input-wrapper relative flex items-center">
            <mat-icon class="absolute left-4 text-gray-400 z-10 text-[22px] w-[22px] h-[22px]">title</mat-icon>
            <input type="text" formControlName="title" placeholder="e.g., Design Sync"
              class="premium-input w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-[3px] focus:ring-primary/10 focus:border-primary transition-all outline-none text-gray-800 placeholder:text-gray-400 font-medium text-[15px]">
            </div>
            @if (eventForm.get('title')?.touched && eventForm.get('title')?.hasError('required')) {
              <span class="text-red-500 text-xs font-medium ml-1">Event title is required</span>
            }
          </div>

          <!-- Date Input -->
          <div class="form-group flex flex-col gap-2.5">
            <label class="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Date</label>
            <div class="input-wrapper relative flex items-center">
              <input type="date" formControlName="date"
                class="premium-input w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-[3px] focus:ring-primary/10 focus:border-primary transition-all outline-none text-gray-800 font-medium text-[15px]">
              </div>
              @if (eventForm.get('date')?.touched && eventForm.get('date')?.hasError('required')) {
                <span class="text-red-500 text-xs font-medium ml-1">Date is required</span>
              }
            </div>

            <!-- Color Theme -->
            <div class="color-picker-section mt-1">
              <label class="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-3 block">Color Theme</label>
              <div class="flex gap-4">
                @for (color of colorOptions; track color.value) {
                  <button type="button"
                    class="color-swatch-premium shadow-sm"
                    [ngClass]="color.value"
                    [class.selected]="eventForm.get('colorClass')?.value === color.value"
                    (click)="eventForm.get('colorClass')?.setValue(color.value)">
                  @if (eventForm.get('colorClass')?.value === color.value) {
                    <mat-icon class="check-icon">check</mat-icon>
                  }
                </button>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 mt-4 pt-6 border-t border-gray-100/80">
            <button type="button" class="flex-1 py-3.5 px-4 font-semibold rounded-xl text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-all" (click)="onClose()">
              Cancel
            </button>
            <button type="submit"
              class="flex-1 py-3.5 px-4 rounded-xl font-bold text-white transition-all duration-300"
              [ngClass]="eventForm.invalid ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary/95 shadow-[0_8px_16px_-4px_rgba(72,128,255,0.4)] hover:-translate-y-0.5'"
              [disabled]="eventForm.invalid">
              Add Event
            </button>
          </div>
        </form>
      </div>
    `,
  styles: [`
    :host {
      display: block;
      background: white;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18);
    }

    .modal-container {
      max-width: 460px;
      width: 100%;
    }

    /* Override input date icon if needed */
    input[type="date"]::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
    }

    .color-swatch-premium {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      opacity: 0.8;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);

      &:hover {
        opacity: 1;
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 6px 12px rgba(0,0,0,0.1);
      }

      &.selected {
        opacity: 1;
        transform: scale(1.1) translateY(-2px);
        border-radius: 12px;
      }

      &.bg-blue { background: #4880FF; color: #4880FF; outline: 2px solid transparent; &.selected { outline-color: #4880FF; outline-offset: 3px; } }
      &.bg-orange { background: #FF8F6B; color: #FF8F6B; outline: 2px solid transparent; &.selected { outline-color: #FF8F6B; outline-offset: 3px; } }
      &.bg-green { background: #00B69B; color: #00B69B; outline: 2px solid transparent; &.selected { outline-color: #00B69B; outline-offset: 3px; } }
      &.bg-purple { background: #8280FF; color: #8280FF; outline: 2px solid transparent; &.selected { outline-color: #8280FF; outline-offset: 3px; } }
      &.bg-red { background: #F93C65; color: #F93C65; outline: 2px solid transparent; &.selected { outline-color: #F93C65; outline-offset: 3px; } }

      .check-icon {
        color: white;
        font-size: 24px;
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }
    }
  `]
})
export class AddEventModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddEventModalComponent>);
  private calendarService = inject(CalendarService);

  colorOptions = [
    { value: 'bg-blue' },
    { value: 'bg-orange' },
    { value: 'bg-purple' },
    { value: 'bg-green' },
    { value: 'bg-red' },
  ];

  eventForm = this.fb.group({
    title: ['', Validators.required],
    date: [formatDate(new Date(), 'yyyy-MM-dd', 'en-US'), Validators.required],
    colorClass: ['bg-blue', Validators.required]
  });

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.getRawValue();

      // Parse the date directly from the selected yyyy-mm-dd
      const dateParts = formValue.date?.split('-') || [];
      let eventDate = new Date();
      if (dateParts.length === 3) {
        eventDate = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
      }

      this.calendarService.addEvent({
        title: formValue.title || '',
        date: eventDate,
        colorClass: formValue.colorClass || 'bg-blue'
      });
      this.dialogRef.close(true);
    }
  }
}

