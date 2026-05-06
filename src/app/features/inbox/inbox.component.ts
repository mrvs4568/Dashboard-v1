import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

interface Email {
  id: number;
  sender: string;
  avatar: string;
  subject: string;
  snippet: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
  label?: string;
  labelColor?: string;
}

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCheckboxModule, FormsModule],
  template: `
    <div class="inbox-container">
      <!-- Page Header -->
      <div class="header-section" *ngIf="view() === 'list'">
        <h1 class="page-title">{{currentFilter() | titlecase}}</h1>
        <div class="header-actions">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search mail..." [(ngModel)]="searchTerm">
          </div>
        </div>
      </div>

      <div class="inbox-layout">
        <!-- Inbox Sidebar -->
        <div class="inbox-sidebar">
          <button mat-flat-button color="primary" class="compose-btn" (click)="setView('compose')">
            <mat-icon>add</mat-icon>
            Compose
          </button>

          <nav class="inbox-nav">
            <button class="nav-item" [class.active]="currentFilter() === 'inbox'" (click)="setFilter('inbox')">
              <div class="nav-label">
                <mat-icon>inbox</mat-icon>
                <span>Inbox</span>
              </div>
              <span class="count">125</span>
            </button>
            <button class="nav-item" [class.active]="currentFilter() === 'starred'" (click)="setFilter('starred')">
              <div class="nav-label">
                <mat-icon>star_border</mat-icon>
                <span>Starred</span>
              </div>
            </button>
            <button class="nav-item" [class.active]="currentFilter() === 'sent'" (click)="setFilter('sent')">
              <div class="nav-label">
                <mat-icon>send</mat-icon>
                <span>Sent</span>
              </div>
            </button>
            <button class="nav-item" [class.active]="currentFilter() === 'draft'" (click)="setFilter('draft')">
              <div class="nav-label">
                <mat-icon>insert_drive_file</mat-icon>
                <span>Draft</span>
              </div>
            </button>
            <button class="nav-item" [class.active]="currentFilter() === 'spam'" (click)="setFilter('spam')">
              <div class="nav-label">
                <mat-icon>report_gmailerrorred</mat-icon>
                <span>Spam</span>
              </div>
            </button>
            <button class="nav-item" [class.active]="currentFilter() === 'trash'" (click)="setFilter('trash')">
              <div class="nav-label">
                <mat-icon>delete_outline</mat-icon>
                <span>Trash</span>
              </div>
            </button>
          </nav>

          <div class="labels-section">
            <h3 class="sidebar-title">Labels</h3>
            <div class="label-item">
              <span class="label-dot" style="background-color: #00B69B"></span>
              <span>Work</span>
            </div>
            <div class="label-item">
              <span class="label-dot" style="background-color: #FD5432"></span>
              <span>Design</span>
            </div>
            <div class="label-item">
              <span class="label-dot" style="background-color: #FFAD33"></span>
              <span>Family</span>
            </div>
            <div class="label-item">
              <span class="label-dot" style="background-color: #4880FF"></span>
              <span>Friends</span>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="inbox-content">
          <!-- List View -->
          @if (view() === 'list') {
            <div class="email-list-container">
              <div class="list-header">
                <div class="header-left">
                  <mat-checkbox [checked]="isAllSelected()" (change)="toggleAll()"></mat-checkbox>
                  <button mat-icon-button class="action-icon" (click)="refreshInbox()"><mat-icon>refresh</mat-icon></button>
                  <button mat-icon-button class="action-icon" (click)="archiveSelected()" *ngIf="selectedIds().size > 0"><mat-icon>archive</mat-icon></button>
                  <button mat-icon-button class="action-icon" (click)="reportSpamSelected()" *ngIf="selectedIds().size > 0"><mat-icon>report_gmailerrorred</mat-icon></button>
                  <button mat-icon-button class="action-icon" (click)="deleteSelected()" *ngIf="selectedIds().size > 0"><mat-icon>delete_outline</mat-icon></button>
                  <button mat-icon-button class="action-icon" (click)="markSelectedAsRead()" *ngIf="selectedIds().size > 0"><mat-icon>drafts</mat-icon></button>
                  <button mat-icon-button class="action-icon"><mat-icon>more_vert</mat-icon></button>
                </div>
                <div class="header-right">
                  <span class="pagination-info">1-{{filteredEmails().length}} of {{filteredEmails().length}}</span>
                  <button mat-icon-button class="nav-btn"><mat-icon>chevron_left</mat-icon></button>
                  <button mat-icon-button class="nav-btn"><mat-icon>chevron_right</mat-icon></button>
                </div>
              </div>

              <div class="email-list">
                @for (email of filteredEmails(); track email.id) {
                  <div class="email-item" [class.unread]="!email.isRead" [class.selected]="isSelected(email.id)" (click)="openEmail(email)">
                    <div class="email-left">
                      <mat-checkbox class="email-check" [checked]="isSelected(email.id)" (change)="toggleSelection(email.id)" (click)="$event.stopPropagation()"></mat-checkbox>
                      <button class="star-btn" (click)="toggleStar($event, email)" [class.active]="email.isStarred">
                        <mat-icon>{{email.isStarred ? 'star' : 'star_border'}}</mat-icon>
                      </button>
                      <span class="sender">{{email.sender}}</span>
                    </div>
                    <div class="email-center">
                      @if (email.label) {
                        <span class="email-label" [style.background-color]="email.labelColor + '20'" [style.color]="email.labelColor">
                          {{email.label}}
                        </span>
                      }
                      <span class="subject">{{email.subject}}</span>
                      <span class="snippet">- {{email.snippet}}</span>
                    </div>
                    <div class="email-right">
                      <span class="time">{{email.time}}</span>
                    </div>
                  </div>
                }
                @if (filteredEmails().length === 0) {
                  <div class="empty-list">
                    <mat-icon>inbox</mat-icon>
                    <p>No messages found in {{currentFilter()}}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Detail View -->
          @if (view() === 'detail' && selectedEmail()) {
            <div class="email-detail">
              <div class="detail-header">
                <div class="header-left">
                  <button mat-icon-button (click)="setView('list')"><mat-icon>arrow_back</mat-icon></button>
                  <div class="actions">
                    <button mat-icon-button title="Archive" (click)="archiveEmail(selectedEmail()!)"><mat-icon>archive</mat-icon></button>
                    <button mat-icon-button title="Report spam" (click)="reportSpam(selectedEmail()!)"><mat-icon>report_gmailerrorred</mat-icon></button>
                    <button mat-icon-button title="Delete" (click)="deleteEmail(selectedEmail()!)"><mat-icon>delete_outline</mat-icon></button>
                    <button mat-icon-button title="More"><mat-icon>more_vert</mat-icon></button>
                  </div>
                </div>
              </div>
              
              <div class="detail-body">
                <div class="subject-row">
                  <h2 class="email-subject">{{selectedEmail()?.subject}}</h2>
                  <div class="subject-actions">
                    <span class="label" *ngIf="selectedEmail()?.label" [style.background-color]="selectedEmail()?.labelColor">
                      {{selectedEmail()?.label}}
                    </span>
                    <button mat-icon-button (click)="printEmail()"><mat-icon>print</mat-icon></button>
                  </div>
                </div>

                <div class="sender-info">
                  <div class="sender-avatar">
                    <img *ngIf="selectedEmail()?.avatar" [src]="selectedEmail()?.avatar" [alt]="selectedEmail()?.sender">
                    <div *ngIf="!selectedEmail()?.avatar" class="avatar-placeholder">
                      {{selectedEmail()?.sender?.[0]}}
                    </div>
                  </div>
                  <div class="sender-details">
                    <div class="sender-name-row">
                      <span class="sender-name">{{selectedEmail()?.sender}}</span>
                      <span class="email-id">&lt;{{selectedEmail()?.sender?.toLowerCase()?.replace(' ', '.')}}&#64;gmail.com&gt;</span>
                    </div>
                    <div class="to-me">to me</div>
                  </div>
                  <div class="time-info">
                    <span>{{selectedEmail()?.time}}</span>
                    <button mat-icon-button><mat-icon>star_border</mat-icon></button>
                    <button mat-icon-button (click)="replyEmail(selectedEmail()!)"><mat-icon>reply</mat-icon></button>
                    <button mat-icon-button><mat-icon>more_vert</mat-icon></button>
                  </div>
                </div>

                <div class="email-content">
                  <p>{{selectedEmail()?.snippet}}</p>
                  <br>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel urna tellus. In varius lacus eu tellus feugiat, sit amet aliquam pede euismod. Pellentesque feugiat velit enim, sed maximus est lobortis ac. Quisque non sollicitudin dolor. Nam a dui a massa hendrerit accumsan. Etiam interdum diam a neque sodales finibus. Proin et justo ex. Mauris sit amet consequat tellus.</p>
                  <br>
                  <p>Best regards,<br>{{selectedEmail()?.sender}}</p>
                </div>

                <div class="detail-actions">
                  <button mat-stroked-button class="reply-btn" (click)="replyEmail(selectedEmail()!)">
                    <mat-icon>reply</mat-icon>
                    Reply
                  </button>
                  <button mat-stroked-button class="forward-btn" (click)="forwardEmail(selectedEmail()!)">
                    <mat-icon>forward</mat-icon>
                    Forward
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Compose View -->
          @if (view() === 'compose') {
            <div class="compose-view">
              <div class="compose-header">
                <h3>New Message</h3>
                <div class="header-actions">
                  <button mat-icon-button><mat-icon>remove</mat-icon></button>
                  <button mat-icon-button><mat-icon>close_fullscreen</mat-icon></button>
                  <button mat-icon-button (click)="setView('list')"><mat-icon>close</mat-icon></button>
                </div>
              </div>
              <div class="compose-body">
                <div class="input-group">
                  <input type="text" placeholder="Recipients" [(ngModel)]="composeTo">
                  <span class="cc-bcc">Cc Bcc</span>
                </div>
                <div class="input-group">
                  <input type="text" placeholder="Subject" [(ngModel)]="composeSubject">
                </div>
                <!-- Simple textarea for message body instead of contenteditable for easier binding -->
                <textarea class="message-textarea" placeholder="Write your message here..." [(ngModel)]="composeBody"></textarea>
              </div>
              <div class="compose-footer">
                <div class="footer-left">
                  <button mat-flat-button color="primary" class="send-btn" [disabled]="!composeTo" (click)="sendEmail()">Send</button>
                  <div class="formatting-tools">
                    <button mat-icon-button (click)="toggleFormatting()"><mat-icon>text_format</mat-icon></button>
                    <button mat-icon-button (click)="triggerFileUpload()"><mat-icon>attach_file</mat-icon></button>
                    <button mat-icon-button (click)="insertLink()"><mat-icon>link</mat-icon></button>
                    <button mat-icon-button (click)="insertEmoticon()"><mat-icon>insert_emoticon</mat-icon></button>
                    <button mat-icon-button (click)="openDrive()"><mat-icon>add_to_drive</mat-icon></button>
                  </div>
                </div>
                <div class="footer-right">
                  <button mat-icon-button><mat-icon>more_vert</mat-icon></button>
                  <button mat-icon-button (click)="setView('list')"><mat-icon>delete_outline</mat-icon></button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inbox-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
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

    .search-box {
      display: flex;
      align-items: center;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0 16px;
      height: 44px;
      width: 100%;
      max-width: 400px;
      gap: 12px;
      transition: all 0.3s;

      mat-icon {
        color: var(--text-main);
        opacity: 0.6;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      input {
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-main);
        width: 100%;
        &::placeholder { opacity: 0.5; }
      }

      &:focus-within {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(72, 128, 255, 0.1);
      }
    }

    .inbox-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 24px;
      align-items: start;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .inbox-sidebar {
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 32px;

      @media (max-width: 1024px) {
        flex-direction: row;
        overflow-x: auto;
        padding: 12px;
        gap: 12px;
        align-items: center;
      }
    }

    .compose-btn {
      width: 100%;
      height: 48px;
      border-radius: 8px;
      font-weight: 700;
      letter-spacing: 0.5px;
      mat-icon { margin-right: 8px; }

      @media (max-width: 1024px) {
        width: auto;
        padding: 0 16px !important;
      }
    }

    .inbox-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;

      @media (max-width: 1024px) {
        flex-direction: row;
        gap: 4px;
      }
    }

    .nav-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      background: transparent;
      border: none;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.2s;

      @media (max-width: 1024px) {
        padding: 8px 12px;
        .count { display: none; }
      }

      .nav-label {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        mat-icon { font-size: 20px; width: 20px; height: 20px; opacity: 0.5; }
      }

      .count {
        font-size: 11px;
        font-weight: 700;
        opacity: 0.5;
      }

      &:hover {
        background: var(--bg-color);
      }

      &.active {
        background: var(--primary);
        color: white;
        .nav-label mat-icon, .count { opacity: 1; }
      }
    }

    .sidebar-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--text-main);
      opacity: 0.5;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }

    .labels-section {
      display: flex;
      flex-direction: column;
      gap: 12px;

      @media (max-width: 1024px) {
        display: none;
      }
    }

    .label-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: var(--text-main);
      font-size: 14px;

      .label-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
    }

    .inbox-content {
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    .email-list-container {
      display: flex;
      flex-direction: column;
    }

    .list-header {
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      @media (max-width: 640px) {
        padding: 8px 12px;
      }
    }

    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-icon, .nav-btn {
      color: var(--text-main);
      opacity: 0.5;
      &:hover { opacity: 1; }
      
      @media (max-width: 640px) {
        width: 32px;
        height: 32px;
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
    }

    .pagination-info {
      font-size: 13px;
      font-weight: 600;
      opacity: 0.5;
      margin-right: 8px;
      
      @media (max-width: 640px) {
        display: none;
      }
    }

    .email-list {
      display: flex;
      flex-direction: column;
    }

    .email-item {
      display: grid;
      grid-template-columns: 240px 1fr 100px;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s;
      background: var(--surface);
      
      @media (max-width: 850px) {
        grid-template-columns: 160px 1fr 80px;
      }

      @media (max-width: 640px) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 12px;
      }

      &:hover {
        background: var(--bg-color);
        box-shadow: inset 4px 0 0 var(--primary);
      }

      &.selected {
        background: rgba(72, 128, 255, 0.1);
      }

      &.unread {
        background: rgba(72, 128, 255, 0.05);
        .sender, .subject { font-weight: 700; color: var(--text-main); }
      }

      &:last-child { border-bottom: none; }
    }

    .email-left {
      display: flex;
      align-items: center;
      gap: 12px;
      @media (max-width: 640px) {
        width: 100%;
        justify-content: space-between;
      }
    }

    .star-btn {
      background: transparent;
      border: none;
      color: var(--text-main);
      opacity: 0.3;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover, &.active { opacity: 1; color: #FFAD33; }
    }

    .sender {
      font-size: 14px;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      @media (max-width: 640px) {
        flex: 1;
        margin-left: 8px;
      }
    }

    .email-center {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      @media (max-width: 640px) {
        width: 100%;
      }
    }

    .email-label {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .subject {
      font-size: 14px;
      color: var(--text-main);
      white-space: nowrap;
      @media (max-width: 640px) {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .snippet {
      font-size: 14px;
      color: var(--text-main);
      opacity: 0.5;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      @media (max-width: 640px) {
        display: none;
      }
    }

    .email-right {
      text-align: right;
      @media (max-width: 640px) {
        width: 100%;
        text-align: left;
        padding-left: 32px;
      }
    }

    .time {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-main);
      opacity: 0.5;
    }

    .empty-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 0;
      color: var(--text-main);
      opacity: 0.3;
      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; }
    }

    /* Detail View Styles */
    .email-detail {
      display: flex;
      flex-direction: column;
    }

    .detail-header {
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
    }

    .detail-header .actions {
      display: flex;
      gap: 8px;
      margin-left: 16px;
      opacity: 0.8;
      button {
        color: var(--text-main);
        &:hover { opacity: 1; }
      }
    }

    .detail-body {
      padding: 24px 32px;
    }

    .subject-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .email-subject {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: var(--text-main);
    }

    .subject-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      .label {
        font-size: 11px;
        font-weight: 700;
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
      }
      mat-icon { opacity: 0.4; }
    }

    .sender-info {
      display: flex;
      align-items: center;
      margin-bottom: 32px;
    }

    .sender-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 16px;
      .avatar-placeholder {
        width: 100%;
        height: 100%;
        background: var(--primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 18px;
      }
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .sender-details {
      flex: 1;
    }

    .sender-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }

    .sender-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
    }

    .email-id {
      font-size: 13px;
      color: var(--text-main);
      opacity: 0.5;
    }

    .to-me {
      font-size: 13px;
      color: var(--text-main);
      opacity: 0.4;
    }

    .time-info {
      display: flex;
      align-items: center;
      gap: 4px;
      span { 
        font-size: 13px; 
        opacity: 0.6; 
        margin-right: 8px; 
        color: var(--text-main);
      }
      mat-icon { 
        opacity: 0.6; 
        font-size: 20px; 
        width: 20px; 
        height: 20px; 
        color: var(--text-main);
      }
      button:hover mat-icon {
        opacity: 1;
      }
    }

    .email-content {
      font-size: 15px;
      line-height: 1.6;
      color: var(--text-main);
      margin-bottom: 48px;
    }

    .detail-actions {
      display: flex;
      gap: 16px;
      button {
        border-radius: 8px;
        font-weight: 600;
        border-color: var(--border-color) !important;
        color: var(--text-main) !important;
        mat-icon { margin-right: 8px; opacity: 0.5; }

        &:hover {
          background: var(--bg-color) !important;
        }
      }
    }

    /* Compose View Styles */
    .compose-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .compose-header {
      background: var(--primary);
      color: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      h3 { font-size: 14px; font-weight: 700; margin: 0; }
      .header-actions {
        display: flex;
        gap: 4px;
        button { color: white; opacity: 0.8; &:hover { opacity: 1; } }
      }
    }

    .compose-body {
      padding: 8px 0;
      flex: 1;
    }

    .input-group {
      padding: 10px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      input {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-main);
        font-size: 14px;
        &::placeholder { opacity: 0.4; }
      }
      .cc-bcc {
        font-size: 13px;
        font-weight: 600;
        opacity: 0.5;
        cursor: pointer;
        &:hover { opacity: 1; }
      }
    }

    .message-textarea {
      width: 100%;
      height: 400px;
      padding: 24px;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-main);
      font-size: 14px;
      line-height: 1.6;
      resize: none;
      &::placeholder { opacity: 0.4; }
    }

    .compose-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .send-btn {
      padding: 0 32px;
      font-weight: 700;
      border-radius: 8px;
    }

    .formatting-tools {
      display: flex;
      gap: 8px;
      button { color: var(--text-main); opacity: 0.4; &:hover { opacity: 1; } }
    }

    .footer-right {
      display: flex;
      gap: 8px;
      button { color: var(--text-main); opacity: 0.4; &:hover { opacity: 1; } }
    }

    @media (max-width: 1024px) {
      .inbox-layout {
        grid-template-columns: 1fr;
      }
      .inbox-sidebar {
        display: none;
      }
    }
  `]
})
export class InboxComponent {
  searchTerm = '';
  view = signal<'list' | 'detail' | 'compose'>('list');
  currentFilter = signal<string>('inbox');
  selectedEmail = signal<Email | null>(null);
  selectedIds = signal<Set<number>>(new Set());
  
