import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  
  currentUser = this.authService.currentUser;
  unreadCount = this.notificationService.unreadCount;

  navItems = computed<NavItem[]>(() => {
    const user = this.currentUser();
    const profileRoute = user ? `/profile/${user.username}` : '/profile';
    const notifCount = this.unreadCount();
    
    return [
      { label: 'Inicio', icon: 'home', route: '/home' },
      { label: 'Explorar', icon: 'compass', route: '/search' },
      { label: 'Mensajes', icon: 'mail', route: '/messages' },
      { 
        label: 'Notificaciones', 
        icon: 'bell', 
        route: '/notifications', 
        badge: notifCount > 0 ? notifCount : undefined 
      },
      { label: 'Mi Perfil', icon: 'user', route: profileRoute },
    ];
  });
}
