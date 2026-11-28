import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as core from '@angular/core';
import * as echarts from 'echarts';

const source = readFileSync(
  'src/app/features/crm-dashboard/crm-dashboard.component.ts',
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

    if (name === 'echarts') return echarts;

    return {};
  };

  new Function('require', 'module', 'exports', compiled)(
    mockRequire, module, module.exports
  );

  return new module.exports.CrmDashboardComponent();
}

test('CRM defaults to monthly period', () => {
  const c = createComponent();
  assert.equal(c.period(), 'month');
  assert.equal(c.periodLabel(), 'This Month');
  assert.equal(c.kpis().length, 6);
});

test('CRM all four periods update KPI values', () => {
  const c = createComponent();

  const expected = {
    day: 1965,
    week: 8599,
    month: 24568,
    year: 294816
  };

  for (const [period, count] of Object.entries(expected)) {
    c.setPeriod(period);

    assert.equal(
      c.kpis()[0].value,
      count.toLocaleString()
    );
  }
});

test('CRM rejects invalid periods', () => {
  const c = createComponent();
  c.setPeriod('invalid');
  assert.equal(c.period(), 'month');
});

test('CRM chart labels match data across all periods', () => {
  const c = createComponent();

  for (const period of ['day', 'week', 'month', 'year']) {
    c.setPeriod(period);

    for (const options of [
      c.clientEngagementOptions(),
      c.relationshipOptions(),
      c.retentionOptions(),
      c.supportMetricsOptions()
    ]) {
      for (const series of options.series) {
        assert.equal(
          options.xAxis.data.length,
          series.data.length
        );
      }
    }
  }
});

test('CRM percentage series remain within valid bounds', () => {
  const c = createComponent();

  for (const period of ['day', 'week', 'month', 'year']) {
    c.setPeriod(period);

    for (const options of [
      c.clientEngagementOptions(),
      c.relationshipOptions(),
      c.retentionOptions()
    ]) {
      assert.ok(
        options.series[0].data.every(
          value => value >= 0 && value <= 100
        )
      );
    }
  }
});

test('CRM support summaries reconcile with chart totals', () => {
  const c = createComponent();

  for (const period of ['day', 'week', 'month', 'year']) {
    c.setPeriod(period);

    const [tickets, resolved, unresolved] =
      c.supportMetricsOptions().series;

    const sum = values =>
      values.reduce((a, b) => a + b, 0);

    assert.equal(c.periodSummary().tickets, sum(tickets.data));
    assert.equal(c.periodSummary().resolved, sum(resolved.data));

    assert.deepEqual(
      unresolved.data,
      tickets.data.map(
        (value, i) => Math.max(0, value - resolved.data[i])
      )
    );
  }
});

test('CRM funnel conversions reconcile with stage counts', () => {
  const c = createComponent();

  for (const period of ['day', 'week', 'month', 'year']) {
    c.setPeriod(period);

    const pipeline = c.pipelineStages();
    const funnel = c.salesFunnel();

    assert.equal(
      c.periodSummary().pipelineConversion,
      (pipeline.at(-1).value / pipeline[0].value * 100).toFixed(1)
    );

    assert.equal(
      c.periodSummary().salesConversion,
      (funnel.at(-1).count / funnel[0].count * 100).toFixed(2)
    );
  }
});

test('CRM activity filters return correct counts', () => {
  const c = createComponent();

  for (const [filter, count] of Object.entries({
    all: 6,
    sales: 2,
    communication: 3,
    tasks: 1
  })) {
    c.setActivityFilter(filter);
    assert.equal(c.filteredActivity().length, count);
  }
});

test('CRM rejects invalid activity filters', () => {
  const c = createComponent();
  c.setActivityFilter('sales');
  c.setActivityFilter('invalid');
  assert.equal(c.activityFilter(), 'sales');
});

test('CRM filtering preserves KPI and period values', () => {
  const c = createComponent();
  c.setPeriod('week');

  const before = c.kpis().map(item => item.value);

  c.setActivityFilter('communication');

  assert.deepEqual(
    c.kpis().map(item => item.value),
    before
  );

  assert.equal(c.period(), 'week');
});

test('CRM CSV exports thirteen metrics for selected period', () => {
  const c = createComponent();

  for (const period of ['day', 'week', 'month', 'year']) {
    c.setPeriod(period);

    const rows = c.buildCsv().split('\r\n');

    assert.equal(rows.length, 14);
    assert.equal(
      rows[0],
      '"Data Type","Period","Metric","Value"'
    );

    assert.ok(rows.slice(1).every(
      row => row.startsWith(
        `"Demo","${c.periodLabel()}","`
      )
    ));

    assert.ok(c.buildCsv().includes('"Total Revenue"'));
    assert.ok(c.buildCsv().includes('"Resolved Tickets"'));
  }
});

test('CRM theme switching preserves period and filter', () => {
  const c = createComponent();

  c.setPeriod('year');
  c.setActivityFilter('sales');
  c.toggleTheme();

  assert.equal(c.darkMode(), true);
  assert.equal(c.period(), 'year');
  assert.equal(c.activityFilter(), 'sales');

  c.toggleTheme();
  assert.equal(c.darkMode(), false);
});
