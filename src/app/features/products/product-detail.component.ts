import { Component, inject, signal, computed, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductService, Product } from '../../core/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTabsModule],
  template: `
    <div class="detail-container" *ngIf="product()">
      <div class="breadcrumb">
        <a routerLink="/products">Products</a>
        <mat-icon>chevron_right</mat-icon>
        <span>{{ product()?.name }}</span>
      </div>

      <div class="product-main">
        <!-- Image Gallery -->
        <div class="image-gallery">
          <div class="main-image-card shadow-premium">
            <img [src]="activeImage()" [alt]="product()?.name" class="main-img">
          </div>
          <div class="thumbnail-list">
            <div 
              *ngFor="let img of images()" 
              class="thumb-item shadow-sm"
              [class.active]="activeImage() === img"
              (click)="activeImage.set(img)">
              <img [src]="img" alt="Thumbnail">
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info-panel">
          <div class="info-header">
            <span class="category-tag">{{ product()?.category }}</span>
            <h1 class="product-title">{{ product()?.name }}</h1>
            <div class="rating-row">
              <div class="stars">
                <mat-icon *ngFor="let s of [1,2,3,4,5]" [class.filled]="s <= (product()?.rating || 0)">star</mat-icon>
              </div>
              <span class="review-count">({{ product()?.reviews }} Customer Reviews)</span>
            </div>
          </div>

          <div class="price-box">
            <h2 class="current-price">{{ product()?.price }}</h2>
            <span class="old-price" *ngIf="product()?.oldPrice">{{ product()?.oldPrice }}</span>
          </div>

          <p class="description">{{ product()?.description || 'No description available for this premium product. Experience the pinnacle of design and functionality.' }}</p>

          <div class="action-row">
            <div class="quantity-picker">
              <button (click)="updateQty(-1)"><mat-icon>remove</mat-icon></button>
              <span>{{ quantity() }}</span>
              <button (click)="updateQty(1)"><mat-icon>add</mat-icon></button>
            </div>
            <button mat-flat-button color="primary" class="add-to-cart">
              <mat-icon>shopping_cart</mat-icon>
              Add to Cart
            </button>
            <button class="wishlist-btn" [class.active]="product()?.isFavorite" (click)="toggleWishlist()">
              <mat-icon>{{ product()?.isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
            </button>
          </div>

          <div class="meta-info">
            <div class="meta-item">
              <mat-icon>verified</mat-icon>
              <span>1 Year Warranty</span>
            </div>
            <div class="meta-item">
              <mat-icon>local_shipping</mat-icon>
              <span>Free Delivery in 2-3 business days</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-tabs shadow-premium">
        <mat-tab-group animationDuration="300ms">
          <mat-tab label="Specifications">
            <div class="tab-content">
              <div class="specs-grid">
                @if (product()?.specifications?.length) {
                  @for (spec of product()?.specifications; track spec.label) {
                    <div class="spec-item">
                      <span class="spec-label">{{ spec.label }}</span>
                      <span class="spec-value">{{ spec.value }}</span>
                    </div>
                  }
                } @else {
                  <p class="empty-msg">Detailed specifications are coming soon for this product.</p>
                }
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="Reviews">
            <div class="tab-content">
              <div class="reviews-list">
                @if (product()?.productReviews?.length) {
                  @for (review of product()?.productReviews; track review.id) {
                    <div class="review-card">
                      <div class="review-header">
                        <img [src]="review.avatar || 'https://i.pravatar.cc/150'" class="user-avatar">
                        <div class="user-meta">
                          <p class="user-name">{{ review.user }}</p>
                          <div class="rating-stars">
                            <mat-icon *ngFor="let s of [1,2,3,4,5]" [class.filled]="s <= review.rating">star</mat-icon>
                          </div>
                        </div>
                        <span class="review-date">{{ review.date | date:'mediumDate' }}</span>
                      </div>
                      <p class="review-comment">{{ review.comment }}</p>
                    </div>
                  }
                } @else {
                  <div class="empty-state">
                    <mat-icon>rate_review</mat-icon>
                    <h3>No reviews yet</h3>
                    <p>Be the first to review this product!</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      @media (max-width: 768px) {
        padding: 16px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 32px;
      color: var(--text-main);
      opacity: 0.7;
      font-size: 14px;
      font-weight: 600;

      @media (max-width: 640px) {
        margin-bottom: 16px;
        font-size: 12px;
      }
      
      a { 
        color: var(--text-main); 
        text-decoration: none;
        &:hover { color: var(--primary); }
      }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      span { color: var(--text-main); opacity: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }

    .product-main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      margin-bottom: 64px;

      @media (max-width: 1024px) {
        gap: 24px;
      }

      @media (max-width: 968px) {
        grid-template-columns: 1fr;
        margin-bottom: 32px;
      }
    }

    .main-image-card {
      background: var(--surface);
      border-radius: 24px;
      overflow: hidden;
      aspect-ratio: 1;
      margin-bottom: 20px;
      border: 1px solid var(--border-color);
      
      img { width: 100%; height: 100%; object-fit: cover; }
      
      @media (max-width: 640px) {
        border-radius: 12px;
      }
    }

    .thumbnail-list {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;

      .thumb-item {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;
        flex-shrink: 0;

        &.active { border-color: #4880ff; transform: scale(1.05); }
        img { width: 100%; height: 100%; object-fit: cover; }
        
        @media (max-width: 640px) {
          width: 60px;
          height: 60px;
          border-radius: 8px;
        }
      }
    }

    .product-info-panel {
      display: flex;
      flex-direction: column;
    }

    .category-tag {
      display: inline-block;
      padding: 6px 16px;
      background: var(--bg-color);
      color: var(--text-main);
      opacity: 0.8;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }

    .product-title {
      font-size: 42px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 16px 0;
      letter-spacing: -1px;
      line-height: 1.1;
      
      @media (max-width: 640px) {
        font-size: 28px;
        margin-bottom: 12px;
      }
    }

    .rating-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;

      @media (max-width: 640px) {
        margin-bottom: 16px;
      }

      .stars {
        display: flex;
        gap: 2px;
        mat-icon { 
          font-size: 20px; width: 20px; height: 20px; color: var(--border-color); 
          &.filled { color: #f59e0b; }
        }
      }
      .review-count { font-size: 14px; color: var(--text-main); opacity: 0.6; font-weight: 600; }
    }

    .price-box {
      margin-bottom: 32px;
      display: flex;
      align-items: baseline;
      gap: 12px;
      
      @media (max-width: 640px) {
        margin-bottom: 24px;
      }

      .current-price { font-size: 36px; font-weight: 800; color: var(--primary); margin: 0; }
      .old-price { font-size: 20px; color: var(--text-main); opacity: 0.5; text-decoration: line-through; }
    }

    .description {
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-main);
      opacity: 0.8;
      margin-bottom: 40px;
      
      @media (max-width: 640px) {
        margin-bottom: 24px;
        font-size: 14px;
      }
    }

    .action-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 40px;
      flex-wrap: wrap;
      
      @media (max-width: 640px) {
        margin-bottom: 32px;
      }
    }

    .quantity-picker {
      display: flex;
      align-items: center;
      background: var(--bg-color);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      padding: 4px;

      button {
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-main);
        opacity: 0.7;
        &:hover { color: var(--primary); opacity: 1; }
      }
      span { width: 40px; text-align: center; font-weight: 700; color: var(--text-main); }
    }

    .add-to-cart {
      height: 48px;
      padding: 0 40px !important;
      border-radius: 12px !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      display: flex;
      align-items: center;
      gap: 8px;
      
      @media (max-width: 640px) {
        flex: 1;
        padding: 0 20px !important;
      }
    }

    .wishlist-btn {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--surface);
      color: var(--text-main);
      opacity: 0.7;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover { background: var(--bg-color); color: #ef4444; opacity: 1; }
      &.active { background: #fee2e2; color: #ef4444; border-color: #fecaca; opacity: 1; }
    }

    .meta-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 32px;
      border-top: 1px solid var(--border-color);

      .meta-item {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-main);
        opacity: 0.8;
        font-size: 14px;
        font-weight: 600;
        mat-icon { font-size: 18px; width: 18px; height: 18px; color: #10b981; }
      }
    }

    .detail-tabs {
      background: var(--surface);
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .tab-content {
      padding: 40px;
      @media (max-width: 640px) {
        padding: 20px;
      }
    }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    .spec-item {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      background: var(--bg-color);
      border-radius: 12px;

      .spec-label { color: var(--text-main); opacity: 0.7; font-weight: 600; }
      .spec-value { color: var(--text-main); font-weight: 800; }
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .review-card {
      padding: 24px;
      background: var(--bg-color);
      border-radius: 20px;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-meta {
      flex: 1;
      .user-name { font-weight: 800; color: var(--text-main); margin: 0; }
      .rating-stars {
        display: flex;
        gap: 2px;
        mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--border-color); &.filled { color: #f59e0b; } }
      }
    }

    .review-date { font-size: 12px; color: var(--text-main); opacity: 0.6; font-weight: 600; }
    .review-comment { font-size: 15px; line-height: 1.6; color: var(--text-main); opacity: 0.8; margin: 0; }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--text-main);
      opacity: 0.6;
      mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
      h3 { color: var(--text-main); opacity: 1; margin: 0 0 8px 0; }
    }

    .shadow-premium {
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product = signal<Product | undefined>(undefined);
  activeImage = signal<string>('');
  quantity = signal(1);

  images = computed(() => {
    const p = this.product();
    if (!p) return [];
    return p.images || [p.image];
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const foundProduct = this.productService.products().find(p => p.id === Number(id));
      if (foundProduct) {
        this.product.set(foundProduct);
        this.activeImage.set(foundProduct.image);
      }
    }
  }

  updateQty(delta: number) {
    const newVal = this.quantity() + delta;
    if (newVal >= 1) this.quantity.set(newVal);
  }

  toggleWishlist() {
    const prod = this.product();
    if (prod) {
      this.productService.toggleFavorite(prod.id);
      this.product.update(p => p ? { ...p, isFavorite: !p.isFavorite } : p);
    }
  }
}
