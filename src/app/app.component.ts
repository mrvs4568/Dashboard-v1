import { Component, signal, inject, computed, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }
}

import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LucideAngularModule, LayoutDashboard, Users, Settings, Bell, Search, Menu, LogOut, ChevronDown, ShoppingBag, Heart, Mail, ClipboardList, Globe, Box, CreditCard, LayoutGrid, Package, ShoppingCart, AlertTriangle, Info, User, Check, X, Image, Calendar, BarChart2, Store, CheckSquare, Banknote, Brain } from 'lucide-angular';

import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { NotificationService } from './core/services/notification.service';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    LucideAngularModule,
    ThemeToggleComponent,
    TimeAgoPipe
  ],
  template: `
    <mat-sidenav-container class="app-container" [class.is-collapsed]="isCollapsed()" autosize>
      <mat-sidenav 
        [mode]="isMobileScreen() ? 'over' : 'side'" 
        [opened]="isMobileScreen() ? isMobileMenuOpen() : true" 
        (closedStart)="isMobileScreen() && isMobileMenuOpen.set(false)"
        class="app-sidenav" 
        [class.collapsed]="!isMobileScreen() && isCollapsed()" 
        [class.mobile-active]="isMobileScreen() && isMobileMenuOpen()">
        
        <div class="logo-container">
          <div class="logo-box">
             <div class="logo-inner"></div>
          </div>
          <span class="logo-text" *ngIf="isMobileScreen() || !isCollapsed()">Dash<span>Stack</span></span>
          <button mat-icon-button (click)="toggleMobileMenu()" class="mobile-close-btn" *ngIf="isMobileScreen()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <nav class="nav-container">
          <div class="nav-section">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Dashboard">
              <lucide-icon [name]="DashboardIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Dashboard</span>
            </a>
            <a routerLink="/analytics" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Analytics">
              <lucide-icon [name]="BarChart2Icon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Analytics</span>
            </a>
            <a routerLink="/financial" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Financial">
              <lucide-icon [name]="BanknoteIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Financial</span>
            </a>
            <a routerLink="/ai-dashboard" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="AI Dashboard">
              <lucide-icon [name]="BrainIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">AI Dashboard</span>
            </a>
            <a routerLink="/ecommerce" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Ecommerce">
              <lucide-icon [name]="StoreIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Ecommerce</span>
            </a>
            <a routerLink="/products" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Products">
              <lucide-icon [name]="ProductIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Products</span>
            </a>
            <a routerLink="/product-stock" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Product Stock">
              <lucide-icon [name]="StockIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Product Stock</span>
            </a>
            <a routerLink="/favorites" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Favorites">
              <lucide-icon [name]="HeartIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Favorites</span>
            </a>
            <a routerLink="/inbox" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Inbox">
              <lucide-icon [name]="MailIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Inbox</span>
            </a>
            <a routerLink="/orders" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Orders">
              <lucide-icon [name]="OrderListIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Order List</span>
            </a>
            <a routerLink="/users" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Users">
              <lucide-icon [name]="UsersIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Users List</span>
            </a>

            <div class="nav-dropdown-group" [class.open]="isPagesOpen()">
              <button class="nav-item dropdown-toggle" (click)="togglePages()" title="Pages">
                <lucide-icon [name]="GlobeIcon" size="22" class="nav-icon"></lucide-icon>
                <span *ngIf="isMobileScreen() || !isCollapsed()">Pages</span>
                <lucide-icon [name]="ChevronDownIcon" size="16" class="chevron-icon" *ngIf="isMobileScreen() || !isCollapsed()"></lucide-icon>
              </button>
              
              <div class="dropdown-items" [class.collapsed-visible]="isCollapsed() && isPagesOpen()">
                <a routerLink="/pricing" routerLinkActive="active" class="nav-sub-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Pricing">
                  <lucide-icon [name]="PricingIcon" size="18" class="nav-icon sub-icon"></lucide-icon>
                  <span>Pricing</span>
                </a>
                <a routerLink="/calendar" routerLinkActive="active" class="nav-sub-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Calendar">
                  <lucide-icon [name]="CalendarIcon" size="18" class="nav-icon sub-icon"></lucide-icon>
                  <span>Calendar</span>
                </a>
                <a routerLink="/todo" routerLinkActive="active" class="nav-sub-item" (click)="isMobileScreen() && toggleMobileMenu()" title="To-Do">
                  <lucide-icon [name]="CheckSquareIcon" size="18" class="nav-icon sub-icon"></lucide-icon>
                  <span>To-Do</span>
                </a>
              </div>
            </div>
          </div>

          <div class="nav-spacer"></div>

          <div class="nav-section border-t pt-4">
             <a routerLink="/settings" routerLinkActive="active" class="nav-item" (click)="isMobileScreen() && toggleMobileMenu()" title="Settings">
              <lucide-icon [name]="SettingsIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Settings</span>
            </a>
            <button class="nav-item logout-btn" title="Logout">
              <lucide-icon [name]="LogoutIcon" size="22" class="nav-icon"></lucide-icon>
              <span *ngIf="isMobileScreen() || !isCollapsed()">Logout</span>
            </button>
          </div>
        </nav>
      </mat-sidenav>

      <mat-sidenav-content class="app-content">

        <header class="app-header">
          <div class="header-left">
            <button mat-icon-button (click)="isMobileScreen() ? toggleMobileMenu() : toggleSidebar()" class="menu-btn">
              <lucide-icon [name]="MenuIcon" size="20"></lucide-icon>
            </button>
            <div class="search-wrapper desktop-search">
              <lucide-icon [name]="SearchIcon" size="16" class="search-icon"></lucide-icon>
              <input type="text" placeholder="Search..." class="search-input">
            </div>
          </div>

          <div class="header-right">
            <app-theme-toggle></app-theme-toggle>
            
            <button mat-icon-button class="header-action-btn notification-btn" [matMenuTriggerFor]="notificationMenu">
              <lucide-icon [name]="BellIcon" size="24" [matBadge]="unreadCount()" matBadgeColor="warn" [matBadgeHidden]="unreadCount() === 0"></lucide-icon>
            </button>

            <mat-menu #notificationMenu="matMenu" class="notification-dropdown">
              <div class="notification-header" (click)="$event.stopPropagation()">
                <div class="header-main">
                  <h3>Notifications</h3>
                  <span class="unread-badge" *ngIf="unreadCount() > 0">{{ unreadCount() }} New</span>
                </div>
                <button mat-button class="mark-read-btn" (click)="notificationService.markAllAsRead()">
                  Mark all as read
                </button>
              </div>
              
              <div class="notification-list" (click)="$event.stopPropagation()">
                @if (notifications().length > 0) {
                  @for (n of notifications(); track n.id) {
                    <div class="notification-item" [class.unread]="!n.isRead" (click)="notificationService.markAsRead(n.id)">
                      <div class="item-visual">
                        @if (n.avatar) {
                          <div class="avatar-container">
                            <img [src]="n.avatar" [alt]="n.title" class="item-avatar">
                            <div class="type-indicator" [class]="n.type"></div>
                          </div>
                        } @else {
                          <div class="icon-container" [class]="n.type">
                            <lucide-icon [name]="getNotificationIcon(n.type)" size="18"></lucide-icon>
                          </div>
                        }
                      </div>
                      <div class="item-content">
                        <div class="item-top">
                          <span class="item-category" *ngIf="n.category">{{ n.category }}</span>
                          <span class="item-time">{{ n.timestamp | timeAgo }}</span>
                        </div>
                        <p class="item-title">{{ n.title }}</p>
                        <p class="item-message">{{ n.message }}</p>
                        <div class="item-actions" *ngIf="!n.isRead">
                           <div class="unread-dot"></div>
                        </div>
                      </div>
                    </div>
                  }
                } @else {
                  <div class="empty-state">
                    <div class="empty-icon">
                      <lucide-icon [name]="BellIcon" size="48"></lucide-icon>
                    </div>
                    <h4>All caught up!</h4>
                    <p>No new notifications at the moment.</p>
                  </div>
                }
              </div>

              <div class="notification-footer" (click)="$event.stopPropagation()">
                <button mat-flat-button color="primary" class="view-all-btn">
                  View All Notifications
                </button>
                <button mat-button class="clear-btn" (click)="notificationService.clearAll()">
                  Clear all
                </button>
              </div>
            </mat-menu>

            <button mat-icon-button class="header-action-btn">
              <lucide-icon [name]="GlobeIcon" size="20"></lucide-icon>
            </button>
            <div class="profile-divider"></div>
            <div class="user-block">
              <div class="user-info">
                <span class="user-name">{{ userService.currentUser().name }}</span>
                <span class="user-role">{{ userService.currentUser().role }}</span>
              </div>
              <div class="avatar-wrapper">
                <img [src]="userService.currentUser().avatar" [alt]="userService.currentUser().name" class="avatar-img">
              </div>
            </div>
          </div>
        </header>

        <main class="main-viewport">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      --sidebar-width: 260px;
      --sidebar-collapsed-width: 80px;
      --header-height: 72px;
    }

    .app-container {
      height: 100%;
      background: var(--bg-gradient);
    }

    .app-sidenav {
      width: var(--sidebar-width);
      border-right: none;
      background: transparent !important;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s;
      overflow-x: hidden;
      padding: 16px 0 16px 16px;

      @media (max-width: 1024px) {
        width: 280px !important;
        padding: 0;
        background: var(--surface) !important;
        border-right: 1px solid var(--border-color);
      }

      &.collapsed {
        width: var(--sidebar-collapsed-width);
        
        .logo-container {
          justify-content: center;
          padding: 0;
        }

        .nav-item {
          justify-content: center;
          padding: 12px 0;
          gap: 0;
        }

        .nav-icon {
          margin: 0;
        }
      }
    }

    .mobile-close-btn {
      display: none;
      @media (max-width: 1024px) {
        display: block;
        color: var(--text-main);
      }
    }

    .logo-container {
      height: 48px;
      margin-bottom: 24px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      transition: all 0.3s;
    }

    .logo-box {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--primary), #D946EF);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px var(--primary-glow);
    }

    .logo-inner {
      width: 14px;
      height: 14px;
      border: 2px solid white;
      border-radius: 4px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.5px;
      white-space: nowrap;
      flex: 1;
      font-family: 'Inter', sans-serif;
      span {
        color: var(--primary);
      }
    }

    .nav-container {
      display: flex;
      flex-direction: column;
      height: calc(100% - 72px);
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-highlight);
      border-radius: 24px;
      padding: 16px;
      box-shadow: var(--shadow-sm);
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nav-spacer {
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 12px;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background: transparent;
      border: 1px solid transparent;
      text-align: left;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;

      &:hover {
        background: var(--bg-color);
        color: var(--text-main);
      }

      &.active {
        background: var(--surface);
        color: var(--primary);
        border-color: var(--border-color);
        box-shadow: var(--shadow-sm);
        .nav-icon {
          opacity: 1;
        }
      }

      .nav-icon {
        opacity: 0.7;
        flex-shrink: 0;
      }
    }

    .nav-dropdown-group {
      display: flex;
      flex-direction: column;
      
      .dropdown-items {
        display: none;
        flex-direction: column;
        padding-left: 36px;
        margin-top: 4px;
        gap: 4px;
        transition: all 0.3s ease;

        &.collapsed-visible {
          display: flex !important;
        }
      }

      &.open {
        .dropdown-items {
          display: flex;
        }
        .chevron-icon {
          transform: rotate(180deg);
        }
      }
    }

    .app-sidenav.collapsed {
      .nav-dropdown-group .dropdown-items {
        padding-left: 0;
        align-items: center;
      }
      .nav-sub-item {
        justify-content: center;
        padding: 10px 0;
        width: 100%;
        span {
          display: none;
        }
        .sub-icon {
          margin: 0;
        }
      }
    }

    .chevron-icon {
      margin-left: auto;
      opacity: 0.5;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-sub-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;

      .sub-icon {
        margin-right: 4px;
        opacity: 0.6;
      }

      &:hover {
        background: var(--bg-color);
        color: var(--text-main);
      }

      &.active {
        color: var(--text-main);
        font-weight: 600;
      }
    }

    .logout-btn {
      color: var(--error);
      opacity: 0.8 !important;
      &:hover {
        background: rgba(225, 29, 72, 0.05);
        color: var(--error);
        border-color: rgba(225, 29, 72, 0.1);
      }
    }

    .app-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
      background: transparent !important;
    }

    .app-header {
      height: var(--header-height);
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-highlight);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      @media (max-width: 768px) {
        padding: 0 16px;
        border-radius: 16px;
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      @media (max-width: 768px) {
        gap: 8px;
      }
    }

    .menu-btn {
      color: var(--text-main);
      opacity: 0.7;
      &:hover { opacity: 1; }
    }

    .search-wrapper {
      position: relative;
      width: 320px;
      
      &.desktop-search {
        @media (max-width: 1024px) {
          display: none;
        }
      }
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.4;
      color: var(--text-main);
    }

    .search-input {
      width: 100%;
      background: var(--bg-color);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 10px 16px 10px 42px;
      font-size: 13px;
      font-weight: 500;
      outline: none;
      transition: all 0.3s;
      &::placeholder {
        opacity: 0.5;
        color: var(--text-muted);
      }
      &:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-glow);
        background: var(--surface);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-action-btn {
      color: var(--text-muted);
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      
      &:hover { 
        color: var(--text-main);
        background: var(--surface);
        border-color: var(--border-highlight);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }
      
      ::ng-deep .mat-badge-content {
        background: linear-gradient(135deg, #E11D48, #F43F5E) !important;
        color: white !important;
        font-size: 10px !important;
        font-weight: 800 !important;
        width: 16px !important;
        height: 16px !important;
        line-height: 16px !important;
        border: 2px solid var(--surface) !important;
        top: 4px !important;
        right: 4px !important;
        box-shadow: 0 0 10px rgba(225, 29, 72, 0.4) !important;
        animation: pulse-badge 2s infinite;
      }
    }

    .main-viewport {
      flex: 1;
      overflow-y: auto;
      border-radius: 24px;
    }

    .header-action-btn.notification-btn {
      color: var(--primary) !important;
      opacity: 1 !important;
      overflow: visible !important;
      
      lucide-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 4px var(--primary-glow));
      }

      ::ng-deep .mat-badge-content {
        background: linear-gradient(135deg, #E11D48, #BE123C) !important;
        color: white !important;
        font-size: 11px !important;
        font-weight: 800 !important;
        width: 20px !important;
        height: 20px !important;
        line-height: 20px !important;
        border: 2px solid var(--surface) !important;
        top: -4px !important;
        right: -4px !important;
        box-shadow: 0 4px 10px rgba(225, 29, 72, 0.4) !important;
        animation: pulse-badge 2s infinite !important;
      }
    }

    @keyframes pulse-badge {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 65, 108, 0.4); }
      70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(255, 65, 108, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 65, 108, 0); }
    }

    .app-content {
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .profile-divider {
      width: 1px;
      height: 40px;
      background: var(--border-color);
      margin: 0 8px;
      @media (max-width: 640px) {
        display: none;
      }
    }

    .user-block {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 12px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-color);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        transform: translateY(-1px);
      }
    }

    .user-info {
      text-align: right;
      display: flex;
      flex-direction: column;
      @media (max-width: 640px) {
        display: none;
      }
    }

    .user-name {
      font-size: 14px;
      font-weight: 700;
    }

    .user-role {
      font-size: 11px;
      opacity: 0.6;
    }

    .avatar-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid rgba(72, 128, 255, 0.2);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .main-viewport {
      padding: 32px;
      @media (max-width: 768px) {
        padding: 16px;
      }
    }

    .border-t {
      border-top: 1px solid var(--border-color);
    }

    /* Premium Notification Styles */
    ::ng-deep .notification-dropdown {
      min-width: 420px !important;
      max-width: 480px !important;
      margin-top: 12px !important;
      border-radius: 20px !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: var(--surface) !important;
      border: 1px solid var(--border-color) !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;

      @media (max-width: 440px) {
        min-width: calc(100vw - 32px) !important;
        margin-left: 16px !important;
        margin-right: 16px !important;
      }
    }

    .notification-header {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface);
      border-bottom: 1px solid var(--border-color);

      .header-main {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.5px;
      }

      .unread-badge {
        background: var(--primary);
        color: white;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 100px;
        box-shadow: 0 4px 12px rgba(72, 128, 255, 0.2);
      }

      .mark-read-btn {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary);
        padding: 0 12px;
        &:hover { background: rgba(72, 128, 255, 0.05); }
      }
    }

    .notification-list {
      max-height: 480px;
      overflow-y: auto;
      background: var(--surface);

      /* Custom Scrollbar */
      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { 
        background: var(--border-color);
        border-radius: 10px;
      }
    }

    .notification-item {
      padding: 20px 24px;
      display: flex;
      gap: 16px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 1px solid var(--border-color);
      position: relative;

      &:hover {
        background: var(--bg-color);
        transform: scale(1.005);
        z-index: 1;
        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      }

      &.unread {
        background: rgba(72, 128, 255, 0.02);
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--primary);
          box-shadow: 2px 0 10px rgba(72, 128, 255, 0.3);
        }
      }

      &:last-child { border-bottom: none; }
    }

    .item-visual {
      flex-shrink: 0;
    }

    .icon-container {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      
      &.stock { background: #FFF1F2; color: #E11D48; }
      &.order { background: #F0F9FF; color: #0EA5E9; }
      &.alert { background: #FFFBEB; color: #D97706; }
      &.info { background: #F5F3FF; color: #7C3AED; }
      &.user { background: #ECFDF5; color: #059669; }
    }

    .avatar-container {
      position: relative;
      width: 44px;
      height: 44px;
    }

    .item-avatar {
      width: 100%;
      height: 100%;
      border-radius: 14px;
      object-fit: cover;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .type-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid var(--surface);
      
      &.stock { background: #E11D48; }
      &.order { background: #0EA5E9; }
      &.alert { background: #D97706; }
      &.info { background: #7C3AED; }
      &.user { background: #059669; }
    }

    .item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }

    .item-category {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.5;
      color: var(--text-main);
    }

    .item-time {
      font-size: 11px;
      font-weight: 500;
      opacity: 0.4;
      color: var(--text-main);
    }

    .item-title {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.2;
    }

    .item-message {
      margin: 2px 0 0;
      font-size: 13px;
      color: var(--text-main);
      opacity: 0.6;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
      margin-top: 8px;
      box-shadow: 0 0 10px rgba(72, 128, 255, 0.4);
    }

    .empty-state {
      padding: 60px 40px;
      text-align: center;
      background: var(--surface);

      .empty-icon {
        width: 80px;
        height: 80px;
        background: var(--bg-color);
        border-radius: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        color: var(--primary);
        opacity: 0.8;
      }

      h4 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 800;
        color: var(--text-main);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: var(--text-main);
        opacity: 0.5;
      }
    }

    .notification-footer {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--surface);
      border-top: 1px solid var(--border-color);

      .view-all-btn {
        width: 100%;
        height: 48px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(72, 128, 255, 0.2);
        letter-spacing: 0.2px;
      }

      .clear-btn {
        width: 100%;
        color: var(--text-main);
        opacity: 0.5;
        font-size: 13px;
        font-weight: 600;
        &:hover { opacity: 1; background: var(--bg-color); }
      }
    }
  `]
})
export class AppComponent {
  notificationService = inject(NotificationService);
  userService = inject(UserService);
  private dialog = inject(MatDialog);
  isCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  isPagesOpen = signal(false);

