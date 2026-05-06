import { Injectable, signal, computed } from '@angular/core';

export interface Order {
  id: string;
  name: string;
  address: string;
  date: string;
  type: string;
  status: 'Completed' | 'Processing' | 'Rejected' | 'On Hold' | 'In Transit';
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSignal = signal<Order[]>([
    { id: '#00001', name: 'Christine Brooks', address: '089 Kutch Green Apt. 448', date: '14 Feb 2026', type: 'Health & Medicine', status: 'Completed' },
    { id: '#00002', name: 'Rosie Pearson', address: '979 Immanuel Ferry Suite 526', date: '14 Feb 2026', type: 'Book & Stationary', status: 'Processing' },
    { id: '#00003', name: 'Darrell Caldwell', address: '8587 Frida Ports', date: '14 Feb 2026', type: 'Services & Industry', status: 'Rejected' },
    { id: '#00004', name: 'Steve Jobs', address: '1 Apple Park Way', date: '24 Feb 2021', type: 'Electronics', status: 'Completed' },
    { id: '#00005', name: 'Bill Gates', address: '500 5th Ave, NY', date: '15 Oct 2021', type: 'Fashion & Beauty', status: 'On Hold' },
    { id: '#00006', name: 'Jeff Bezos', address: '410 Terry Ave N, Seattle', date: '01 Dec 2021', type: 'Home & Living', status: 'In Transit' },
    { id: '#00007', name: 'Elon Musk', address: '1 Rocket Road, Hawthorne', date: '20 Jan 2022', type: 'Mobile & Phone', status: 'Completed' },
    { id: '#00008', name: 'Mark Zuckerberg', address: '1 Hacker Way, Menlo Park', date: '14 May 2022', type: 'Accessories', status: 'Processing' },
    { id: '#00009', name: 'Sundar Pichai', address: '1600 Amphitheatre Pkwy', date: '10 Aug 2022', type: 'Health & Medicine', status: 'Completed' },
    { id: '#00010', name: 'Satya Nadella', address: 'One Microsoft Way', date: '18 Nov 2022', type: 'Mobile & Phone', status: 'On Hold' },
    { id: '#00011', name: 'Tim Cook', address: 'Infinite Loop, CA', date: '05 Mar 2023', type: 'Electronics', status: 'Completed' },
    { id: '#00012', name: 'Jack Dorsey', address: '1355 Market St, SF', date: '12 Jun 2023', type: 'Electronics', status: 'Rejected' },
    { id: '#00013', name: 'Reed Hastings', address: '100 Winchester Cir', date: '15 Jul 2023', type: 'Home & Living', status: 'Completed' },
    { id: '#00014', name: 'Jensen Huang', address: '2788 San Tomas Expy', date: '22 Sep 2023', type: 'Electronics', status: 'Processing' },
    { id: '#00015', name: 'Lisa Su', address: '2485 Augustine Dr', date: '30 Oct 2023', type: 'Electronics', status: 'In Transit' },
    { id: '#00016', name: 'Travis Kalanick', address: '1455 Market St, SF', date: '12 Nov 2023', type: 'Services & Industry', status: 'Completed' },
    { id: '#00017', name: 'Brian Chesky', address: '888 Brannan St, SF', date: '05 Dec 2023', type: 'Home & Living', status: 'Processing' },
    { id: '#00018', name: 'Evan Spiegel', address: '2700 Ocean Park Blvd', date: '18 Jan 2024', type: 'Mobile & Phone', status: 'On Hold' }
  ]);

  orders = computed(() => this.ordersSignal());

  addOrder(order: Order) {
    this.ordersSignal.update(orders => [order, ...orders]);
  }

  updateOrderStatus(id: string, status: Order['status']) {
    this.ordersSignal.update(orders => 
      orders.map(o => o.id === id ? { ...o, status } : o)
    );
  }

  bulkUpdateStatus(ids: string[], status: Order['status']) {
    this.ordersSignal.update(orders => 
      orders.map(o => ids.includes(o.id) ? { ...o, status } : o)
    );
  }

  bulkDeleteOrders(ids: string[]) {
    this.ordersSignal.update(orders => 
      orders.filter(o => !ids.includes(o.id))
    );
  }
}
