import { ChangeDetectionStrategy, Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, HeatmapChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption, GraphicComponentOption } from 'echarts';

echarts.use([LineChart, BarChart, PieChart, HeatmapChart, TooltipComponent, GridComponent, LegendComponent, VisualMapComponent, CanvasRenderer]);

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatMenuModule, 
    MatChipsModule, 
    MatDividerModule,
    NgxEchartsDirective
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AnalyticsDashboardComponent {
  // Theme state
  isDarkMode = signal(true);
  
  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    if (this.isDarkMode()) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }

  // Derived theme-based variables
  chartTextColor = computed(() => this.isDarkMode() ? '#94a3b8' : '#64748b');
  gridLineColor = computed(() => this.isDarkMode() ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.06)');

  readonly periods = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 12 Months'];
  selectedPeriod = signal('Last 30 Days');

  setPeriod(p: string) {
    this.selectedPeriod.set(p);
  }

  // Multiplier for mock data generation
  periodMultiplier = computed(() => {
    switch (this.selectedPeriod()) {
      case 'Last 7 Days': return 0.25;
      case 'Last 30 Days': return 1;
      case 'Last 3 Months': return 3;
      case 'Last 12 Months': return 12;
      default: return 1;
    }
  });

  topMetrics = computed(() => {
    const m = this.periodMultiplier();
    return [
      { label: 'Total Revenue', value: '$' + (98765.42 * m).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), change: (18.2 * m).toFixed(1) + '%', down: false, icon: 'attach_money', color: '#7c3aed', 
        sparkValues: [12, 22, 19, 31, 28, 44, 38, 58].map(x => x * m) },
      { label: 'Total Users', value: Math.floor(142783 * m).toLocaleString(), change: (24.5 * m).toFixed(1) + '%', down: false, icon: 'group', color: '#2563eb', 
        sparkValues: [18, 24, 34, 29, 45, 38, 57, 49, 68].map(x => x * m) },
      { label: 'Conversion Rate', value: Math.min(100, 3.24 * (m > 1 ? 1.1 : 0.9)).toFixed(2) + '%', change: '12.6%', down: false, icon: 'check_circle', color: '#16a34a', 
        sparkValues: [10, 25, 18, 38, 31, 55, 34, 62].map(x => x * (m > 1 ? 1.1 : 0.9)) },
      { label: 'Avg. Order', value: '$' + (186.42 * (m > 1 ? 1.05 : 0.95)).toFixed(2), change: '8.7%', down: false, icon: 'shopping_bag', color: '#ea580c', 
        sparkValues: [8, 16, 12, 24, 20, 28, 36, 48].map(x => x * (m > 1 ? 1.05 : 0.95)) },
      { label: 'Sessions', value: Math.floor(8583 * m).toLocaleString(), change: (16.9 * m).toFixed(1) + '%', down: false, icon: 'mouse', color: '#db2777', 
        sparkValues: [9, 13, 21, 18, 30, 24, 42, 37, 55].map(x => x * m) }
    ];
  });

  realTimeRows = computed(() => {
    const m = this.periodMultiplier();
    return [
      { label: 'Page Views', value: Math.floor(32984 * m).toLocaleString(), change: '8.2%', icon: 'visibility', down: false },
      { label: 'Sessions', value: Math.floor(16293 * m).toLocaleString(), change: '6.7%', icon: 'trending_up', down: false },
      { label: 'Bounce Rate', value: '24.6%', change: '3.1%', icon: 'warning', down: true },
      { label: 'Avg. Session', value: '04:32', change: '5.4%', icon: 'schedule', down: false }
    ];
  });

  insights = computed(() => [
    { title: 'High Growth', text: `Revenue expected to grow ${Math.floor(24 * this.periodMultiplier())}% next month.`, icon: 'auto_graph', color: '#16a34a' },
    { title: 'Opportunity', text: 'Mobile conversion is 2.8× higher than desktop.', icon: 'smartphone', color: '#0284c7' },
    { title: 'Retention Alert', text: 'User retention dropped by 12% recently.', icon: 'error_outline', color: '#e11d48' }
  ]);

  funnel = computed(() => {
    const m = this.periodMultiplier();
    return [
      { name: 'Visitors', value: Math.floor(128643 * m).toLocaleString(), rate: '100%' },
      { name: 'Add to Cart', value: Math.floor(34850 * m).toLocaleString(), rate: '27.1%' },
      { name: 'Checkout', value: Math.floor(18392 * m).toLocaleString(), rate: '14.3%' },
      { name: 'Purchase', value: Math.floor(6184 * m).toLocaleString(), rate: '4.8%' }
    ];
  });

  traffic = computed(() => {
    const m = this.periodMultiplier();
    return [
      { name: 'Organic Search', percent: '48.5%', value: Math.floor(62415 * m).toLocaleString(), color: '#3b82f6' },
      { name: 'Direct', percent: '21.8%', value: Math.floor(28034 * m).toLocaleString(), color: '#f59e0b' },
      { name: 'Social Media', percent: '16.3%', value: Math.floor(20984 * m).toLocaleString(), color: '#d946ef' },
      { name: 'Referral', percent: '8.7%', value: Math.floor(11203 * m).toLocaleString(), color: '#14b8a6' },
      { name: 'Email', percent: '4.7%', value: Math.floor(6027 * m).toLocaleString(), color: '#8b5cf6' }
    ];
  });

  geo = computed(() => {
    const m = this.periodMultiplier();
    return [
      { name: 'United States', percent: '32.6%', value: Math.floor(41928 * m).toLocaleString() },
      { name: 'India', percent: '18.7%', value: Math.floor(24051 * m).toLocaleString() },
      { name: 'United Kingdom', percent: '8.9%', value: Math.floor(11442 * m).toLocaleString() },
      { name: 'Canada', percent: '6.3%', value: Math.floor(8109 * m).toLocaleString() },
      { name: 'Australia', percent: '5.8%', value: Math.floor(7453 * m).toLocaleString() }
    ];
  });

  bottomKpis = computed(() => {
    const m = this.periodMultiplier();
    return [
      { label: 'Revenue', value: '$' + Math.floor(98765 * m).toLocaleString(), change: '18.2%' },
      { label: 'Users', value: Math.floor(142783 * m).toLocaleString(), change: '24.5%' },
      { label: 'Orders', value: Math.floor(2456 * m).toLocaleString(), change: '13.7%' },
      { label: 'Conversion', value: '3.24%', change: '12.6%' },
      { label: 'Sessions', value: Math.floor(16293 * m).toLocaleString(), change: '16.9%' },
      { label: 'Page Views', value: Math.floor(32984 * m).toLocaleString(), change: '8.2%' },
      { label: 'Bounce Rate', value: '24.6%', change: '3.1%', down: true },
      { label: 'Avg. Time', value: '04:32', change: '5.4%' }
    ];
  });

  // Dynamic Chart Options (Re-evaluate when theme changes)
  get topMetricsCharts() {
    return this.topMetrics().map(item => this.sparkChart(item.color, item.sparkValues));
  }

  get revenueChartOpts(): EChartsCoreOption {
    const m = this.periodMultiplier();
    return this.areaChart('#8b5cf6', ['May 12','May 19','May 26','Jun 02','Jun 09'], 
      [12, 28, 24, 36, 31, 45, 60, 56, 66, 82, 74, 84, 72, 61, 78, 96, 91, 112, 124].map(x => x * m));
  }

  get salesChartOpts(): EChartsCoreOption {
    const m = this.periodMultiplier();
    return this.barChart(['Week 1','Week 2','Week 3','Week 4','Week 5'], 
      [26000, 14500, 33540, 42400, 28500].map(x => x * m));
  }

  get realtimeOpts(): EChartsCoreOption {
    const m = this.periodMultiplier();
    return this.sparkChart('#3b82f6', 
      [35, 36, 38, 32, 28, 29, 25, 31, 39, 34, 44, 36, 31, 28, 24, 22, 31, 39, 41, 48, 44].map(x => x * m));
  }

  get predictionOpts(): EChartsCoreOption {
    const m = this.periodMultiplier();
    return this.areaChart('#a855f7', [], [12, 18, 24, 22, 21, 24, 30, 28, 34, 38, 36, 42, 47].map(x => x * m), false);
  }

  get userGrowthOpts(): EChartsCoreOption {
    const m = this.periodMultiplier();
    return this.areaChart('#22c55e', ['Jan','Mar','May','Jul','Sep','Nov'], 
      [50, 65, 78, 100, 102, 116, 132, 122, 138, 164, 158, 176, 198, 193, 215, 222].map(x => x * m), false);
  }

  get customerRetentionOpts(): EChartsCoreOption {
    const m = this.periodMultiplier();
    return this.areaChart('#d946ef', ['W1','W2','W3','W4'], [64, 69, 66, 72, 65, 68, 74, 69, 71, 78, 82, 98].map(x => x * (m > 1 ? 1.05 : 0.95)), false);
  }

  get trafficOpts(): EChartsCoreOption {
    const isDark = this.isDarkMode();
    const tr = this.traffic();
    return {
      tooltip: this.tooltip('item'),
      series: [{ 
        type: 'pie', 
        radius: ['60%', '85%'], 
        center: ['50%', '50%'], 
        label: { show: false }, 
        itemStyle: { 
          borderRadius: 6, 
          borderColor: isDark ? '#0f172a' : '#ffffff', 
          borderWidth: 2 
        }, 
        data: tr.map(x => ({ 
          value: parseFloat(x.percent), 
          name: x.name, 
          itemStyle: { color: x.color } 
        })) 
      }]
    };
  }

  get heatmapOpts(): EChartsCoreOption {
    return {
      tooltip: this.tooltip('item'),
      grid: { left: 40, right: 10, top: 10, bottom: 20 },
      xAxis: { 
        type: 'category', 
        data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], 
        axisLine: { show: false }, 
        axisTick: { show: false }, 
        axisLabel: { color: this.chartTextColor(), fontSize: 11, margin: 12 } 
      },
      yAxis: { 
        type: 'category', 
        data: ['12am','4am','8am','12pm','4pm','8pm'], 
        axisLine: { show: false }, 
        axisTick: { show: false }, 
        axisLabel: { color: this.chartTextColor(), fontSize: 11 } 
      },
      visualMap: { 
        show: false, 
        min: 0, 
        max: 100, 
        inRange: { color: ['#1e3a8a', '#2563eb', '#7c3aed', '#db2777'] } 
      },
      series: [{ 
        type: 'heatmap', 
        data: Array.from({ length: 42 }, (_, i) => [i % 7, Math.floor(i / 7), Math.round(20 + Math.random() * 80)]), 
        itemStyle: { borderRadius: 4, borderColor: 'transparent', borderWidth: 1 } 
      }]
    };
  }

  private sparkChart(color: string, data: number[]): EChartsCoreOption {
    return { 
      animation: true, 
      grid: { left: 0, right: 0, top: 12, bottom: 4 }, 
      xAxis: { type: 'category', show: false, boundaryGap: false }, 
      yAxis: { type: 'value', show: false }, 
      series: [{ 
        type: 'line', 
        data, 
        smooth: true, 
        showSymbol: false, 
        lineStyle: { color, width: 3, shadowColor: color, shadowBlur: 8, shadowOffsetY: 2 }, 
        areaStyle: { 
          opacity: 0.35, 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color }, 
            { offset: 1, color: 'transparent' }
          ]) as any
        } 
      }] 
    };
  }

  private areaChart(color: string, labels: string[], data: number[], showAxis: boolean = true): EChartsCoreOption {
    const textColor = this.chartTextColor();
    const gridLine = this.gridLineColor();
    return {
      tooltip: this.tooltip('axis'),
      grid: { left: showAxis ? 40 : 5, right: showAxis ? 15 : 5, top: 20, bottom: showAxis ? 30 : 10 },
      xAxis: { 
        type: 'category', 
        boundaryGap: false, 
        data: labels.length ? labels : data.map((_, i) => String(i + 1)), 
        axisLine: { show: false }, 
        axisTick: { show: false }, 
        axisLabel: { show: showAxis, color: textColor } 
      },
      yAxis: { 
        type: 'value', 
        axisLabel: { show: showAxis, color: textColor, formatter: (v: number) => `$${v}K` }, 
        splitLine: { lineStyle: { color: gridLine, type: 'dashed' } } 
      },
      series: [{ 
        type: 'line', 
        data, 
        smooth: true, 
        symbol: 'circle', 
        symbolSize: showAxis ? 6 : 0, 
        showSymbol: false,
        lineStyle: { color, width: 3 }, 
        itemStyle: { color }, 
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}40` }, 
            { offset: 1, color: 'transparent' }
          ]) as any
        } 
      }]
    };
  }

  private barChart(labels: string[], data: number[]): EChartsCoreOption {
    const textColor = this.chartTextColor();
    const gridLine = this.gridLineColor();
    return {
      tooltip: this.tooltip('axis'),
      grid: { left: 45, right: 15, top: 20, bottom: 30 },
      xAxis: { 
        type: 'category', 
        data: labels, 
        axisLine: { show: false }, 
        axisTick: { show: false }, 
        axisLabel: { color: textColor } 
      },
      yAxis: { 
        type: 'value', 
        axisLabel: { color: textColor, formatter: (v: number) => `$${v / 1000}K` }, 
        splitLine: { lineStyle: { color: gridLine, type: 'dashed' } } 
      },
      series: [{ 
        type: 'bar', 
        data, 
        barWidth: '40%', 
        itemStyle: { 
          borderRadius: [6, 6, 0, 0], 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' }, 
            { offset: 1, color: '#1d4ed8' }
          ]) as any
        } 
      }]
    };
  }

  private tooltip(trigger: 'axis' | 'item') {
    const isDark = this.isDarkMode();
    return { 
      trigger, 
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
      borderColor: isDark ? '#334155' : '#e2e8f0', 
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a' },
      padding: [10, 14],
      borderRadius: 8,
      shadowBlur: 20,
      shadowColor: 'rgba(0, 0, 0, 0.15)'
    };
  }
}
