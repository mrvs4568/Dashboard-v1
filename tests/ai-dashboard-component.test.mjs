import '@angular/compiler';
import {
  createEnvironmentInjector,
  runInInjectionContext,
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
  join(process.cwd(), 'tests/.ai-dashboard-test-')
);

let AiDashboardComponent;
let ThemeService;
const injectors = [];

try {
  const source = readFileSync(
    'src/app/features/ai-dashboard/ai-dashboard.component.ts',
    'utf8'
  ).replace(
    "'../../core/services/theme.service'",
    "'./theme.service.mjs'"
  );

  writeFileSync(
    join(temp, 'theme.service.mjs'),
    'export class ThemeService {}'
  );

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true
    }
  }).outputText;

  writeFileSync(
    join(temp, 'ai-dashboard.component.mjs'),
    compiled
  );

  ({ ThemeService } = await import(
    pathToFileURL(join(temp, 'theme.service.mjs')).href
  ));

  ({ AiDashboardComponent } = await import(
    pathToFileURL(
      join(temp, 'ai-dashboard.component.mjs')
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

  const injector = createEnvironmentInjector([
    {
      provide: ThemeService,
      useValue: {
        isDarkMode: theme,
        toggleTheme: () => theme.update(v => !v)
      }
    }
  ], null);

  injectors.push(injector);

  return runInInjectionContext(
    injector,
    () => new AiDashboardComponent()
  );
}

test('dashboard defaults to comparison disabled', () => {
  const dashboard = createDashboard();

  assert.equal(dashboard.compareEnabled(), false);
  assert.equal(dashboard.selectedRange(), 'Last 30 Days');
  assert.equal(dashboard.kpis().length, 6);
});

test('comparison toggles on and off', () => {
  const dashboard = createDashboard();

  dashboard.toggleCompare();
  assert.equal(dashboard.compareEnabled(), true);

  dashboard.toggleCompare();
  assert.equal(dashboard.compareEnabled(), false);
});

test('previous KPI values and changes are calculated', () => {
  const dashboard = createDashboard();
  const models = dashboard.kpis()[0];

  assert.equal(models.value, '24');
  assert.equal(models.previousValue, '19');
  assert.equal(models.delta, '+26.3%');
  assert.equal(models.trend, 'up');
});

test('all five date ranges update prediction totals', () => {
  const dashboard = createDashboard();

  const ranges = [
    ['Today', 0.08],
    ['Last 7 Days', 0.25],
    ['Last 30 Days', 1],
    ['Last 90 Days', 3],
    ['This Year', 12]
  ];

  dashboard.toggleCompare();

  for (const [range, multiplier] of ranges) {
    dashboard.setRange(range);

    assert.equal(dashboard.selectedRange(), range);
    assert.equal(
      dashboard.predictionsTotal(),
      Math.round(1452230 * multiplier)
    );

    assert.equal(dashboard.kpis().length, 6);
    assert.equal(dashboard.compareEnabled(), true);

    for (const kpi of dashboard.kpis()) {
      assert.ok(kpi.previousValue);
      assert.ok(!/NaN|Infinity/.test(kpi.delta));
    }
  }
});

test('negative and flat trends are handled correctly', () => {
  const dashboard = createDashboard();

  const latency = dashboard.kpis()[3];

  assert.equal(latency.value, '120ms');
  assert.equal(latency.previousValue, '131ms');
  assert.equal(latency.trend, 'down');
  assert.equal(latency.delta, '-8.4%');

  dashboard.setRange('Today');

  const models = dashboard.kpis()[0];

  assert.equal(models.trend, 'flat');
  assert.equal(models.delta, '0.0%');
});

test('comparison chart adds and removes previous series', () => {
  const dashboard = createDashboard();

  assert.equal(dashboard.predictiveOptions().series.length, 3);

  dashboard.toggleCompare();

  const series = dashboard.predictiveOptions().series;

  assert.equal(series.length, 4);
  assert.equal(series[3].name, 'Previous (demo)');

  assert.deepEqual(
    series[3].data,
    series[0].data.map(v => Math.round(v / 1.186))
  );

  dashboard.toggleCompare();

  assert.equal(dashboard.predictiveOptions().series.length, 3);
});

test('chart comparison follows selected date range', () => {
  const dashboard = createDashboard();

  dashboard.toggleCompare();
  dashboard.setRange('Last 7 Days');

  const options = dashboard.predictiveOptions();

  assert.equal(dashboard.labels().length, 7);
  assert.equal(options.series.length, 4);

  for (const series of options.series) {
    assert.equal(series.data.length, 7);
  }
});

test('theme switching preserves comparison state', () => {
  const dashboard = createDashboard();

  dashboard.toggleCompare();

  assert.equal(dashboard.isDark(), false);

  const lightColor =
    dashboard.predictiveOptions().legend.textStyle.color;

  dashboard.toggleTheme();

  assert.equal(dashboard.isDark(), true);
  assert.equal(dashboard.compareEnabled(), true);
  assert.equal(dashboard.predictiveOptions().series.length, 4);

  assert.notEqual(
    dashboard.predictiveOptions().legend.textStyle.color,
    lightColor
  );

  dashboard.toggleTheme();

  assert.equal(dashboard.isDark(), false);
  assert.equal(dashboard.compareEnabled(), true);
});
