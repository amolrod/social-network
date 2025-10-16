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

  getIconSvg(iconName: string): string {
    const icons: { [key: string]: string } = {
      home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
      compass: '<circle cx="12" cy="12" r="10"></circle><polyline points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polyline>',
      plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
      mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
      user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    };
    return icons[iconName] || '';
  }
}
