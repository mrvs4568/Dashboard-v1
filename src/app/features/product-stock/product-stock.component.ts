import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductStockService, ProductStock } from '../../core/product-stock.service';

@Component({
  selector: 'app-product-stock',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="product-stock-container">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Product Stock</h1>
          <p class="page-subtitle">Manage your inventory levels and product variations</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search products...">
          </div>
          <button class="add-btn">
            <mat-icon>add</mat-icon>
            <span>Add Product</span>
          </button>
        </div>
      </header>

      <div class="table-card shadow-premium">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="pl-8">Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Available Colors</th>
                <th class="pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of stock(); track item.id) {
                <tr class="stock-row">
                  <td class="pl-8">
                    <div class="product-cell">
                      <div class="img-wrapper shadow-sm">
                        <img [src]="item.image" [alt]="item.name" referrerpolicy="no-referrer">
                      </div>
                      <span class="product-name">{{ item.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="category-badge">{{ item.category }}</span>
                  </td>
                  <td class="font-bold text-slate-700">{{ item.price }}</td>
                  <td>
                    <div class="stock-badge" [class.low-stock]="item.piece < 20">
                      <span class="indicator"></span>
                      {{ item.piece }} Pieces
                    </div>
                  </td>
                  <td>
                    <div class="color-swatch">
                      @for (color of item.availableColors; track color) {
                        <span class="color-dot" [style.background-color]="color" [title]="color"></span>
                      }
                    </div>
                  </td>
                  <td class="pr-8 text-right">
                    <div class="action-btns-group">
                      <button class="icon-btn edit" matTooltip="Edit details">
                        <mat-icon>edit_square</mat-icon>
                      </button>
                      <button class="icon-btn delete" matTooltip="Remove from stock">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-stock-container {
      padding: 40px;
      max-width: 1400px;
      margin: 0 auto;
      animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);

      @media (max-width: 768px) {
        padding: 20px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .page-title {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
      letter-spacing: -0.5px;
    }

    .page-subtitle {
      color: var(--text-main);
      opacity: 0.6;
      margin: 4px 0 0 0;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .search-box {
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0 16px;
      height: 48px;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 280px;
      transition: all 0.2s ease;

      @media (max-width: 640px) {
        width: 100%;
      }

      &:focus-within {
        border-color: var(--primary);
        box-shadow: 0 0 0 4px rgba(72, 128, 255, 0.1);
        width: 320px;
      }

      mat-icon { color: var(--text-main); opacity: 0.5; font-size: 20px; width: 20px; height: 20px; }
      input {
        border: none;
        outline: none;
        font-size: 14px;
        font-weight: 500;
        width: 100%;
        color: var(--text-main);
        background: transparent;
        &::placeholder { color: var(--text-main); opacity: 0.5; }
      }
    }

    .add-btn {
      height: 48px;
      padding: 0 24px;
      background: #4880ff;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(72, 128, 255, 0.25);

      &:hover {
        background: #3a6ede;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(72, 128, 255, 0.35);
      }
    }

    .table-card {
      background: var(--surface);
      border-radius: 20px;
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .shadow-premium {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
    }

    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    table {
      width: 100%;
      min-width: 1000px;
      border-collapse: collapse;
      
      th {
        padding: 20px;
        background: var(--bg-color);
        text-align: left;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-main);
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--border-color);
      }

      td {
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
        font-size: 14px;
        font-weight: 500;
        color: var(--text-main);
      }
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .img-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg-color);
      
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .product-name {
      font-weight: 700;
      color: var(--text-main);
    }

    .category-badge {
      background: var(--bg-color);
      color: var(--text-main);
      opacity: 0.8;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
    }

    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border-radius: 99px;
      font-weight: 700;
      font-size: 13px;

      .indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
      }

      &.low-stock {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
    }

    .color-swatch {
      display: flex;
      gap: -4px; /* Stacked effect */
      
      .color-dot {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        margin-right: -8px;
        transition: transform 0.2s ease;
        cursor: pointer;

        &:hover {
          transform: scale(1.2) translateY(-2px);
          z-index: 10;
        }
      }
    }

    .action-btns-group {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--text-main); opacity: 0.6; }

      &:hover {
        background: var(--bg-color);
        transform: translateY(-2px);
        
        &.edit mat-icon { color: var(--primary); opacity: 1; }
        &.delete mat-icon { color: var(--error); opacity: 1; }
      }
    }

    .stock-row:hover {
      background: rgba(72, 128, 255, 0.02);
    }
  `]

})
export class ProductStockComponent {
  productStockService = inject(ProductStockService);
  stock = this.productStockService.stock;
}
