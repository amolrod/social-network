import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { FollowService } from '../../core/services/follow.service';
import { AuthService } from '../../core/services/auth.service';
import { FollowButtonComponent } from '../../shared/components/follow-button/follow-button.component';
import { User } from '../../core/models/user.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, FollowButtonComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  private userService = inject(UserService);
  private followService = inject(FollowService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchQuery = signal('');
  searchResults = signal<User[]>([]);
  suggestedUsers = signal<User[]>([]);
  isSearching = signal(false);
  noResults = signal(false);
  currentUser = this.authService.currentUser;

  private searchSubject = new Subject<string>();

  ngOnInit() {
    // Cargar usuarios sugeridos al inicio
    this.loadSuggestedUsers();

    // Leer query params de la URL
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) {
        this.searchQuery.set(query);
        this.performSearch(query);
      }
    });

    // Configurar debounce para búsqueda
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      if (query.trim().length >= 2) {
        this.performSearch(query);
      } else {
        this.searchResults.set([]);
        this.noResults.set(false);
      }
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    
    if (value.trim().length === 0) {
      this.searchResults.set([]);
      this.noResults.set(false);
      return;
    }

    this.searchSubject.next(value);
  }

  performSearch(query: string): void {
    this.isSearching.set(true);
    this.noResults.set(false);

    this.userService.searchUsers(query).subscribe({
      next: (response) => {
        this.searchResults.set(response.data);
        this.noResults.set(response.data.length === 0);
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.isSearching.set(false);
        this.noResults.set(true);
      }
    });
  }

  loadSuggestedUsers(): void {
    this.userService.searchUsers('', 1, 6).subscribe({
      next: (response) => {
        this.suggestedUsers.set(response.data);
      },
      error: (err) => {
        console.error('Error al cargar usuarios sugeridos:', err);
      }
    });
  }

  goToProfile(username: string): void {
    this.router.navigate(['/profile', username]);
  }

  isFollowing(userId: string): boolean {
    return this.followService.isFollowing(userId);
  }

  isCurrentUser(userId: string): boolean {
    const current = this.currentUser();
    return current?.id === userId;
  }

  onFollowChange(userId: string, isFollowing: boolean): void {
    console.log(`Usuario ${userId} ahora ${isFollowing ? 'seguido' : 'no seguido'}`);
  }
}

