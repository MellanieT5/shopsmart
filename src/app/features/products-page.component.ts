//prikazuje izdelke

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';// dodaš importe 
import { ProductService } from '../core/product.service';
import { HighlightPipe } from "../shared/pipe/highlight.pipe";
import{RouterLink} from '@angular/router';
import { CartService } from "../core/cart.service";
import { inject } from "@angular/core";


@Component({ //vstavimo komponento
    selector: 'app-products-page', //ime za HTML
    standalone: true, //lahko damo v module
    imports: [NgFor, RouterLink,  NgIf, CurrencyPipe, HighlightPipe], // še več importov 
    changeDetection: ChangeDetectionStrategy.OnPush, //naj pregleda samo dejanske spremembe 
    template: `
        <h2>Products</h2>

         <div style= "display: flex; gap:0.5rem; margin-bottom:1rem">
           <input
           #q
            placeholder="Search..."
            [value]="svc.query()"
            (input)="setQuery(q.value||'')"/>
                        
        <select
            [value]="svc.sortBy()"
            (change)="setSort($any($event.target).value)">
            <option value="name">Name</option>
            <option value="price">Price</option>
        </select>
            
            <button (click)="svc.load()">Reload </button>
        </div>

        <ul *ngIf = "svc.filtered().length; else empty">
            <li *ngFor = "let p of svc.filtered(); tackBy: trackById" style="display:flex; gap:.5rem;">
                
                <a [routerLink] = "['/products', p.id]">
                    <span [innerHTML]="p.name | highlight:svc.query()"> </span>
                </a> 
                -{{p.price | currency: 'EUR'}} - {{p.category}}

                <button type= "button" (click)="svc.remove(p.id)">Remove </button>

                <button type ="button" (click)="cart.add(p.id,1)">Add to cart </button>

                 <button type="button"
                [attr.aria-pressed]="cart.isFav(p.id)"
                (click)="cart.toggleFav(p.id)"
                class="heart"
                [class.active]="cart.isFav(p.id)">
          ♥
        </button>

            </li>
        </ul>

        <ng-template #empty><p>No products found. </p></ng-template>
    
    `,
    styles:[`
    .heart {
      border: 1px solid var(--border, #444);
      background: transparent;
      line-height: 1;
      padding: .2rem .5rem;
      border-radius: .5rem;
      opacity:.8;
    }
    .heart.active { background: #ff2b77; color: white; opacity:1; }
  `]
})

export class ProductsPageComponent {

    svc=inject(ProductService);
    cart=inject(CartService);
    

    setQuery(v: string) { this.svc.query.set(v); }
    setSort(v: string) { this.svc.sortBy.set(v as 'name' | 'price'); }
    trackById =(_:number, p: {id:number}) => p.id; 
}