  // Compose form
  composeTo = '';
  composeSubject = '';
  composeBody = '';

  emails = signal<Email[]>([
    {
      id: 1,
      sender: 'Jullu Jalal',
      avatar: '',
      subject: 'Our Bachelor of Science program is..',
      snippet: "Hello, I'm writing to inform you about the amazing opportunities we have for you in our program...",
      time: '8:38 AM',
      isRead: false,
      isStarred: true,
      label: 'Work',
      labelColor: '#00B69B'
    },
    {
      id: 2,
      sender: 'Minerva Barnett',
      avatar: '',
      subject: 'Get 20% Discount for any Course',
      snippet: "Summer sale is here! Don't miss out on our special offers for all design courses starting this month.",
      time: '9:12 AM',
      isRead: true,
      isStarred: false,
      label: 'Design',
      labelColor: '#FD5432'
    },
    {
      id: 3,
      sender: 'Peter Pan',
      avatar: '',
      subject: 'Invitations: Meet up @ Friday',
      snippet: "Hey team, let's catch up this Friday at the usual spot to discuss the upcoming product launch.",
      time: '10:45 AM',
      isRead: false,
      isStarred: false,
    },
    {
      id: 4,
      sender: 'Savannah Nguyen',
      avatar: '',
      subject: 'Project Update: New Dashboard UI',
      snippet: "I've uploaded the latest mockups for the dashboard redesign. Please take a look and give me your feedback.",
      time: '1:20 PM',
      isRead: true,
      isStarred: true,
      label: 'Friends',
      labelColor: '#4880FF'
    },
    {
      id: 5,
      sender: 'Eleanor Pena',
      avatar: '',
      subject: 'Weekly Newsletter: Tech Trends',
      snippet: 'Stay updated with the latest in technology. This week we focus on AI and its impact on modern design.',
      time: 'Yesterday',
      isRead: true,
      isStarred: false,
    },
    {
      id: 6,
      sender: 'Guy Hawkins',
      avatar: '',
      subject: 'Your Order Has Been Shipped',
      snippet: 'Good news! Your order #42356 has been dispatched and is on its way to your delivery address.',
      time: 'May 1, 2024',
      isRead: true,
      isStarred: false,
      label: 'Family',
      labelColor: '#FFAD33'
    },
    {
      id: 7,
      sender: 'Jerome Bell',
      avatar: '',
      subject: 'Subscription Confirmation',
      snippet: 'Thank you for subscribing to our premium service. You now have full access to all our features.',
      time: 'Apr 28, 2024',
      isRead: true,
      isStarred: false,
    }
  ]);

