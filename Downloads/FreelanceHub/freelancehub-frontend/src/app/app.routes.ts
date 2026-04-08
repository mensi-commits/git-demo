import { Routes } from '@angular/router';

export const routes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  //{ path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  //{ path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },

  

  {
    path: '',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
      { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
      { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },
      { path: 'gigs', loadComponent: () => import('./pages/gigs/gigs.page').then(m => m.GigsPage) },
      { path: 'store', loadComponent: () => import('./pages/store/store.page').then(m => m.StorePage) },
      { path: 'messages', loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  { path: 'offers', loadComponent: () => import('./pages/offers/offers.page').then(m => m.OffersPage) },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage) },


];