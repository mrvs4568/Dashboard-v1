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
    name: 'Moni Roy',
    email: 'moni.roy@dashstack.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    role: 'Admin'
  });

  currentUser = this.userSignal.asReadonly();

  updateProfile(profile: Partial<UserProfile>) {
    this.userSignal.update(current => ({ ...current, ...profile }));
  }
}