  filteredEmails() {
    let list = this.emails();
    
    // Filter by tab
    const filter = this.currentFilter();
    if (filter === 'starred') {
      list = list.filter(e => e.isStarred && !e.label?.includes('Trash'));
    } else if (filter === 'inbox') {
      list = list.filter(e => !e.label?.includes('Sent') && !e.label?.includes('Trash') && !e.label?.includes('Draft') && !e.label?.includes('Spam'));
    } else if (filter === 'sent') {
      list = list.filter(e => e.label === 'Sent');
    } else if (filter === 'trash') {
      list = list.filter(e => e.label === 'Trash');
    } else if (filter === 'draft') {
      list = list.filter(e => e.label === 'Draft');
    } else if (filter === 'spam') {
      list = list.filter(e => e.label === 'Spam');
    }

    const term = this.searchTerm.toLowerCase();
    if (!term) return list;
    return list.filter(e => 
      e.sender.toLowerCase().includes(term) || 
      e.subject.toLowerCase().includes(term) ||
      e.snippet.toLowerCase().includes(term)
    );
  }

  setView(view: 'list' | 'detail' | 'compose') {
    this.view.set(view);
    if (view === 'list') {
      this.selectedEmail.set(null);
    }
    if (view === 'compose') {
      this.resetCompose();
    }
  }

