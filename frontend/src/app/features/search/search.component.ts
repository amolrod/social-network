import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { FollowService } from '../../core/services/follow.service';
import { AuthService } from '../../core/services/auth.service';
import { FollowButtonComponent } from '../../shared/components/follow-button/follow-button.component';
import { User } from '../../core/models/user.model';
import { debounceTime, Subject } from 'rxjs';

type SearchTab = 'users' | 'posts' | 'trending';

interface TrendingTopic {
  id: string;
  hashtag: string;
  count: number;
  category: string;
}

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
  trendingTopics = signal<TrendingTopic[]>([]);
  isSearching = signal(false);
  noResults = signal(false);
  activeTab = signal<SearchTab>('users');
  currentUser = this.authService.currentUser;

  private searchSubject = new Subject<string>();

  // Computed: Filtrar resultados por tab
  filteredResults = computed(() => {
    const tab = this.activeTab();
    const results = this.searchResults();
    
    // Por ahora solo tenemos usuarios
    if (tab === 'users') {
      return results;
    }
    
    return [];
  });

  // Computed: Mostrar sección de trending
  showTrending = computed(() => {
    return this.searchQuery().length === 0 || this.activeTab() === 'trending';
  });

  ngOnInit() {
    // Cargar datos iniciales
    this.loadSuggestedUsers();
    this.loadTrendingTopics();

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

  changeTab(tab: SearchTab): void {
    this.activeTab.set(tab);
  }

  searchTrending(hashtag: string): void {
    const query = hashtag.replace('#', '');
    this.searchQuery.set(query);
    this.performSearch(query);
  }

  loadTrendingTopics(): void {
    // Mock data por ahora - Esto se conectará con el backend después
    const mockTrending: TrendingTopic[] = [
      { id: '1', hashtag: '#TechNews', count: 1523, category: 'Tecnología' },
      { id: '2', hashtag: '#WebDevelopment', count: 987, category: 'Desarrollo' },
      { id: '3', hashtag: '#Angular', count: 856, category: 'Frontend' },
      { id: '4', hashtag: '#Design', count: 754, category: 'Diseño' },
      { id: '5', hashtag: '#JavaScript', count: 623, category: 'Programación' },
      { id: '6', hashtag: '#UXDesign', count: 512, category: 'Diseño' },
      { id: '7', hashtag: '#AI', count: 489, category: 'Inteligencia Artificial' },
      { id: '8', hashtag: '#NestJS', count: 367, category: 'Backend' }
    ];
    
    this.trendingTopics.set(mockTrending);
  }

  formatTrendCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }
}

