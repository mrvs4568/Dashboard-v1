import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CurrencyPipe, RouterLink,
    MatIconModule, MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cart-page">
      <div class="page-header">
        <div>
          <h1>Shopping Cart</h1>
          <p>{{ cart.itemCount() }} {{ cart.itemCount() === 1 ? 'item' : 'items' }} in your cart</p>
        </div>
        <a mat-stroked-button routerLink="/products">
          Continue Shopping
        </a>
      </div>

      @if (cart.items().length > 0) {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cart.items(); track item.productId) {
              <article class="cart-item">
                <a [routerLink]="['/product', item.productId]">
                  <img [src]="item.image" [alt]="item.name">
                </a>

                <div class="item-info">
                  <a class="item-name"
                     [routerLink]="['/product', item.productId]">
                    {{ item.name }}
                  </a>

                  <p>{{ item.unitPriceCents / 100 | currency:'USD' }} each</p>

                  <div class="quantity-control">
                    <button mat-icon-button
                      [attr.aria-label]="'Decrease quantity of ' + item.name"
                      [disabled]="item.quantity <= 1"
                      (click)="cart.updateQuantity(item.productId, item.quantity - 1)">
                      <mat-icon>remove</mat-icon>
                    </button>

                    <span>{{ item.quantity }}</span>

                    <button mat-icon-button
                      [attr.aria-label]="'Increase quantity of ' + item.name"
                      [disabled]="item.quantity >= 99"
                      (click)="cart.updateQuantity(item.productId, item.quantity + 1)">
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                </div>

                <div class="item-total">
                  <strong>
                    {{ item.unitPriceCents * item.quantity / 100 | currency:'USD' }}
                  </strong>

                  <button mat-icon-button class="remove-btn"
                    [attr.aria-label]="'Remove ' + item.name"
                    (click)="cart.removeItem(item.productId)">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </article>
            }
          </div>

          <aside class="summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Items</span>
              <strong>{{ cart.itemCount() }}</strong>
            </div>
            <div class="summary-row">
              <span>Subtotal</span>
              <strong>{{ cart.subtotal() | currency:'USD' }}</strong>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <strong>{{ cart.subtotal() | currency:'USD' }}</strong>
            </div>
            <p class="demo-note">
              Demo cart. Taxes, shipping and payments are not calculated.
            </p>
            <a mat-flat-button routerLink="/products">
              Continue Shopping
            </a>
            <button mat-stroked-button (click)="cart.clearCart()">
              Clear Cart
            </button>
          </aside>
        </div>
      } @else {
        <div class="empty-cart">
          <mat-icon>shopping_cart</mat-icon>
          <h2>Your cart is empty</h2>
          <p>Add products to start shopping.</p>
          <a mat-flat-button routerLink="/products">
            Browse Products
          </a>
        </div>
      }
    </section>
  `,
  styles: [`
    .cart-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px;
      color: var(--text-main);
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
    }

    h1 { font-size: 28px; font-weight: 800; margin: 0 0 8px; }
    h2 { font-size: 20px; font-weight: 700; margin: 0 0 20px; }
    p { color: var(--text-muted); margin: 0; }

    .cart-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
      gap: 24px;
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }

    .cart-item, .summary, .empty-cart {
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 88px minmax(0, 1fr) auto;
      gap: 16px;
      align-items: center;
    }

    .cart-item img {
      width: 88px;
      height: 88px;
      object-fit: cover;
      border-radius: 12px;
      background: var(--bg-color);
    }

    .item-name {
      color: var(--text-main);
      text-decoration: none;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .item-info p { margin: 6px 0; font-size: 13px; }

    .quantity-control {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      margin-top: 8px;
    }

    .quantity-control span {
      min-width: 24px;
      text-align: center;
      font-weight: 700;
    }

    .item-total {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .item-total strong {
      color: var(--primary);
      white-space: nowrap;
    }

    .remove-btn { color: var(--error); }

    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .total {
      border-top: 1px solid var(--border-color);
      padding-top: 20px;
      font-size: 20px;
      font-weight: 800;
    }

    .demo-note {
      font-size: 12px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .summary a, .summary button {
      width: 100%;
      margin-top: 10px;
    }

    .empty-cart {
      text-align: center;
      padding: 48px 24px;
    }

    .empty-cart mat-icon {
      color: var(--primary);
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .empty-cart a { margin-top: 24px; }

    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .cart-page { padding: 16px; }
      .cart-item { padding: 16px; gap: 12px; }
      .cart-item { grid-template-columns: 64px minmax(0, 1fr); }
      .cart-item img { width: 64px; height: 64px; }
      .item-total {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--border-color);
        padding-top: 8px;
      }
      .summary { padding: 20px; }
    }
  `]
})
export class CartComponent {
  readonly cart = inject(CartService);
}
