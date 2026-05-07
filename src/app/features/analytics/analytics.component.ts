import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ThemeService } from '../../core/services/theme.service';
import { 
  LucideAngularModule, 
  BarChart3, 
  TrendingUp, 
  Users, 
  CircleDollarSign, 
  Timer, 
  ChevronDown, 
  Filter, 
  Calendar, 
  Download,
  Info,
  Map,
  MousePointer2,
  PieChart,
  RefreshCcw,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-angular';

@Component({
  selector: 'app-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    NgxEchartsModule,
    LucideAngularModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent {
  private themeService = inject(ThemeService);
  readonly isDark = this.themeService.isDarkMode;

  // Icons
  readonly BarChartIcon = BarChart3;
  readonly TrendingIcon = TrendingUp;
  readonly UsersIcon = Users;
  readonly DollarIcon = CircleDollarSign;
  readonly TimerIcon = Timer;
  readonly ChevronDownIcon = ChevronDown;
  readonly FilterIcon = Filter;
  readonly CalendarIcon = Calendar;
  readonly DownloadIcon = Download;
  readonly InfoIcon = Info;
  readonly MapIcon = Map;
  readonly CursorIcon = MousePointer2;
  readonly PieChartIcon = PieChart;
  readonly RefreshIcon = RefreshCcw;
  readonly ZapIcon = Zap;
  readonly UpIcon = ArrowUpRight;
  readonly DownIcon = ArrowDownRight;

  readonly selectedRange = signal('Last 30 Days');
  readonly ranges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Year'];

  setRange(range: string) {
    this.selectedRange.set(range);
  }

  // KPI Data
  readonly kpis = [
    { label: 'Total Revenue', value: '$2,482,900', delta: '+12.5%', trend: 'up', color: 'purple' },
    { label: 'Total Users', value: '148.5k', delta: '+8.2%', trend: 'up', color: 'blue' },
    { label: 'Conversion Rate', value: '3.42%', delta: '-1.4%', trend: 'down', color: 'cyan' },
    { label: 'Avg. Order Value', value: '$84.50', delta: '+4.3%', trend: 'up', color: 'emerald' },
    { label: 'Active Sessions', value: '1,240', delta: '+22.1%', trend: 'up', color: 'pink' }
  ];

  // Revenue Options
  readonly revenueChartOptions = computed<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: this.isDark() ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
      borderColor: 'rgba(139, 92, 246, 0.2)',
      textStyle: { color: this.isDark() ? '#fff' : '#0f172a' },
      axisPointer: { lineStyle: { color: 'rgba(139, 92, 246, 0.3)' } }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b' }
    },
    yAxis: { 
      type: 'value', 
      splitLine: { lineStyle: { color: this.isDark() ? 'rgba(148, 163, 184, 0.05)' : 'rgba(15, 23, 42, 0.05)' } },
      axisLabel: { color: '#64748b' }
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#7c3aed' },
      lineStyle: { width: 4, color: '#7c3aed' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(124, 58, 237, 0.2)' }, { offset: 1, color: 'transparent' }]
        }
      }
    }]
  }));

  // Sales Options
  readonly salesChartOptions = computed<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: { 
        trigger: 'axis',
        backgroundColor: this.isDark() ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
        borderColor: 'rgba(139, 92, 246, 0.2)',
        textStyle: { color: this.isDark() ? '#fff' : '#0f172a' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#64748b' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: this.isDark() ? 'rgba(148, 163, 184, 0.05)' : 'rgba(15, 23, 42, 0.05)' } }, axisLabel: { color: '#64748b' } },
    series: [{
      data: [120, 200, 150, 80],
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: '#6366f1' }, { offset: 1, color: '#06b6d4' }]
        }
      }
    }]
  }));

  // Funnel Options
  readonly funnelOptions = computed<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: { 
        backgroundColor: this.isDark() ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
        borderColor: 'rgba(139, 92, 246, 0.2)',
        textStyle: { color: this.isDark() ? '#fff' : '#0f172a' },
    },
    series: [{
      type: 'funnel',
      left: '10%', top: 10, bottom: 10, width: '80%',
      minSize: '0%', maxSize: '100%',
      sort: 'descending', gap: 2,
      label: { show: true, position: 'inside', color: '#fff' },
      itemStyle: { borderColor: 'transparent', borderWidth: 0 },
      data: [
        { value: 100, name: 'Visitors', itemStyle: { color: 'rgba(124, 58, 237, 0.8)' } },
        { value: 80, name: 'Add to Cart', itemStyle: { color: 'rgba(99, 102, 241, 0.8)' } },
        { value: 60, name: 'Checkout', itemStyle: { color: 'rgba(6, 182, 212, 0.8)' } },
        { value: 40, name: 'Purchase', itemStyle: { color: 'rgba(16, 185, 129, 0.8)' } }
      ]
    }]
  }));

  // Traffic Options
  readonly trafficOptions = computed<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: { 
        backgroundColor: this.isDark() ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
        borderColor: 'rgba(139, 92, 246, 0.2)',
        textStyle: { color: this.isDark() ? '#fff' : '#0f172a' },
    },
    series: [{
      type: 'pie',
      radius: ['60%', '85%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: 45, name: 'Search', itemStyle: { color: '#7c3aed' } },
        { value: 25, name: 'Direct', itemStyle: { color: '#06b6d4' } },
        { value: 15, name: 'Social', itemStyle: { color: '#ec4899' } },
        { value: 10, name: 'Email', itemStyle: { color: '#f59e0b' } },
        { value: 5, name: 'Other', itemStyle: { color: '#10b981' } }
      ]
    }]
  }));

  readonly bottomMetrics = [
    { label: 'Revenue', value: '$24.8k', trend: 'up' },
    { label: 'Users', value: '1,245', trend: 'up' },
    { label: 'Orders', value: '842', trend: 'down' },
    { label: 'Conversion', value: '3.4%', trend: 'up' },
    { label: 'Sessions', value: '4.2k', trend: 'up' },
    { label: 'Page Views', value: '12.8k', trend: 'up' },
    { label: 'Bounce Rate', value: '24%', trend: 'down' },
    { label: 'Avg Time', value: '4m 32s', trend: 'up' }
  ];
}
