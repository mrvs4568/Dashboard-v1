import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as core from '@angular/core';
import * as echarts from 'echarts';

const source = readFileSync(
  'src/app/features/financial/financial.component.ts',
  'utf8'
);

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    experimentalDecorators: true,
    esModuleInterop: true
  }
}).outputText;

function createComponent() {
  const darkMode = core.signal(false);

  const theme = {
    isDarkMode: darkMode,
    toggleTheme: () => darkMode.update(value => !value)
  };

  const module = { exports: {} };

  const mockRequire = name => {
    if (name === '@angular/core') {
      return {
        ...core,
        Component: () => target => target,
        inject: () => theme
      };
    }

    if (name === 'echarts/core') {
      return {
        ...echarts,
        use: () => {}
      };
    }

    if (name === 'ngx-echarts') {
      return {
        NgxEchartsDirective: class {},
        provideEchartsCore: () => ({})
      };
    }

    return {};
  };

  new Function('require', 'module', 'exports', compiled)(
    mockRequire, module, module.exports
  );

  return new module.exports.FinancialOverviewComponent({});
}

const periods = ['day', 'week', 'month', 'year'];

const sum = values =>
  values.reduce((total, value) => total + value, 0);

test('Financial defaults to monthly period', () => {
  const c = createComponent();
  assert.equal(c.period(), 'month');
  assert.equal(c.periodLabel, 'This Month');
  assert.equal(c.kpis().length, 5);
});

test('Financial comparison defaults to disabled', () => {
  const c = createComponent();
  assert.equal(c.compareEnabled(), false);
});

test('Financial comparison toggles correctly', () => {
  const c = createComponent();
  c.toggleCompare();
  assert.equal(c.compareEnabled(), true);
  c.toggleCompare();
  assert.equal(c.compareEnabled(), false);
});

test('Financial monthly totals are correct', () => {
  const c = createComponent();
  const totals = c.financialTotals();

  assert.equal(totals.income, 790000);
  assert.equal(totals.expenses, 440000);
  assert.equal(totals.profit, 350000);
  assert.equal(totals.cashFlow, 350000);
  assert.equal(totals.forecast, 870000);
});

test('Financial profit reconciles across all periods', () => {
  const c = createComponent();

  for (const period of periods) {
    c.setPeriod(period);
    const t = c.financialTotals();

    assert.equal(t.profit, t.income - t.expenses);
    assert.equal(sum(c.profitSeries()) * 1000, t.profit);
  }
});

test('Financial KPI values follow selected period', () => {
  const c = createComponent();

  for (const period of periods) {
    c.setPeriod(period);
    const t = c.financialTotals();

    assert.equal(c.kpis()[1].value, c.currency.format(t.income));
    assert.equal(c.kpis()[2].value, c.currency.format(t.expenses));
    assert.equal(c.kpis()[3].value, c.currency.format(t.profit));
    assert.equal(c.kpis()[4].value, c.currency.format(t.cashFlow));
  }
});

test('Financial expense breakdown reconciles', () => {
  const c = createComponent();

  for (const period of periods) {
    c.setPeriod(period);
    const rows = c.expenseBreakdown();

    assert.equal(
      sum(rows.map(row => Math.round(row.value * 100))),
      Math.round(c.financialTotals().expenses * 100)
    );

    assert.ok(
      Math.abs(sum(rows.map(row => row.percentage)) - 100) < 0.001
    );
  }
});

test('Financial comparison handles positive negative and flat changes', () => {
  const c = createComponent();
  c.toggleCompare();

  assert.equal(c.comparison(120, 100).trend, 'up');
  assert.equal(c.comparison(80, 100).trend, 'down');
  assert.equal(c.comparison(100, 100).trend, 'neutral');
  assert.equal(c.comparison(100, 0).delta, 'N/A');
});

