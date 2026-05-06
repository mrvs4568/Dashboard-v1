import { Injectable, signal, computed } from '@angular/core';

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  oldPrice?: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  currentImageIndex?: number;
  category: string;
  badge?: string;
  badgeColor?: string;
  isEditing?: boolean;
  isFavorite?: boolean;
  description?: string;
  specifications?: Specification[];
  productReviews?: Review[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSignal = signal<Product[]>([
    {
      id: 1,
      name: 'Apple Watch Series 4',
      price: '$120.00',
      oldPrice: '$150.00',
      rating: 4.8,
      reviews: 120,
      image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&q=80',
      images: [
        'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&q=80',
        'https://images.unsplash.com/photo-1508685096489-7abac4f4bd9a?w=400&q=80',
        'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&q=80'
      ],
      currentImageIndex: 0,
      category: 'Electronics',
      badge: 'New',
      badgeColor: '#00B69B',
      description: 'The redefined Apple Watch Series 4. Radically re-engineered and redesigned to help you stay even more active, healthy, and connected.',
      specifications: [
        { label: 'Display', value: 'LTPO OLED Retina display' },
        { label: 'Processor', value: 'S4 with 64-bit dual-core processor' },
        { label: 'Sensors', value: 'Electrical heart sensor, Second-gen optical heart sensor' },
        { label: 'Water Resistance', value: '50 meters' }
      ],
      productReviews: [
        { id: '1', user: 'Jason Borne', rating: 5, comment: 'Best watch I ever had. The battery life is impressive!', date: '2023-10-12', avatar: 'https://i.pravatar.cc/150?u=jason' },
        { id: '2', user: 'Sarah Connor', rating: 4, comment: 'Great for tracking my workouts.', date: '2023-09-25', avatar: 'https://i.pravatar.cc/150?u=sarah' }
      ]
    },
    {
      id: 2,
      name: 'Microsoft Surface Laptop',
      price: '$899.00',
      rating: 4.5,
      reviews: 85,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80'
      ],
      currentImageIndex: 0,
      category: 'Electronics'
    },
    {
      id: 3,
      name: 'iPhone 13 Pro Max',
      price: '$1099.00',
      rating: 4.9,
      reviews: 240,
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80',
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80',
        'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=400&q=80',
        'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&q=80'
      ],
      currentImageIndex: 0,
      category: 'Electronics',
      badge: 'Hot',
      badgeColor: '#F93C65'
    },
    {
      id: 4,
      name: 'Noise Cancelling Headphones',
      price: '$299.00',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
      category: 'Electronics'
    },
    {
      id: 5,
      name: 'Cozy Wool Sweater',
      price: '$45.00',
      oldPrice: '$60.00',
      rating: 4.2,
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?w=400&q=80',
      category: 'Fashion'
    },
    {
      id: 6,
      name: 'Classic White Sneakers',
      price: '$75.00',
      rating: 4.6,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      category: 'Fashion',
      badge: 'Sale',
      badgeColor: '#FFA800'
    },
    {
      id: 7,
      name: 'Modern Sofa',
      price: '$650.00',
      rating: 4.6,
      reviews: 28,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
      category: 'Furniture'
    },
    {
      id: 8,
      name: 'Leather Watch',
      price: '$85.00',
      oldPrice: '$110.00',
      rating: 4.4,
      reviews: 56,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
      category: 'Fashion'
    },
    {
      id: 9,
      name: 'Running Shoes',
      price: '$120.00',
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      category: 'Sports',
      badge: 'Best Seller',
      badgeColor: '#4880FF'
    },
    {
      id: 10,
      name: 'Yoga Mat',
      price: '$25.00',
      rating: 4.3,
      reviews: 88,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
      category: 'Sports'
    },
    {
      id: 11,
      name: 'Minimalist Clock',
      price: '$45.00',
      rating: 4.5,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&q=80',
      category: 'Furniture'
    },
    {
      id: 12,
      name: 'Wireless Mouse',
      price: '$29.00',
      rating: 4.1,
      reviews: 112,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
      category: 'Electronics'
    }
  ]);

  products = this.productsSignal.asReadonly();

  favorites = computed(() => this.productsSignal().filter(p => p.isFavorite));

  toggleFavorite(productId: number) {
    this.productsSignal.update(products => 
      products.map(p => p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p)
    );
  }

  updateProduct(updatedProduct: Product) {
    this.productsSignal.update(products => 
      products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  }

  addProduct(product: Partial<Product>) {
    this.productsSignal.update(products => {
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name: product.name || 'New Product',
        price: product.price || '$0.00',
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        image: product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        category: product.category || 'Other',
        isFavorite: product.isFavorite || false,
        ...product
      } as Product;
      return [newProduct, ...products];
    });
  }

  nextImage(productId: number) {
    this.productsSignal.update(products => 
      products.map(p => {
        if (p.id === productId && p.images) {
          const nextIndex = ((p.currentImageIndex || 0) + 1) % p.images.length;
          return { ...p, currentImageIndex: nextIndex };
        }
        return p;
      })
    );
  }

  prevImage(productId: number) {
    this.productsSignal.update(products => 
      products.map(p => {
        if (p.id === productId && p.images) {
          const prevIndex = ((p.currentImageIndex || 0) - 1 + p.images.length) % p.images.length;
          return { ...p, currentImageIndex: prevIndex };
        }
        return p;
      })
    );
  }
}
