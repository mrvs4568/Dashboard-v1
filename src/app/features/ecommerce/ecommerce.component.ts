import { ThemeService } from '../../core/services/theme.service';
import { ChangeDetectionStrategy, Component, computed, signal, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';
import { BarChart, FunnelChart, HeatmapChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';

echarts.use([
  BarChart,
  FunnelChart,
  HeatmapChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

type Trend = 'up' | 'down';

export interface KpiCard {
  label: string;
  value: string;
  delta: string;
  helper: string;
  previousValue: string;
  icon: string;
  tone: 'violet' | 'green' | 'blue' | 'amber' | 'pink';
  spark: EChartsCoreOption;
}

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    NgxEchartsDirective
],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommerceComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly isDark = this.themeService.isDarkMode.asReadonly();

  private chartsTheme: boolean | undefined;

  constructor() {
    effect(() => {
      if (this.chartsTheme !== this.isDark()) {
        this.initCharts();
        this.changeDetector.markForCheck();
      }
    });
  }
  readonly themeLabel = computed(() => (this.isDark() ? 'Dark' : 'Light'));

  readonly metrics = [
    { label: 'Total Vendors', value: '1,245', delta: '16.2%', icon: 'storefront', tone: 'violet' },
    { label: 'Active Vendors', value: '987', delta: '12.8%', icon: 'groups', tone: 'blue' },
    { label: 'Total Products', value: '24,568', delta: '20.1%', icon: 'inventory_2', tone: 'green' },
    { label: 'Total Payouts', value: '$89,450', delta: '15.4%', icon: 'account_balance_wallet', tone: 'violet' },
    { label: 'Commission Earned', value: '$14,780', delta: '18.3%', icon: 'paid', tone: 'amber' },
  ];

  readonly productTrends = [
    { name: 'Smart Watch Series 8', price: '$12,430', delta: '24.5%', icon: 'watch', trend: 'up' as Trend },
    { name: 'Air Pro Earbuds', price: '$8,760', delta: '18.2%', icon: 'headphones', trend: 'up' as Trend },
    { name: 'Running Sneakers M4', price: '$15,230', delta: '15.7%', icon: 'directions_run', trend: 'up' as Trend },
    { name: 'Trekker Backpack', price: '$6,540', delta: '12.3%', icon: 'backpack', trend: 'up' as Trend },
    { name: 'Polarized Sunglasses', price: '$4,890', delta: '2.1%', icon: 'visibility', trend: 'down' as Trend },
  ];

  readonly insights = [
    { title: 'Revenue Growth', text: 'Revenue is up 18.6% this month. Keep up the great work!', icon: 'rocket_launch', tone: 'green' },
    { title: 'Top Opportunity', text: "Mens Sneakers has 34% higher conversion potential.", icon: 'settings_suggest', tone: 'blue' },
    { title: 'Stock Alert', text: '12 products are running critically low on stock.', icon: 'inventory', tone: 'amber' },
    { title: 'Customer Insight', text: 'Returning customers increased by 22% overall.', icon: 'psychology', tone: 'violet' },
  ];

  readonly vendors = [
    { name: 'Tech Store Plus', revenue: '$24,560', growth: '22.4%' },
    { name: 'Fashion Hub Main', revenue: '$18,230', growth: '18.7%' },
    { name: 'Gadget World LLC', revenue: '$15,470', growth: '16.3%' },
    { name: 'Home Essentials Co', revenue: '$12,680', growth: '14.2%' },
    { name: 'Beauty Palace', revenue: '$8,760', growth: '12.5%' },
  ];

  readonly vendorsSearch = signal('');
  readonly filteredVendors = computed(() => {
    const search = this.vendorsSearch().trim().toLowerCase();
    if (!search) return this.vendors;
    return this.vendors.filter(v => v.name.toLowerCase().includes(search));
  });

  readonly productTrendFilter = signal<'all' | Trend>('all');
  readonly productTrendsSearch = signal('');

  readonly filtersActive = computed(() =>
    this.productTrendFilter() !== 'all' ||
    !!this.vendorsSearch().trim() ||
    !!this.productTrendsSearch().trim()
  );

  readonly productFilterLabel = computed(() => {
    switch (this.productTrendFilter()) {
      case 'up': return 'Rising products';
      case 'down': return 'Declining products';
      default: return 'All products';
    }
  });
  readonly filteredProducts = computed(() => {
    const search = this.productTrendsSearch().trim().toLowerCase();
    const trend = this.productTrendFilter();

    return this.productTrends.filter(p =>
      (trend === 'all' || p.trend === trend) &&
      (!search || p.name.toLowerCase().includes(search))
    );
  });

  readonly selectedTimeRange = signal('Last 30 Days');
  readonly compareEnabled = signal(false);

  readonly periodTotals = computed(() => {
    const factors: Record<string, number> = {
      'Today': 1 / 30,
      'Last 7 Days': 7 / 30,
      'Last 30 Days': 1,
      'Last 90 Days': 3,
      'This Year': 12
    };

    const factor = factors[this.selectedTimeRange()] ?? 1;
    const revenue = Math.round(24876050 * factor);
    const orders = Math.round(8756 * factor);
    const customers = Math.round(6582 * factor);

    return {
      revenue,
      orders,
      customers,
      previousRevenue: Math.round(revenue / 1.186),
      previousOrders: Math.round(orders / 1.142),
      previousCustomers: Math.round(customers / 1.128)
    };
  });

  money(cents: number): string {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  private metric(
    current: number,
    previous: number,
    format: (value: number) => string
  ) {
    const change = previous > 0
      ? ((current - previous) / previous) * 100
      : 0;
    const rounded = Number(change.toFixed(1));

    return {
      value: format(current),
      previousValue: format(previous),
      delta: `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}%`,
      helper: 'vs prior period'
    };
  }

  private periodSeries(
    total: number,
    weights: number[],
    divisor = 1
  ): number[] {
    const buckets: Record<string, number> = {
      'Today': 6,
      'Last 7 Days': 7,
      'Last 30 Days': 10,
      'Last 90 Days': 9,
      'This Year': 12
    };

    const points = weights.slice(
      0, buckets[this.selectedTimeRange()] ?? 10
    );

    const sum = points.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    let allocated = 0;

    return points.map(weight => {
      cumulative += weight;
      const target = Math.round(total * cumulative / sum);
      const value = target - allocated;
      allocated = target;
      return value / divisor;
    });
  }
  readonly timeRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];

  readonly categories = [
    { name: 'Electronics', revenue: '$78,450', orders: '2,156', growth: '24.6%', width: 100 },
    { name: 'Fashion & Apparel', revenue: '$65,780', orders: '1,856', growth: '18.3%', width: 82 },
    { name: 'Home & Kitchen', revenue: '$45,230', orders: '1,245', growth: '16.7%', width: 55 },
    { name: 'Beauty & Health', revenue: '$32,160', orders: '987', growth: '12.5%', width: 42 },
    { name: 'Sports & Outdoors', revenue: '$28,540', orders: '789', growth: '10.3%', width: 36 },
  ];

  readonly journey = [
    { stage: 'Awareness', icon: 'visibility', metric: 'Visits', value: '120,450', delta: '18.6%' },
    { stage: 'Consideration', icon: 'search', metric: 'Product Views', value: '45,780', delta: '16.2%' },
    { stage: 'Interest', icon: 'favorite', metric: 'Add to Cart', value: '12,456', delta: '14.8%' },
    { stage: 'Intent', icon: 'shopping_cart', metric: 'Checkout', value: '4,320', delta: '12.6%' },
    { stage: 'Purchase', icon: 'shopping_bag', metric: 'Orders', value: '2,876', delta: '8.6%' },
  ];

  kpis: KpiCard[] = [];
  storePerformance!: EChartsCoreOption;
  ordersAnalytics!: EChartsCoreOption;
  revenueTracking!: EChartsCoreOption;
  shoppingBehavior!: EChartsCoreOption;
  cartConversion!: EChartsCoreOption;
  heatmap!: EChartsCoreOption;

  ngOnInit() {
    this.initCharts();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setTimeRange(range: string) {
    if (!this.timeRanges.includes(range)) return;
    this.selectedTimeRange.set(range);
    this.initCharts();
  }

  toggleCompare(): void {
    this.compareEnabled.update(value => !value);
    this.initCharts();
  }

  buildCsv(): string {
    const rows = [
      ['Data Type', 'Period', 'Metric', 'Current', 'Previous', 'Change (%)']
    ];

    for (const item of this.kpis) {
      rows.push([
        'Demo',
        this.selectedTimeRange(),
        item.label,
        item.value,
        this.compareEnabled() ? item.previousValue : '',
        String(Number.parseFloat(item.delta))
      ]);
    }

    return rows.map(row =>
      row.map(value =>
        '"' + value.replace(/"/g, '""') + '"'
      ).join(',')
    ).join('\r\n');
  }

  exportData(): void {
    const blob = new Blob(
      ['\uFEFF', this.buildCsv()],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const period = this.selectedTimeRange()
      .toLowerCase()
      .replace(/\s+/g, '-');

    link.href = url;
    link.download = `dashstack-ecommerce-demo-${period}.csv`;

    document.body.appendChild(link);

    try {
      link.click();
    } finally {
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  setProductFilter(filter: 'all' | Trend): void {
    if (filter !== 'all' && filter !== 'up' && filter !== 'down') return;
    this.productTrendFilter.set(filter);
  }

  resetFilters(): void {
    this.productTrendFilter.set('all');
    this.productTrendsSearch.set('');
    this.vendorsSearch.set('');
  }

  private initCharts() {
    this.chartsTheme = this.isDark();
    const p = this.periodTotals();
    const number = (v: number) => v.toLocaleString('en-US');

    this.kpis = [
      {
        label: 'Total Revenue',
        ...this.metric(p.revenue, p.previousRevenue, v => this.money(v)),
        icon: 'attach_money', tone: 'violet',
        spark: this.spark('#8b5cf6', [7, 10, 9, 12, 18, 15, 23, 21, 28, 25, 35])
      },
      {
        label: 'Total Orders',
        ...this.metric(p.orders, p.previousOrders, number),
        icon: 'shopping_bag', tone: 'green',
        spark: this.spark('#22c55e', [3, 4, 6, 5, 7, 9, 8, 12, 11, 14, 18])
      },
      {
        label: 'Total Customers',
        ...this.metric(p.customers, p.previousCustomers, number),
        icon: 'group', tone: 'blue',
        spark: this.spark('#0b76ff', [4, 7, 5, 6, 10, 8, 13, 12, 17, 15, 22])
      },
      {
        label: 'Avg. Order',
        ...this.metric(
          Math.round(p.revenue / p.orders),
          Math.round(p.previousRevenue / p.previousOrders),
          v => this.money(v)
        ),
        icon: 'shopping_cart', tone: 'amber',
        spark: this.spark('#f59e0b', [2, 5, 4, 7, 6, 10, 8, 14, 12, 18, 25])
      },
      {
        label: 'Conversion',
        ...this.metric(324, 298, v => (v / 100).toFixed(2) + '%'),
        icon: 'track_changes', tone: 'pink',
        spark: this.spark('#ec4899', [1, 3, 2, 5, 4, 8, 7, 10, 9, 13, 18])
      }
    ];

    const revenueWeights = [128, 152, 181, 158, 174, 192, 168, 223, 220, 262, 235, 252];
    const orderWeights = [810, 1400, 1070, 1210, 1050, 1540, 1370, 1850, 1520, 1320, 1560, 1880];

    this.storePerformance = this.area(
      '#8b5cf6',
      this.periodSeries(p.revenue, revenueWeights, 100),
      this.periodSeries(p.previousRevenue, revenueWeights, 100)
    );

    this.ordersAnalytics = this.bars(
      '#0b76ff',
      this.periodSeries(p.orders, orderWeights),
      this.periodSeries(p.previousOrders, orderWeights)
    );

    this.revenueTracking = this.area('#22c55e', [4.5, 7.5, 12.5, 20.2, 18.5, 22.8, 16.2, 25.2, 24.8, 32.4, 27.2, 30.5, 34.2, 34.5, 40.2]);
    this.shoppingBehavior = this.donut();
    this.cartConversion = this.funnel();
    this.heatmap = this.inventoryHeatmap();
  }

  private baseTooltip() {
    const isDark = this.isDark();
    return {
      backgroundColor: isDark ? 'rgba(7, 10, 25, .94)' : 'rgba(255, 255, 255, .94)',
      borderColor: isDark ? 'rgba(148, 163, 184, .18)' : 'rgba(15, 23, 42, .1)',
      borderWidth: 1,
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontFamily: 'Inter, Roboto, sans-serif' },
      extraCssText: `box-shadow: 0 18px 48px ${isDark ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.15)'}; border-radius: 14px; padding: 10px 12px;`,
    };
  }

  private getAxisColor() {
    return this.isDark() ? '#94a3b8' : '#64748b';
  }

  private getSplitLineColor() {
    return this.isDark() ? 'rgba(148,163,184,.08)' : 'rgba(15,23,42,.06)';
  }

  private spark(color: string, data: number[]): EChartsCoreOption {
    return {
      animationDuration: 1400,
      grid: { left: 0, right: 0, top: 4, bottom: 4 },
      xAxis: { type: 'category', show: false },
      yAxis: { type: 'value', show: false, min: 'dataMin' },
      series: [{ 
        type: 'line', smooth: true, showSymbol: false, data, 
        lineStyle: { color, width: 2.5 }, 
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: `${color}55` }, { offset: 1, color: `${color}00` }]) } 
      }],
    };
  }

  private area(color: string, data: number[], previous?: number[]): EChartsCoreOption {
    const compare = !!previous && this.compareEnabled();

    return {
      color: [color, '#f59e0b'],
      legend: {
        show: compare,
        top: 0,
        textStyle: { color: this.getAxisColor() }
      },
      animationDuration: 1200,
      tooltip: { ...this.baseTooltip(), trigger: 'axis' },
      grid: { left: 16, right: 16, top: compare ? 44 : 20, bottom: 0, containLabel: true },
      xAxis: { 
        type: 'category', boundaryGap: false, 
        data: previous
          ? data.map((_, i) => `P${i + 1}`)
          : data.map((_, i) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i % 12]),
        axisTick: { show: false }, axisLine: { lineStyle: { color: this.getSplitLineColor() } }, axisLabel: { color: this.getAxisColor(), fontSize: 11 } 
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: this.getSplitLineColor() } }, axisLabel: { color: this.getAxisColor(), fontSize: 11 } },
      series: [{ 
        name: 'Current', type: 'line', smooth: true, showSymbol: false, data,
        lineStyle: { color, width: 3 }, 
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: `${color}66` }, { offset: 1, color: `${color}00` }]) } 
      }, ...(compare && previous ? [{
        name: 'Previous (demo)',
        type: 'line',
        data: previous,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' }
      }] : [])],
    };
  }

  private bars(color: string, data: number[], previous: number[]): EChartsCoreOption {
    const compare = this.compareEnabled();

    return {
      color: [color, '#f59e0b'],
      legend: {
        show: compare,
        top: 0,
        textStyle: { color: this.getAxisColor() }
      },
      animationDuration: 1200,
      tooltip: { ...this.baseTooltip(), trigger: 'axis' },
      grid: { left: 16, right: 16, top: compare ? 44 : 20, bottom: 0, containLabel: true },
      xAxis: { type: 'category', data: data.map((_, i) => `P${i + 1}`), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: this.getAxisColor(), fontSize: 11 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: this.getSplitLineColor() } }, axisLabel: { color: this.getAxisColor(), fontSize: 11 } },
      series: [{ name: 'Current', type: 'bar', data, barMaxWidth: 14, itemStyle: { borderRadius: [8, 8, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color }, { offset: 1, color: `${color}28` }]) } }, ...(compare ? [{
        name: 'Previous (demo)',
        type: 'bar',
        data: previous,
        barMaxWidth: 14,
        itemStyle: { color: '#f59e0b' }
      }] : [])],
    };
  }

  private donut(): EChartsCoreOption {
    return {
      animationDuration: 1300,
      tooltip: { ...this.baseTooltip(), trigger: 'item' },
      series: [{ 
        type: 'pie', radius: ['55%', '85%'], center: ['35%', '50%'], label: { show: false }, 
        itemStyle: { borderRadius: 8, borderColor: this.isDark() ? '#0f172a' : '#ffffff', borderWidth: 2 }, 
        data: [
          { value: 32.5, name: 'New Visitors', itemStyle: { color: '#7c3aed' } },
          { value: 27.8, name: 'Returning Visitors', itemStyle: { color: '#0b76ff' } },
          { value: 21.4, name: 'Engaged Customers', itemStyle: { color: '#22d3ee' } },
          { value: 12.6, name: 'Loyal Customers', itemStyle: { color: '#f59e0b' } },
          { value: 5.7, name: 'Inactive', itemStyle: { color: '#ec4899' } },
        ] 
      }],
    };
  }

  private funnel(): EChartsCoreOption {
    return {
      animationDuration: 1200,
      tooltip: { ...this.baseTooltip(), trigger: 'item' },
      series: [{ 
        type: 'funnel', left: '3%', top: 10, bottom: 10, width: '94%',
        minSize: '30%', maxSize: '100%', sort: 'descending', gap: 4, 
        label: { position: 'inside', color: '#fff', fontWeight: 600, formatter: '{c}' }, 
        itemStyle: { borderColor: 'transparent', borderWidth: 0, borderRadius: 4 }, 
        data: [
          { value: 12456, name: 'Add to Cart', itemStyle: { color: '#5b21f6' } },
          { value: 8765, name: 'View Cart', itemStyle: { color: '#7c3aed' } },
          { value: 4320, name: 'Checkout', itemStyle: { color: '#a21caf' } },
          { value: 2876, name: 'Purchase', itemStyle: { color: '#db2777' } },
        ] 
      }],
    };
  }

  private inventoryHeatmap(): EChartsCoreOption {
    const xs = ['Electro', 'Fashion', 'Home', 'Beauty', 'Sports', 'Toys'];
    const ys = ['High', 'Med', 'Low', 'Critical'];
    const values = [
      [0, 0, 30], [1, 0, 45], [2, 0, 42], [3, 0, 28], [4, 0, 56], [5, 0, 64],
      [0, 1, 43], [1, 1, 82], [2, 1, 88], [3, 1, 76], [4, 1, 52], [5, 1, 92],
      [0, 2, 58], [1, 2, 71], [2, 2, 77], [3, 2, 84], [4, 2, 81], [5, 2, 70],
      [0, 3, 65], [1, 3, 68], [2, 3, 60], [3, 3, 73], [4, 3, 41], [5, 3, 55],
    ];
    return {
      animationDuration: 1000,
      tooltip: { ...this.baseTooltip(), position: 'top' },
      grid: { left: 48, right: 14, top: 12, bottom: 26, containLabel: true },
      xAxis: { type: 'category', data: xs, axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: this.getAxisColor(), fontSize: 11 } },
      yAxis: { type: 'category', data: ys, axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: this.getAxisColor(), fontSize: 11 } },
      visualMap: { show: false, min: 20, max: 95, inRange: { color: ['#24116d', '#8b22f6', '#f43fcd', '#f59e0b', '#22c55e'] } },
      series: [{ 
        type: 'heatmap', data: values, label: { show: false }, 
        itemStyle: { borderRadius: 4, borderColor: this.isDark() ? '#0f172a' : '#ffffff', borderWidth: 2 } 
      }],
    };
  }
}
