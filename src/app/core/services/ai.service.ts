import { Injectable } from '@angular/core';
import { Order } from '../order.service';

/** Local, deterministic demo insights; not an AI provider or external API call. */
@Injectable({ providedIn: 'root' })
export class AiService {
  async analyzeOrders(orders: Order[]): Promise<string> {
    const total = orders.length;
    const completed = orders.filter(order => order.status === 'Completed').length;
    const rejected = orders.filter(order => order.status === 'Rejected').length;
    const pending = orders.filter(order => order.status === 'Processing' || order.status === 'On Hold').length;
    const completionRate = total ? Math.round(completed * 100 / total) : 0;
    return [
      '<h3>Demo Order Insights (not AI-generated)</h3>',
      `<p>Total orders: ${total}; completed: ${completed} (${completionRate}%), rejected: ${rejected}.</p>`,
      `<p>Processing or on hold: ${pending}.</p>`,
      '<ul>',
      '<li>Review rejected orders for recurring causes.</li>',
      '<li>Follow up on orders that are processing or on hold.</li>',
      '<li>Connect a backend analytics service before using real business data.</li>',
      '</ul>'
    ].join('');
  }
}
