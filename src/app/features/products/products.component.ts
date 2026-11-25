import { Component, computed, signal, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../core/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, FormsModule, RouterModule],
  template: `
    <div class="products-container">
      <div class="header-section">
        <h1 class="page-title">Products</h1>
        <div class="header-actions">
          <button mat-flat-button color="primary" class="add-btn" (click)="addNewProduct()">
            <mat-icon>add</mat-icon>
            Add New Product
          </button>
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search product..." [ngModel]="searchTerm()" (ngModelChange)="updateSearch($event)">
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="categories-section">
        <button
          class="category-btn"
          [class.active]="selectedCategory() === 'All'"
          (click)="updateCategory('All')">
          All
        </button>
        @for (cat of categories; track cat) {
          <button
            class="category-btn"
            [class.active]="selectedCategory() === cat"
            (click)="updateCategory(cat)">
            {{cat}}
          </button>
        }
      </div>

      <!-- Featured Product Carousel -->
      <div class="carousel-wrapper">
        <mat-card class="featured-banner" [style.background-image]="'url(' + featuredItems[activeBanner()].bgImage + ')'">
          <div class="banner-overlay"></div>
          <div class="banner-content">
            <span class="banner-subtitle">{{featuredItems[activeBanner()].subtitle}}</span>
            <h2 class="banner-title" [innerHTML]="featuredItems[activeBanner()].title.replace('\n', '<br>')"></h2>
            <p class="banner-text">{{featuredItems[activeBanner()].text}}</p>
            <button mat-flat-button color="primary" class="banner-btn">Get Started</button>
          </div>

          <div class="carousel-nav">
            <button class="nav-btn prev" (click)="prevBanner()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button class="nav-btn next" (click)="nextBanner()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>

          <div class="carousel-indicators">
            @for (item of featuredItems; track item; let i = $index) {
              <span
                class="indicator"
                [class.active]="activeBanner() === i"
                (click)="activeBanner.set(i)">
              </span>
            }
          </div>
        </mat-card>
      </div>

      <!-- Best Sellers Carousel -->
      <div class="trending-section">
        <div class="section-header">
          <h2 class="section-title">Best Sellers</h2>
          <div class="carousel-controls">
            <button class="control-btn" (click)="prevTrending()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button class="control-btn" (click)="nextTrending()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>

        <div class="trending-carousel">
          <div class="trending-track" [style.transform]="'translateX(-' + (activeTrendingSlide() * 100) + '%)'">
            @for (slide of trendingSlides(); track slide) {
              <div class="trending-slide">
                <div class="trending-grid">
                  @for (product of slide; track product) {
                    <mat-card class="product-card mini" [routerLink]="['/product', product.id]" style="cursor: pointer;">
                      <div class="product-image-container mini">
                        <img [src]="product.image" [alt]="product.name" class="product-img">
                      </div>
                      <div class="product-details mini">
                        <h4 class="product-name mini">{{product.name}}</h4>
                        <p class="current-price mini">{{product.price}}</p>
                      </div>
                    </mat-card>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        @for (product of paginatedProducts(); track product) {
          <mat-card class="product-card" [routerLink]="['/product', product.id]" style="cursor: pointer;">
            <div class="product-image-container" (click)="$event.stopPropagation()">
              @if (product.badge) {
                <span class="badge" [style.background-color]="product.badgeColor">
                  {{product.badge}}
                </span>
              }
              <div class="image-wrapper" [style.transform]="'translateX(-' + (product.currentImageIndex || 0) * 100 + '%)'">
                @for (img of (product.images || [product.image]); track img) {
                  <img [src]="img" [alt]="product.name" class="product-img">
                }
              </div>
              <!-- Mini Carousel Nav -->
              @if (product.images && product.images.length > 1) {
                <div class="mini-nav">
                  <button class="m-nav-btn prev" (click)="prevProductImg($event, product)">
                    <mat-icon>chevron_left</mat-icon>
                  </button>
                  <button class="m-nav-btn next" (click)="nextProductImg($event, product)">
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
                <div class="mini-indicators">
                  @for (img of product.images; track img; let i = $index) {
                    <span
                      class="m-indicator"
                      [class.active]="(product.currentImageIndex || 0) === i">
                    </span>
                  }
                </div>
              }
              <button class="favorite-btn" [class.active]="product.isFavorite" (click)="toggleFavorite($event, product)">
                <mat-icon>{{product.isFavorite ? 'favorite' : 'favorite_border'}}</mat-icon>
              </button>
            </div>
            <div class="product-details">
              @if (!product.isEditing) {
                <div class="title-row">
                  <h3 class="product-name">{{product.name}}</h3>
                  <div class="rating">
                    <mat-icon class="star-icon">star</mat-icon>
                    <span>{{product.rating}} ({{product.reviews}})</span>
                  </div>
                </div>
                <div class="price-row">
                  <span class="current-price">{{product.price}}</span>
                  @if (product.oldPrice) {
                    <span class="old-price">{{product.oldPrice}}</span>
                  }
                </div>
                <button class="edit-btn" (click)="toggleEdit(product)">Edit Product</button>
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
          </mat-card>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination-section">
          <button
            class="page-nav-btn"
            [disabled]="currentPage() === 1"
            (click)="currentPage.set(currentPage() - 1)">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <div class="page-numbers">
            @for (page of pageNumbers(); track page) {
              <button
                class="page-num"
                [class.active]="currentPage() === page"
                (click)="currentPage.set(page)">
                {{page}}
              </button>
            }
          </div>
          <button
            class="page-nav-btn"
            [disabled]="currentPage() === totalPages()"
            (click)="currentPage.set(currentPage() + 1)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      }
    </div>
    `,
  styles: [`
    .products-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      @media (max-width: 640px) {
        gap: 12px;
      }
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      margin: 0;
      color: var(--text-main);
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      @media (max-width: 640px) {
        width: 100%;
        gap: 8px;
      }
    }

    .add-btn {
      font-weight: 700;
      border-radius: 8px;
      height: 44px;
      padding: 0 20px;
      mat-icon { margin-right: 8px; }
      @media (max-width: 640px) {
        flex: 1;
        padding: 0 12px;
        font-size: 13px;
        white-space: nowrap;
      }
    }

    .search-box {
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 12px;
      width: 280px;
      gap: 8px;

      @media (max-width: 640px) {
        width: 100%;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--text-main);
        opacity: 0.5;
      }

      input {
        border: none;
        background: transparent;
        outline: none;
        font-size: 14px;
        color: var(--text-main);
        width: 100%;
        &::placeholder { color: var(--text-main); opacity: 0.4; }
      }
    }

    .categories-section {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
      margin: 0 -32px;
      padding: 0 32px 8px 32px;
      &::-webkit-scrollbar { display: none; }
      @media (max-width: 768px) {
        margin: 0 -16px;
        padding: 0 16px 8px 16px;
      }
    }

    .category-btn {
      padding: 8px 24px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--surface);
      color: var(--text-main);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;

      @media (max-width: 640px) {
        padding: 6px 16px;
        font-size: 13px;
      }

      &:hover {
        border-color: var(--primary);
      }

      &.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
    }

    .carousel-wrapper {
      position: relative;
    }

    .featured-banner {
      background-size: cover;
      background-position: center;
      color: white;
      border-radius: 16px;
      padding: 0;
      overflow: hidden;
      display: flex;
      min-height: 320px;
      position: relative;
      transition: background-image 0.5s ease;
      @media (max-width: 768px) {
        min-height: 240px;
      }
    }

    .banner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(72, 128, 255, 0.9) 0%, rgba(72, 128, 255, 0.4) 100%);
      z-index: 1;
    }

    .banner-content {
      padding: 48px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 2;
      position: relative;
      @media (max-width: 640px) {
        padding: 24px;
      }
    }

    .carousel-nav {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 3;
      pointer-events: none;
    }

    .nav-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s;
      &:hover {
        background: rgba(255, 255, 255, 0.4);
        transform: scale(1.1);
      }
    }

    .carousel-indicators {
      position: absolute;
      bottom: 20px;
      left: 48px;
      display: flex;
      gap: 8px;
      z-index: 3;
    }

    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.2s;
      &.active {
        background: white;
        width: 24px;
        border-radius: 100px;
      }
    }

    .banner-subtitle {
      font-size: 14px;
      font-weight: 600;
      opacity: 0.8;
      margin-bottom: 12px;
    }

    .banner-title {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 16px;
      @media (max-width: 640px) {
        font-size: 24px;
      }
    }

    .banner-text {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 24px;
      max-width: 400px;
    }

    .banner-btn {
      width: fit-content;
      background: #FFAD33 !important;
      color: white !important;
      font-weight: 800;
      border-radius: 8px;
      padding: 0 32px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .product-card {
      border-radius: 12px;
      overflow: hidden;
      padding: 0;
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

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.03);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      &:hover::after {
        opacity: 1;
      }
    }

    .image-wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-img {
      min-width: 100%;
      height: 100%;
      object-fit: cover;
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
      transition: opacity 0.2s;
      z-index: 5;
    }

    .product-image-container:hover .mini-nav {
      opacity: 1;
    }

    .m-nav-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--surface);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      color: var(--text-main);
      opacity: 0.8;
      &:hover { color: var(--primary); opacity: 1; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .mini-indicators {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      z-index: 5;
    }

    .m-indicator {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--text-main);
      opacity: 0.2;
      transition: all 0.2s;
      &.active {
        background: var(--primary);
        opacity: 1;
        transform: scale(1.2);
      }
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
        line-height: 18px;
      }

      &:hover, &.active {
        background: #F93C65;
        color: white;
        opacity: 1;
        transform: scale(1.1);
      }
    }

    .product-details {
      padding: 16px;
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .product-name {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      color: var(--text-main);
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-main);
      opacity: 0.6;
    }

    .star-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #FFAD33;
    }

    .price-row {
      margin-bottom: 16px;
    }

    .current-price {
      font-size: 18px;
      font-weight: 800;
      color: var(--primary);
      margin-right: 8px;
    }

    .old-price {
      font-size: 14px;
      text-decoration: line-through;
      color: var(--text-main);
      opacity: 0.5;
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
      background: var(--bg-color);
      color: var(--text-main);
      border: 1px solid var(--border-color);
    }

    @media (max-width: 768px) {
      .featured-banner {
        min-height: auto;
      }
      .banner-content {
        padding: 32px;
      }
    }

    .pagination-section {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
    }

    .page-numbers {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .page-nav-btn, .page-num {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--surface);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: var(--primary);
        color: var(--primary);
      }

      &.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
    }

    .dots {
      color: var(--text-main);
      opacity: 0.5;
      font-weight: 800;
      letter-spacing: 2px;
    }

    .trending-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-title {
      font-size: 20px;
      font-weight: 800;
      margin: 0;
      color: var(--text-main);
    }

    .carousel-controls {
      display: flex;
      gap: 8px;
    }

    .control-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--surface);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        border-color: var(--primary);
        color: var(--primary);
      }
    }

    .trending-carousel {
      overflow: hidden;
      width: 100%;
    }

    .trending-track {
      display: flex;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .trending-slide {
      min-width: 100%;
    }

    .trending-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 580px) {
        grid-template-columns: 1fr;
      }
    }

    .product-card.mini {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      padding: 12px !important;
      box-shadow: none;
      border: 1px solid var(--border-color);
    }

    .product-image-container.mini {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .product-name.mini {
      font-size: 13px;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .current-price.mini {
      font-size: 14px;
      margin: 0;
      color: var(--primary);
      font-weight: 700;
    }

    @media (max-width: 1024px) {
      .trending-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .trending-grid {
        grid-template-columns: repeat(1, 1fr);
      }
    }
  `]
})
export class ProductsComponent {
  productService = inject(ProductService);

