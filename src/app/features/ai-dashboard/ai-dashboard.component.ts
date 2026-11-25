import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import {
  LucideBot,
  LucideBrain,
  LucideChevronRight,
  LucideDatabase,
  LucideShieldCheck,
  LucideTrendingUp,
  LucideZap
} from '@lucide/angular';

type Period = 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'This Year';
type Trend = 'up' | 'down';

@Component({
  selector: 'app-ai-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule,
    NgxEchartsModule,
    LucideBot,
    LucideBrain,
    LucideChevronRight,
    LucideDatabase,
    LucideShieldCheck,
    LucideTrendingUp,
    LucideZap
],
  templateUrl: './ai-dashboard.component.html',
  styleUrls: ['./ai-dashboard.component.scss'],
})
export class AiDashboardComponent {

  readonly isDark = signal(true);
  readonly selectedRange = signal<Period>('Last 30 Days');
  readonly timeRanges: Period[] = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];

  private readonly rangeMultiplier = computed(() => {
    switch (this.selectedRange()) {
      case 'Today': return 0.08;
      case 'Last 7 Days': return 0.25;
      case 'Last 30 Days': return 1;
      case 'Last 90 Days': return 3;
      case 'This Year': return 12;
      default: return 1;
    }
  });

  readonly labels = computed(() => {
    switch (this.selectedRange()) {
      case 'Today': return ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'];
      case 'Last 7 Days': return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'Last 90 Days': return ['Apr', 'May', 'Jun'];
      case 'This Year': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default: return ['May 12', 'May 19', 'May 26', 'Jun 02', 'Jun 09', 'Jun 12'];
    }
  });

  readonly kpis = computed(() => {
    const m = this.rangeMultiplier();
    return [
      { label: 'AI Models', value: String(Math.round(24 * Math.min(m, 3))), delta: '+26.5%', trend: 'up' as Trend, icon: 'BotIcon', color: 'violet', spark: [18, 22, 20, 32, 30, 45, 52] },
      { label: 'Predictions', value: this.compact(1452230 * m), delta: '+18.6%', trend: 'up' as Trend, icon: 'TrendingIcon', color: 'blue', spark: [22, 28, 38, 32, 45, 58, 72] },
      { label: 'Accuracy', value: (94.32 + Math.min(m, 12) * 0.08).toFixed(2) + '%', delta: '+3.8%', trend: 'up' as Trend, icon: 'ShieldIcon', color: 'emerald', spark: [70, 72, 75, 73, 78, 82, 86] },
      { label: 'Inference Time', value: Math.max(48, Math.round(120 / Math.max(1, m * 0.15))) + 'ms', delta: '-8.4%', trend: 'down' as Trend, icon: 'ZapIcon', color: 'amber', spark: [80, 76, 70, 74, 64, 58, 52] },
      { label: 'Cost Savings', value: '$' + Math.round(28450 * m).toLocaleString(), delta: '+22.7%', trend: 'up' as Trend, icon: 'TrendingIcon', color: 'cyan', spark: [12, 18, 23, 30, 42, 55, 69] },
      { label: 'Data Processed', value: (2.45 * m).toFixed(m < 1 ? 2 : 1) + 'TB', delta: '+32.1%', trend: 'up' as Trend, icon: 'DatabaseIcon', color: 'rose', spark: [28, 30, 36, 42, 58, 70, 88] },
    ];
  });

  readonly predictiveOptions = computed<EChartsOption>(() => {
    const m = this.rangeMultiplier();
    const labels = this.labels();
    const actual = labels.map((_, i) => Math.round((420 + i * 112 + Math.sin(i) * 70) * 1000 * m));
    const predicted = labels.map((_, i) => Math.round((500 + i * 138 + Math.cos(i) * 55) * 1000 * m));
    const confidence = labels.map((_, i) => Math.round((220 + i * 82 + Math.sin(i / 2) * 60) * 1000 * m));

    return {
      backgroundColor: 'transparent',
      animationDuration: 900,
      tooltip: this.tooltip(),
      legend: { right: 12, top: 0, icon: 'circle', textStyle: { color: '#94a3b8' } },
      grid: { left: 4, right: 18, bottom: 8, top: 44, containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: labels, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#64748b' } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(148,163,184,.08)' } }, axisLabel: { color: '#64748b', formatter: (v: number) => this.compact(v) } },
      series: [
        this.lineSeries('Actual', actual, '#8b5cf6', true),
        this.lineSeries('Predicted', predicted, '#3b82f6', false, 'dashed'),
        this.lineSeries('Confidence', confidence, '#14b8a6', true),
      ],
    };
  });

  readonly sentimentOptions = computed<EChartsOption>(() => this.donut([
    { value: 82.6, name: 'Positive', itemStyle: { color: '#10b981' } },
    { value: 12.1, name: 'Neutral', itemStyle: { color: '#f59e0b' } },
    { value: 5.3, name: 'Negative', itemStyle: { color: '#ef4444' } },
  ]));

  readonly chatTrendOptions = computed<EChartsOption>(() => {
    const data = [680, 1220, 720, 1580, 1010, 1260, 1160, 1540, 1060, 1850, 1430, 2010, 1680];
    return this.smallArea(data, '#8b5cf6');
  });

  readonly qualityTrendOptions = computed<EChartsOption>(() => this.smallArea([52, 70, 68, 84, 56, 68, 76, 88, 72, 78, 93, 87], '#3b82f6'));
  readonly sentimentTrendOptions = computed<EChartsOption>(() => this.smallArea([62, 86, 72, 54, 68, 81, 78, 90, 84, 96, 78, 88], '#10b981'));
  readonly tokenSparkOptions = computed<EChartsOption>(() => this.sparkline('#8b5cf6', [24, 32, 48, 42, 58, 61, 52, 70, 78, 96]));
  readonly recoSparkOptions = computed<EChartsOption>(() => this.sparkline('#8b5cf6', [14, 18, 16, 22, 20, 26, 21, 30, 42]));

  readonly mlMetrics = [
    { label: 'Recommendation v2.4', value: 94.2, color: '#10b981' },
    { label: 'Anomaly Detector', value: 91.8, color: '#10b981' },
    { label: 'Demand Forecast', value: 89.6, color: '#3b82f6' },
    { label: 'Churn Prediction', value: 87.3, color: '#3b82f6' },
    { label: 'Sentiment Classifier', value: 93.1, color: '#10b981' },
  ];

  readonly modelStats = [
    { label: 'Neurons', value: '128.4M', delta: '+14.6%', trend: 'up' },
    { label: 'Layers', value: '156', delta: '+8.3%', trend: 'up' },
    { label: 'Parameters', value: '2.45B', delta: '+21.7%', trend: 'up' },
    { label: 'Training Time', value: '18.6h', delta: '-6.2%', trend: 'down' },
    { label: 'GPU Utilization', value: '78.4%', delta: '+12.4%', trend: 'up' },
  ];

  readonly recommendations = [
    { name: 'Smart Watch X1', category: 'Electronics', match: '28.4%' },
    { name: 'Wireless Earbuds Pro', category: 'Electronics', match: '24.7%' },
    { name: 'Running Shoes', category: 'Sports', match: '21.3%' },
    { name: 'Backpack Premium', category: 'Accessories', match: '18.6%' },
    { name: 'Sunglasses UV', category: 'Accessories', match: '16.9%' },
  ];

  readonly automations = [
    { title: 'Order Processing', body: 'Auto-process high priority orders', icon: 'workflow', color: 'green' },
    { title: 'Inventory Refill', body: 'Auto-reorder low stock items', icon: 'inventory_2', color: 'blue' },
    { title: 'Customer Support', body: 'Auto-respond to common queries', icon: 'support_agent', color: 'violet' },
  ];

  readonly chatIntents = [
    { label: 'Order Status', value: 32.1 },
    { label: 'Return & Refund', value: 24.7 },
    { label: 'Product Inquiry', value: 18.3 },
    { label: 'Payment Issue', value: 12.6 },
    { label: 'Shipping Info', value: 7.8 },
  ];

  readonly dataCards = [
    { label: 'Datasets', value: '245', delta: '+18.0%', icon: 'dataset', color: 'blue' },
    { label: 'Data Quality', value: '93.4%', delta: '+4.2%', icon: 'verified', color: 'green' },
    { label: 'Data Pipelines', value: '56', delta: '+12.1%', icon: 'hub', color: 'cyan' },
    { label: 'Anomalies', value: '18', delta: '-6.3%', icon: 'warning', color: 'red' },
  ];

  readonly insights = [
    { title: 'Model Performance', body: 'Your models are performing 23% better this month.', icon: 'model_training', type: 'success' },
    { title: 'Data Drift Detected', body: 'Data drift detected in 2 datasets.', icon: 'warning_amber', type: 'warning' },
    { title: 'Optimization Opportunity', body: 'You can reduce inference cost by 18%.', icon: 'auto_fix_high', type: 'info' },
    { title: 'New Recommendation', body: 'Deploy v2.4 model for 9% higher accuracy.', icon: 'psychology', type: 'violet' },
  ];

  readonly activities = [
    { title: 'Model v2.4 deployed successfully', time: '2 min ago', type: 'success', icon: 'rocket_launch' },
    { title: 'New training job completed', time: '5 min ago', type: 'info', icon: 'timer' },
    { title: 'Data drift detected in users_behavior', time: '10 min ago', type: 'warning', icon: 'warning_amber' },
    { title: 'Prediction batch processed', time: '12 min ago', type: 'violet', icon: 'online_prediction' },
    { title: 'New insight generated by AI', time: '15 min ago', type: 'success', icon: 'auto_awesome' },
  ];

  readonly useCases = [
    { label: 'Content Generation', value: 38.6 },
    { label: 'Code Generation', value: 28.4 },
    { label: 'Data Summarization', value: 18.7 },
    { label: 'Image Generation', value: 9.8 },
    { label: 'Other', value: 4.5 },
  ];

  setRange(range: Period): void {
    this.selectedRange.set(range);
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
  }

  sparkline(color: string, data: number[]): EChartsOption {
    return {
      backgroundColor: 'transparent',
      animationDuration: 700,
      grid: { left: 0, right: 0, top: 3, bottom: 3 },
      xAxis: { type: 'category', show: false },
      yAxis: { type: 'value', show: false, scale: true },
      series: [{
        type: 'line',
        data,
        smooth: 0.45,
        symbol: 'none',
        lineStyle: { color, width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}55` },
            { offset: 1, color: `${color}00` },
          ]),
        },
      }],
    };
  }

  private tooltip(): EChartsOption['tooltip'] {
    return {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: 'rgba(139, 92, 246, 0.26)',
      borderWidth: 1,
      textStyle: { color: '#f8fafc' },
      extraCssText: 'box-shadow:0 20px 60px rgba(0,0,0,.35);border-radius:14px;padding:10px 12px;',
    };
  }

  private lineSeries(name: string, data: number[], color: string, area = true, type: 'solid' | 'dashed' = 'solid'): any {
    return {
      name,
      type: 'line',
      smooth: true,
      data,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color, width: 3, type },
      itemStyle: { color },
      areaStyle: area ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${color}3d` },
          { offset: 1, color: `${color}00` },
        ]),
      } : undefined,
    };
  }

  private smallArea(data: number[], color: string): EChartsOption {
    return {
      backgroundColor: 'transparent',
      tooltip: this.tooltip(),
      grid: { left: 6, right: 8, top: 10, bottom: 6, containLabel: false },
      xAxis: { type: 'category', show: false },
      yAxis: { type: 'value', show: false, scale: true },
      series: [this.lineSeries('Trend', data, color, true)],
    };
  }

  private donut(data: any[]): EChartsOption {
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['54%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 3 },
        label: { show: false },
        data,
      }],
    };
  }

  private compact(value: number): string {
    if (Math.abs(value) >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + 'B';
    if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return Math.round(value).toString();
  }
}
