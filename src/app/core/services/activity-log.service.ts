import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ActivityLog {
  id: string;
  userId?: string;
  userName: string;
  action: 'Created' | 'Edited' | 'Deleted' | 'Login' | 'Logout';
  details: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private logsSubject = new BehaviorSubject<ActivityLog[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Moni Roy',
      action: 'Login',
      details: 'Logged into the system',
      timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
    },
    {
      id: '2',
      userId: '2',
      userName: 'Jhon Doe',
      action: 'Edited',
      details: 'Updated profile settings',
      timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
      id: '3',
      userId: '3',
      userName: 'Sarah Connor',
      action: 'Logout',
      details: 'Logged out of the system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    }
  ]);
  
  logs$ = this.logsSubject.asObservable();

  addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const currentLogs = this.logsSubject.value;
    const newLog: ActivityLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    this.logsSubject.next([newLog, ...currentLogs]);
  }

  getLogs() {
    return this.logsSubject.value;
  }
}