  featuredItems = [
    {
      subtitle: 'September 12-22',
      title: 'Enjoy free home \ndelivery this summer',
      text: 'Effortless deliver for all your product needs, keeping you cool all season long.',
      bgImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000'
    },
    {
      subtitle: 'Exclusive Deal',
      title: 'Up to 50% Off on \nElectronics Gear',
      text: 'Upgrade your setup with the latest tech at unbeatable prices for a limited time.',
      bgImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000'
    },
    {
      subtitle: 'New Arrival',
      title: 'Smart Living with \nModern Furniture',
      text: 'Redefine your space with our contemporary furniture collection designed for comfort.',
      bgImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2000'
    }
  ];

  activeBanner = signal(0);

  nextBanner() {
    this.activeBanner.update(i => (i + 1) % this.featuredItems.length);
  }

  prevBanner() {
    this.activeBanner.update(i => (i - 1 + this.featuredItems.length) % this.featuredItems.length);
  }

  activeTrendingSlide = signal(0);

  trendingSlides = computed(() => {
    const products = this.productService.products();
    const slides = [];
    const size = 4; // Products per slide
    for (let i = 0; i < 8; i += size) {
      slides.push(products.slice(i, i + size));
    }
    return slides;
  });

  nextTrending() {
    this.activeTrendingSlide.update(i => (i + 1) % this.trendingSlides().length);
  }

