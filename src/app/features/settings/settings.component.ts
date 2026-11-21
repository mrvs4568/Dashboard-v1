import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, User, Bell, Lock, Globe, Palette, MonitorSmartphone, Shield, Check } from 'lucide-angular';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  readonly userService = inject(UserService);
  UserIcon = User;
  BellIcon = Bell;
  LockIcon = Lock;
  GlobeIcon = Globe;
  PaletteIcon = Palette;
  MonitorSmartphoneIcon = MonitorSmartphone;
  ShieldIcon = Shield;
  CheckIcon = Check;

  activeTab = signal<'profile' | 'notifications' | 'appearance' | 'security'>('profile');
  
  profileForm: FormGroup;
  notificationsForm: FormGroup;
  securityForm: FormGroup;

  savedMessage = signal<string | null>(null);

  constructor(private fb: FormBuilder) {
    const profile = this.userService.currentUser();
    const [firstName, ...lastName] = profile.name.split(' ');
    this.profileForm = this.fb.group({
      firstName: [firstName],
      lastName: [lastName.join(' ')],
      email: [profile.email],
      title: ['Demo Admin'],
      bio: ['Sample dashboard profile. Changes are not stored on a server.'],
      timezone: ['UTC']
    });

    this.notificationsForm = this.fb.group({
      emailAlerts: [true],
      pushNotifications: [true],
      marketingEmails: [false],
      weeklyReport: [true]
    });

    this.securityForm = this.fb.group({
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: [''],
      twoFactorAuth: [false]
    });
  }

  setTab(tab: 'profile' | 'notifications' | 'appearance' | 'security') {
    this.activeTab.set(tab);
    this.savedMessage.set(null);
  }

  saveProfile() {
    const { firstName, lastName, email } = this.profileForm.getRawValue();
    const name = [firstName, lastName].map(value => String(value ?? '').trim()).filter(Boolean).join(' ');
    const emailAddress = String(email ?? '').trim();
    if (!name || !emailAddress) {
      this.savedMessage.set('Enter a name and email for the demo profile.');
      return;
    }
    this.userService.updateProfile({ name, email: emailAddress });
    this.showSaveMessage('Demo profile updated for this session only.');
  }

  saveNotifications() {
    this.showSaveMessage('Notification preferences are a UI preview; no backend settings were saved.');
  }

  // There is no authentication backend. Never collect, log, or pretend to save passwords.
  saveSecurity() {
    this.securityForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactorAuth: false });
    this.showSaveMessage('Security settings are unavailable in this demo.');
  }

  private showSaveMessage(message: string) {
    this.savedMessage.set(message);
    setTimeout(() => {
      this.savedMessage.set(null);
    }, 3000);
  }
}
