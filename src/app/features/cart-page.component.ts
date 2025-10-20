//za košarico
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { CartService } from '../core/cart.service';
import {RouterLink} from '@angular/router'

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="cart-wrap">
  <div class="cart-header">
    <h2>Cart</h2>
    <a class="btn btn-secondary" routerLink="/history">History</a>
  </div>

  <ng-container *ngIf="cart.lines().length; else empty">

    <div class="cart-list">
      <div *ngFor="let line of cart.lines(); trackBy: trackById" class="cart-item">
        <!-- image -->
        <img class="cart-img"
             [src]="line.product.imageData || 'assets/no-image.png'"
             [alt]="line.product.name" />

        <!-- name + unit price -->
        <div class="cart-info">
          <div class="cart-name">{{ line.product.name }}</div>
          <div class="muted">{{ line.product.price | currency:'EUR' }}</div>
        </div>

        <!-- qty -->
        <div class="cart-qty">
          <button class="btn-ghost qty-btn" (click)="cart.add(line.product.id, 1)"
          style="background:#3b82f6; color: white; border: none; padding: 0.35rem 0.65rem; border-radius: 6px; font-weight:600;">+</button>
          <div class="cart-qty-value">{{ line.qty }}</div>
          <button class="btn-ghost qty-btn" (click)="cart.setQty(line.product.id, line.qty - 1)"
          style="background:#3b82f6; color:white; border:none; padding:0.35rem 0.65rem; border-radius:6px; font-weight:600;">−</button>
        </div>

        <!-- subtotal -->
        <div class="cart-subtotal">
          {{ line.lineTotal | currency:'EUR' }}
        </div>

        <!-- remove -->
        <button class="btn btn-secondary cart-remove" (click)="cart.remove(line.product.id)">Remove</button>
      </div>
    </div>

    <!-- total + clear -->
    <div class="cart-total-box">
      <div class="total-label">TOTAL:</div>
      <div class="total-value">{{ cart.total() | currency:'EUR' }}</div>
      <button class="btn btn-secondary clear-btn" (click)="cart.clear()">Clear cart</button>
    </div>

    <!-- footer actions -->
    <div class="cart-actions">
      <a class="btn btn-secondary" routerLink="/products">← Back</a>
      <a class="btn" routerLink="/checkout">Next →</a>
    </div>
  </ng-container>

  <ng-template #empty>
    <p>Your cart is empty.</p>
  </ng-template>
</div>


`
})
export class CartPageComponent {
  cart = inject(CartService);//vbrizgnemo CartService in ga izpostavimo templatu

  trackById = (_: number, line: { product: { id: number } }) => line.product.id; //funkcija trackBy: Angular sledi elementom po product.id, manj nepotrebnih renderjev.
}