  setFilter(filter: string) {
    this.currentFilter.set(filter);
    this.selectedIds.set(new Set());
    this.setView('list');
  }

  openEmail(email: Email) {
    email.isRead = true;
    this.selectedEmail.set(email);
    this.setView('detail');
  }

  toggleStar(event: Event, email: Email) {
    event.stopPropagation();
    email.isStarred = !email.isStarred;
  }

  toggleSelection(id: number) {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  isSelected(id: number) {
    return this.selectedIds().has(id);
  }

  isAllSelected() {
    const visible = this.filteredEmails();
    return visible.length > 0 && Array.from(this.selectedIds()).length === visible.length;
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedIds.set(new Set());
    } else {
      const allIds = this.filteredEmails().map(e => e.id);
      this.selectedIds.set(new Set(allIds));
    }
  }

  deleteSelected() {
    const ids = this.selectedIds();
    this.emails.update(list => list.map(e => {
      if (ids.has(e.id)) {
        return { ...e, label: 'Trash', labelColor: '#666' };
      }
      return e;
    }));
    this.selectedIds.set(new Set());
  }

  archiveSelected() {
    // Mock archive: just remove from view or mark as archived
    const ids = this.selectedIds();
    this.emails.update(list => list.filter(e => !ids.has(e.id)));
    this.selectedIds.set(new Set());
  }

