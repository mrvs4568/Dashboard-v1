import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { LucideSun, LucideMoon } from '@lucide/angular';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, LucideSun, LucideMoon],
  template: `
    <button mat-icon-button (click)="themeService.toggleTheme()" class="theme-btn">
      @if (themeService.isDarkMode()) {
        <svg lucideSun size="20"></svg>
      } @else {
        <svg lucideMoon size="20"></svg>
      }
    </button>
  `,
  styles: [`
    .theme-btn {
      color: var(--text-main);
      opacity: 0.6;
      &:hover { opacity: 1; background: var(--bg-color); }
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
