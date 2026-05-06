import { Injectable } from '@angular/core';
import { Observable, timer, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  /**
   * Simulates a mock API call that returns fresh sales data every 30 seconds.
   */
  getRealTimeSalesData(): Observable<number[]> {
    // Emissions every 30s, starting immediately (0)
    return timer(0, 30000).pipe(
      map(() => {
        // Generate 12 random values between 20 and 100
        return Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 20);
      })
    );
  }
}
