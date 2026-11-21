import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSignal = signal<UserProfile>({
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: '/images/demo-avatar.svg',
    role: 'Demo Admin'
  });

  currentUser = this.userSignal.asReadonly();

  updateProfile(profile: Partial<UserProfile>) {
    this.userSignal.update(current => ({ ...current, ...profile }));
  }
}