  reportSpamSelected() {
    const ids = this.selectedIds();
    this.emails.update(list => list.map(e => {
      if (ids.has(e.id)) {
        return { ...e, label: 'Spam', labelColor: '#FFA800' };
      }
      return e;
    }));
    this.selectedIds.set(new Set());
  }

  markSelectedAsRead() {
    const ids = this.selectedIds();
    this.emails.update(list => list.map(e => {
      if (ids.has(e.id)) {
        return { ...e, isRead: true };
      }
      return e;
    }));
    this.selectedIds.set(new Set());
  }

  // Individual actions for Detail View
  deleteEmail(email: Email) {
    this.emails.update(list => list.map(e => {
      if (e.id === email.id) {
        return { ...e, label: 'Trash', labelColor: '#666' };
      }
      return e;
    }));
    this.setView('list');
  }

  reportSpam(email: Email) {
    this.emails.update(list => list.map(e => {
      if (e.id === email.id) {
        return { ...e, label: 'Spam', labelColor: '#FFA800' };
      }
      return e;
    }));
    this.setView('list');
  }

  archiveEmail(email: Email) {
    this.emails.update(list => list.filter(e => e.id !== email.id));
    this.setView('list');
  }

  replyEmail(email: Email) {
    this.resetCompose();
    this.composeTo = email.sender.toLowerCase().replace(' ', '.') + '@gmail.com';
    this.composeSubject = `Re: ${email.subject}`;
    this.composeBody = `\n\nOn ${email.time}, ${email.sender} wrote:\n> ${email.snippet}`;
    this.setView('compose');
  }

