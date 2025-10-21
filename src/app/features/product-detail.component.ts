import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIf, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService, type Product } from '../core/product.service';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgIf, RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .product-detail .wrap{max-width:980px;margin:1.25rem auto;padding:0 1rem}
    .product-detail .back{display:inline-block;margin-bottom:.75rem;opacity:.85}
    .product-detail .row{display:grid;grid-template-columns:1fr 1.4fr;gap:1rem;align-items:start}
    .product-detail .imgbox{width:100%;aspect-ratio:1/1;border-radius:12px;background:#f3f4f6}
    .product-detail .meta{opacity:.85;margin:.25rem 0 .5rem}
    .product-detail .desc{margin-top:.75rem;opacity:.95;white-space:pre-wrap}
    @media (max-width:820px){.product-detail .row{grid-template-columns:1fr}.product-detail .imgbox{height:220px}}
  `],
  template: `
  <div class="product-detail">
    <div class="wrap" *ngIf="prod() as p; else nf">
      <a class="back" routerLink="/products">← Back to products</a>

      <div class="row">
        <div>
          <img *ngIf="p.imageData as img"
               [src]="img" [alt]="p.name"
               style="max-width:320px;border-radius:12px;border:1px solid #eee;display:block;margin:.5rem 0" />
        </div>

        <div>
          <h1>{{ p.name }}</h1>
          <div class="meta">{{ p.category }} • {{ p.price | currency:'EUR' }}</div>
          <p class="desc" *ngIf="p.description as d; else noDesc">{{ d }}</p>
          <ng-template #noDesc><span class="desc">-</span></ng-template>

          <div class="actions" style="margin-top:.75rem">
            <button class="btn" (click)="cart.add(p.id, 1)">Add to cart</button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #nf>
      <div class="wrap">
        <a class="back" routerLink="/products">← Back to products</a>
        <p>Product not found.</p>
      </div>
    </ng-template>
  </div>
  `
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(ProductService);
  cart = inject(CartService);

  private paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  prod = computed<Product | null>(() => {
    const id = Number(this.paramMap().get('id'));
    if (Number.isNaN(id)) return null;
    return this.svc.products().find(p => p.id === id) ?? null;
  });
}
