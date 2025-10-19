import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { FollowService } from './core/services/follow.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private followService = inject(FollowService);
  
  protected readonly title = signal('frontend');

  constructor() {
    // Efecto que se ejecuta cuando el usuario cambia
    effect(() => {
      const user = this.authService.currentUser();
      console.log('👤 Usuario cambió en App component:', user);
      
      if (user?.id) {
        // Cargar IDs de usuarios seguidos cuando el usuario está autenticado
        console.log('🔄 Iniciando carga de followingIds para user:', user.id);
        setTimeout(() => {
          this.followService.loadFollowingIds(user.id);
        }, 100); // Pequeño delay para asegurar que el token esté disponible
      }
    });
  }

  ngOnInit() {
    console.log('🚀 App component inicializado');
    const user = this.authService.currentUser();
    if (user?.id) {
      console.log('✅ Usuario ya autenticado al iniciar:', user);
    }
  }
}
