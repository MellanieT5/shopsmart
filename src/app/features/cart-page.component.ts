//za košarico
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Cart</h2>

    <div *ngIf="cart.lines().length; else empty"> <!--če ima košarica lines, pokaže seznam, drugače prikaže #empty-->
      <ul>
        <li *ngFor="let line of cart.lines(); trackBy: trackById" 
            style="display:flex; gap:.5rem; align-items:center;"><!--ngfore čez joinane vrstice iz servisa lines, vrne {product,qty,lineTotal}-->
          <strong>{{ line.product.name }}</strong>
          — {{ line.product.price | currency:'EUR' }} × {{ line.qty }}
          <span style="margin-left:auto">
            = <strong>{{ line.lineTotal | currency:'EUR' }}</strong>
          </span>

          <button (click)="cart.add(line.product.id, 1)">+</button>
          <button (click)="cart.setQty(line.product.id, line.qty - 1)">-</button>
          <button (click)="cart.remove(line.product.id)">Remove</button>
        </li>
      </ul>

      <p><strong>Total: {{ cart.total() | currency:'EUR' }}</strong></p> <!--skupni seštevek-->
      <button (click)="cart.clear()">Clean cart</button>
    </div>

    <ng-template #empty>
      <p>Your cart is empty</p>
    </ng-template>
  `
})
export class CartPageComponent {
  cart = inject(CartService);//vbrizgnemo CartService in ga izpostavimo templatu

  trackById = (_: number, line: { product: { id: number } }) => line.product.id; //funkcija trackBy: Angular sledi elementom po product.id, manj nepotrebnih renderjev.
}

