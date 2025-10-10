import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { ProductService } from '../core/product.service';
import { SortByPipe } from '../shared/pipe/sort-by.pipe';
import { HighlightPipe } from '../shared/pipe/highlight.pipe';

@Component({
  selector: 'app-products-page',
  standalone: true,
  // Če pipe-a SortBy v templatu ne uporabljaš, ga lahko odstraniš iz imports
  imports: [NgFor, NgIf, CurrencyPipe, HighlightPipe, SortByPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Products</h2>

    <div style="display:flex; gap:0.5rem; margin-bottom:1rem">
      <input
        placeholder="Search..."
        [value]="svc.query()"
        (input)="setQuery(($event.target as HTMLInputElement).value)" />

      <select
        [value]="svc.sortBy()"
        (change)="setSort(($event.target as HTMLSelectElement).value)">
        <option value="name">Name</option>
        <option value="price">Price</option>
      </select>

      <button (click)="svc.load()">Reload</button>
    </div>

    <ul *ngIf="svc.filtered().length; else empty">
      <li *ngFor="let p of svc.filtered()">
        <span [innerHTML]="p.name | highlight: svc.query()"></span>
        - {{ p.price | currency:'EUR' }}
      </li>
    </ul>

    <ng-template #empty><p>No products found.</p></ng-template>
  `
})
export class ProductsPageComponent {
  constructor(public svc: ProductService) { this.svc.load(); }

  setQuery(v: string) { this.svc.query.set(v); }
  setSort(v: string)  { this.svc.sortBy.set(v as 'name' | 'price'); }
}
