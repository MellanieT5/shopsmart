import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import {AsyncPipe, CurrencyPipe,NgIf} from '@angular/common';
import { ActivatedRoute, RouterLink } from "@angular/router";
import{toSignal} from '@angular/core/rxjs-interop';           //importaš
import {ProductService, type Product} from '../core/product.service';



@Component({ //komponent
    selector: 'app-product-detail', //za html
    standalone:true,
    imports:[NgIf, RouterLink, CurrencyPipe],
    changeDetection:ChangeDetectionStrategy.OnPush,
    styles: [`
        .wrap{max-width:780px;margin:1.25rem auto; padding:1rem}
        .back{display:inline-block; margin-bottom:.75rem;opacity:.85;}
        .row{display:flex; gap:1rem; align-items:flex-start;}
        .img{width:240px; height: 240px; border-radius:0.75}
        h1 {font-size:1.6rem; margin:0 0 .25rem;}
        .meta{opacity:.85;}
        .desc{margin-top:1rem;opacity:.95; white-space:pre-wrap;}
        @media (max-width:700px) { .row {flex-direction:column;} .img {width:100%; height: 200px}}
        
        `],

    template: `

<<div class="wrap" *ngIf="prod() as p; else notFound">
  <a class="back" routerLink="/products">← Back to products</a>

  <div class="row">
    <div class="img"></div>

    <div>
      <h1>{{ p.name }}</h1>
      <div class="meta">
        {{ p.category }} • {{ p.price | currency:'EUR' }}
      </div>

      <img *ngIf="p.imageData as img"
           [src]="img"
           [alt]="p.name"
           style="max-width:320px; border-radius:12px; border:1px solid #eee; display:block; margin:.5rem 0" />

      <p class="desc" *ngIf="p.description as d">{{ d }}</p>
    </div>
  </div>
</div>

<ng-template #notFound>
  <div class="wrap">
    <a class="back" routerLink="/products">← Back to products</a>
    <p>Product not found.</p>
  </div>
</ng-template>

    `,
})

export class ProductDetailComponent {
    private route=inject(ActivatedRoute); //vbrizgaš trenutno aktivno ruto in service produktov
    private svc = inject (ProductService);

    private id=computed(()=>Number(this.route.snapshot.paramMap.get('id')));

    product= computed<Product |undefined>(()=> 
    this.svc.products().find(p=>p.id === this.id()))

    private paramMap = toSignal (this.route.paramMap, {initialValue:this.route.snapshot.paramMap})
  //route.paraMap je observable, toSignal ga spremeni v signal, da ga lahko bereš kot funkcijo paramMap

    prod= computed (()=>{ //izpeljan signal: odvisen je od paramMap in od svc.products
        const id =Number (this.paramMap().get('id'));
        if (Number.isNaN (id)) return null; //najprej parsiraš id iz rute, če ni št. null
        return this.svc.products().find(p=>p.id === id) ?? null;//poiščeš produkt po id, če ga ni vrneš null
    });
}

