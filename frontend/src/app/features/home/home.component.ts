import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  
  readonly currentUser = this.authService.currentUser;

  // Computed signals para evitar errores de undefined en el template
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user?.fullName) return 'U';
    return user.fullName.substring(0, 2).toUpperCase();
  });

  readonly userFirstName = computed(() => {
    const user = this.currentUser();
    if (!user?.fullName) return '';
    return user.fullName.split(' ')[0];
  });

  ngOnInit(): void {
    console.log('Home component initialized');
    console.log('Current user:', this.currentUser());
  }

  logout(): void {
    this.authService.logout();
  }
}
