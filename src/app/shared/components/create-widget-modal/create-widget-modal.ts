import { Component, inject } from '@angular/core';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-create-widget-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
],
  template: `
    <div class="modal-container dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">

      <!-- HEADER -->
      <div class="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
        <div class="space-y-1">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">Create AI Widget</h2>
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dashboard Component Builder</p>
        </div>
        <button mat-icon-button (click)="onClose()" class="!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-800 transition-all">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onGenerate()" class="p-8 space-y-8">

        <!-- DESCRIPTION -->
        <div class="space-y-2">
          <label class="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Describe Requirement</label>
          <mat-form-field appearance="outline" class="w-full !m-0 custom-field">
            <textarea
              matInput
              rows="4"
              formControlName="description"
              placeholder="e.g. Visualize monthly active users vs churn rate for the last quarter"
              class="font-medium text-slate-700 dark:text-slate-200">
            </textarea>
            <mat-icon matSuffix class="text-indigo-500 opacity-50">auto_awesome</mat-icon>
            <mat-hint class="!text-[10px] !font-bold !text-slate-400">Natural language processing will generate the SQL and chart config.</mat-hint>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- Widget Type -->
          <div class="space-y-2">
            <label class="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Output Format</label>
            <mat-form-field appearance="outline" class="w-full !m-0 custom-field">
              <mat-select formControlName="type" class="font-bold">
                <mat-option value="line" class="!py-3">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-indigo-500 !m-0 scale-90">show_chart</mat-icon>
                    <span>Line Chart</span>
                  </div>
                </mat-option>
                <mat-option value="bar" class="!py-3">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-emerald-500 !m-0 scale-90">bar_chart</mat-icon>
                    <span>Bar Chart</span>
                  </div>
                </mat-option>
                <mat-option value="pie" class="!py-3">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-amber-500 !m-0 scale-90">pie_chart</mat-icon>
                    <span>Pie Chart</span>
                  </div>
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Data Source -->
          <div class="space-y-2">
            <label class="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Data Source</label>
            <mat-form-field appearance="outline" class="w-full !m-0 custom-field">
              <mat-select formControlName="source" class="font-bold">
                <mat-option value="ecommerce" class="!py-3">Ecommerce Database</mat-option>
                <mat-option value="analytics" class="!py-3">Google Analytics</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <!-- TOGGLES -->
        <div class="flex items-center justify-between py-6 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl px-6 border border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <mat-slide-toggle formControlName="aiPowered" color="primary"></mat-slide-toggle>
            <div class="flex flex-col">
              <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">AI Insights</span>
              <span class="text-[10px] font-bold text-slate-400">Generate explanatory text</span>
            </div>
          </div>

          <div class="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>

          <div class="flex items-center gap-4">
            <div class="flex flex-col items-end">
              <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Live Sync</span>
              <span class="text-[10px] font-bold text-slate-400">Refresh every 5m</span>
            </div>
            <mat-slide-toggle formControlName="autoRefresh" color="primary"></mat-slide-toggle>
          </div>
        </div>

        <!-- BUTTON -->
        <button mat-flat-button color="primary" class="!w-full !h-16 !rounded-2xl !text-lg !font-black !tracking-widest shadow-2xl shadow-indigo-500/20 active:scale-95 transition-transform">
          <mat-icon class="!mr-2 scale-110">auto_awesome</mat-icon>
          GENERATE COMPONENT
        </button>

      </form>
    </div>
  `,
  styles: [`
    .modal-container {
      width: 580px;
      background: white;
      border-radius: 2.5rem;
    }

    ::ng-deep .custom-field {
      .mat-mdc-form-field-flex {
        background: transparent !important;
      }
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #f1f5f9 !important;
        border-width: 2px !important;
      }
      .dark & .mdc-notched-outline__leading,
      .dark & .mdc-notched-outline__notch,
      .dark & .mdc-notched-outline__trailing {
        border-color: #1e293b !important;
      }
      &.mat-focused {
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #4f46e5 !important;
        }
      }
    }
  `]
})
export class CreateWidgetModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateWidgetModalComponent>);

  form = this.fb.group({
    description: [''],
    type: ['line'],
    source: ['ecommerce'],
    aiPowered: [true],
    autoRefresh: [false]
  });

  onClose() {
    this.dialogRef.close();
  }

  onGenerate() {
    this.dialogRef.close(this.form.value);
  }
}