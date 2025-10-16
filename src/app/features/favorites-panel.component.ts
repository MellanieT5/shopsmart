import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-favorites-panel',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe],
  template: `
    <aside class="favorites-panel" *ngIf="open">
      <button class="close" (click)="close.emit()">×</button>
      <h3>Favorites</h3>
      <ul *ngIf="cart.favoriteLines().length; else empty">
        <li *ngFor="let p of cart.favoriteLines()">
          {{ p.name }} — {{ p.price | currency:'EUR' }} — {{ p.category }}
        </li>
      </ul>
      <ng-template #empty><p>No favorites yet.</p></ng-template>
    </aside>
  `,
  styles: [ /* tvoji obstoječi slogi */ ]
})
export class FavoritesPanelComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  cart = inject(CartService);
}
