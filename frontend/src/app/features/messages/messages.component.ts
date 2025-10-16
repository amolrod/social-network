import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="placeholder"><h2>Messages Component - Coming Soon</h2></div>',
  styles: ['.placeholder { padding: 2rem; text-align: center; }']
})
export class MessagesComponent {}
