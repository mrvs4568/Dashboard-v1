import { Component, ChangeDetectionStrategy } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pricing',
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pricing-container">
      <div class="header-section">
        <h1 class="page-title">Pricing</h1>
        <p class="page-subtitle">Choose the right plan for your business needs</p>
      </div>

      <div class="pricing-grid">
        <!-- Basic Plan -->
        <div class="pricing-card">
          <div class="card-header">
            <span class="plan-name">Starter</span>
            <div class="price">
              <span class="currency">$</span>
              <span class="amount">0</span>
              <span class="period">/month</span>
            </div>
          </div>
          <div class="card-body">
            <ul class="features-list">
              <li><mat-icon>check_circle</mat-icon> Free Custom Domain</li>
              <li><mat-icon>check_circle</mat-icon> 2 GB Storage</li>
              <li><mat-icon>check_circle</mat-icon> Basic Support</li>
              <li class="disabled"><mat-icon>cancel</mat-icon> Advanced Analytics</li>
              <li class="disabled"><mat-icon>cancel</mat-icon> Custom Reports</li>
            </ul>
          </div>
          <div class="card-footer">
            <button mat-flat-button class="plan-btn secondary">Get Started</button>
          </div>
        </div>

        <!-- Standard Plan (Featured) -->
        <div class="pricing-card featured">
          <div class="card-header">
            <div class="badge">Most Popular</div>
            <span class="plan-name">Standard</span>
            <div class="price">
              <span class="currency">$</span>
              <span class="amount">49</span>
              <span class="period">/month</span>
            </div>
          </div>
          <div class="card-body">
            <ul class="features-list">
              <li><mat-icon>check_circle</mat-icon> Free Custom Domain</li>
              <li><mat-icon>check_circle</mat-icon> 20 GB Storage</li>
              <li><mat-icon>check_circle</mat-icon> Priority Support</li>
              <li><mat-icon>check_circle</mat-icon> Advanced Analytics</li>
              <li class="disabled"><mat-icon>cancel</mat-icon> Custom Reports</li>
            </ul>
          </div>
          <div class="card-footer">
            <button mat-flat-button class="plan-btn primary">Try 7 Days Free</button>
          </div>
        </div>

        <!-- Premium Plan -->
        <div class="pricing-card">
          <div class="card-header">
            <span class="plan-name">Premium</span>
            <div class="price">
              <span class="currency">$</span>
              <span class="amount">99</span>
              <span class="period">/month</span>
            </div>
          </div>
          <div class="card-body">
            <ul class="features-list">
              <li><mat-icon>check_circle</mat-icon> Free Custom Domain</li>
              <li><mat-icon>check_circle</mat-icon> Unlimited Storage</li>
              <li><mat-icon>check_circle</mat-icon> 24/7 Premium Support</li>
              <li><mat-icon>check_circle</mat-icon> Advanced Analytics</li>
              <li><mat-icon>check_circle</mat-icon> Custom Reports</li>
            </ul>
          </div>
          <div class="card-footer">
            <button mat-flat-button class="plan-btn secondary">Go Premium</button>
          </div>
        </div>
      </div>

      <div class="faq-section">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-grid">
          <div class="faq-item">
            <h3>Can I change plans later?</h3>
            <p>Yes, you can upgrade or downgrade your plan at any time from your dashboard settings.</p>
          </div>
          <div class="faq-item">
            <h3>Is there a free trial available?</h3>
            <p>Our Standard and Premium plans come with a 7-day free trial period to test all features.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pricing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .header-section {
      text-align: center;
      margin-bottom: 64px;
      @media (max-width: 640px) {
        margin-bottom: 32px;
      }
    }

    .page-title {
      font-size: 42px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 12px 0;
      letter-spacing: -1.5px;
      @media (max-width: 640px) {
        font-size: 32px;
      }
    }

    .page-subtitle {
      font-size: 18px;
      color: var(--text-main);
      opacity: 0.6;
      margin: 0;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      margin-bottom: 80px;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }

    .pricing-card {
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        border-color: var(--primary);
      }

      @media (max-width: 640px) {
        padding: 32px;
      }
    }

    .pricing-card.featured {
      border: 2px solid var(--primary);
      background: var(--surface);
      transform: scale(1.05);
      z-index: 10;

      @media (max-width: 1024px) {
        transform: none;
      }

      .plan-name { color: var(--primary); }
    }

    .badge {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--primary);
      color: white;
      padding: 6px 16px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .card-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .plan-name {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 16px;
      display: block;
    }

    .price {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;

      .currency { font-size: 24px; font-weight: 700; color: var(--text-main); opacity: 0.8; }
      .amount { font-size: 56px; font-weight: 800; color: var(--text-main); letter-spacing: -2px; }
      .period { font-size: 16px; color: var(--text-main); opacity: 0.5; font-weight: 600; }
    }

    .card-body {
      flex: 1;
      margin-bottom: 40px;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;

      li {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-main);
        opacity: 0.9;

        mat-icon { font-size: 20px; width: 20px; height: 20px; color: #10b981; }

        &.disabled {
          opacity: 0.4;
          mat-icon { color: var(--text-main); }
        }
      }
    }

    .plan-btn {
      width: 100%;
      height: 52px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 15px;
      transition: all 0.2s;

      &.primary {
        background: var(--primary);
        color: white;
      }

      &.secondary {
        background: var(--bg-color);
        color: var(--text-main);
        border: 1px solid var(--border-color);
      }

      &:hover {
        transform: scale(1.02);
      }
    }

    .faq-section {
      text-align: center;
    }

    .section-title {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 48px;
    }

    .faq-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
      text-align: left;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }

    .faq-item {
      h3 { font-size: 18px; font-weight: 800; color: var(--text-main); margin-bottom: 12px; }
      p { color: var(--text-main); opacity: 0.7; line-height: 1.6; margin: 0; }
    }
  `]
})
export class PricingComponent {}
