import { Component, input } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatCardModule, LucideAngularModule],
  template: `
    <div class="stat-card">
      <div class="card-glow" [style.background-color]="iconBgColor()"></div>
      <div class="stat-main">
        <div class="stat-text">
          <span class="stat-label">{{title()}}</span>
          <h3 class="stat-value">{{value()}}</h3>
        </div>
        <div class="stat-icon-container" [style.background]="iconBg()">
          <span class="stat-emoji">{{emoji()}}</span>
        </div>
      </div>
      <div class="stat-trend-footer">
        <span class="trend-score" [class.up]="trend() === 'up'" [class.down]="trend() === 'down'">
          <lucide-icon [name]="trend() === 'up' ? 'TrendingUp' : 'TrendingDown'" size="16" class="trend-icon"></lucide-icon>
          {{trendValue()}}
        </span>
        <span class="trend-label">vs last month</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      position: relative;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      border-radius: 24px;
      overflow: hidden;
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-highlight);
      box-shadow: var(--shadow-sm);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      cursor: pointer;

      &:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow: var(--shadow-lg), inset 0 1px 0 0 rgba(255,255,255,0.8);
        border-color: var(--primary);

        .card-glow {
          opacity: 0.15;
          transform: scale(1.5);
        }
      }
    }

    .card-glow {
      position: absolute;
      top: -20px;
      right: -20px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.08;
      transition: all 0.6s ease;
      pointer-events: none;
      z-index: 0;
    }

    .stat-main {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .stat-text {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-main);
      margin: 0;
      line-height: 1;
    }

    .stat-icon-container {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.4), 0 4px 6px -1px rgba(0,0,0,0.1);
      position: relative;
      z-index: 1;
    }

    .stat-trend-footer {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .trend-score {
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px 4px 8px;
      border-radius: 100px;

      &.up { 
        color: #059669; 
        background: rgba(16, 185, 129, 0.1);
      }
      &.down { 
        color: #E11D48; 
        background: rgba(225, 29, 72, 0.1);
      }

      .trend-icon {
        stroke-width: 3px;
      }
    }

    .trend-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
    }
  `]
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string>();
  emoji = input.required<string>();
  iconBg = input.required<string>();
  trend = input<'up' | 'down'>('up');
  trendValue = input.required<string>();

  // Extract base color from rgba for the glow effect
  iconBgColor() {
    const bg = this.iconBg();
    if (bg.includes('rgba')) {
      return bg.replace(/[^,]+(?=\))/, '1'); // Replace alpha with 1
    }
    return bg;
  }
}
