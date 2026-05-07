import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
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
    this.profileForm = this.fb.group({
      firstName: ['John'],
      lastName: ['Doe'],
      email: ['john.doe@example.com'],
      title: ['Senior Developer'],
      bio: ['Passionate about building great user experiences...'],
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
    console.log('Profile saved', this.profileForm.value);
    this.showSaveSuccess();
  }

  saveNotifications() {
    console.log('Notifications saved', this.notificationsForm.value);
    this.showSaveSuccess();
  }

  saveSecurity() {
    console.log('Security saved', this.securityForm.value);
    this.showSaveSuccess();
  }

  private showSaveSuccess() {
    this.savedMessage.set('Changes saved successfully.');
    setTimeout(() => {
      this.savedMessage.set(null);
    }, 3000);
  }
}
