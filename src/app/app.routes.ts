import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'todo',
    loadComponent: () => import('./features/todo/todo.component').then(m => m.TodoComponent)
  },
  {
    path: 'ecommerce',
    loadComponent: () => import('./features/ecommerce/ecommerce.component').then(m => m.EcommerceComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/products/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'product-stock',
    loadComponent: () => import('./features/product-stock/product-stock.component').then(m => m.ProductStockComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'inbox',
    loadComponent: () => import('./features/inbox/inbox.component').then(m => m.InboxComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/pricing/pricing.component').then(m => m.PricingComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent)
  },
  {
    path: 'financial',
    loadComponent: () => import('./features/financial/financial.component').then(m => m.FinancialOverviewComponent)
  },
  {
    path: 'analytics-insights',
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'crm-dashboard',
    loadComponent: () => import('./features/crm-dashboard/crm-dashboard.component').then(m => m.CrmDashboardComponent)
  },
  {
    path: 'ai-dashboard',
    loadComponent: () => import('./features/ai-dashboard/ai-dashboard.component').then(m => m.AiDashboardComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
