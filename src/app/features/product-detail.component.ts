import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { AsyncPipe, CurrencyPipe, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService, type Product } from '../core/product.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [NgIf, RouterLink, CurrencyPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
       /* features.scss (dodaš spodaj) */
.product-detail {
  .wrap { max-width: 980px; margin: 1.25rem auto; padding: 0 1rem; }
  .back { display: inline-block; margin-bottom: .75rem; opacity: .85; }
  .row { display: grid; grid-template-columns: 1fr 1.4fr; gap: 1rem; align-items: start; }
  .imgbox { width: 100%; aspect-ratio: 1/1; border-radius: 12px; background: #f3f4f6; }
  .meta { opacity: .85; margin: .25rem 0 .5rem; }
  .desc { margin-top: .75rem; opacity: .95; white-space: pre-wrap; }
  @media (max-width: 820px) { .row { grid-template-columns: 1fr; } .imgbox { height: 220px; } }
}
    `],
    template: `
<ng-template #notFound>
  <div class="product-detail">
    <div class="wrap">
      <a class="back" routerLink="/products">← Back to products</a>
      <p>Product not found.</p>
    </div>
  </div>
</ng-template>

<div class="product-detail" *ngIf="prod() as p; else notFound">
  <div class="wrap">
    <a class="back" routerLink="/products">← Back to products</a>

    <div class="row">
      <div class="imgbox">
        <img
          [src]="svc.resolveImage(p.imageUrl || p.imageData)"
          [alt]="p.name"
          (error)="onImgError($event)" />
      </div>

      <div class="info">
        <h1 class="title">{{ p.name }}</h1>

        <div class="badges">
          <span class="badge cat">{{ p.category }}</span>
          <span class="badge price">{{ p.price | currency:'EUR' }}</span>
        </div>

        <p class="desc" *ngIf="p.description as d">{{ d }}</p>
      </div>
    </div>
  </div>
</div>
    `,
})
export class ProductDetailComponent {
    private route = inject(ActivatedRoute);
    svc = inject(ProductService);

    private id = computed(() => Number(this.route.snapshot.paramMap.get('id')));

    product = computed<Product | undefined>(() =>
        this.svc.products().find(p => p.id === this.id())
    );

    private paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

    prod = computed(() => {
        const id = Number(this.paramMap().get('id'));
        if (Number.isNaN(id)) return null;
        return this.svc.products().find(p => p.id === id) ?? null;
    });

    onImgError(event: Event) {
        (event.target as HTMLImageElement).src = 'assets/no-image.png';
    }
}
