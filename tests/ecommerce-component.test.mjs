import '@angular/compiler';
import {
  createEnvironmentInjector,
  runInInjectionContext,
  ChangeDetectorRef,
  signal
} from '@angular/core';
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  readFileSync, writeFileSync, mkdtempSync, rmSync
} from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const temp = mkdtempSync(
  join(process.cwd(), 'tests/.ecommerce-test-')
);

let EcommerceComponent;
let ThemeService;
let effects;
const injectors = [];

try {
  const source = readFileSync(
    'src/app/features/ecommerce/ecommerce.component.ts',
    'utf8'
  )
    .replace(
      "'../../core/services/theme.service'",
      "'./theme.service.mjs'"
    )
    .replace(
      'inject, effect, ChangeDetectorRef',
      'inject, ChangeDetectorRef'
    )
    + "\nimport { effect } from './theme.service.mjs';\n";

  writeFileSync(
    join(temp, 'theme.service.mjs'),
    `
    export class ThemeService {}
    export const effects = [];
    export function effect(callback) {
      effects.push(callback);
    }
    `
  );

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true
    }
  }).outputText;

  writeFileSync(
    join(temp, 'ecommerce.component.mjs'),
    compiled
  );

  ({ ThemeService, effects } = await import(
    pathToFileURL(join(temp, 'theme.service.mjs')).href
  ));

  ({ EcommerceComponent } = await import(
    pathToFileURL(
      join(temp, 'ecommerce.component.mjs')
    ).href
  ));
} finally {
  rmSync(temp, { recursive: true, force: true });
}

afterEach(() => {
  for (const injector of injectors.splice(0)) {
    injector.destroy();
  }
});

function createDashboard() {
  const theme = signal(false);
  let runThemeEffect = () => {};

  const injector = createEnvironmentInjector([
    {
      provide: ThemeService,
      useValue: {
        isDarkMode: theme,
        toggleTheme: () => {
          theme.update(v => !v);
          runThemeEffect();
        }
      }
    },
    {
      provide: ChangeDetectorRef,
      useValue: { markForCheck() {} }
    }
  ], null);

  injectors.push(injector);

  const dashboard = runInInjectionContext(
    injector,
    () => new EcommerceComponent()
  );

  runThemeEffect = effects.pop();
  assert.equal(typeof runThemeEffect, 'function');

  dashboard.ngOnInit();

  return dashboard;
}

test('ecommerce defaults to comparison disabled', () => {
  const d = createDashboard();

  assert.equal(d.compareEnabled(), false);
  assert.equal(d.selectedTimeRange(), 'Last 30 Days');
  assert.equal(d.kpis.length, 5);
});

test('ecommerce comparison toggles on and off', () => {
  const d = createDashboard();

  d.toggleCompare();
  assert.equal(d.compareEnabled(), true);

  d.toggleCompare();
  assert.equal(d.compareEnabled(), false);
});

test('ecommerce default KPI values are correct', () => {
  const d = createDashboard();

  assert.deepEqual(
    d.kpis.map(k => k.value),
    ['$248,760.50', '8,756', '6,582', '$28.41', '3.24%']
  );
});

test('ecommerce previous period values are correct', () => {
  const d = createDashboard();

  assert.deepEqual(
    d.kpis.map(k => k.previousValue),
    ['$209,747.47', '7,667', '5,835', '$27.36', '2.98%']
  );
});

test('ecommerce all five date ranges update totals', () => {
  const d = createDashboard();

  const ranges = [
    ['Today', 1 / 30],
    ['Last 7 Days', 7 / 30],
    ['Last 30 Days', 1],
    ['Last 90 Days', 3],
    ['This Year', 12]
  ];

  d.toggleCompare();

  for (const [range, factor] of ranges) {
    d.setTimeRange(range);

    const p = d.periodTotals();

    assert.equal(d.selectedTimeRange(), range);
    assert.equal(p.revenue, Math.round(24876050 * factor));
    assert.equal(p.orders, Math.round(8756 * factor));
    assert.equal(p.customers, Math.round(6582 * factor));
    assert.equal(d.compareEnabled(), true);

    for (const k of d.kpis) {
      assert.ok(!/NaN|Infinity/.test(k.delta));
    }
  }
});

