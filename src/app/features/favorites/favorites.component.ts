import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductService, Product } from '../../core/product.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, FormsModule],
  template: `
    <div class="favorites-container">
      <div class="header-section">
        <h1 class="page-title">Favorites</h1>
        <button mat-flat-button color="primary" class="add-btn" (click)="addNewProduct()">
          <mat-icon>add</mat-icon>
          Add Favorite Product
        </button>
      </div>

      @if (productService.favorites().length === 0) {
        <div class="empty-state">
          <div class="empty-icon-wrapper">
            <mat-icon>favorite_border</mat-icon>
          </div>
          <h3>No Favorites Yet</h3>
          <p>Your favorite items will appear here once you add them from our products page.</p>
          <button mat-flat-button color="primary" routerLink="/products" class="explore-btn">
            Explore Products
          </button>
        </div>
      } @else {
        <div class="products-grid">
          <div class="product-card" *ngFor="let product of productService.favorites()">
            <div class="product-image-container">
              <span class="badge" *ngIf="product.badge" [style.background-color]="product.badgeColor">
                {{product.badge}}
              </span>
              
              <div class="image-slider">
                <div class="image-wrapper" [style.transform]="'translateX(-' + (product.currentImageIndex || 0) * 100 + '%)'">
                  <img *ngFor="let img of (product.images || [product.image])" [src]="img" [alt]="product.name" class="product-img">
                </div>
              </div>

              <!-- Mini Carousel Nav -->
              <ng-container *ngIf="product.images && product.images.length > 1">
                <div class="mini-nav">
                  <button class="m-nav-btn prev" (click)="prevProductImg($event, product)">
                    <mat-icon>chevron_left</mat-icon>
                  </button>
                  <button class="m-nav-btn next" (click)="nextProductImg($event, product)">
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
                <div class="mini-indicators">
                  <span *ngFor="let img of product.images; let i = index" 
                        class="m-indicator" 
                        [class.active]="(product.currentImageIndex || 0) === i">
                  </span>
                </div>
              </ng-container>

              <button class="favorite-btn active" (click)="toggleFavorite($event, product)" title="Remove from favorites">
                <mat-icon>favorite</mat-icon>
              </button>
            </div>

            <div class="product-content">
              @if (!product.isEditing) {
                <div class="product-info">
                  <h3 class="product-name">{{product.name}}</h3>
                  <div class="price-row">
                    <span class="current-price">{{product.price}}</span>
                    <span class="old-price" *ngIf="product.oldPrice">{{product.oldPrice}}</span>
                  </div>
                </div>
                
                <div class="product-footer">
                  <div class="rating">
                    <mat-icon class="star-icon">star</mat-icon>
                    <span class="rating-val">{{product.rating}}</span>
                    <span class="reviews">({{product.reviews}})</span>
                  </div>
                  <button mat-flat-button class="edit-btn" (click)="toggleEdit(product)">Edit</button>
                </div>
              } @else {
                <div class="edit-mode">
                  <input class="edit-input" [(ngModel)]="product.name" placeholder="Product Name">
                  <input class="edit-input" [(ngModel)]="product.price" placeholder="Price">
                  <div class="edit-actions">
                    <button class="save-btn" (click)="toggleEdit(product)">Save</button>
                    <button class="cancel-btn" (click)="toggleEdit(product)">Cancel</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .favorites-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      margin: 0;
      color: var(--text-main);
    }

    .add-btn {
      font-weight: 700;
      border-radius: 8px;
      height: 44px;
      padding: 0 20px;
      mat-icon { margin-right: 8px; }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      text-align: center;
      background: var(--surface);
      border-radius: 12px;
      border: 1px dashed var(--border-color);
      
      .empty-icon-wrapper {
        width: 80px;
        height: 80px;
        background: rgba(72, 128, 255, 0.05);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: var(--primary);
          opacity: 0.5;
        }
      }

      h3 {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text-main);
      }

      p {
        font-size: 14px;
        color: var(--text-main);
        opacity: 0.6;
        max-width: 400px;
        margin-bottom: 32px;
        line-height: 1.6;
      }

      .explore-btn {
        padding: 0 32px;
        height: 48px;
        font-weight: 700;
        border-radius: 8px;
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      @media (max-width: 1280px) {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 580px) {
        grid-template-columns: 1fr;
      }
    }

    .product-card {
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s;
      
      &:hover {
        transform: translateY(-4px);
      }
    }

    .product-image-container {
      position: relative;
      height: 200px;
      background: var(--bg-color);
      overflow: hidden;
    }

    .image-slider {
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .image-wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .product-img {
      min-width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 800;
      color: white;
      z-index: 10;
    }

    .favorite-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--surface);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-main);
      opacity: 0.8;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      z-index: 10;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover, &.active {
        background: #F93C65;
        color: white;
        opacity: 1;
        transform: scale(1.1);
      }
    }

    .mini-nav {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 8px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 5;
    }

    .product-card:hover .mini-nav {
      opacity: 1;
    }

    .m-nav-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-main);
      opacity: 0.7;
      &:hover { color: var(--primary); opacity: 1; border-color: var(--primary); }
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    .mini-indicators {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      z-index: 5;
    }

    .m-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-main);
      opacity: 0.2;
      transition: all 0.3s;
      &.active {
        background: var(--primary);
        opacity: 1;
        width: 12px;
        border-radius: 100px;
      }
    }

    .product-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      margin-bottom: 8px;
    }

    .product-name {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      color: var(--text-main);
    }

    .price-row {
      margin-bottom: 16px;
    }

    .current-price {
      font-size: 18px;
      font-weight: 800;
      color: #4880FF;
      margin-right: 8px;
    }

    .old-price {
      font-size: 14px;
      text-decoration: line-through;
      color: #94a3b8;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-main);
      opacity: 0.6;

      .star-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #FFAD33;
      }
    }

    .edit-btn {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-color);
      color: var(--text-main);
      font-weight: 700;
      font-size: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        background: var(--border-color);
      }
    }

    .edit-mode {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .edit-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 13px;
      background: var(--surface);
      color: var(--text-main);
      &:focus {
        border-color: var(--primary);
        outline: none;
      }
    }

    .edit-actions {
      display: flex;
      gap: 8px;
    }

    .save-btn, .cancel-btn {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }

    .save-btn {
      background: var(--primary);
      color: white;
    }

    .cancel-btn {
      background: var(--border-color);
      color: var(--text-main);
    }
  `]

})
export class FavoritesComponent {
  productService = inject(ProductService);

  addNewProduct() {
    this.productService.addProduct({
      name: 'New Favorite Product',
      price: '$0.00',
      category: 'Other',
      isEditing: true,
      isFavorite: true
    });
  }

  toggleEdit(product: Product) {
    product.isEditing = !product.isEditing;
    if (!product.isEditing) {
      this.productService.updateProduct(product);
    }
  }

  toggleFavorite(event: Event, product: Product) {
    event.stopPropagation();
    this.productService.toggleFavorite(product.id);
  }

  nextProductImg(event: Event, product: Product) {
    event.stopPropagation();
    this.productService.nextImage(product.id);
  }

  prevProductImg(event: Event, product: Product) {
    event.stopPropagation();
    this.productService.prevImage(product.id);
  }
}
