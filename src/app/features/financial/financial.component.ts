import { ChangeDetectionStrategy, Component, computed, signal, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { animate, stagger } from 'motion';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ThemeService } from '../../core/services/theme.service';

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

type Period = 'day' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-financial-overview',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatChipsModule, 
    MatDividerModule, 
    MatProgressBarModule, 
    MatListModule,
    NgxEchartsDirective
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancialOverviewComponent implements AfterViewInit {
  private themeService = inject(ThemeService);
  
  readonly period = signal<Period>('month');

  readonly compareEnabled = signal(false);

  toggleCompare(): void {
    this.compareEnabled.update(value => !value);
  }

  readonly previousTotals = computed(() => {
    const d = this.financialTotals();

    const income = Math.round(d.income * 0.91);
    const expenses = Math.round(d.expenses * 1.05);

    return {
      income,
      expenses,
      profit: income - expenses,
      cashFlow: Math.round(d.cashFlow * 0.88),
      forecast: Math.round(d.forecast * 0.90)
    };
  });

  comparison(current: number, previous: number) {
    if (!this.compareEnabled() || previous === 0) {
      return {
        delta: 'N/A',
        trend: 'neutral',
        helper: 'No comparison enabled'
      };
    }

    const change = (current - previous) / Math.abs(previous) * 100;

    return {
      delta: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      helper: 'vs previous demo period'
    };
  }

  readonly isDark = this.themeService.isDarkMode;

  readonly periods = [
    { label: 'Today', value: 'day' as Period },
    { label: 'This Week', value: 'week' as Period },
    { label: 'This Month', value: 'month' as Period },
    { label: 'This Year', value: 'year' as Period },
  ];

  readonly labels = computed(() => {
    const p = this.period();
    if (p === 'day') return ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
    if (p === 'week') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (p === 'year') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  });

  private readonly data = {
    day: { 
      income: [8, 12, 10, 18, 24, 21, 28], 
      expense: [5, 8, 9, 13, 10, 14, 16], 
      cash: [4, 9, -5, 12, -8, 14, 18], 
      forecast: [10, 13, 18, 22, 28, 33, 39], 
    },
    week: { 
      income: [30, 45, 38, 52, 60, 48, 70], 
      expense: [15, 25, 20, 30, 35, 28, 40], 
      cash: [15, 20, 18, 22, 25, 20, 30], 
      forecast: [35, 50, 45, 60, 70, 55, 80], 
    },
    month: { 
      income: [150, 210, 180, 250], 
      expense: [80, 120, 100, 140], 
      cash: [70, 90, 80, 110], 
      forecast: [160, 230, 200, 280], 
    },
    year: { 
      income: [510, 680, 790, 940, 1100, 1280, 1460, 1350, 1520, 1680, 1800, 2100], 
      expense: [260, 330, 420, 510, 575, 660, 735, 690, 780, 850, 920, 1050], 
      cash: [90, 140, 210, -80, 280, 340, 420, 380, 450, 510, 560, 680], 
      forecast: [420, 560, 690, 840, 1040, 1260, 1510, 1420, 1600, 1780, 1900, 2250], 
    },
  };

  readonly profitSeries = computed(() => {
    const d = this.data[this.period()];
    return d.income.map((income, i) => income - d.expense[i]);
  });

  readonly financialTotals = computed(() => {
    const d = this.data[this.period()];
    const sum = (values: number[]) =>
      values.reduce((total, value) => total + value, 0) * 1000;

    return {
      income: sum(d.income),
      expenses: sum(d.expense),
      profit: sum(this.profitSeries()),
      cashFlow: sum(d.cash),
      forecast: sum(d.forecast)
    };
  });

  readonly currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  readonly kpis = computed(() => {
    const totals = this.financialTotals();
    const previous = this.previousTotals();
    const values = [
      this.currency.format(101750.50),
      this.currency.format(totals.income),
      this.currency.format(totals.expenses),
      this.currency.format(totals.profit),
      this.currency.format(totals.cashFlow)
    ];

    return [
      { title: 'Total Balance', value: values[0], delta: 'N/A', helper: 'No comparison data', icon: 'account_balance_wallet', accent: 'violet', trend: 'neutral', spark: [2,3,3,5,4,7,6,9] },
      { title: 'Total Income', value: values[1], ...this.comparison(totals.income, previous.income), icon: 'trending_up', accent: 'green', spark: [1,2,4,3,6,7,10] },
      { title: 'Total Expenses', value: values[2], ...this.comparison(totals.expenses, previous.expenses), icon: 'south', accent: 'orange', spark: [5,4,6,3,7,5,8] },
      { title: 'Net Profit', value: values[3], ...this.comparison(totals.profit, previous.profit), icon: 'person', accent: 'blue', spark: [1,2,3,4,3,8,7,11] },
      { title: 'Cash Flow', value: values[4], ...this.comparison(totals.cashFlow, previous.cashFlow), icon: 'payments', accent: 'cyan', spark: [3,4,5,4,7,8,10,13] },
    ];
  });

  readonly incomeExpenseChart = computed(() => this.makeIncomeExpenseChart());
  readonly expenseBreakdownChart = computed(() => this.makeExpenseBreakdownChart());
  readonly cashFlowChart = computed(() => this.makeCashFlowChart());
  readonly investmentChart = computed(() => this.makeDonutChart([['Stocks', 68450, '#2563eb'], ['Bonds', 32120, '#7c3aed'], ['ETFs', 28750, '#06b6d4'], ['Crypto', 18230, '#8b5cf6'], ['Cash', 9230, '#f59e0b']]));
  readonly profitChart = computed(() => this.makeProfitChart());
  readonly forecastChart = computed(() => this.makeForecastChart());
  readonly invoiceChart = computed(() => this.makeDonutChart([['Paid', 112, '#2563eb'], ['Pending', 32, '#06b6d4'], ['Overdue', 12, '#9333ea']]));

  readonly budgetRows = [
    { name: 'Housing', budget: '$10,000', actual: '$7,850', progress: 78.5 },
    { name: 'Transportation', budget: '$5,000', actual: '$4,320', progress: 86.4 },
    { name: 'Food & Dining', budget: '$4,000', actual: '$3,680', progress: 92 },
    { name: 'Utilities', budget: '$2,500', actual: '$1,890', progress: 75.6 },
    { name: 'Others', budget: '$7,000', actual: '$6,940', progress: 99.1 },
  ];
  readonly accounts = [
    { name: 'Main Account', number: '**** 4507', value: '$45,780.50' },
    { name: 'Savings Account', number: '**** 8912', value: '$32,680.00' },
    { name: 'Business Account', number: '**** 2345', value: '$28,450.00' },
    { name: 'Credit Card', number: '**** 1234', value: '-$5,160.00' },
  ];
  readonly transactions = [
    { icon: 'work', title: 'Salary Payment', date: 'Jun 12, 2026', amount: '+$4,850.00', trend: 'up', accent: 'green' },
    { icon: 'shopping_bag', title: 'Amazon Purchase', date: 'Jun 11, 2026', amount: '-$125.50', trend: 'down', accent: 'orange' },
    { icon: 'bolt', title: 'Electricity Bill', date: 'Jun 10, 2026', amount: '-$85.40', trend: 'down', accent: 'amber' },
    { icon: 'public', title: 'Freelance Work', date: 'Jun 9, 2026', amount: '+$1,250.00', trend: 'up', accent: 'green' },
    { icon: 'subscriptions', title: 'Netflix Subscription', date: 'Jun 8, 2026', amount: '-$15.99', trend: 'down', accent: 'red' },
  ];
  readonly transactionFilter =
    signal<'all' | 'income' | 'expense'>('all');

  setTransactionFilter(
    filter: 'all' | 'income' | 'expense'
  ): void {
    if (['all', 'income', 'expense'].includes(filter)) {
      this.transactionFilter.set(filter);
    }
  }

  readonly filteredTransactions = computed(() => {
    const filter = this.transactionFilter();

    if (filter === 'all') {
      return this.transactions;
    }

    return this.transactions.filter(tx =>
      filter === 'income'
        ? tx.trend === 'up'
        : tx.trend === 'down'
    );
  });

  runQuickAction(title: string): void {
    if (title === 'Download Statement') {
      this.downloadReport();
    }
  }

  isQuickActionAvailable(title: string): boolean {
    return title === 'Download Statement';
  }

  readonly notificationsRead = signal(false);

  readonly notifications = [
    'Demo financial report is available.',
    'Review your sample budget allocations.',
    'Financial data is for demonstration only.'
  ];

  markNotificationsRead(): void {
    this.notificationsRead.set(true);
  }

  readonly quickActions = [
    { icon: 'add_link', title: 'Add Transaction', sub: 'Requires transaction integration' },
    { icon: 'sync_alt', title: 'Transfer Funds', sub: 'Requires banking integration' },
    { icon: 'receipt_long', title: 'Pay Bills', sub: 'Requires payment integration' },
    { icon: 'download', title: 'Download Statement', sub: 'Download demo financial report' },
  ];
  readonly markets = [
    { symbol: 'S&P 500', value: '5,345.21', delta: '1.25%', trend: 'up', spark: [1,3,2,5,4,7] },
    { symbol: 'NASDAQ', value: '17,895.22', delta: '2.35%', trend: 'up', spark: [2,4,3,6,7,9] },
    { symbol: 'DOW JONES', value: '38,747.42', delta: '0.95%', trend: 'up', spark: [1,2,4,4,6,8] },
    { symbol: 'GOLD', value: '2,340.50', delta: '0.68%', trend: 'up', spark: [2,3,5,4,7,10] },
    { symbol: 'OIL', value: '78.45', delta: '1.25%', trend: 'down', spark: [8,6,7,5,6,4] },
    { symbol: 'BTC/USD', value: '67,890.50', delta: '3.45%', trend: 'up', spark: [3,2,5,4,7,11] },
    { symbol: 'ETH/USD', value: '3,456.78', delta: '2.18%', trend: 'up', spark: [2,3,4,6,5,8] },
    { symbol: 'USD/EUR', value: '0.9156', delta: '0.35%', trend: 'down', spark: [7,6,8,5,4,3] },
  ];
  readonly categories = [
    { name: 'Electronics', revenue: '$78,450', orders: '2,156', growth: '24.6%', width: 92, icon: 'devices' },
    { name: 'Fashion', revenue: '$65,780', orders: '1,856', growth: '18.3%', width: 78, icon: 'checkroom' },
    { name: 'Home & Kitchen', revenue: '$45,230', orders: '1,245', growth: '16.7%', width: 56, icon: 'kitchen' },
    { name: 'Beauty & Health', revenue: '$32,160', orders: '987', growth: '12.5%', width: 42, icon: 'spa' },
    { name: 'Sports & Outdoors', revenue: '$28,540', orders: '789', growth: '10.3%', width: 36, icon: 'fitness_center' },
  ];

  readonly showAllMarkets = signal(false);

  toggleMarkets(): void {
    this.showAllMarkets.update(value => !value);
  }

  readonly visibleMarkets = computed(() =>
    this.showAllMarkets()
      ? this.markets
      : this.markets.slice(0, 5)
  );

  readonly categorySort =
    signal<'revenue' | 'orders' | 'growth'>('revenue');

  setCategorySort(
    sort: 'revenue' | 'orders' | 'growth'
  ): void {
    if (['revenue', 'orders', 'growth'].includes(sort)) {
      this.categorySort.set(sort);
    }
  }

  readonly sortedCategories = computed(() => {
    const sort = this.categorySort();
    const numeric = (value: string) =>
      Number(value.replace(/[^0-9.]/g, ''));

    return [...this.categories].sort(
      (a, b) => numeric(b[sort]) - numeric(a[sort])
    );
  });

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.animateEntrance();
  }

  setPeriod(period: Period): void { 
    this.period.set(period); 
  }
  
  buildReportCsv(): string {
    const totals = this.financialTotals();
    const previous = this.previousTotals();
    const compare = this.compareEnabled();

    const metrics = [
      { name: 'Total Income', current: totals.income, previous: previous.income },
      { name: 'Total Expenses', current: totals.expenses, previous: previous.expenses },
      { name: 'Net Profit', current: totals.profit, previous: previous.profit },
      { name: 'Cash Flow', current: totals.cashFlow, previous: previous.cashFlow },
      { name: 'Revenue Forecast', current: totals.forecast, previous: previous.forecast }
    ];

    const rows: string[][] = [
      ['Period', this.period()],
      ['Currency', 'USD'],
      ['Data Source', 'Demo'],
      ['Comparison', compare ? 'Enabled - Synthetic Data' : 'Disabled'],
      compare
        ? ['Metric', 'Amount', 'Previous Demo Amount', 'Change (%)']
        : ['Metric', 'Amount'],
      ...metrics.map(metric => {
        const row = [
          metric.name,
          metric.current.toFixed(2)
        ];

        if (compare) {
          const change = metric.previous === 0
            ? 'N/A'
            : ((metric.current - metric.previous)
              / Math.abs(metric.previous) * 100).toFixed(2);

          row.push(metric.previous.toFixed(2), change);
        }

        return row;
      }),
      [],
      ['Expense Category', 'Amount', 'Percentage'],
      ...this.expenseBreakdown().map(row => [
        row.name,
        row.value.toFixed(2),
        row.percentage.toFixed(2)
      ])
    ];

    return rows.map(row => row.join(',')).join('\r\n');
  }

  downloadReport(): void {
    const blob = new Blob([this.buildReportCsv()], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `financial-report-${this.period()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  toggleTheme(): void { 
    this.themeService.toggleTheme();
  }

  get periodLabel(): string {
    const p = this.period();
    return p === 'day' ? 'Today' : p === 'week' ? 'This Week' : p === 'year' ? '2026' : 'This Month';
  }

  private animateEntrance() {
    const el = this.elementRef.nativeElement;
    
    animate(el.querySelector('.financial-shell'), 
      { opacity: [0, 1] }, 
      { duration: 0.6, ease: 'easeOut' }
    );

    const cards = el.querySelectorAll('.animate-in');
    if (cards.length) {
      animate(cards, 
        { opacity: [0, 1], y: [20, 0] }, 
        { duration: 0.5, delay: stagger(0.06), ease: 'easeOut' } as any
      );
    }
  }

  sparkline(color: string, data: number[]) { 
    return { 
      animation: true, 
      grid: { left: 0, right: 0, top: 2, bottom: 2 }, 
      xAxis: { type: 'category', show: false }, 
      yAxis: { type: 'value', show: false, scale: true }, 
      series: [{ 
        type: 'line', 
        data, 
        smooth: 0.4, 
        symbol: 'none', 
        lineStyle: { color, width: 2.5 }, 
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0,0,0,1,[
            { offset: 0, color: `${color}66` }, 
            { offset: 1, color: `${color}00` }
          ]) 
        } 
      }] 
    }; 
  }

  private tooltip() { 
    const isDark = this.isDark();
    return { 
      backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)', 
      borderColor: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.1)', 
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { 
        color: isDark ? '#f8fafc' : '#0f172a',
        fontFamily: 'Inter, sans-serif',
        fontSize: 13
      }, 
      extraCssText: 'border-radius:12px;box-shadow:0 10px 40px -10px rgba(0,0,0,0.3);backdrop-filter:blur(8px);' 
    }; 
  }
  
  private axisColor() { return this.isDark() ? '#64748b' : '#94a3b8'; }
  private splitColor() { return this.isDark() ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.05)'; }

  private makeIncomeExpenseChart() { 
    const d = this.data[this.period()]; 
    return { 
      animationDuration: 1000, 
      tooltip: { ...this.tooltip(), trigger: 'axis' }, 
      legend: { 
        top: 0, 
        right: 0, 
        icon: 'circle',
        itemWidth: 10,
        textStyle: { color: this.axisColor() } 
      }, 
      grid: { top: this.compareEnabled() ? 65 : 40, left: 0, right: 0, bottom: 0, containLabel: true },
      xAxis: { 
        type: 'category', 
        boundaryGap: false, 
        data: this.labels(), 
        axisTick: { show: false }, 
        axisLine: { lineStyle: { color: this.splitColor() } }, 
        axisLabel: { color: this.axisColor(), margin: 16 } 
      }, 
      yAxis: { 
        type: 'value', 
        axisLabel: { color: this.axisColor(), formatter: '${value}K' }, 
        splitLine: { lineStyle: { color: this.splitColor(), type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false }
      }, 
      series: [
        { 
          name: 'Income', 
          type: 'line', 
          smooth: 0.4, 
          data: d.income, 
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          lineStyle: { width: 3, color: '#22c55e' }, 
          itemStyle: { color: '#22c55e', borderWidth: 2, borderColor: '#fff' }, 
          areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{ offset: 0, color: 'rgba(34,197,94,.3)' }, { offset: 1, color: 'rgba(34,197,94,0)' }]) } 
        }, 
        { 
          name: 'Expenses', 
          type: 'line', 
          smooth: 0.4, 
          data: d.expense, 
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          lineStyle: { width: 3, color: '#8b5cf6' }, 
          itemStyle: { color: '#8b5cf6', borderWidth: 2, borderColor: '#fff' }, 
          areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{ offset: 0, color: 'rgba(139,92,246,.3)' }, { offset: 1, color: 'rgba(139,92,246,0)' }]) } 
        }
      ,
        ...(this.compareEnabled() ? [
          {
            name: 'Previous Income (Demo)',
            type: 'line',
            data: d.income.map(value => value * 0.91),
            smooth: 0.4,
            symbol: 'none',
            lineStyle: {
              width: 2,
              type: 'dashed',
              color: '#22c55e',
              opacity: 0.65
            },
            itemStyle: { color: '#22c55e' }
          },
          {
            name: 'Previous Expenses (Demo)',
            type: 'line',
            data: d.expense.map(value => value * 1.05),
            smooth: 0.4,
            symbol: 'none',
            lineStyle: {
              width: 2,
              type: 'dashed',
              color: '#8b5cf6',
              opacity: 0.65
            },
            itemStyle: { color: '#8b5cf6' }
          }
        ] : [])
      ] 
    }; 
  }
  
  readonly cashFlowFilter =
    signal<'all' | 'positive' | 'negative'>('all');

  setCashFlowFilter(
    filter: 'all' | 'positive' | 'negative'
  ): void {
    if (['all', 'positive', 'negative'].includes(filter)) {
      this.cashFlowFilter.set(filter);
    }
  }

  private makeCashFlowChart() { 
    const filter = this.cashFlowFilter();
    const d = this.data[this.period()].cash.map(value =>
      filter === 'all' ||
      (filter === 'positive' && value > 0) ||
      (filter === 'negative' && value < 0)
        ? value : 0
    );
    return { 
      animationDuration: 1000, 
      tooltip: { ...this.tooltip(), trigger: 'axis' }, 
      grid: { top: 10, left: 0, right: 0, bottom: 0, containLabel: true }, 
      xAxis: { 
        type: 'category', 
        data: this.labels(), 
        axisTick: { show: false }, 
        axisLine: { lineStyle: { color: this.splitColor() } }, 
        axisLabel: { color: this.axisColor(), margin: 16 } 
      }, 
      yAxis: { 
        type: 'value', 
        axisLabel: { color: this.axisColor(), formatter: '${value}K' }, 
        splitLine: { lineStyle: { color: this.splitColor(), type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false }
      }, 
      series: [{ 
        type: 'bar', 
        data: d, 
        barWidth: '35%', 
        barMaxWidth: 30,
        itemStyle: { 
          borderRadius: [6,6,6,6], 
          color: (p: any) => p.value >= 0 
            ? new echarts.graphic.LinearGradient(0,0,0,1,[{ offset: 0, color: '#0ea5e9' }, { offset: 1, color: 'rgba(14,165,233,0.3)' }]) 
            : new echarts.graphic.LinearGradient(0,0,0,1,[{ offset: 0, color: '#f43f5e' }, { offset: 1, color: 'rgba(244,63,94,0.3)' }]) 
        } 
      }] 
    }; 
  }
  
  readonly expenseBreakdown = computed(() => {
    const total = this.financialTotals().expenses;

    const categories = [
      { name: 'Housing', weight: 7850, color: '#0ea5e9' },
      { name: 'Transport', weight: 4320, color: '#fb7185' },
      { name: 'Food', weight: 3680, color: '#6366f1' },
      { name: 'Shopping', weight: 2450, color: '#f59e0b' },
      { name: 'Utilities', weight: 1890, color: '#a855f7' },
      { name: 'Others', weight: 2370, color: '#14b8a6' }
    ];

    const weightTotal = categories.reduce(
      (sum, row) => sum + row.weight, 0
    );

    let remaining = Math.round(total * 100);

    return categories.map((row, index) => {
      const cents = index === categories.length - 1
        ? remaining
        : Math.round(total * 100 * row.weight / weightTotal);

      remaining -= cents;
      const value = cents / 100;

      return {
        name: row.name,
        color: row.color,
        value,
        percentage: total > 0 ? value / total * 100 : 0
      };
    });
  });

  private makeExpenseBreakdownChart() {
    return this.makeDonutChart(
      this.expenseBreakdown().map(
        (row): [string, number, string] =>
          [row.name, row.value, row.color]
      )
    );
  }

  private makeDonutChart(rows: [string, number, string][]) { 
    return { 
      animationDuration: 1200,
      animationType: 'scale',
      tooltip: { ...this.tooltip(), trigger: 'item' }, 
      legend: { show: false }, 
      series: [{ 
        type: 'pie', 
        radius: ['60%','85%'], 
        center: ['50%','50%'], 
        label: { show: false }, 
        itemStyle: { 
          borderRadius: 8, 
          borderWidth: 4, 
          borderColor: this.isDark() ? '#0f172a' : '#ffffff' 
        }, 
        data: rows.map(([name, value, color]) => ({ name, value, itemStyle: { color } })) 
      }] 
    }; 
  }

  private makeProfitChart() { 
    return { 
      animationDuration: 1000, 
      tooltip: { ...this.tooltip(), trigger: 'axis' }, 
      grid: { top: 10, left: 0, right: 0, bottom: 0, containLabel: true }, 
      xAxis: { 
        type: 'category', 
        data: this.labels(), 
        axisTick: { show: false }, 
        axisLine: { show: false }, 
        axisLabel: { color: this.axisColor(), margin: 12 } 
      }, 
      yAxis: { 
        type: 'value', 
        splitLine: { lineStyle: { color: this.splitColor(), type: 'dashed' } }, 
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      }, 
      series: [{ 
        type: 'line', 
        data: this.profitSeries(),
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { width: 3, color: '#8b5cf6' },
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0,0,0,1,[{ offset: 0, color: 'rgba(139,92,246,0.4)' }, { offset: 1, color: 'rgba(139,92,246,0)' }]) 
        } 
      }] 
    }; 
  }
  
  private makeForecastChart() { 
    const f = this.data[this.period()].forecast; 
    return { 
      animationDuration: 1000, 
      tooltip: { ...this.tooltip(), trigger: 'axis' }, 
      grid: { top: 10, left: 0, right: 0, bottom: 0, containLabel: true }, 
      xAxis: { 
        type: 'category', 
        boundaryGap: false, 
        data: this.labels(), 
        axisTick: { show: false }, 
        axisLine: { show: false }, 
        axisLabel: { color: this.axisColor(), margin: 12 } 
      }, 
      yAxis: { 
        type: 'value', 
        axisLabel: { show: false }, 
        splitLine: { lineStyle: { color: this.splitColor(), type: 'dashed' } },
        axisTick: { show: false },
        axisLine: { show: false },
      }, 
      series: [
        { 
          name: 'Actual', 
          type: 'line', 
          smooth: 0.4, 
          symbol: 'none',
          data: f.map((v,i) => i < f.length - 2 ? v : null), 
          lineStyle: { width: 3, color: '#f59e0b' },
          areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{ offset: 0, color: 'rgba(245,158,11,0.3)' }, { offset: 1, color: 'rgba(245,158,11,0)' }]) } 
        }, 
        { 
          name: 'Forecast', 
          type: 'line', 
          smooth: 0.4, 
          symbol: 'none',
          data: f, 
          lineStyle: { width: 3, color: '#94a3b8', type: 'dashed' } 
        }
      ] 
    }; 
  }
}
