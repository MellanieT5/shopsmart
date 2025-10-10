//prikazuje izdelke

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';// dodaš importe 
import { ProductService } from '../core/product.service';
import { HighlightPipe } from "../shared/pipe/highlight.pipe";

@Component({ //vstavimo komponento
    selector: 'app-products-page', //ime za HTML
    standalone: true, //lahko damo v module
    imports: [NgFor, NgIf, CurrencyPipe, HighlightPipe], // še več importov 
    changeDetection: ChangeDetectionStrategy.OnPush, //naj preglda samo dejanske spremembe 
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

        <ul *ngIf= "svc.filtered().length; else empty">
            <li *ngFor="let p of svc.filtered()">
                <span [innerHTML]= "p.name | highlight:svc.query()"> </span>
                - {{p.price|currency: 'EUR'}}
            </li>
        </ul>

        <ng-template #empty><p>No products found. </p></ng-template>
    `
})

export class ProductsPageComponent {
    constructor(public svc: ProductService) {
        this.svc.load()
    }

    setQuery(v: string) { this.svc.query.set(v); }
    setSort(v: string) { this.svc.sortBy.set(v as 'name' | 'price'); }

}
