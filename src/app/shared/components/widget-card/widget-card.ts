import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';

@Component({
  selector: 'app-widget-card',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  template: `
    <div class="widget-card bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col h-full transition-all hover:shadow-md">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ title() }}</h3>
        <div class="header-action">
          <slot name="header-action"></slot>
        </div>
      </div>
      
      <div class="chart-container flex-grow min-h-[250px] w-full">
        <div echarts [options]="options()" class="w-full h-full"></div>
      </div>
      
      <div class="insight mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <p class="text-xs text-slate-600 dark:text-slate-300">{{ insightText() }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .chart-container {
      position: relative;
    }
  `]
})
export class WidgetCardComponent {
  title = input.required<string>();
  options = input.required<any>();
  insightText = input.required<string>();
}
