import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService, Order } from '../../core/order.service';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatButtonModule, 
    MatMenuModule, 
    MatTooltipModule, 
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="order-list-container">
      <div class="page-header">
        <h1 class="page-title">Order Lists</h1>
        <div class="header-actions">
          @if (selectedIds().size > 0) {
            <div class="bulk-actions-group">
              <button class="action-header-btn delete-btn" (click)="bulkDelete()" matTooltip="Delete selected orders">
                <mat-icon>delete</mat-icon>
                <span>Delete ({{selectedIds().size}})</span>
              </button>
              <button class="action-header-btn status-btn" [matMenuTriggerFor]="bulkStatusMenu" matTooltip="Update status for selected">
                <mat-icon>edit_note</mat-icon>
                <span>Update Status</span>
              </button>
            </div>
          }
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search product..." (input)="onSearch($event)" [value]="searchTerm()">
          </div>
          <button class="action-header-btn export-btn" (click)="exportOrders()" matTooltip="Export selected orders">
            <mat-icon>file_download</mat-icon>
            <span>Export</span>
          </button>
          <button class="action-header-btn ai-btn" (click)="toggleAiPanel()" matTooltip="Get AI business insights">
            <mat-icon>auto_awesome</mat-icon>
            <span>AI Insights</span>
          </button>
          <button class="action-header-btn add-btn" (click)="addNewOrder()">
            <mat-icon>add</mat-icon>
            <span>Add Order</span>
          </button>
        </div>
      </div>
      
      <div class="table-card">
        <div class="dashstack-filter-bar">
          <div class="filter-segment icon-seg">
            <mat-icon>filter_alt</mat-icon>
          </div>
          <div class="filter-segment label-seg">
            <span>Filter By</span>
          </div>
          <div class="filter-segment dropdown-seg" (click)="picker.open()" [class.active]="selectedDate()">
            <span>{{selectedDate() ? (selectedDate() | date:'dd MMM yyyy') : 'Date'}}</span>
            <mat-icon class="chevron">expand_more</mat-icon>
            <input [matDatepicker]="picker" [ngModel]="selectedDate()" (dateChange)="onDateChange($event.value)" style="display: none;">
            <mat-datepicker #picker></mat-datepicker>
          </div>
          <div class="filter-segment dropdown-seg" [matMenuTriggerFor]="typeMenu" [class.active]="selectedTypes().length > 0">
            <span>Order Type</span>
            <mat-icon class="chevron">expand_more</mat-icon>
          </div>
          <div class="filter-segment dropdown-seg border-right-none" [matMenuTriggerFor]="statusMenu" [class.active]="selectedStatuses().length > 0">
            <span>Order Status</span>
            <mat-icon class="chevron">expand_more</mat-icon>
          </div>
          <div class="filter-segment reset-seg" (click)="resetFilters()">
            <mat-icon>restart_alt</mat-icon>
            <span>Reset Filter</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th class="checkbox-col">
                  <mat-checkbox 
                    [checked]="isAllSelected()" 
                    [indeterminate]="isPartiallySelected()"
                    (change)="toggleAllSelection($event.checked)">
                  </mat-checkbox>
                </th>
                <th>ID</th>
                <th>NAME</th>
                <th>ADDRESS</th>
                <th>DATE</th>
                <th>TYPE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              @for (order of paginatedOrders(); track order.id) {
                <tr [class.selected]="selectedIds().has(order.id)">
                  <td class="checkbox-col">
                    <mat-checkbox 
                      [checked]="selectedIds().has(order.id)"
                      (change)="toggleSelection(order.id)">
                    </mat-checkbox>
                  </td>
                  <td class="id-cell">{{order.id.replace('#', '')}}</td>
                  <td class="name-cell">{{order.name}}</td>
                  <td class="address-cell">{{order.address}}</td>
                  <td class="date-cell">{{order.date}}</td>
                  <td class="type-cell">{{order.type}}</td>
                  <td>
                    <div class="status-cell">
                      <span class="status-badge" [class]="order.status.toLowerCase().replace(' ', '-')">
                        {{order.status}}
                      </span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Multi-select Filter Menus -->
        <mat-menu #typeMenu="matMenu" class="modern-menu chip-style" (opened)="onTypeMenuOpen()">
          <div class="menu-container chip-type-container" (click)="$event.stopPropagation()">
            <div class="menu-title">Select Order Type</div>
            <div class="chips-grid">
              @for (type of types; track type) {
                <button class="chip-item" 
                  [class.selected]="pendingTypes().includes(type)"
                  (click)="togglePendingType(type)">
                  {{type}}
                </button>
              }
            </div>
            
            <div class="menu-footer">
              <p class="hint-text">*You can choose multiple Order type</p>
              <button class="apply-btn" (click)="applyTypes()">Apply Now</button>
            </div>
          </div>
        </mat-menu>

        <mat-menu #statusMenu="matMenu" class="modern-menu list-style">
          <div class="menu-container" (click)="$event.stopPropagation()">
            <div class="menu-header">Order Status</div>
            <div class="menu-list">
              @for (status of statuses; track status) {
                <div class="menu-list-item" 
                  [class.active]="selectedStatuses().includes(status)"
                  (click)="toggleStatus(status)">
                  <mat-checkbox [checked]="selectedStatuses().includes(status)" (click)="$event.preventDefault()">
                    <span class="item-label">{{status}}</span>
                  </mat-checkbox>
                </div>
              }
            </div>
          </div>
        </mat-menu>
        
        <mat-menu #bulkStatusMenu="matMenu" class="modern-menu list-style">
          <div class="menu-container">
            <div class="menu-header">Update Status To:</div>
            <div class="menu-list">
              @for (status of statuses; track status) {
                <div class="menu-list-item" (click)="bulkUpdateStatus(status)">
                  <span class="item-label">{{status}}</span>
                </div>
              }
            </div>
          </div>
        </mat-menu>
        
        <div class="table-footer">
          <div class="footer-info">
            Showing {{startIndex() + 1}}-{{endIndex()}} of {{filteredOrders().length}} entries
          </div>
          <div class="pagination">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="prevPage()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            
            @for (page of pages(); track page) {
              <button class="page-btn" 
                [class.active]="page === currentPage()"
                (click)="setPage(page)">
                {{page}}
              </button>
            }
            
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="nextPage()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- AI Insights Panel -->
      @if (showAiPanel()) {
        <div class="ai-overlay" (click)="toggleAiPanel()">
          <div class="ai-sidebar" (click)="$event.stopPropagation()">
            <div class="ai-header">
              <div class="ai-title-wrap">
                <mat-icon>auto_awesome</mat-icon>
                <h2>Smart Insights</h2>
              </div>
              <button class="close-ai" (click)="toggleAiPanel()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <div class="ai-content">
              @if (isAnalyzing()) {
                <div class="ai-loading">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>AI is analyzing your order data...</p>
                </div>
              } @else if (aiAnalysis()) {
                <div class="ai-analysis-text" [innerHTML]="aiAnalysis()"></div>
              } @else {
                <div class="ai-empty">
                  <mat-icon>query_stats</mat-icon>
                  <h3>No analysis yet</h3>
                  <p>Click below to generate insights using Gemini AI</p>
                  <button class="generate-btn" (click)="generateAnalysis()">
                    Generate Insights
                  </button>
                </div>
              }
            </div>

            <div class="ai-footer">
              <p>Powered by Gemini AI</p>
              @if (aiAnalysis() && !isAnalyzing()) {
                <button class="refresh-btn" (click)="generateAnalysis()">
                  <mat-icon>refresh</mat-icon>
                  Refresh
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .order-list-container {
      padding: 30px;
      animation: fadeIn 0.4s ease-out;

      @media (max-width: 768px) {
        padding: 16px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;

      @media (max-width: 640px) {
        font-size: 24px;
        width: 100%;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .search-box {
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0 16px;
      height: 48px;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 280px;
      transition: all 0.2s;

      @media (max-width: 640px) {
        min-width: 100%;
        width: 100%;
        order: 1;
      }

      &:focus-within {
        border-color: var(--primary);
        box-shadow: 0 0 0 4px rgba(72, 128, 255, 0.1);
      }

      mat-icon {
        color: var(--text-main);
        opacity: 0.5;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      input {
        border: none;
        outline: none;
        background: transparent;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-main);
        width: 100%;
        &::placeholder { color: var(--text-main); opacity: 0.5; }
      }
    }

    .action-header-btn {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 24px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      border: none;

      @media (max-width: 640px) {
        flex: 1;
        padding: 0 12px;
        font-size: 13px;
      }

      mat-icon { font-size: 20px; width: 20px; height: 20px; }

      &.export-btn {
        background: var(--surface);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        &:hover { background: var(--bg-color); }
      }

      &.add-btn {
        background: var(--primary);
        color: white;
        box-shadow: 0 4px 15px rgba(72, 128, 255, 0.25);
        &:hover {
          background: #3669e1;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(72, 128, 255, 0.3);
        }
      }

      &.delete-btn {
        background: #F9D9D7;
        color: #EF3826;
        &:hover {
          background: #f8c2be;
        }
      }

      &.status-btn {
        background: #E2D9FD;
        color: #6226EF;
        &:hover {
          background: #d4c7fb;
        }
      }

      &.ai-btn {
        background: linear-gradient(135deg, rgba(72, 128, 255, 0.1), rgba(124, 77, 255, 0.1));
        color: var(--primary);
        border: 1px solid rgba(72, 128, 255, 0.2);
        &:hover {
          background: linear-gradient(135deg, rgba(72, 128, 255, 0.15), rgba(124, 77, 255, 0.15));
          border-color: var(--primary);
        }
        mat-icon { color: #7C4DFF; }
      }
    }

    /* AI Sidebar Styles */
    .ai-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
      animation: fadeIn 0.3s ease;
    }

    .ai-sidebar {
      width: 450px;
      height: 100%;
      background: var(--surface);
      box-shadow: -10px 0 30px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);

      @media (max-width: 640px) {
        width: 100%;
      }
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .ai-header {
      padding: 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .ai-title-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        mat-icon { color: #7C4DFF; }
        h2 { margin: 0; font-size: 20px; font-weight: 800; color: var(--text-main); }
      }

      .close-ai {
        border: none;
        background: transparent;
        cursor: pointer;
        color: var(--text-main);
        opacity: 0.5;
        &:hover { opacity: 1; }
      }
    }

    .ai-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;

      .ai-loading, .ai-empty {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 16px;
        
        p { color: var(--text-main); opacity: 0.5; font-weight: 600; margin: 0; }
        mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--border-color); }
        h3 { margin: 0; color: var(--text-main); font-weight: 800; }
      }

      .ai-analysis-text {
        font-size: 15px;
        line-height: 1.6;
        color: var(--text-main);
        opacity: 0.9;

        h3 { color: var(--text-main); margin-top: 24px; margin-bottom: 12px; font-weight: 800; }
        p { margin-bottom: 16px; }
        ul { padding-left: 20px; margin-bottom: 16px; }
        li { margin-bottom: 8px; }
      }

      .generate-btn {
        margin-top: 8px;
        padding: 12px 24px;
        border-radius: 10px;
        background: #7C4DFF;
        color: white;
        border: none;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        &:hover { background: #673AB7; transform: translateY(-1px); }
      }
    }

    .ai-footer {
      padding: 20px 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-color);

      p { margin: 0; font-size: 12px; font-weight: 700; color: var(--text-main); opacity: 0.4; text-transform: uppercase; letter-spacing: 0.5px; }

      .refresh-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: none;
        color: var(--primary);
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 6px;
        &:hover { background: rgba(72, 128, 255, 0.05); }
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
    }

    .bulk-actions-group {
      display: flex;
      gap: 12px;
      padding-right: 12px;
      border-right: 1px solid var(--border-color);
      margin-right: 12px;

      @media (max-width: 768px) {
        border-right: none;
        padding-right: 0;
        margin-right: 0;
        width: 100%;
      }
    }

    .table-card {
      background: var(--surface);
      border-radius: 28px;
      box-shadow: none;
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .dashstack-filter-bar {
      margin: 24px;
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      height: 56px;
      align-items: stretch;
      overflow: hidden;
      width: fit-content;

      @media (max-width: 1024px) {
        margin: 0 16px 20px 16px;
        width: calc(100% - 32px);
        height: auto;
        flex-wrap: wrap;
      }
    }

    .filter-segment {
      display: flex;
      align-items: center;
      padding: 0 24px;
      border-right: 1px solid var(--border-color);
      transition: all 0.2s;

      @media (max-width: 1024px) {
        height: 50px;
        flex: 1;
        min-width: 120px;
        padding: 0 16px;
      }

      @media (max-width: 480px) {
        min-width: 50%;
        border-bottom: 1px solid var(--border-color);
        &:nth-child(even) { border-right: none; }
      }

      &:last-child { border-right: none; }
      &.border-right-none { border-right: none; }

      &.icon-seg {
        padding: 0 20px;
        mat-icon { font-size: 24px; width: 24px; height: 24px; color: var(--text-main); }
      }

      &.label-seg {
        padding: 0 20px 0 0;
        span { font-size: 14px; font-weight: 800; color: var(--text-main); }
      }

      &.dropdown-seg {
        cursor: pointer;
        gap: 20px;
        min-width: 150px;
        span { font-size: 14px; font-weight: 700; color: var(--text-main); }
        .chevron { opacity: 1; color: var(--text-main); font-size: 20px; font-weight: 800; width: 20px; height: 20px; }
        
        &:hover { background: rgba(72, 128, 255, 0.03); }
        &.active { 
          span { color: var(--primary); }
          .chevron { color: var(--primary); }
        }
      }

      &.reset-seg {
        background: var(--bg-color);
        cursor: pointer;
        gap: 10px;
        min-width: 140px;
        transition: all 0.2s;
        border-right: none;

        mat-icon { color: #EF3826; font-size: 20px; width: 20px; height: 20px; font-weight: bold; }
        span { color: #EF3826; font-size: 14px; font-weight: 800; }

        &:hover { background: var(--border-color); }
      }
    }

    .modern-menu {
      border-radius: 20px !important;
      margin-top: 8px !important;
      box-shadow: 0 15px 50px rgba(0,0,0,0.12) !important;
      border: 1px solid var(--border-color);

      @media (max-width: 640px) {
        max-width: calc(100vw - 32px) !important;
      }

      .menu-container {
        padding: 12px 0;
        min-width: 220px;
      }

      .menu-header {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-main);
        opacity: 0.4;
        margin: 8px 20px 12px 20px;
      }

      &.list-style {
        .menu-list {
          display: flex;
          flex-direction: column;
          padding-bottom: 8px;
        }

        .menu-list-item {
          padding: 10px 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(72, 128, 255, 0.04);
          }

          &.active {
            background: rgba(72, 128, 255, 0.02);
            .item-label {
              color: var(--primary);
              font-weight: 700;
            }
          }

          mat-checkbox {
            width: 100%;
          }

          .item-label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-main);
            margin-left: 8px;
          }
        }
      }

      &.chip-style {
        .chip-type-container {
          padding: 32px;
          min-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 24px;

          @media (max-width: 640px) {
            padding: 24px;
            min-width: auto;
            width: 100%;
          }
        }

        .menu-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .chip-item {
          padding: 12px 24px;
          border-radius: 100px;
          border: 1px solid var(--border-color);
          background: var(--surface);
          color: var(--text-main);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;

          &:hover { 
            border-color: var(--primary);
            background: rgba(72, 128, 255, 0.05);
          }

          &.selected {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
            box-shadow: 0 4px 15px rgba(72, 128, 255, 0.3);
          }
        }

        .menu-footer {
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-top: 1px solid #F1F4F9;
          padding-top: 24px;
          margin-top: 8px;
        }

        .hint-text {
          font-size: 13px;
          color: var(--text-main);
          opacity: 0.5;
          font-weight: 600;
          margin: 0;
        }

        .apply-btn {
          width: 150px;
          height: 48px;
          background: #4880FF;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          align-self: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(72, 128, 255, 0.25);

          &:hover {
            background: #3669e1;
            transform: translateY(-1px);
            box-shadow: 0 8px 20px rgba(72, 128, 255, 0.3);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }

      .chips-container {
        padding: 0 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .data-table {
      width: 100%;
      min-width: 900px;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 16px 24px;
        font-size: 13px;
        font-weight: 800;
        color: var(--text-main);
        background: var(--surface);
        border-bottom: 1px solid var(--border-color);
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        padding: 16px 24px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
        border-bottom: 1px solid var(--border-color);
        vertical-align: middle;
        
        &.checkbox-col { text-align: center; padding: 16px 12px; }
        &.id-cell { opacity: 0.8; }
      }

      tr:last-child td { border-bottom: none; }
      
      tr {
        transition: all 0.2s;
        &:hover { background: var(--bg-color); }
        &.selected { background: rgba(72, 128, 255, 0.03); }
      }
    }

    .status-cell {
      display: flex;
      align-items: center;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      min-width: 90px;
      
      &.completed { background: #CCF3EE; color: #00B69B; }
      &.processing { background: #E2D9FD; color: #6226EF; }
      &.rejected { background: #F9D9D7; color: #EF3826; }
      &.on-hold { background: rgba(255, 167, 11, 0.2); color: #FFA70B; }
      &.in-transit { background: rgba(72, 128, 255, 0.2); color: #4880FF; }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-main);
      transition: all 0.2s;

      &:hover {
        transform: scale(1.1);
      }

      &.view:hover { color: var(--primary); border-color: var(--primary); }
      &.delete:hover { color: #EF3826; border-color: #EF3826; }

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .table-footer {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-color);

      @media (max-width: 640px) {
        flex-direction: column;
        gap: 16px;
        padding: 20px 16px;
        text-align: center;
      }
    }

    .footer-info {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      opacity: 0.6;
    }

    .pagination {
      display: flex;
      gap: 8px;
    }

    .page-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color);
      background: var(--surface);
      border-radius: 6px;
      color: var(--text-main);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;

      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); color: white; border-color: var(--primary); }
      
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `]
})
export class OrderListComponent {
  orderService = inject(OrderService);
  aiService = inject(AiService);
  
  searchTerm = signal('');
  selectedStatuses = signal<string[]>([]);
  selectedTypes = signal<string[]>([]);
  pendingTypes = signal<string[]>([]);
  selectedDate = signal<Date | null>(null);

  // AI Insights State
  showAiPanel = signal(false);
  isAnalyzing = signal(false);
  aiAnalysis = signal<string>('');
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  
  // Selection state
  selectedIds = signal<Set<string>>(new Set());

  statuses = ['Completed', 'Processing', 'Rejected', 'On Hold', 'In Transit'];
  types = [
    'Health & Medicine', 
    'Book & Stationary', 
    'Services & Industry', 
    'Fashion & Beauty', 
    'Home & Living', 
    'Electronics', 
    'Mobile & Phone', 
    'Accessories'
  ];
  
  filteredOrders = computed(() => {
    let orders = this.orderService.orders();
    const term = this.searchTerm().toLowerCase();
    const activeStatuses = this.selectedStatuses();
    const activeTypes = this.selectedTypes();
    const activeDate = this.selectedDate();

    // Search filter
    if (term) {
      orders = orders.filter(o => 
        o.name.toLowerCase().includes(term) || 
        o.id.toLowerCase().includes(term) ||
        o.type.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (activeStatuses.length > 0) {
      orders = orders.filter(o => activeStatuses.includes(o.status));
    }

    // Type filter
    if (activeTypes.length > 0) {
      orders = orders.filter(o => activeTypes.includes(o.type));
    }

    // Date filter
    if (activeDate) {
      const filterDateStr = activeDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      // The dates in service are like '04 Sep 2019'
      orders = orders.filter(o => o.date === filterDateStr);
    }

    return orders;
  });

  paginatedOrders = computed(() => {
    const orders = this.filteredOrders();
    const start = (this.currentPage() - 1) * this.pageSize();
    return orders.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredOrders().length / this.pageSize()));

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  startIndex = computed(() => (this.currentPage() - 1) * this.pageSize());
  endIndex = computed(() => Math.min(this.startIndex() + this.pageSize(), this.filteredOrders().length));

  isAllSelected = computed(() => {
    const orders = this.filteredOrders();
    return orders.length > 0 && orders.every(o => this.selectedIds().has(o.id));
  });

  isPartiallySelected = computed(() => {
    const orders = this.filteredOrders();
    const selectedCount = orders.filter(o => this.selectedIds().has(o.id)).length;
    return selectedCount > 0 && selectedCount < orders.length;
  });

  hasActiveFilters = computed(() => {
    return this.selectedStatuses().length > 0 || 
           this.selectedTypes().length > 0 || 
           this.selectedDate() !== null;
  });

  toggleSelection(id: string) {
    this.selectedIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  toggleAllSelection(checked: boolean) {
    const orders = this.filteredOrders();
    this.selectedIds.update(set => {
      const newSet = new Set(set);
      if (checked) {
        orders.forEach(o => newSet.add(o.id));
      } else {
        orders.forEach(o => newSet.delete(o.id));
      }
      return newSet;
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onTypeMenuOpen() {
    this.pendingTypes.set([...this.selectedTypes()]);
  }

  togglePendingType(type: string) {
    this.pendingTypes.update(current => 
      current.includes(type) ? current.filter(t => t !== type) : [...current, type]
    );
  }

  applyTypes() {
    this.selectedTypes.set([...this.pendingTypes()]);
  }

  toggleStatus(status: string) {
    this.selectedStatuses.update(current => 
      current.includes(status) ? current.filter(s => s !== status) : [...current, status]
    );
  }

  toggleType(type: string) {
    this.selectedTypes.update(current => 
      current.includes(type) ? current.filter(t => t !== type) : [...current, type]
    );
  }

  onDateChange(date: Date | null) {
    this.selectedDate.set(date);
  }

  exportOrders() {
    if (this.selectedIds().size === 0) {
      alert('Please select orders to export');
      return;
    }
    console.log('Exporting orders:', Array.from(this.selectedIds()));
    alert(`Exporting ${this.selectedIds().size} orders to CSV...`);
  }

  addNewOrder() {
    const id = '#' + Math.floor(10000 + Math.random() * 90000).toString();
    const newOrder: Order = {
      id,
      name: 'New Customer',
      address: 'Simulated Address, City',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: 'Electronics',
      status: 'Processing'
    };
    this.orderService.addOrder(newOrder);
  }

  bulkDelete() {
    if (confirm(`Are you sure you want to delete ${this.selectedIds().size} orders?`)) {
      this.orderService.bulkDeleteOrders(Array.from(this.selectedIds()));
      this.selectedIds.set(new Set());
    }
  }

  bulkUpdateStatus(status: string) {
    this.orderService.bulkUpdateStatus(Array.from(this.selectedIds()), status as Order['status']);
    this.selectedIds.set(new Set());
  }

  setPage(page: number) {
    this.currentPage.set(page);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  // AI Actions
  toggleAiPanel() {
    this.showAiPanel.update(v => !v);
  }

  async generateAnalysis() {
    this.isAnalyzing.set(true);
    try {
      const result = await this.aiService.analyzeOrders(this.orderService.orders());
      this.aiAnalysis.set(result);
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  resetFilters() {
    this.searchTerm.set('');
    this.selectedStatuses.set([]);
    this.selectedTypes.set([]);
    this.selectedDate.set(null);
  }
}