test('ecommerce rejects invalid date ranges', () => {
  const d = createDashboard();

  d.setTimeRange('Invalid range');

  assert.equal(d.selectedTimeRange(), 'Last 30 Days');
  assert.equal(d.periodTotals().revenue, 24876050);
});

test('ecommerce adds and removes comparison chart series', () => {
  const d = createDashboard();

  for (const chart of [d.storePerformance, d.ordersAnalytics]) {
    assert.equal(chart.series.length, 1);
  }

  d.toggleCompare();

  for (const chart of [d.storePerformance, d.ordersAnalytics]) {
    assert.equal(chart.series.length, 2);
    assert.equal(chart.series[1].name, 'Previous (demo)');
    assert.equal(chart.legend.show, true);
  }

  d.toggleCompare();

  for (const chart of [d.storePerformance, d.ordersAnalytics]) {
    assert.equal(chart.series.length, 1);
    assert.equal(chart.legend.show, false);
  }
});

test('ecommerce chart totals reconcile across all periods', () => {
  const d = createDashboard();

  const sum = values => values.reduce((a, b) => a + b, 0);
  d.toggleCompare();

  for (const range of d.timeRanges) {
    d.setTimeRange(range);

    const p = d.periodTotals();
    const revenue = d.storePerformance.series;
    const orders = d.ordersAnalytics.series;

    assert.equal(
      Math.round(sum(revenue[0].data) * 100),
      p.revenue
    );

    assert.equal(
      Math.round(sum(revenue[1].data) * 100),
      p.previousRevenue
    );

    assert.equal(sum(orders[0].data), p.orders);
    assert.equal(sum(orders[1].data), p.previousOrders);
  }
});

test('ecommerce chart buckets follow selected range', () => {
  const d = createDashboard();

  d.toggleCompare();

  const ranges = [
    ['Today', 6],
    ['Last 7 Days', 7],
    ['Last 30 Days', 10],
    ['Last 90 Days', 9],
    ['This Year', 12]
  ];

  for (const [range, count] of ranges) {
    d.setTimeRange(range);

    for (const chart of [d.storePerformance, d.ordersAnalytics]) {
      assert.equal(chart.xAxis.data.length, count);

      for (const series of chart.series) {
        assert.equal(series.data.length, count);
      }
    }
  }
});

test('ecommerce average order value reconciles with totals', () => {
  const d = createDashboard();

  for (const range of d.timeRanges) {
    d.setTimeRange(range);

    const p = d.periodTotals();

    assert.equal(
      d.kpis[3].value,
      d.money(Math.round(p.revenue / p.orders))
    );

    assert.equal(
      d.kpis[3].previousValue,
      d.money(Math.round(p.previousRevenue / p.previousOrders))
    );
  }
});

test('ecommerce theme switching preserves comparison and period', () => {
  const d = createDashboard();

  d.setTimeRange('Last 7 Days');
  d.toggleCompare();

  const lightColor = d.storePerformance.legend.textStyle.color;
  const totals = d.periodTotals();

  d.toggleTheme();

  assert.equal(d.isDark(), true);
  assert.equal(d.compareEnabled(), true);
  assert.equal(d.selectedTimeRange(), 'Last 7 Days');
  assert.deepEqual(d.periodTotals(), totals);
  assert.equal(d.storePerformance.series.length, 2);

  assert.notEqual(
    d.storePerformance.legend.textStyle.color,
    lightColor
  );

  d.toggleTheme();

  assert.equal(d.isDark(), false);
  assert.equal(d.compareEnabled(), true);
});

