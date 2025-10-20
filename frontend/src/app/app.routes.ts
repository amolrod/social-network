import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'sign-in',
        loadComponent: () => import('./features/auth/sign-in/sign-in.component')
          .then(m => m.SignInComponent)
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./features/auth/sign-up/sign-up.component')
          .then(m => m.SignUpComponent)
      },
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component')
          .then(m => m.HomeComponent)
      },
      {
        path: 'profile/:username',
        loadComponent: () => import('./features/profile/profile.component')
          .then(m => m.ProfileComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/messages/messages.component')
          .then(m => m.MessagesComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component')
          .then(m => m.SearchComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component')
          .then(m => m.NotificationsComponent)
      },
      {
        path: 'post/:id',
        loadComponent: () => import('./features/post-detail/post-detail.component')
          .then(m => m.PostDetailComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