test('Financial comparison adds and removes chart series', () => {
  const c = createComponent();

  assert.equal(c.incomeExpenseChart().series.length, 2);

  c.toggleCompare();
  assert.equal(c.incomeExpenseChart().series.length, 4);

  c.toggleCompare();
  assert.equal(c.incomeExpenseChart().series.length, 2);
});

test('Financial chart labels match series across periods', () => {
  const c = createComponent();
  c.toggleCompare();

  for (const period of periods) {
    c.setPeriod(period);

    for (const chart of [
      c.incomeExpenseChart(),
      c.cashFlowChart(),
      c.profitChart(),
      c.forecastChart()
    ]) {
      for (const series of chart.series) {
        assert.equal(series.data.length, chart.xAxis.data.length);
      }
    }
  }
});

test('Financial CSV omits previous values when disabled', () => {
  const c = createComponent();
  const csv = c.buildReportCsv();

  assert.ok(csv.includes('Data Source,Demo'));
  assert.ok(csv.includes('Comparison,Disabled'));
  assert.ok(!csv.includes('Previous Demo Amount'));
});

test('Financial CSV includes synthetic comparison values', () => {
  const c = createComponent();
  c.toggleCompare();

  const csv = c.buildReportCsv();

  assert.ok(csv.includes('Previous Demo Amount'));
  assert.ok(csv.includes('Enabled - Synthetic Data'));
  assert.ok(csv.includes('Change (%)'));
});

test('Financial transaction filters return correct counts', () => {
  const c = createComponent();

  for (const [filter, count] of Object.entries({
    all: 5,
    income: 2,
    expense: 3
  })) {
    c.setTransactionFilter(filter);
    assert.equal(c.filteredTransactions().length, count);
  }

  c.setTransactionFilter('invalid');
  assert.equal(c.transactionFilter(), 'expense');
});

test('Financial cash flow filters work correctly', () => {
  const c = createComponent();
  c.setPeriod('day');

  c.setCashFlowFilter('positive');
  assert.ok(c.cashFlowChart().series[0].data.every(v => v >= 0));

  c.setCashFlowFilter('negative');
  assert.ok(c.cashFlowChart().series[0].data.every(v => v <= 0));

  c.setCashFlowFilter('all');
  const values = c.cashFlowChart().series[0].data;

  assert.ok(values.some(v => v > 0));
  assert.ok(values.some(v => v < 0));
});

test('Financial market expansion works correctly', () => {
  const c = createComponent();

  assert.equal(c.visibleMarkets().length, 5);
  c.toggleMarkets();
  assert.equal(c.visibleMarkets().length, 8);
  c.toggleMarkets();
  assert.equal(c.visibleMarkets().length, 5);
});

test('Financial category sorting works correctly', () => {
  const c = createComponent();
  const numeric = value => Number(value.replace(/[^0-9.]/g, ''));

  for (const sort of ['revenue', 'orders', 'growth']) {
    c.setCategorySort(sort);
    const values = c.sortedCategories().map(row => numeric(row[sort]));

    assert.deepEqual(values, [...values].sort((a, b) => b - a));
  }
});

test('Financial notification read state updates', () => {
  const c = createComponent();

  assert.equal(c.notificationsRead(), false);
  c.markNotificationsRead();
  assert.equal(c.notificationsRead(), true);
});

test('Financial theme preserves state and banking actions remain disabled', () => {
  const c = createComponent();

  c.setPeriod('year');
  c.setTransactionFilter('income');
  c.toggleCompare();
  c.toggleTheme();

  assert.equal(c.isDark(), true);
  assert.equal(c.period(), 'year');
  assert.equal(c.transactionFilter(), 'income');
  assert.equal(c.compareEnabled(), true);

  assert.equal(c.isQuickActionAvailable('Download Statement'), true);
  assert.equal(c.isQuickActionAvailable('Add Transaction'), false);
  assert.equal(c.isQuickActionAvailable('Transfer Funds'), false);
  assert.equal(c.isQuickActionAvailable('Pay Bills'), false);
});