  isMobileScreen = signal(false);

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    this.isMobileScreen.set(window.innerWidth <= 1024);
  }

  readonly DashboardIcon = LayoutDashboard;
  readonly BarChart2Icon = BarChart2;
  readonly BanknoteIcon = Banknote;
  readonly BrainIcon = Brain;
  readonly StoreIcon = Store;
  readonly CheckSquareIcon = CheckSquare;
  readonly ProductIcon = ShoppingBag;
  readonly StockIcon = Box;
  readonly HeartIcon = Heart;
  readonly MailIcon = Mail;
  readonly OrderListIcon = ClipboardList;
  readonly UsersIcon = Users;
  readonly PricingIcon = CreditCard;
  readonly CalendarIcon = Calendar;
  readonly CreditCardIcon = CreditCard;
  readonly SettingsIcon = Settings;
  readonly BellIcon = Bell;
  readonly SearchIcon = Search;
  readonly MenuIcon = Menu;
  readonly LogoutIcon = LogOut;
  readonly GlobeIcon = Globe;
  readonly ChevronDownIcon = ChevronDown;
  readonly PackageIcon = Package;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly AlertIcon = AlertTriangle;
  readonly InfoIcon = Info;
  readonly UserIcon = User;
  readonly CheckIcon = Check;
  
  getNotificationIcon(type: string): any {
    switch (type) {
      case 'stock': return Package;
      case 'order': return ShoppingCart;
      case 'alert': return AlertTriangle;
      case 'user': return User;
      case 'info':
      default: return Info;
    }
  }

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  togglePages() {
    this.isPagesOpen.update(v => !v);
  }
}
