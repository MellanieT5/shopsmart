//prikaže košarico

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { CartService } from "./cart.service";


@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [NgIf, NgFor, CurrencyPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h2>Cart </h2>

    <div *ngIf= "cart.items().length; else empty">
        <ul>
            <li *ngFor= "let it of cart.items()">
                {{it.product.name}} -
                {{it.product.price | currency:'EUR'}} x {{it.qty}}
                =<strong>{{it.product.price * it.qty | currency: 'EUR'}} x </strong>
                <button (click)= "cart.changeQty(it.product.id, +1)">+</button>
                <button (click)="cart.changeQty(it.product.id, -1)">-</button>
                <button (click) = "cart.remove(it.product.id)">Remove</button>
            </li>
        </ul>

        <p><strong>Total: {{cart.total() | currency: 'EUR'}} </strong><p>
           <button (click) = "cart.clear()"> Clean cart </button>
    </div>
    
    <ng-template #empty>
        <p> Your cart is empty </p>
    </ng-template>
    `
})

export class CartPageComponent {
    constructor(public cart: CartService) { }
}