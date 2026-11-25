import { CommonModule } from "@angular/common";
import { Component, ViewChild, AfterViewInit, OnInit, inject, Inject, Optional, ChangeDetectionStrategy } from '@angular/core';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LucideX, LucideActivity, LucideSearch, LucideHistory, LucideEdit, LucideTrash2 } from '@lucide/angular';
import { ActivityLogService, ActivityLog } from '../../core/services/activity-log.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

const ELEMENT_DATA: UserData[] = [
  { id: '1', name: 'Moni Roy', email: 'moni.roy@example.com', role: 'Admin', status: 'Active', lastActive: '2 mins ago' },
  { id: '2', name: 'Jhon Doe', email: 'jhon.doe@example.com', role: 'Editor', status: 'Active', lastActive: '1 day ago' },
  { id: '3', name: 'Sarah Connor', email: 'sarah.c@example.com', role: 'Contributor', status: 'Inactive', lastActive: '2 days ago' },
  { id: '4', name: 'James Smith', email: 'james.s@example.com', role: 'Admin', status: 'Active', lastActive: '5 mins ago' },
  { id: '5', name: 'Lily Evans', email: 'lily.e@example.com', role: 'Editor', status: 'Active', lastActive: '1 hour ago' },
  { id: '6', name: 'Robert Fox', email: 'robert.f@example.com', role: 'Viewer', status: 'Inactive', lastActive: '1 week ago' },
  { id: '7', name: 'Aman Khan', email: 'aman.k@example.com', role: 'Admin', status: 'Active', lastActive: 'Just now' },
  { id: '8', name: 'Zoe Bell', email: 'zoe.b@example.com', role: 'Designer', status: 'Inactive', lastActive: '3 hours ago' },
];

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    LucideX
],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ data ? 'Edit User' : 'Add New User' }}</h2>
        <button mat-icon-button (click)="dialogRef.close()" class="close-btn">
          <svg lucideX size="20"></svg>
        </button>
      </div>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
        <div class="dialog-content">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter full name">
            @if (userForm.get('name')?.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Enter email address">
            @if (userForm.get('email')?.hasError('required')) {
              <mat-error>Email is required</mat-error>
            }
            @if (userForm.get('email')?.hasError('email')) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="Admin">Admin</mat-option>
              <mat-option value="Editor">Editor</mat-option>
              <mat-option value="Contributor">Contributor</mat-option>
              <mat-option value="Designer">Designer</mat-option>
              <mat-option value="Viewer">Viewer</mat-option>
            </mat-select>
            @if (userForm.get('role')?.hasError('required')) {
              <mat-error>Role is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
            </mat-select>
            @if (userForm.get('status')?.hasError('required')) {
              <mat-error>Status is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="dialog-actions">
          <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="userForm.invalid">{{ data ? 'Save Changes' : 'Add User' }}</button>
        </div>
      </form>
    </div>
    `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .dialog-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }
    .close-btn {
      color: var(--text-main);
      opacity: 0.6;
      &:hover { opacity: 1; }
    }
    .dialog-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-field {
      width: 100%;
    }
    .dialog-actions {
      padding: 16px 24px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class UserDialogComponent {
  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    private fb: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UserData | null
  ) {
    this.userForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      role: [data?.role || '', Validators.required],
      status: [data?.status || 'Active', Validators.required]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, LucideX],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Confirm Delete</h2>
        <button mat-icon-button (click)="dialogRef.close(false)" class="close-btn">
          <svg lucideX size="20"></svg>
        </button>
      </div>
      <div class="dialog-content">
        <p>Are you sure you want to delete <strong>{{ data.name }}</strong>?</p>
        <p class="text-sm">This action cannot be undone.</p>
      </div>
      <div class="dialog-actions">
        <button mat-stroked-button (click)="dialogRef.close(false)">Cancel</button>
        <button mat-flat-button color="warn" (click)="dialogRef.close(true)">Delete</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .dialog-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }
    .close-btn {
      color: var(--text-main);
      opacity: 0.6;
      &:hover { opacity: 1; }
    }
    .dialog-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: var(--text-main);
    }
    .text-sm {
      font-size: 14px;
      opacity: 0.7;
    }
    .dialog-actions {
      padding: 16px 24px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}
}

@Component({
  selector: 'app-activity-log-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, LucideX, LucideActivity],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Activity Log@if (data?.userName) {
          - {{ data?.userName }}
        }</h2>
        <button mat-icon-button (click)="dialogRef.close()" class="close-btn">
          <svg lucideX size="20"></svg>
        </button>
      </div>
      <div class="dialog-content">
        @if ((logs$ | async); as logs) {
          @if (logs.length === 0) {
            <div class="empty-state">
              No recent activity found.
            </div>
          }
          <div class="log-list">
            @for (log of logs; track log) {
              <div class="log-item">
                <div class="log-icon" [ngClass]="log.action.toLowerCase()">
                  <svg lucideActivity size="16"></svg>
                </div>
                <div class="log-details">
                  <div class="log-text">
                    <strong>{{ log.userName }}</strong> {{ getActionText(log.action) }}
                    <span class="log-target">{{ log.details }}</span>
                  </div>
                  <div class="log-time">{{ log.timestamp | date:'medium' }}</div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
    `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .dialog-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }
    .close-btn {
      color: var(--text-main);
      opacity: 0.6;
      &:hover { opacity: 1; }
    }
    .dialog-content {
      padding: 0;
      overflow-y: auto;
      flex: 1;
    }
    .empty-state {
      padding: 32px;
      text-align: center;
      color: var(--text-main);
      opacity: 0.6;
    }
    .log-list {
      display: flex;
      flex-direction: column;
    }
    .log-item {
      display: flex;
      gap: 16px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
      &:last-child {
        border-bottom: none;
      }
    }
    .log-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.8;
      &.created { background: rgba(0, 182, 155, 0.1); color: #00B69B; }
      &.edited { background: rgba(98, 75, 255, 0.1); color: #624BFF; }
      &.deleted { background: rgba(249, 60, 101, 0.1); color: #F93C65; }
      &.login { background: rgba(24, 119, 242, 0.1); color: #1877F2; }
      &.logout { background: rgba(255, 179, 2, 0.1); color: #FFB302; }
    }
    .log-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .log-text {
      color: var(--text-main);
      font-size: 14px;
      line-height: 1.5;
    }
    .log-target {
      opacity: 0.8;
    }
    .log-time {
      font-size: 13px;
      opacity: 0.5;
      color: var(--text-main);
    }
  `]
})
export class ActivityLogDialogComponent implements OnInit {
  logs$!: Observable<ActivityLog[]>;
  activityLogService = inject(ActivityLogService);

  constructor(
    public dialogRef: MatDialogRef<ActivityLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId?: string, userName?: string } | null
  ) {}

  ngOnInit() {
    this.logs$ = this.activityLogService.logs$.pipe(
      map(logs => {
        if (this.data?.userId) {
          return logs.filter(log => log.userId === this.data?.userId);
        }
        return logs;
      })
    );
  }

  getActionText(action: string): string {
    switch(action) {
      case 'Created': return 'created user';
      case 'Edited': return 'updated user';
      case 'Deleted': return 'deleted user';
      case 'Login': return 'logged in';
      case 'Logout': return 'logged out';
      default: return 'performed action';
    }
  }
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    LucideSearch, LucideHistory, LucideEdit, LucideTrash2
],
  template: `
    <div class="users-page">
      <div class="page-header">
        <h1 class="page-title">Users List</h1>
        <div class="header-actions">
           <div class="search-box">
             <svg lucideSearch size="16" class="search-icon"></svg>
             <input type="text" placeholder="Search by name, email, or role..." (keyup)="applyFilter($event)" class="search-input">
           </div>
           <button mat-stroked-button class="filter-btn" (click)="viewAllActivity()">
            <svg lucideHistory size="16"></svg>
            All Activity
          </button>
          <button mat-flat-button color="primary" class="add-user-btn" (click)="openAddUserDialog()">
            Add New User
          </button>
        </div>
      </div>

      <mat-card class="table-card">
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
              <td mat-cell *matCellDef="let user"> 
                <div class="user-info-cell">
                  <div class="avatar-cell">
                    <img [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name" alt="avatar">
                  </div>
                  {{user.name}} 
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
              <td mat-cell *matCellDef="let user"> {{user.email}} </td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Role </th>
              <td mat-cell *matCellDef="let user"> {{user.role}} </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let user"> 
                <span class="status-badge" [class.active]="user.status === 'Active'">
                  {{user.status}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="lastActive">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Last Active </th>
              <td mat-cell *matCellDef="let user"> {{user.lastActive}} </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Action </th>
              <td mat-cell *matCellDef="let user">
                <div class="row-actions">
                  <button mat-icon-button title="View Activity" class="action-history-btn" (click)="viewUserActivity(user)">
                    <svg lucideHistory size="18"></svg>
                  </button>
                  <button mat-icon-button title="Edit" class="action-edit-btn" (click)="editUser(user)">
                    <svg lucideEdit size="18"></svg>
                  </button>
                  <button mat-icon-button title="Delete" class="action-delete-btn" (click)="deleteUser(user)">
                    <svg lucideTrash2 size="18"></svg>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[10, 20, 50]" showFirstLastButtons class="minimal-paginator"></mat-paginator>
      </mat-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .users-page {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
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
      @media (max-width: 640px) {
        width: 100%;
        button { flex: 1; padding: 0 12px; font-size: 13px; }
      }
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 240px;
      @media (max-width: 640px) {
        min-width: 100%;
      }
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--text-main);
      opacity: 0.5;
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      height: 44px;
      padding: 0 16px 0 36px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-main);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      &::placeholder {
        color: var(--text-main);
        opacity: 0.5;
      }
      &:focus {
        border-color: #00B69B;
        box-shadow: 0 0 0 2px rgba(0, 182, 155, 0.1);
      }
    }

    .add-user-btn {
      border-radius: 8px;
      padding: 0 24px;
      height: 44px;
      font-weight: 700;
    }

    .filter-btn {
      border-radius: 8px;
      height: 44px;
      border-color: var(--border-color);
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-main);
      opacity: 0.7;
      &:hover {
        opacity: 1;
        background: var(--bg-color);
      }
    }

    .table-card {
      border-radius: 16px;
      overflow: hidden;
      padding: 0;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 800px;
    }

    .user-info-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      color: var(--text-main);
    }

    .avatar-cell {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--bg-color);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .status-badge {
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 800;
      background: rgba(249, 60, 101, 0.1);
      color: #F93C65;
      &.active {
        background: rgba(0, 182, 155, 0.1);
        color: #00B69B;
      }
    }

    .row-actions {
      display: flex;
      gap: 4px;
    }

    .action-history-btn {
      color: var(--text-main);
      opacity: 0.5;
      &:hover { 
        opacity: 1;
        background: var(--bg-color); 
      }
    }

    .action-edit-btn {
      color: var(--text-main);
      opacity: 0.7;
      &:hover { 
        opacity: 1;
        background: var(--bg-color); 
      }
    }

    .action-delete-btn {
      color: var(--error);
      opacity: 0.8;
      &:hover { 
        opacity: 1;
        background: rgba(249, 60, 101, 0.1); 
      }
    }

    .minimal-paginator {
      border-top: 1px solid var(--border-color);
    }

    ::ng-deep .mat-mdc-header-row {
      height: 56px;
    }

    ::ng-deep .mat-mdc-row {
      height: 64px;
    }

    ::ng-deep .mat-sort-header-container {
      font-weight: 800;
    }
  `]
})
export class UsersComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'lastActive', 'actions'];
  dataSource = new MatTableDataSource<UserData>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  dialog = inject(MatDialog);
  activityLogService = inject(ActivityLogService);

  ngOnInit() {
    this.dataSource.filterPredicate = (data: UserData, filter: string) => {
      const searchStr = (data.name + ' ' + data.email + ' ' + data.role).toLowerCase();
      return searchStr.includes(filter);
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewAllActivity() {
    this.dialog.open(ActivityLogDialogComponent, {
      width: '500px',
      maxHeight: '90vh'
    });
  }

  viewUserActivity(user: UserData) {
    this.dialog.open(ActivityLogDialogComponent, {
      width: '500px',
      maxHeight: '90vh',
      data: { userId: user.id, userName: user.name }
    });
  }

  openAddUserDialog() {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '440px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newUser: UserData = {
          id: (this.dataSource.data.length + 1).toString(),
          name: result.name,
          email: result.email,
          role: result.role,
          status: result.status,
          lastActive: 'Just now'
        };
        this.dataSource.data = [newUser, ...this.dataSource.data];

        // Log activity
        this.activityLogService.addLog({
          userId: newUser.id,
          userName: 'Admin User', // Mocking current user taking action
          action: 'Created',
          details: `added new user: ${result.name} (${result.email})`
        });
      }
    });
  }

  editUser(user: UserData) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '440px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.dataSource.data.findIndex(u => u.id === user.id);
        if (index !== -1) {
          const updatedUser: UserData = { ...user, ...result };
          const data = [...this.dataSource.data];
          data[index] = updatedUser;
          this.dataSource.data = data;

          // Log activity
          this.activityLogService.addLog({
            userId: user.id,
            userName: 'Admin User',
            action: 'Edited',
            details: `updated details for user: ${user.name}`
          });
        }
      }
    });
  }

  deleteUser(user: UserData) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { name: user.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.data = this.dataSource.data.filter(u => u.id !== user.id);

        // Log activity
        this.activityLogService.addLog({
          userId: user.id,
          userName: 'Admin User',
          action: 'Deleted',
          details: `removed user: ${user.name}`
        });
      }
    });
  }
}