test('ecommerce comparison preserves snapshot charts', () => {
  const d = createDashboard();

  d.toggleCompare();

  assert.equal(d.revenueTracking.series.length, 1);
  assert.equal(d.cartConversion.series.length, 1);
  assert.equal(d.shoppingBehavior.series.length, 1);
  assert.equal(d.heatmap.series.length, 1);
});

test('ecommerce product trend filters work correctly', () => {
  const d = createDashboard();

  assert.equal(d.filteredProducts().length, 5);

  d.setProductFilter('up');
  assert.equal(d.filteredProducts().length, 4);

  d.setProductFilter('down');
  assert.equal(d.filteredProducts().length, 1);
  assert.equal(d.filteredProducts()[0].name, 'Polarized Sunglasses');

  d.setProductFilter('all');
  assert.equal(d.filteredProducts().length, 5);
});

test('ecommerce product search combines with trend filter', () => {
  const d = createDashboard();

  d.setProductFilter('up');
  d.productTrendsSearch.set('  SMART WATCH  ');

  assert.equal(d.filteredProducts().length, 1);

  d.setProductFilter('down');
  assert.equal(d.filteredProducts().length, 0);
});

test('ecommerce vendor search ignores case and whitespace', () => {
  const d = createDashboard();

  d.vendorsSearch.set('  TECH  ');
  assert.equal(d.filteredVendors().length, 1);

  d.vendorsSearch.set('not-found');
  assert.equal(d.filteredVendors().length, 0);
});

test('ecommerce reset clears filters and searches', () => {
  const d = createDashboard();

  d.setProductFilter('down');
  d.productTrendsSearch.set('watch');
  d.vendorsSearch.set('tech');

  assert.equal(d.filtersActive(), true);

  d.resetFilters();

  assert.equal(d.filtersActive(), false);
  assert.equal(d.productTrendFilter(), 'all');
  assert.equal(d.productTrendsSearch(), '');
  assert.equal(d.vendorsSearch(), '');
  assert.equal(d.filteredProducts().length, 5);
  assert.equal(d.filteredVendors().length, 5);
});

test('ecommerce rejects invalid product filters', () => {
  const d = createDashboard();

  d.setProductFilter('up');
  d.setProductFilter('invalid');

  assert.equal(d.productTrendFilter(), 'up');
});

test('ecommerce filters preserve analytics totals', () => {
  const d = createDashboard();
  const totals = d.periodTotals();

  d.setProductFilter('down');

  assert.deepEqual(d.periodTotals(), totals);
});

test('ecommerce CSV contains header and five KPI rows', () => {
  const d = createDashboard();
  const rows = d.buildCsv().split('\r\n');

  assert.equal(rows.length, 6);
  assert.equal(
    rows[0],
    '"Data Type","Period","Metric","Current","Previous","Change (%)"'
  );

  assert.ok(!d.buildCsv().includes('\\r\\n'));
});

test('ecommerce CSV includes previous values when compare is enabled', () => {
  const d = createDashboard();

  d.setTimeRange('Last 7 Days');
  d.toggleCompare();

  assert.ok(d.buildCsv().includes(
    '"Demo","Last 7 Days","Total Revenue","$58,044.12","$48,941.08","18.6"'
  ));
});

test('ecommerce CSV omits previous values when compare is disabled', () => {
  const d = createDashboard();

  d.setTimeRange('Last 7 Days');

  assert.ok(d.buildCsv().includes(
    '"Demo","Last 7 Days","Total Revenue","$58,044.12","","18.6"'
  ));
});

test('ecommerce CSV follows all selected date ranges', () => {
  const d = createDashboard();

  for (const range of d.timeRanges) {
    d.setTimeRange(range);

    const rows = d.buildCsv().split('\r\n');

    assert.equal(rows.length, 6);

    for (const row of rows.slice(1)) {
      assert.ok(row.startsWith(`"Demo","${range}",`));
    }
  }
});
