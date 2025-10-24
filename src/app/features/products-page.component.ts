// prikazuje izdelke + price range filter (brez spreminjanja ProductService)

import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {CATEGORIES, type Category} from '../core/categories';
import { ProductService, type Product } from '../core/product.service';
import { CartService } from '../core/cart.service';
import { HighlightPipe } from '../shared/pipe/highlight.pipe';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [NgFor, RouterLink, CurrencyPipe, HighlightPipe, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="topbar">
    <h2 class="page-title container">Products</h2>
  </div>

<div class="container filters">
  <input
    #q
    class="input"
    placeholder="Search..."
    [value]="svc.query()"
    (input)="setQuery(q.value || '')"
  />

<select
  class="input"
  [value]="svc.sortBy()"
  (change)="onSortChange($event)">
  <option value="name">Name</option>
  <option value="price">Price</option>
</select>

<select 
  class="input"
  [value]="svc.category()"
  (change)="svc.setCategory($any($event.target).value ||'all')">
  <option value="all"> All categories </option>
  <option *ngFor= "let c of categories" [value]="c"> {{c}}</option>
</select>

  <div class="price-range">
    <label>Price:</label>
    <input class="input input--num" type="number"
           [value]="form.value.min ?? pmin()"
           (input)="form.patchValue({ min: +$any($event.target).value })" />
    <span>–</span>
    <input class="input input--num" type="number"
           [value]="form.value.max ?? pmax()"
           (input)="form.patchValue({ max: +$any($event.target).value })" />
    <button class="btn btn-secondary" type="button" (click)="resetRange()">Reset</button>
  </div>

  <button class="btn" type="button" (click)="svc.load()">Reload</button>
  <span class="results">({{ filtered().length }} found)</span>
</div>

<div class="container grid">
  <div *ngFor="let p of filtered(); trackBy: trackById" class="product-card">
    <a [routerLink]="['/products', p.id]" class="product-link">
      <img
        [src]="svc.resolveImage(p.imageUrl || p.imageData)"
        [alt]="p.name"
        class="product-img"
        (error)="onImgError($event)" />

      <h3 class="product-name" [innerHTML]="p.name | highlight: svc.query()"></h3>
    </a>

    <div class="product-meta">
      <span class="product-price">{{ p.price | currency:'EUR' }}</span>
      <span class="dot">•</span>
      <span class="product-category">{{ p.category }}</span>
    </div>

    <div class="product-actions">
      <button class="btn" type="button" (click)="cart.add(p.id, 1)">Add to cart</button>
      <button type="button"
              [attr.aria-pressed]="cart.isFav(p.id)"
              (click)="cart.toggleFav(p.id)"
              class="heart"
              [class.active]="cart.isFav(p.id)">
        ♥
      </button>
    </div>
  </div>
</div>

<ng-template #empty>
  <div class="container"><p>No products found.</p></div>
</ng-template>

  `,
  styles: [`
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
  svc = inject(ProductService);
  cart = inject(CartService);
  fb = inject(FormBuilder);
  categories=CATEGORIES

  onSortChange(ev:Event){
    const v= (ev.target as HTMLSelectElement).value as 'name'|'price';
    this.svc.sortBy.set(v);
  }

  onCategoryChange(ev:Event) {
    const v= (ev.target as HTMLSelectElement).value as Category | 'all';
    this.svc.setCategory(v);
  }

  products = this.svc.products;
  pmin = computed(() => {
    const arr = this.products().map(p => p.price);
    return arr.length ? Math.min(...arr) : 0;
  });
  pmax = computed(() => {
    const arr = this.products().map(p => p.price);
    return arr.length ? Math.max(...arr) : 0;
  });

  form = this.fb.nonNullable.group({
    min: [0],
    max: [0],
  });

  constructor() {
    this.form.patchValue({ min: this.pmin(), max: this.pmax() }, { emitEvent: false });
  }

  filtered = computed<Product[]>(() => {
    const base = this.svc.filtered();
    const min = Number(this.form.value.min ?? this.pmin());
    const max = Number(this.form.value.max ?? this.pmax());
    return base.filter(p => p.price >= min && p.price <= max);
  });

  resetRange() {
    this.form.patchValue({ min: this.pmin(), max: this.pmax() });
  }

  setQuery(v: string) { this.svc.query.set(v); }
  setSort(v: string) { this.svc.sortBy.set(v as 'name' | 'price'); }

  trackById = (_: number, p: Product) => p.id;

  setCategory(v:string) {
    this.svc.category.set((v as Category) ||'all')
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/no-image.png';
  }
}
