import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

interface BottomNavItem {
  label: string;
  icon: string;
  route: string | string[];
  badge?: number;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private readonly currentUser = this.authService.currentUser;
  private readonly unreadCount = this.notificationService.unreadCount;

  // Computed navItems con datos dinámicos
  navItems = computed<BottomNavItem[]>(() => {
    const user = this.currentUser();
    const notifCount = this.unreadCount();
    
    return [
      { label: 'Inicio', icon: 'home', route: '/home' },
      { label: 'Explorar', icon: 'compass', route: '/search' },
      { 
        label: 'Notificaciones', 
        icon: 'bell', 
        route: '/notifications',
        badge: notifCount > 0 ? notifCount : undefined
      },
      { label: 'Mensajes', icon: 'mail', route: '/messages' },
      { 
        label: 'Perfil', 
        icon: 'user', 
        route: user ? ['/profile', user.username] : '/home'
      },
    ];
  });
}
