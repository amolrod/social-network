import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';
import { NotificationBadgeComponent } from '../notification-badge/notification-badge.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationBadgeComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  unreadMessagesCount = computed(() => {
    return this.messageService.unreadCount$;
  });
  
  // Estado para el menú de usuario
  isUserMenuOpen = false;

  ngOnInit(): void {
    // Cargar contador de mensajes no leídos
    if (this.isAuthenticated()) {
      this.messageService.updateUnreadCount();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Obtener iniciales del usuario para el avatar
  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  });

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  navigateToProfile(): void {
    this.isUserMenuOpen = false;
    const user = this.currentUser();
    if (user) {
      this.router.navigate(['/profile', user.username]);
    }
  }

  navigateToSettings(): void {
    this.isUserMenuOpen = false;
    // TODO: Implementar ruta de settings
    console.log('Navigate to settings');
  }

  logout(): void {
    this.isUserMenuOpen = false;
    this.authService.logout();
  }
}
