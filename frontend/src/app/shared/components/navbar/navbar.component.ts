import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  
  // Estado para el menú de usuario
  isUserMenuOpen = false;
  
  // Estado para el buscador en móvil
  isSearchOpen = false;

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

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  navigateToProfile(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/profile']);
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

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();
    
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }
}
