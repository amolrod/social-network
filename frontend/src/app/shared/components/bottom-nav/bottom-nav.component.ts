import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface BottomNavItem {
  label: string;
  icon: string;
  route: string;
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
  navItems: BottomNavItem[] = [
    { label: 'Inicio', icon: 'home', route: '/home' },
    { label: 'Explorar', icon: 'compass', route: '/search' },
    { label: 'Crear', icon: 'plus', route: '/create' },
    { label: 'Mensajes', icon: 'mail', route: '/messages', badge: 3 },
    { label: 'Perfil', icon: 'user', route: '/profile' },
  ];
}
