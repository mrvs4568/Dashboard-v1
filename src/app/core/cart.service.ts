import { Injectable, signal, computed, inject } from '@angular/core';
import { ProductService, type Product } from './product.service';

export interface CartItem {
  productId: number;
  name: string;
  image: string;
  unitPriceCents: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'dashstack.cart.v1';
  private readonly productService = inject(ProductService);
  private readonly cartItems = signal<CartItem[]>(this.restoreCart());

  readonly items = this.cartItems.asReadonly();

  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotalCents = computed(() =>
    this.items().reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity, 0
    )
  );

  readonly subtotal = computed(() => this.subtotalCents() / 100);

  addToCart(product: Product, quantity = 1): boolean {
    if (!this.validQuantity(quantity)) return false;

    const price = product.price.replace(/[$,]/g, '').trim();

    if (!/^\d+(\.\d{1,2})?$/.test(price)) return false;

    const unitPriceCents = Math.round(Number(price) * 100);

    if (!Number.isSafeInteger(unitPriceCents)) return false;

    const existing = this.items().find(
      item => item.productId === product.id
    );

    if (existing) {
      return this.updateQuantity(
        product.id,
        existing.quantity + quantity
      );
    }

    this.cartItems.update(items => [
      ...items,
      {
        productId: product.id,
        name: product.name,
        image: product.image,
        unitPriceCents,
        quantity
      }
    ]);

    this.saveCart();
    return true;
  }

  updateQuantity(productId: number, quantity: number): boolean {
    if (!this.validQuantity(quantity)) return false;

    if (!this.items().some(item => item.productId === productId)) {
      return false;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );

    this.saveCart();
    return true;
  }

  removeItem(productId: number): void {
    this.cartItems.update(items =>
      items.filter(item => item.productId !== productId)
    );
    this.saveCart();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCart();
  }

  private saveCart(): void {
    try {
      const data = this.items().map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(data)
      );
    } catch {
      // Cart remains usable if browser storage is unavailable.
    }
  }

  private restoreCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];

      const stored: unknown = JSON.parse(raw);
      if (!Array.isArray(stored)) return [];

      const restored: CartItem[] = [];
      const seen = new Set<number>();

      for (const item of stored) {
        if (!item || typeof item !== 'object') continue;
        if (!Number.isSafeInteger(item.productId)) continue;
        if (!this.validQuantity(item.quantity)) continue;
        if (seen.has(item.productId)) continue;

        const product = this.productService.products().find(
          p => p.id === item.productId
        );

        if (!product) continue;

        const price = product.price.replace(/[$,]/g, '').trim();

        if (!/^\d+(\.\d{1,2})?$/.test(price)) continue;

        const unitPriceCents = Math.round(Number(price) * 100);

        if (!Number.isSafeInteger(unitPriceCents)) continue;

        restored.push({
          productId: product.id,
          name: product.name,
          image: product.image,
          unitPriceCents,
          quantity: item.quantity
        });

        seen.add(product.id);
      }

      return restored;
    } catch {
      return [];
    }
  }

  private validQuantity(quantity: number): boolean {
    return Number.isSafeInteger(quantity)
      && quantity >= 1
      && quantity <= 99;
  }
}
