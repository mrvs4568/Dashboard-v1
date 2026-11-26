import '@angular/compiler';
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  readFileSync, writeFileSync, mkdtempSync, rmSync
} from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const temp = mkdtempSync(join(process.cwd(), 'tests/.todo-test-'));
let TodoComponent;

try {
  const source = readFileSync(
    'src/app/features/todo/todo.component.ts', 'utf8'
  );

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true
    }
  }).outputText;

  const file = join(temp, 'todo.component.mjs');
  writeFileSync(file, compiled);

  ({ TodoComponent } = await import(
    pathToFileURL(file).href
  ));
} finally {
  rmSync(temp, { recursive: true, force: true });
}

const key = 'dashstack.todo.v1';
const originalStorage = Object.getOwnPropertyDescriptor(
  globalThis, 'localStorage'
);

let storage;

beforeEach(() => {
  storage = new Map();

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value))
    }
  });
});

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(
      globalThis, 'localStorage', originalStorage
    );
  } else {
    delete globalThis.localStorage;
  }
});

test('default tasks and productivity are correct', () => {
  const todo = new TodoComponent();

  assert.equal(todo.tasks().length, 6);
  assert.equal(todo.completedCount(), 2);
  assert.equal(todo.productivity(), 33);
});

test('creates a task with validated title and priority', () => {
  const todo = new TodoComponent();

  todo.openAddForm();
  todo.newTitle.set('  Dashboard Testing  ');
  todo.newPriority.set('High');
  todo.addTask();

  assert.equal(todo.tasks().length, 7);
  assert.equal(todo.tasks()[0].title, 'Dashboard Testing');
  assert.equal(todo.tasks()[0].priority, 'High');
  assert.equal(todo.tasks()[0].completed, false);
  assert.equal(todo.showAddForm(), false);
});

test('rejects invalid task input', () => {
  const todo = new TodoComponent();

  for (const title of ['', '   ', 'a'.repeat(121)]) {
    todo.newTitle.set(title);
    todo.addTask();
  }

  todo.newTitle.set('Valid title');
  todo.newPriority.set('Invalid');
  todo.addTask();

  assert.equal(todo.tasks().length, 6);
});

test('editing preserves completion and task metadata', () => {
  const todo = new TodoComponent();
  const original = todo.tasks().find(t => t.completed);

  todo.openEditForm(original);
  todo.newTitle.set('Updated completed task');
  todo.newPriority.set('High');
  todo.addTask();

  const updated = todo.tasks().find(t => t.id === original.id);

  assert.deepEqual(updated, {
    ...original,
    title: 'Updated completed task',
    priority: 'High'
  });

  assert.equal(todo.tasks().length, 6);
  assert.equal(todo.completedCount(), 2);
  assert.equal(todo.productivity(), 33);
});

test('completion updates productivity', () => {
  const todo = new TodoComponent();

  todo.toggleTask(todo.tasks()[0]);

  assert.equal(todo.completedCount(), 3);
  assert.equal(todo.productivity(), 50);
});

test('starred filter responds to task changes', () => {
  const todo = new TodoComponent();

  todo.activeFilter.set('starred');
  assert.equal(todo.filteredTasks().length, 2);

  todo.toggleStar(todo.filteredTasks()[0]);
  assert.equal(todo.filteredTasks().length, 1);
});

test('metadata search ignores case and whitespace', () => {
  const todo = new TodoComponent();

  todo.searchQuery.set('  CRITICAL  ');
  assert.equal(todo.filteredTasks().length, 2);

  todo.searchQuery.set('Performance');
  assert.equal(todo.filteredTasks().length, 1);

  todo.searchQuery.set('Completed');
  assert.equal(todo.filteredTasks().length, 2);

  assert.equal(todo.productivity(), 33);
});

test('deleting a task updates totals', () => {
  const todo = new TodoComponent();

  todo.deleteTask(todo.tasks()[0]);

  assert.equal(todo.tasks().length, 5);
  assert.equal(todo.completedCount(), 2);
  assert.equal(todo.productivity(), 40);
});

test('flush removes only completed tasks', () => {
  const todo = new TodoComponent();

  todo.flushCompleted();

  assert.equal(todo.tasks().length, 4);
  assert.equal(todo.completedCount(), 0);
  assert.equal(todo.productivity(), 0);
});

test('task changes survive component recreation', () => {
  const todo = new TodoComponent();

  todo.newTitle.set('Persistence test');
  todo.addTask();

  const task = todo.tasks()[0];

  todo.toggleStar(task);
  todo.toggleTask(task);

  const restored = new TodoComponent();

  assert.deepEqual(restored.tasks(), todo.tasks());
  assert.equal(restored.completedCount(), 3);
});

test('corrupted storage safely restores defaults', () => {
  storage.set(key, '{invalid JSON');

  const todo = new TodoComponent();

  assert.equal(todo.tasks().length, 6);
});

test('empty saved task list remains empty', () => {
  const todo = new TodoComponent();

  for (const task of todo.tasks()) {
    todo.deleteTask(task);
  }

  const restored = new TodoComponent();

  assert.equal(restored.tasks().length, 0);
  assert.equal(restored.productivity(), 0);
});