  prevTrending() {
    this.activeTrendingSlide.update(i => (i - 1 + this.trendingSlides().length) % this.trendingSlides().length);
  }

  categories = ['Electronics', 'Fashion', 'Furniture', 'Sports'];

  searchTerm = signal('');
  selectedCategory = signal('All');
  currentPage = signal(1);
  pageSize = signal(8);

  constructor() {
    // Reset to page 1 when filters change
    const filterReset = computed(() => {
      this.searchTerm();
      this.selectedCategory();
      return true;
    });

    // We can't use effect() to set signals easily without allowSignalWrites: true
    // but we can just use the setter in the template or logic.
  }

  updateSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  updateCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.currentPage.set(1);
  }

  filteredProducts = computed(() => {
    let filtered = this.productService.products();

    // Search filter
    const term = this.searchTerm().toLowerCase();
    if (term) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }

    // Category filter
    const cat = this.selectedCategory();
    if (cat !== 'All') {
      filtered = filtered.filter(p => p.category === cat);
    }

    return filtered;
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.pageSize());
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredProducts().slice(start, end);
  });

  pageNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  addNewProduct() {
    this.productService.addProduct({
      name: 'New Awesome Product',
      price: '$0.00',
      category: 'Other',
      isEditing: true
    });
    // Go to page 1 to see the new product (usually it would be added at the end, but let's just make it visible)
    this.currentPage.set(1);
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
