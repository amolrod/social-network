import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="placeholder"><h2>Profile Component - Coming Soon</h2></div>',
  styles: ['.placeholder { padding: 2rem; text-align: center; }']
})
export class ProfileComponent {}
