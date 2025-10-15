//prikazuje izdelke

import { ChangeDetectionStrategy, Component } from "@angular/core"; 
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';//NgIf, NgFor sta direktivi za if/for v templatu, CurrencyPipe lepo formatira št. kot EUR
import { ProductService } from '../core/product.service';//je vir podatkov (signali: products/query/filtered)
import { HighlightPipe } from "../shared/pipe/highlight.pipe";//poudari  ujemanje iskanje v imenu 
import{RouterLink} from '@angular/router'; //za linke na /products/:id
import { CartService } from "../core/cart.service";//za add to cart in favorites
import { inject } from "@angular/core"; //za DI brez konstruktorja


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
        </div> <!--prebere trenutne vrednosti iz signala svc.query(), on input kličemo setQuery, ki nastavi signal ||'' poskrbim da nikoli ne nastavi null/undefined-->
        <!--value veže na svc.sortBy(), change prebere vrednost iz DOM targeta $any je TS hack, da ne benti nad tipom targeta.-->
        <!-- reload ponovno naloži podatke (najprej iz localStorage, sicer iz /products.json - logika v servisu) -->


        
        <ul *ngIf = "svc.filtered().length; else empty"><!--prikazuje seznam samo, če filtrirani produkti niso prazni. (filtrira->query, sortira->sortBy) -->
            <li *ngFor = "let p of svc.filtered(); trackBy: trackById" style="display:flex; gap:.5rem;"> <!--ponovi element za vsak produkt-->
                
                <a [routerLink] = "['/products', p.id]"> <!--vodi na productDetailComponent za ta id-->
                    <span [innerHTML]="p.name | highlight:svc.query()"> </span> <!--highlight pipe vrne HTML z označenim ujemanjem, zato uporabiš innerHTML-->
                </a> 
                -{{p.price | currency: 'EUR'}} - {{p.category}}

                <button type= "button" (click)="svc.remove(p.id)">Remove </button>

                <button type ="button" (click)="cart.add(p.id,1)">Add to cart </button>

                 <button type="button"
                [attr.aria-pressed]="cart.isFav(p.id)" 
                (click)="cart.toggleFav(p.id)"
                class="heart"
                [class.active]="cart.isFav(p.id)"><!--attr... izboljša dostopnost(toggle button)
                class active  doda CSS, ko je v favs
                click=cart.... doda/odstrani in najljubših-->
          ♥
        </button>

            </li>
        </ul>

        <ng-template #empty><p>No products found. </p></ng-template>
    
    `,
    styles:[`//osnovni videz srčka
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
    

    setQuery(v: string) { this.svc.query.set(v); } //setQuery, setSort sta kratki helperj, ki nastavljata signals v ProductService
    setSort(v: string) { this.svc.sortBy.set(v as 'name' | 'price'); }
    trackById =(_:number, p: {id:number}) => p.id; //poskrbi, da angular sledi elementom po id (bolj učinkovito renderiranje)
}
