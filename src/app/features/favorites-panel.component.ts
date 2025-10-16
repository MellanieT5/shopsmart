import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-favorites-panel',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe],
  template: `
    <aside class="favorites-panel" *ngIf="open">
      <button class="close" type="button" (click)="close.emit()">×</button>
      <h3>Favorites</h3>
      <ul *ngIf="cart.favoriteLines().length; else empty">
        <li *ngFor="let p of cart.favoriteLines()">
          {{ p.name }} — {{ p.price | currency:'EUR' }} — {{ p.category }}
        </li>
      </ul>
      <ng-template #empty><p>No favorites yet.</p></ng-template>
    </aside>
  `,
  styles: [ `
    .favorites-panel {
      position: absolute;            
      top: calc(100% + -78.5rem);  
      right:0;     
      max-width: 320px;
      max-height: 70vh;
      overflow: auto;
      background: var(--bg, #fff);
      border: 1px solid var(--border, #ccc);
      border-radius: .5rem;
      padding: .75rem .75rem .5rem;
      box-shadow: 0 8px 24px rgba(0,0,0,.12);
      z-index: 1000;
    }
    .close {
      position: absolute;
      top: .25rem;
      right: .4rem;
      border: 0;
      background: transparent;
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
    }
  `]
})
export class FavoritesPanelComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  cart = inject(CartService);
}
