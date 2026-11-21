import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('every dashboard route has a unique path', () => {
  const routes = [...read('src/app/app.routes.ts').matchAll(/^\s*path:\s*'([^']+)'/gm)].map(match => match[1]);
  assert.ok(routes.length >= 16, 'unexpectedly few routes');
  assert.equal(new Set(routes).size, routes.length, 'duplicate router paths');
  assert.ok(routes.includes('analytics') && routes.includes('analytics-insights'));
});

test('analytics-insights is discoverable through navigation', () => {
  assert.match(read('src/app/app.component.ts'), /routerLink="\/analytics-insights"/);
});

test('demo identity is consistent and has local avatar', () => {
  const service = read('src/app/core/services/user.service.ts');
  assert.match(service, /name: 'Demo User'/);
  assert.match(service, /email: 'demo@example.com'/);
  assert.ok(existsSync(new URL('../public/images/demo-avatar.svg', import.meta.url)));
  assert.match(read('src/app/features/settings/settings.component.ts'), /this\.userService\.updateProfile/);
});

test('security controls do not claim to persist credentials', () => {
  const settings = read('src/app/features/settings/settings.component.ts');
  assert.doesNotMatch(settings, /console\.log\(/);
  assert.match(settings, /Security settings are unavailable in this demo/);
  assert.match(read('src/app/features/settings/settings.component.html'), /disabled>Security settings unavailable/);
});

test('frontend demo does not bundle a Gemini credential', () => {
  const ai = read('src/app/core/services/ai.service.ts');
  assert.doesNotMatch(ai, /GEMINI_API_KEY|GoogleGenAI|@google\/genai/);
  assert.match(ai, /not AI-generated/);
});

test('Angular cache is ignored and not tracked', () => {
  assert.match(read('.gitignore'), /^\.angular\/$/m);
  const tracked = execFileSync('git', ['ls-files', '--', '.angular/'], {
    cwd: new URL('..', import.meta.url)
  }).toString();
  assert.equal(tracked.trim(), '');
});
