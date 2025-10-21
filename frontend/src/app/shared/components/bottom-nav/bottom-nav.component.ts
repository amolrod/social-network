import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MessageService } from '../../../core/services/message.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class BottomNavComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  private readonly currentUser = this.authService.currentUser;
  private readonly unreadCount = this.notificationService.unreadCount;
  private readonly unreadMessagesCount = computed(() => {
    let count = 0;
    this.messageService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe(c => count = c);
    return count;
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.messageService.updateUnreadCount();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed navItems con datos dinámicos
  navItems = computed<BottomNavItem[]>(() => {
    const user = this.currentUser();
    const notifCount = this.unreadCount();
    const messagesCount = this.unreadMessagesCount();
    
    return [
      { label: 'Inicio', icon: 'home', route: '/home' },
      { label: 'Explorar', icon: 'compass', route: '/search' },
      { 
        label: 'Notificaciones', 
        icon: 'bell', 
        route: '/notifications',
        badge: notifCount > 0 ? notifCount : undefined
      },
      { 
        label: 'Mensajes', 
        icon: 'mail', 
        route: '/messages',
        badge: messagesCount > 0 ? messagesCount : undefined
      },
      { 
        label: 'Perfil', 
        icon: 'user', 
        route: user ? ['/profile', user.username] : '/home'
      },
    ];
  });
}
