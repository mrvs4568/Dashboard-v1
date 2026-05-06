import { Injectable, signal, computed, inject } from '@angular/core';
import { NotificationService } from './services/notification.service';

export interface ProductStock {
  id: string;
  image: string;
  name: string;
  category: string;
  price: string;
  piece: number;
  availableColors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductStockService {
  private notificationService = inject(NotificationService);
  private notifiedLowStock = new Set<string>();
  private readonly LOW_STOCK_THRESHOLD = 20;

  private stockSignal = signal<ProductStock[]>([
    {
      id: '1',
      image: 'https://picsum.photos/seed/watch1/40/40',
      name: 'Apple Watch Series 4',
      category: 'Digital Product',
      price: '$690.00',
      piece: 63,
      availableColors: ['#FFC107', '#E91E63', '#00BCD4', '#4CAF50']
    },
    {
      id: '2',
      image: 'https://picsum.photos/seed/phone1/40/40',
      name: 'Microsoft Surface 7',
      category: 'Digital Product',
      price: '$1,299.00',
      piece: 13,
      availableColors: ['#202224', '#00BCD4', '#4CAF50']
    },
    {
      id: '3',
      image: 'https://picsum.photos/seed/camera1/40/40',
      name: 'Samsung Galaxy S10',
      category: 'Digital Product',
      price: '$399.00',
      piece: 125,
      availableColors: ['#FFC107', '#E91E63', '#4880FF']
    },
    {
      id: '4',
      image: 'https://picsum.photos/seed/laptop1/40/40',
      name: 'MacBook Air M2',
      category: 'Digital Product',
      price: '$1,199.00',
      piece: 63,
      availableColors: ['#FFC107', '#E91E63', '#00BCD4']
    },
    {
      id: '5',
      image: 'https://picsum.photos/seed/mac/40/40',
      name: 'iPad Pro 12.9',
      category: 'Digital Product',
      price: '$1,099.00',
      piece: 7,
      availableColors: ['#FFC107', '#E91E63', '#00BCD4']
    }
  ]);

  constructor() {
    this.checkStockLevels();
  }

  stock = computed(() => this.stockSignal());

  updateStock(id: string, piece: number) {
    this.stockSignal.update(items => 
      items.map(item => item.id === id ? { ...item, piece } : item)
    );
    this.checkStockLevels();
  }

  private checkStockLevels() {
    this.stockSignal().forEach(item => {
      if (item.piece < this.LOW_STOCK_THRESHOLD) {
        if (!this.notifiedLowStock.has(item.id)) {
          this.notificationService.addNotification({
            title: 'Low Stock Alert',
            message: `${item.name} is running low on stock (${item.piece} pieces left).`,
            type: 'stock'
          });
          this.notifiedLowStock.add(item.id);
        }
      } else {
        // If stock was replenished, allow another notification later if it drops again
        this.notifiedLowStock.delete(item.id);
      }
    });
  }
}
