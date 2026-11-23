import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import { routes } from './app.routes';
import { LucideAngularModule, LayoutDashboard, Users, Settings, Bell, Search, Menu, LogOut, ChevronDown, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Clock, Edit, Trash2, ShoppingBag, Heart, Mail, ClipboardList, Globe, Filter, BarChart3, Sparkles, Plus, MoreVertical, Send, AppWindow, Package, Database, Target, Activity, MessageCircle, ArrowRight } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideCharts(withDefaultRegisterables()),
    provideEchartsCore({ echarts }),
    importProvidersFrom(LucideAngularModule.pick({ LayoutDashboard, Users, Settings, Bell, Search, Menu, LogOut, ChevronDown, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Clock, Edit, Trash2, ShoppingBag, Heart, Mail, ClipboardList, Globe, Filter, BarChart3, Sparkles, Plus, MoreVertical, Send, AppWindow, Package, Database, Target, Activity, MessageCircle, ArrowRight }))
  ]
};

