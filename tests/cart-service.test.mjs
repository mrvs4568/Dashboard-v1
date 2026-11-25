import '@angular/compiler';
import { createEnvironmentInjector } from '@angular/core';
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  readFileSync, writeFileSync, mkdtempSync, rmSync
} from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const temp = mkdtempSync(join(process.cwd(), 'tests/.cart-test-'));

let CartService;
let ProductService;

try {
  const source = readFileSync(
    'src/app/core/cart.service.ts', 'utf8'
  ).replace(
    "'./product.service'",
    "'./product.service.mjs'"
  );

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true
    }
  }).outputText;

  writeFileSync(
    join(temp, 'cart.service.mjs'),
    compiled
  );

  writeFileSync(
    join(temp, 'product.service.mjs'),
    'export class ProductService {}'
  );

  ({ ProductService } = await import(
    pathToFileURL(join(temp, 'product.service.mjs')).href
  ));

  ({ CartService } = await import(
    pathToFileURL(join(temp, 'cart.service.mjs')).href
  ));
} finally {
  rmSync(temp, { recursive: true, force: true });
}

const watch = {
  id: 1,
  name: 'Apple Watch Series 4',
  price: '$120.00',
  image: '/images/products/apple-watch-1.jpg'
};

const laptop = {
  id: 2,
  name: 'Microsoft Surface Laptop',
  price: '$899.00',
  image: '/images/laptop.jpg'
};

const storageKey = 'dashstack.cart.v1';
const originalStorage = Object.getOwnPropertyDescriptor(
  globalThis, 'localStorage'
);

let storage;
let injectors;

beforeEach(() => {
  storage = new Map();
  injectors = [];

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    }
  });
});

afterEach(() => {
  for (const injector of injectors) injector.destroy();

  if (originalStorage) {
    Object.defineProperty(
      globalThis, 'localStorage', originalStorage
    );
  } else {
    delete globalThis.localStorage;
  }
});

function createCart() {
  const injector = createEnvironmentInjector([
    CartService,
    {
      provide: ProductService,
      useValue: { products: () => [watch, laptop] }
    }
  ], null);

  injectors.push(injector);
  return injector.get(CartService);
}

test('cart starts empty', () => {
  const cart = createCart();
  assert.equal(cart.itemCount(), 0);
  assert.equal(cart.subtotalCents(), 0);
});

test('adding the same product merges quantities', () => {
  const cart = createCart();

  assert.equal(cart.addToCart(watch, 2), true);
  assert.equal(cart.addToCart(watch, 1), true);

  assert.equal(cart.items().length, 1);
  assert.equal(cart.itemCount(), 3);
  assert.equal(cart.subtotalCents(), 36000);
});

test('multiple products calculate correct totals', () => {
  const cart = createCart();

  cart.addToCart(watch);
  cart.addToCart(laptop);

  assert.equal(cart.itemCount(), 2);
  assert.equal(cart.subtotalCents(), 101900);
});

test('quantity updates recalculate totals', () => {
  const cart = createCart();

  cart.addToCart(watch);
  assert.equal(cart.updateQuantity(1, 3), true);
  assert.equal(cart.subtotalCents(), 36000);

  assert.equal(cart.updateQuantity(1, 2), true);
  assert.equal(cart.subtotalCents(), 24000);
});

test('invalid quantities and prices are rejected', () => {
  const cart = createCart();

  for (const quantity of [0, -1, 100, 1.5, NaN, Infinity]) {
    assert.equal(cart.addToCart(watch, quantity), false);
  }

  assert.equal(
    cart.addToCart({ ...watch, price: 'invalid' }),
    false
  );

  assert.equal(cart.addToCart(watch, 99), true);
  assert.equal(cart.addToCart(watch), false);
  assert.equal(cart.itemCount(), 99);
});

test('remove and clear operations update totals', () => {
  const cart = createCart();

  cart.addToCart(watch);
  cart.addToCart(laptop);
  cart.removeItem(1);

  assert.equal(cart.subtotalCents(), 89900);

  cart.clearCart();

  assert.equal(cart.itemCount(), 0);
  assert.equal(cart.subtotalCents(), 0);
});

test('cart restores saved quantities and catalog prices', () => {
  const cart = createCart();

  cart.addToCart(watch, 2);
  cart.addToCart(laptop);

  const restored = createCart();

  assert.equal(restored.itemCount(), 3);
  assert.equal(restored.subtotalCents(), 113900);
});

test('invalid stored entries are ignored', () => {
  storage.set(storageKey, JSON.stringify([
    { productId: 1, quantity: 2, unitPriceCents: 1 },
    { productId: 1, quantity: 3 },
    { productId: 2, quantity: -1 },
    { productId: 999, quantity: 1 },
    null
  ]));

  const cart = createCart();

  assert.equal(cart.itemCount(), 2);
  assert.equal(cart.subtotalCents(), 24000);
});

test('corrupted storage does not crash the cart', () => {
  storage.set(storageKey, '{invalid JSON');

  const cart = createCart();

  assert.equal(cart.itemCount(), 0);
});

test('cleared cart remains empty after restoration', () => {
  const cart = createCart();

  cart.addToCart(watch);
  cart.clearCart();

  assert.equal(createCart().itemCount(), 0);
});
