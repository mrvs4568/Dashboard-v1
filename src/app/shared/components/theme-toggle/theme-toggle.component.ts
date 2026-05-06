import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule, Sun, Moon } from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, LucideAngularModule],
  template: `
    <button mat-icon-button (click)="themeService.toggleTheme()" class="theme-btn">
      <lucide-icon [name]="themeService.isDarkMode() ? SunIcon : MoonIcon" size="20"></lucide-icon>
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
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
}
