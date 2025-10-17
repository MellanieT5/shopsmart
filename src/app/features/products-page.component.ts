// prikazuje izdelke + price range filter (brez spreminjanja ProductService)

import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { ProductService, type Product } from '../core/product.service';
import { CartService } from '../core/cart.service';
import { HighlightPipe } from '../shared/pipe/highlight.pipe';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, CurrencyPipe, HighlightPipe, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Products</h2>

    <div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; margin:.5rem 0;">
      <input
        #q
        placeholder="Search..."
        [value]="svc.query()"
        (input)="setQuery(q.value || '')" />

      <select
        [value]="svc.sortBy()"
        (change)="setSort($any($event.target).value)">
        <option value="name">Name</option>
        <option value="price">Price</option>
      </select>

      <button (click)="svc.load()">Reload</button>

      <!-- Price range -->
      <span style="margin-left:1rem; opacity:.75">Price:</span>
      <input type="number" [formControl]="form.controls.min" [attr.min]="pmin()" [attr.max]="pmax()" style="width:7rem; padding:.35rem" />
      <span>–</span>
      <input type="number" [formControl]="form.controls.max" [attr.min]="pmin()" [attr.max]="pmax()" style="width:7rem; padding:.35rem" />
      <button type="button" (click)="resetRange()" style="padding:.35rem .6rem; border-radius:8px;">Reset</button>

      <span style="opacity:.7; margin-left:.5rem">({{ filtered().length }} found)</span>
    </div>

    <ul *ngIf="filtered().length; else empty">
      <li *ngFor="let p of filtered(); trackBy: trackById" style="display:flex; gap:.5rem; align-items:center;">
        <a [routerLink]="['/products', p.id]">
          <span [innerHTML]="p.name | highlight: svc.query()"></span>
        </a>
        — {{ p.price | currency:'EUR' }} — {{ p.category }}

        <button type="button" (click)="svc.remove(p.id)">Remove</button>
        <button type="button" (click)="cart.add(p.id, 1)">Add to cart</button>

        <button
          type="button"
          [attr.aria-pressed]="cart.isFav(p.id)"
          (click)="cart.toggleFav(p.id)"
          class="heart"
          [class.active]="cart.isFav(p.id)">
          ♥
        </button>
      </li>
    </ul>

    <ng-template #empty><p>No products in this range.</p></ng-template>
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

  // surovi produkti iz servisa
  products = this.svc.products;

  // min / max izračunana iz kataloga
  pmin = computed(() => {
    const arr = this.products().map(p => p.price);
    return arr.length ? Math.min(...arr) : 0;
  });
  pmax = computed(() => {
    const arr = this.products().map(p => p.price);
    return arr.length ? Math.max(...arr) : 0;
  });

  // formular za price range
  form = this.fb.nonNullable.group({
    min: [0],
    max: [0],
  });

  constructor() {
    // nastavi začetni range na celoten razpon cen
    this.form.patchValue({ min: this.pmin(), max: this.pmax() }, { emitEvent: false });
  }

  // lokalni filter: najprej uporabi servisov filtered() (query + sort),
  // nato dodatno filtriraj po cenovnem rangu
  filtered = computed<Product[]>(() => {
    const base = this.svc.filtered(); // že upošteva query + sort
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
}