  forwardEmail(email: Email) {
    this.resetCompose();
    this.composeSubject = `Fwd: ${email.subject}`;
    this.composeBody = `\n\n---------- Forwarded message ----------\nFrom: ${email.sender}\nDate: ${email.time}\nSubject: ${email.subject}\n\n${email.snippet}`;
    this.setView('compose');
  }

  printEmail() {
    window.print();
  }

  // Compose actions
  triggerFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        alert(`File selected: ${file.name}`);
        this.composeBody += `\n[Attached: ${file.name}]`;
      }
    };
    input.click();
  }

  insertLink() {
    const url = prompt('Enter the URL:', 'https://');
    if (url) {
      this.composeBody += ` ${url} `;
    }
  }

  openDrive() {
    alert('Google Drive integration: Selecting file...');
    this.composeBody += '\n[Drive File: Project_Deep_Blue.pdf]';
  }

  toggleFormatting() {
    alert('Formatting toolbar toggled');
  }

  insertEmoticon() {
    this.composeBody += ' 😊 ';
  }

  sendEmail() {
    if (!this.composeTo) return;
    
    const newEmail: Email = {
      id: Date.now(),
      sender: 'Me',
      avatar: '',
      subject: this.composeSubject || '(No Subject)',
      snippet: this.composeBody || '',
      time: 'Just now',
      isRead: true,
      isStarred: false,
      label: 'Sent',
      labelColor: '#4880FF'
    };

    this.emails.update(list => [newEmail, ...list]);
    this.setView('list');
    this.currentFilter.set('sent');
  }

  refreshInbox() {
    // Simple mock refresh
    const current = this.emails();
    this.emails.set([...current]);
    this.selectedIds.set(new Set());
  }

  private resetCompose() {
    this.composeTo = '';
    this.composeSubject = '';
    this.composeBody = '';
  }
}

