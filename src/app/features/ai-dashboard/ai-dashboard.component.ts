import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { LucideAngularModule, Brain, Cpu, Database, Activity, ShieldCheck, Zap, TrendingUp, ChevronRight, MessageSquare, BarChart3, PieChart, Info, Layers, Workflow, Bot } from 'lucide-angular';

@Component({
  selector: 'app-ai-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule,
    NgxEchartsModule,
    LucideAngularModule
  ],
  templateUrl: './ai-dashboard.component.html',
  styleUrls: ['./ai-dashboard.component.scss']
})
export class AiDashboardComponent {
  // Icons
  readonly BrainIcon = Brain;
  readonly CpuIcon = Cpu;
  readonly DatabaseIcon = Database;
  readonly ActivityIcon = Activity;
  readonly ShieldIcon = ShieldCheck;
  readonly ZapIcon = Zap;
  readonly TrendingIcon = TrendingUp;
  readonly ChevronRightIcon = ChevronRight;
  readonly ChatIcon = MessageSquare;
  readonly ChartIcon = BarChart3;
  readonly PieChartIcon = PieChart;
  readonly InfoIcon = Info;
  readonly LayersIcon = Layers;
  readonly WorkflowIcon = Workflow;
  readonly BotIcon = Bot;

  readonly isDark = signal(true);
  readonly selectedRange = signal('Last 30 Days');
  readonly timeRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];

  // KPI Data
  readonly kpis = [
    { label: 'AI Models', value: '24', delta: '26.5%', trend: 'up', icon: 'BotIcon', color: 'violet' },
    { label: 'Predictions', value: '1.45M', delta: '18.6%', trend: 'up', icon: 'TrendingIcon', color: 'blue' },
    { label: 'Accuracy', value: '94.32%', delta: '3.8%', trend: 'up', icon: 'ShieldIcon', color: 'emerald' },
    { label: 'Inference Time', value: '120ms', delta: '8.4%', trend: 'down', icon: 'ZapIcon', color: 'amber' },
    { label: 'Cost Savings', value: '$28,450', delta: '22.7%', trend: 'up', icon: 'TrendingIcon', color: 'emerald' },
    { label: 'Data Processed', value: '2.45TB', delta: '32.1%', trend: 'up', icon: 'DatabaseIcon', color: 'rose' }
  ];

  // Predictive Analytics Chart
  readonly predictiveOptions: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(99, 102, 241, 0.2)', textStyle: { color: '#fff' } },
    legend: { bottom: 0, textStyle: { color: '#94a3b8' }, icon: 'circle' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['May 12', 'May 19', 'May 26', 'Jun 02', 'Jun 09', 'Jun 12'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#64748b' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.05)' } }, axisLabel: { color: '#64748b' } },
    series: [
      { name: 'Actual', type: 'line', smooth: true, data: [400000, 600000, 850000, 1100000, 1050000, 1200000], itemStyle: { color: '#8b5cf6' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(139, 92, 246, 0.2)' }, { offset: 1, color: 'transparent' }] } } },
      { name: 'Predicted', type: 'line', smooth: true, lineStyle: { type: 'dashed' }, data: [450000, 550000, 900000, 1050000, 1150000, 1300000], itemStyle: { color: '#3b82f6' } }
    ]
  };

  // Neural Chart (Radar/Polar)
  readonly neuralOptions: EChartsOption = {
    backgroundColor: 'transparent',
    polar: { radius: [20, '70%'] },
    angleAxis: { type: 'value', startAngle: 0, show: false },
    radiusAxis: { min: 0, show: false },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 1048, name: 'Search Engine', itemStyle: { color: '#8b5cf6' } },
        { value: 735, name: 'Direct', itemStyle: { color: '#3b82f6' } },
        { value: 580, name: 'Email', itemStyle: { color: '#10b981' } },
        { value: 484, name: 'Union Ads', itemStyle: { color: '#f59e0b' } }
      ]
    }]
  };

  // ML Ops Metrics
  readonly mlMetrics = [
    { label: 'Recommendation v2.4', value: 94.2, color: '#8b5cf6' },
    { label: 'Anomaly Detector', value: 91.8, color: '#3b82f6' },
    { label: 'Demand Forecast', value: 89.6, color: '#10b981' },
    { label: 'Churn Prediction', value: 87.3, color: '#f59e0b' },
    { label: 'Sentiment Classifier', value: 93.1, color: '#ec4899' }
  ];

  // Activities
  readonly activities = [
    { title: 'Model v2.4 deployed successfully', time: '2 min ago', type: 'success', icon: 'ZapIcon' },
    { title: 'New training job completed', time: '5 min ago', type: 'info', icon: 'WorkflowIcon' },
    { title: 'Data drift detected in users_behavior', time: '10 min ago', type: 'warning', icon: 'ActivityIcon' },
    { title: 'Prediction batch processed', time: '12 min ago', type: 'success', icon: 'LayersIcon' },
    { title: 'New insight generated by AI', time: '15 min ago', type: 'info', icon: 'BotIcon' }
  ];

  // Recommendations
  readonly recommendations = [
    { name: 'Smart Watch X1', category: 'Electronics', match: '98.4%', image: 'watch' },
    { name: 'Wireless Earbuds Pro', category: 'Electronics', match: '94.7%', image: 'buds' },
    { name: 'Running Shoes', category: 'Sports', match: '91.3%', image: 'shoes' },
    { name: 'Backpack Premium', category: 'Accessories', match: '88.6%', image: 'bag' }
  ];

  setRange(range: string) {
    this.selectedRange.set(range);
  }
}
