import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, CdkDragHandle, CdkDragPlaceholder } from '@angular/cdk/drag-drop';

import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { CreateWidgetModalComponent } from '../../shared/components/create-widget-modal/create-widget-modal';
import { ThemeService } from '../../core/services/theme.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatDialogModule,
    BaseChartDirective, 
    StatCardComponent, 
    CdkDropList, 
    CdkDrag, 
    CdkDragHandle,
    CdkDragPlaceholder
  ],
  template: `
    <div class="dashboard-container">
      <div class="header-row">
        <h1 class="page-title">Dashboard</h1>
      </div>

      <div class="stats-grid" cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="onStatsDrop($event)">
        @for (stat of stats; track stat.label) {
          <app-stat-card
            cdkDrag
            [title]="stat.label"
            [value]="stat.value"
            [emoji]="stat.emoji"
            [iconBg]="stat.iconBg"
            [trend]="stat.trend"
            [trendValue]="stat.trendValue"
            >
            <div class="drag-placeholder" *cdkDragPlaceholder></div>
          </app-stat-card>
        }
      </div>

      <div class="content-row" cdkDropList (cdkDropListDropped)="onWidgetDrop($event)">
        @for (widgetId of rowWidgets; track widgetId) {
          @switch (widgetId) {
            <!-- Analytics Widget -->
            @case ('analytics') {
              <mat-card class="analytics-card" cdkDrag>
                <div class="drag-handle" cdkDragHandle>
                  <mat-icon>drag_indicator</mat-icon>
                </div>
                <div class="card-header">
                  <h4 class="card-title">Sales Analytics</h4>
                  <div class="legend-row">
                    <span class="legend-dot"></span>
                    <span class="legend-text">Real-time Updates (30s)</span>
                  </div>
                </div>
                <div class="chart-wrapper">
                  <canvas baseChart
                    [data]="lineChartData()"
                    [options]="lineChartOptions()"
                    [type]="'line'">
                  </canvas>
                </div>
                <div class="drag-placeholder" *cdkDragPlaceholder></div>
              </mat-card>
            }
            <!-- Recent Orders Widget -->
            @case ('orders') {
              <mat-card class="recent-orders-card" cdkDrag>
                <div class="drag-handle" cdkDragHandle>
                  <mat-icon>drag_indicator</mat-icon>
                </div>
                <div class="card-header">
                  <h4 class="card-title">Recent Orders</h4>
                </div>
                <div class="order-list">
                  @for (order of recentOrders; track order.name) {
                    <div class="order-item">
                      <div class="order-left">
                        <div class="order-avatar" [style.background-color]="order.color">
                          {{order.initials}}
                        </div>
                        <div class="order-info">
                          <p class="order-owner">{{order.name}}</p>
                          <p class="order-desc">{{order.item}}</p>
                        </div>
                      </div>
                      <span class="status-chip" [class]="order.status.toLowerCase()">
                        {{order.status}}
                      </span>
                    </div>
                  }
                </div>
                <button class="view-all-btn">View All Orders</button>
                <div class="drag-placeholder" *cdkDragPlaceholder></div>
              </mat-card>
            }
            <!-- Notifications Widget -->
            @case ('activity') {
              <mat-card class="notifications-card" cdkDrag>
                <div class="drag-handle" cdkDragHandle>
                  <mat-icon>drag_indicator</mat-icon>
                </div>
                <div class="card-header">
                  <h4 class="card-title">Recent Activity</h4>
                </div>
                <div class="activity-list">
                  @for (n of notifications(); track n.timestamp) {
                    <div class="activity-item">
                      <div class="activity-icon" [class]="n.type">
                        <mat-icon>{{ n.type === 'stock' ? 'inventory_2' : (n.type === 'order' ? 'shopping_cart' : (n.type === 'alert' ? 'warning' : 'info')) }}</mat-icon>
                      </div>
                      <div class="activity-content">
                        <p class="activity-title">{{ n.title }}</p>
                        <p class="activity-time">{{ n.timestamp | date:'shortTime' }}</p>
                      </div>
                    </div>
                  }
                  @if (notifications().length === 0) {
                    <div class="empty-activity">
                      <mat-icon>history</mat-icon>
                      <p>No recent activity</p>
                    </div>
                  }
                </div>
                @if (notifications().length > 0) {
                  <button class="view-all-btn">Clear Recent</button>
                }
                <div class="drag-placeholder" *cdkDragPlaceholder></div>
              </mat-card>
            }
          }

          <!-- Dynamic Widgets -->
          @switch (widgetId) {
            @case ('inventory') {
              <mat-card class="analytics-card" cdkDrag>
                <div class="drag-handle" cdkDragHandle><mat-icon>drag_indicator</mat-icon></div>
                <div class="card-header"><h4 class="card-title">Inventory Status</h4></div>
                <div class="activity-list">
                  <div class="activity-item"><div class="activity-icon info"><mat-icon>inventory</mat-icon></div><div class="activity-content"><p class="activity-title">Warehouse A</p><p class="activity-time">85% Capacity</p></div></div>
                  <div class="activity-item"><div class="activity-icon info"><mat-icon>inventory</mat-icon></div><div class="activity-content"><p class="activity-title">Warehouse B</p><p class="activity-time">42% Capacity</p></div></div>
                </div>
                <div class="drag-placeholder" *cdkDragPlaceholder></div>
              </mat-card>
            }
            @case ('satisfaction') {
              <mat-card class="analytics-card" cdkDrag>
                <div class="drag-handle" cdkDragHandle><mat-icon>drag_indicator</mat-icon></div>
                <div class="card-header"><h4 class="card-title">Customer Satisfaction</h4></div>
                <div class="empty-activity">
                  <mat-icon style="color: #00B69B">sentiment_very_satisfied</mat-icon>
                  <p>98% Positive Feedback</p>
                </div>
                <div class="drag-placeholder" *cdkDragPlaceholder></div>
              </mat-card>
            }
            @case ('tasks') {
              <mat-card class="analytics-card" cdkDrag>
                <div class="drag-handle" cdkDragHandle><mat-icon>drag_indicator</mat-icon></div>
                <div class="card-header"><h4 class="card-title">Pending Tasks</h4></div>
                <div class="activity-list">
                  <div class="activity-item"><div class="activity-content"><p class="activity-title">Review Q3 Reports</p><p class="activity-time">Due in 2h</p></div></div>
                  <div class="activity-item"><div class="activity-content"><p class="activity-title">Approve Invoices</p><p class="activity-time">Due tomorrow</p></div></div>
                </div>
                <div class="drag-placeholder" *cdkDragPlaceholder></div>
              </mat-card>
            }
          }
        }
      </div>

      <mat-card class="deals-card">
        <div class="card-header">
          <h4 class="card-title">Deals Details</h4>
        </div>
        <div class="table-responsive">
          <table class="deals-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Location</th>
                <th>Date - Time</th>
                <th>Piece</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (deal of dealsDetails; track deal) {
                <tr>
                  <td>
                    <div class="product-info">
                      <div class="product-img" [style.background-image]="'url(' + deal.image + ')'"></div>
                      <span>{{deal.productName}}</span>
                    </div>
                  </td>
                  <td>{{deal.location}}</td>
                  <td>{{deal.dateTime}}</td>
                  <td>{{deal.piece}}</td>
                  <td>{{deal.amount}}</td>
                  <td>
                    <span class="status-chip" [class]="deal.status.toLowerCase()">
                      {{deal.status}}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </mat-card>
    </div>
    `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
      @media (max-width: 640px) {
        gap: 20px;
      }
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin: 0;
      color: var(--text-main);
      background: linear-gradient(135deg, var(--text-main), var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 24px;
      box-shadow: var(--shadow-lg);
      cursor: grabbing;
      opacity: 0.95;
      transform: scale(1.02);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--primary);
      z-index: 1000;
    }

    .cdk-drag-placeholder {
      opacity: 0.5;
      background: var(--primary-glow);
      border: 2px dashed var(--primary);
      border-radius: 24px;
      min-height: 200px;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .content-row.cdk-drop-list-dragging mat-card:not(.cdk-drag-placeholder),
    .stats-grid.cdk-drop-list-dragging app-stat-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .drag-handle {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.03);
      color: var(--text-muted);
      opacity: 0;
      cursor: grab;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 20;

      &:active {
        cursor: grabbing;
      }

      &:hover {
        background: var(--bg-color);
        color: var(--primary);
        opacity: 1 !important;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    mat-card.analytics-card, mat-card.recent-orders-card, mat-card.notifications-card, mat-card.deals-card {
      position: relative;
      border-radius: 20px !important;
      background: var(--surface-glass) !important;
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-highlight) !important;
      box-shadow: var(--shadow-premium) !important;
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;

      &:hover .drag-handle {
        opacity: 0.6;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg), inset 0 1px 0 0 rgba(255,255,255,0.6) !important;
      }
    }

    .content-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1.2fr;
      gap: 24px;
      align-items: stretch;

      @media (max-width: 1600px) {
        grid-template-columns: 1.5fr 1fr 1fr;
      }

      @media (max-width: 1400px) {
        grid-template-columns: 1.5fr 1fr;
      }

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .analytics-card, .recent-orders-card, .notifications-card, .deals-card {
      padding: 24px;
      @media (max-width: 640px) {
        padding: 20px;
      }
    }

    .notifications-card {
       @media (max-width: 1400px) {
          grid-column: span 1;
       }
       @media (max-width: 1280px) {
          order: 3;
       }
    }

    .deals-card {
      margin-top: 8px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-shrink: 0;
    }

    .card-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 0;
      color: var(--text-main);
    }

    .legend-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      background-color: var(--primary);
      border-radius: 50%;
    }

    .legend-text {
      font-size: 12px;
      opacity: 0.5;
    }

    .chart-wrapper {
      flex: 1;
      width: 100%;
      min-height: 250px;
      position: relative;
    }

    .order-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: auto;
      flex: 1;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-radius: 12px;
      transition: background 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

      &:hover {
        background: var(--bg-color);
      }
    }

    .order-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .order-avatar {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 13px;
      font-weight: 700;
      box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.4);
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .order-owner {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin: 0;
      color: var(--text-main);
    }

    .order-desc {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      margin: 0;
    }

    .status-chip {
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 90px;
      border: 1px solid transparent;
      &.done, &.delivered { background: rgba(16, 185, 129, 0.1); color: #10B981; border-color: rgba(16, 185, 129, 0.2); }
      &.pending { background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.2); }
      &.canceled { background: rgba(225, 29, 72, 0.1); color: #E11D48; border-color: rgba(225, 29, 72, 0.2); }
    }

    .activity-list {
       display: flex;
       flex-direction: column;
       gap: 16px;
       margin-top: 8px;
    }

    .activity-item {
       display: flex;
       align-items: center;
       gap: 12px;
       padding: 8px;
       border-radius: 12px;
       transition: background 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

       &:hover { 
         background: var(--bg-color); 
       }
    }

    .activity-icon {
       width: 36px;
       height: 36px;
       border-radius: 10px;
       display: flex;
       align-items: center;
       justify-content: center;
       box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.2);

       &.stock { background: rgba(225, 29, 72, 0.1); color: #E11D48; }
       &.order { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }
       &.info { background: rgba(79, 70, 229, 0.1); color: #4F46E5; }

       mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .activity-content {
       flex: 1;
       overflow: hidden;
    }

    .activity-title {
       font-size: 13px;
       font-weight: 700;
       margin: 0 0 2px 0;
       white-space: nowrap;
       overflow: hidden;
       text-overflow: ellipsis;
       color: var(--text-main);
       letter-spacing: -0.01em;
    }

    .activity-time {
       font-size: 11px;
       font-weight: 500;
       color: var(--text-muted);
       margin: 0;
    }

    .empty-activity {
       text-align: center;
       padding: 32px 0;
       color: var(--text-muted);
       mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.5; margin-bottom: 8px; }
       p { font-size: 14px; font-weight: 600; margin: 0; }
    }

    .view-all-btn {
      width: 100%;
      margin-top: 16px;
      padding: 12px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-main);
      font-size: 13px;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

      &:hover {
        background: var(--bg-color);
        border-color: var(--primary);
        color: var(--primary);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }
    }

    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 0 -24px;
      padding: 0 24px;
      @media (max-width: 640px) {
        margin: 0 -16px;
        padding: 0 16px;
      }
    }

    .deals-table {
      width: 100%;
      min-width: 800px;
      border-collapse: separate;
      border-spacing: 0 8px;

      th {
        text-align: left;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 12px 16px;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-color);
      }
      td {
        padding: 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-main);
        background: var(--bg-color);
        transition: background 0.2s;

        &:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        &:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
      }
      tr:hover td {
        background: var(--surface);
        box-shadow: inset 0 0 0 1px var(--primary);
      }
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
    }

    .product-img {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background-size: cover;
      background-position: center;
      background-color: var(--bg-color);
    }
  `]
})
export class DashboardComponent {
  private dashboardService = inject(DashboardService);
  private dialog = inject(MatDialog);
  notificationService = inject(NotificationService);
  themeService = inject(ThemeService);

  notifications = this.notificationService.notifications;

  constructor() {
    // Initial sample notifications if none exist
    if (this.notificationService.notifications().length === 0) {
      this.notificationService.addNotification({
        title: 'Low Stock Alert',
        message: 'iPhone 13 Pro is running low on stock (only 2 left).',
        type: 'stock'
      });
      this.notificationService.addNotification({
        title: 'New Order',
        message: 'You have a new order from Moni Roy.',
        type: 'order'
      });
    }
  }


  onStatsDrop(event: CdkDragDrop<any[]>) {
    const newStats = [...this.stats];
    moveItemInArray(newStats, event.previousIndex, event.currentIndex);
    this.stats = newStats;
  }

  onWidgetDrop(event: CdkDragDrop<string[]>) {
    const newWidgets = [...this.rowWidgets];
    moveItemInArray(newWidgets, event.previousIndex, event.currentIndex);
    this.rowWidgets = newWidgets;
  }

  rowWidgets = ['analytics', 'orders', 'activity'];

  stats = [
    { label: 'Total User', value: '40,689', emoji: '👥', iconBg: 'rgba(72, 128, 255, 0.1)', trend: 'up' as const, trendValue: '8.5%' },
    { label: 'Total Order', value: '10,293', emoji: '📦', iconBg: 'rgba(255, 168, 0, 0.1)', trend: 'up' as const, trendValue: '1.3%' },
    { label: 'Total Sales', value: '$89,000', emoji: '💰', iconBg: 'rgba(0, 182, 155, 0.1)', trend: 'down' as const, trendValue: '4.3%' },
    { label: 'Total Pending', value: '2,040', emoji: '⏳', iconBg: 'rgba(249, 60, 101, 0.1)', trend: 'up' as const, trendValue: '1.8%' },
  ];

  recentOrders = [
    { name: 'John Doe', item: 'Apple Watch Series 4', status: 'Done', initials: 'JD', color: '#4880FF' },
    { name: 'Moni Roy', item: 'iPhone 12 Pro', status: 'Pending', initials: 'MR', color: '#F93C65' },
    { name: 'Aman Khan', item: 'Samsung Note 10', status: 'Canceled', initials: 'AK', color: '#40C0E0' },
  ];

  dealsDetails = [
    { productName: 'Apple Watch', location: '6096 Marline Crossings', dateTime: '12.09.2019 - 12.53 PM', piece: 423, amount: '$34,295', status: 'Delivered', image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=100&h=100&fit=crop' },
    { productName: 'iPhone Pro Max', location: '6096 Marline Crossings', dateTime: '12.09.2019 - 12.53 PM', piece: 423, amount: '$34,295', status: 'Pending', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=100&h=100&fit=crop' },
    { productName: 'Macbook Pro', location: '6096 Marline Crossings', dateTime: '12.09.2019 - 12.53 PM', piece: 423, amount: '$34,295', status: 'Canceled', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop' },
    { productName: 'Apple Watch', location: '6096 Marline Crossings', dateTime: '12.09.2019 - 12.53 PM', piece: 423, amount: '$34,295', status: 'Delivered', image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=100&h=100&fit=crop' },
  ];

  // Real-time sales data from mock API
  salesData = toSignal(this.dashboardService.getRealTimeSalesData(), { initialValue: [65, 59, 80, 81, 56, 55, 40, 70, 80, 90, 85, 95] });

  lineChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const isDark = this.themeService.isDarkMode();
    const data = this.salesData();
    const primaryColor = isDark ? '#60A5FA' : '#2563EB';

    return {
      datasets: [
        {
          data: data,
          label: 'Sales',
          backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)',
          borderColor: primaryColor,
          pointBackgroundColor: isDark ? '#0B1120' : '#fff',
          pointBorderColor: primaryColor,
          pointHoverBackgroundColor: primaryColor,
          pointHoverBorderColor: '#fff',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        }
      ],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
  });

  lineChartOptions = computed<ChartOptions<'line'>>(() => {
    const isDark = this.themeService.isDarkMode();
    const primaryColor = isDark ? '#60A5FA' : '#2563EB';
    const color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.6)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#1E293B' : '#fff',
          titleColor: isDark ? '#F8FAFC' : '#0F172A',
          bodyColor: primaryColor,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          border: { display: false },
          ticks: { 
            color: color,
            font: { size: 10, weight: 600 } 
          }
        },
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { 
            color: color,
            font: { size: 10, weight: 600 } 
          }
        }
      }
    };
  });
}

