import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import {AsyncPipe, CurrencyPipe,NgIf} from '@angular/common';
import { ActivatedRoute, RouterLink } from "@angular/router";
import{toSignal} from '@angular/core/rxjs-interop';           //importaš
import {ProductService} from '../core/product.service';



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
   <div class="wrap" *ngIf="prod(); else notFound">
  <a class="back" routerLink="/products">← Back to products</a>

  <div class="row">
    <div class="img"><!-- sliko bom dala kasneje --></div>

    <div>
      <h1>{{ prod()!.name }}</h1>

      <div class="meta">
        {{ prod()!.category }} • {{ prod()!.price | currency:'EUR' }}
      </div>

      <p class="desc" *ngIf="prod()!.description as d">{{ d }}</p>
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
    private route=inject(ActivatedRoute);
    private svc = inject (ProductService);

    private paramMap = toSignal (this.route.paramMap, {initialValue:this.route.snapshot.paramMap})

    prod= computed (()=>{
        const id =Number (this.paramMap().get('id'));
        if (Number.isNaN (id)) return null;
        return this.svc.products().find(p=>p.id === id) ?? null;
    });
}

