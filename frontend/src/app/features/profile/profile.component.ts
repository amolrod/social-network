import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { PostService } from '../../core/services/post.service';
import { FollowService } from '../../core/services/follow.service';
import { AuthService } from '../../core/services/auth.service';
import { FollowButtonComponent } from '../../shared/components/follow-button/follow-button.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { User } from '../../core/models/user.model';
import { Post } from '../../core/models/post.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FollowButtonComponent, PostCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private postService = inject(PostService);
  private followService = inject(FollowService);
  private authService = inject(AuthService);

  userProfile = signal<User | null>(null);
  userPosts = signal<Post[]>([]);
  isLoading = signal(true);
  isLoadingPosts = signal(true);
  error = signal<string | null>(null);
  
  currentUser = this.authService.currentUser;
  
  // Computed: ¿Es mi propio perfil?
  isOwnProfile = computed(() => {
    const current = this.currentUser();
    const profile = this.userProfile();
    return current && profile && current.id === profile.id;
  });

  // Computed: ¿Estoy siguiendo a este usuario?
  isFollowing = computed(() => {
    const profile = this.userProfile();
    return profile ? this.followService.isFollowing(profile.id) : false;
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const username = params['username'];
      if (username) {
        this.loadUserProfile(username);
      }
    });
  }

  loadUserProfile(username: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getUserByUsername(username).subscribe({
      next: (user) => {
        this.userProfile.set(user);
        this.isLoading.set(false);
        this.loadUserPosts(username);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.error.set('Usuario no encontrado');
        this.isLoading.set(false);
      }
    });
  }

  loadUserPosts(username: string): void {
    this.isLoadingPosts.set(true);

    this.postService.getPostsByUser(username).subscribe({
      next: (response) => {
        this.userPosts.set(response.posts || []);
        this.isLoadingPosts.set(false);
      },
      error: (err) => {
        console.error('Error al cargar posts del usuario:', err);
        this.isLoadingPosts.set(false);
      }
    });
  }

  onFollowChange(isFollowing: boolean): void {
    const profile = this.userProfile();
    if (profile) {
      // Actualizar contador local
      const currentCount = profile.followersCount || 0;
      const newCount = isFollowing 
        ? currentCount + 1 
        : currentCount - 1;
      
      this.userProfile.set({
        ...profile,
        followersCount: newCount
      });
    }
  }

  onLikePost(postId: string): void {
    console.log('Like post:', postId);
    // TODO: Implementar likes cuando esté el módulo
  }

  onDeletePost(postId: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.userPosts.update(posts => posts.filter(p => p.id !== postId));
      },
      error: (err) => {
        console.error('Error al eliminar post:', err);
        alert('Error al eliminar el post');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  editProfile(): void {
    // TODO: Implementar edición de perfil
    alert('Funcionalidad de edición próximamente');
  }
}

