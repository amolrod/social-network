import { Component, signal, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { FollowService } from './core/services/follow.service';
import { LikesService } from './core/services/likes.service';
import { WebSocketService } from './core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private followService = inject(FollowService);
  private likesService = inject(LikesService);
  private webSocketService = inject(WebSocketService);
  
  protected readonly title = signal('frontend');
  private subscriptions = new Subscription();

  constructor() {
    // Efecto que se ejecuta cuando el usuario cambia
    effect(() => {
      const user = this.authService.currentUser();
      console.log('👤 Usuario cambió en App component:', user);
      
      if (user?.id) {
        // Cargar IDs de usuarios seguidos y posts con like cuando el usuario está autenticado
        console.log('🔄 Iniciando carga de followingIds y likedPostIds para user:', user.id);
        setTimeout(() => {
          this.followService.loadFollowingIds(user.id);
          this.likesService.loadLikedPostIds(user.id);
        }, 100); // Pequeño delay para asegurar que el token esté disponible
        
        // Conectar WebSocket cuando el usuario hace login
        if (!this.webSocketService.isConnected()) {
          this.connectWebSocket();
        }
      } else {
        // Desconectar WebSocket cuando el usuario hace logout
        console.log('🔌 Desconectando WebSocket por logout');
        this.webSocketService.disconnect();
      }
    });
  }

  ngOnInit() {
    console.log('🚀 App component inicializado');
    const user = this.authService.currentUser();
    if (user?.id) {
      console.log('✅ Usuario ya autenticado al iniciar:', user);
      // Conectar WebSocket cuando hay usuario autenticado
      this.connectWebSocket();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.webSocketService.disconnect();
  }

  private connectWebSocket() {
    console.log('🔌 Conectando WebSocket...');
    this.webSocketService.connect();
    
    // Suscribirse al estado de conexión
    const connectionSub = this.webSocketService.connectionStatus$.subscribe(isConnected => {
      if (isConnected) {
        console.log('✅ WebSocket conectado exitosamente');
      } else {
        console.log('⚠️ WebSocket desconectado');
      }
    });
    
    this.subscriptions.add(connectionSub);
  }
}
