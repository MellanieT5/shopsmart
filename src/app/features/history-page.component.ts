// src/app/features/history-page.component.ts
import { Component, signal, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { HistoryService, OrderHistoryItem } from '../core/history.service';
import {Router} from '@angular/router'; 
import { ProductService } from '../core/product.service';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, DatePipe, SlicePipe],
  template: `
  <div class="container">
    <button class="btn secondary" (click)="goBack()">← Back</button>
    <h2>Order history</h2>

    <div *ngIf="svc.history().length; else empty" class="history-list">
      <div class="history-card" *ngFor="let o of svc.history()">
        <div class="history top">
          <div class="history date">{{ o.date | date:'medium' }}</div>
          <div class="history-total">{{ o.total | currency:'EUR' }}</div>
        </div>

        <div class="history-items-preview">
          <img *ngFor="let it of o.items | slice:0:4"
               [src]="ps.resolveImage(it.imageData || it.imageData)"
               class="preview-img" [alt]="it.name" (error)="onImgError($event)" />
          <span class="more" *ngIf="o.items.length > 4">+{{ o.items.length - 4 }} more</span>
        </div>

        <div class="history-actions">
          <button class="btn" (click)="open(o)">Details</button>
          <button class="btn btn-secondary" (click)="remove(o.id)">Remove</button>
        </div>
      </div>
    </div>

    <ng-template #empty><p>No orders yet.</p></ng-template>
  </div>

  <div *ngIf="sel()" class="drawer">
    <div class="drawer-card">
      <div class="drawer-top">
        <strong>Order</strong>
        <button class="btn btn-secondary" (click)="close()">Close</button>
      </div>

      <div class="muted">{{ sel()!.date | date:'medium' }}</div>
      <div style="margin:.4rem 0 1rem"><strong>Total: {{ sel()!.total | currency:'EUR' }}</strong></div>

      <div class="items">
        <div class="row" *ngFor="let it of sel()!.items">
          <img [src]="ps.resolveImage(it.imageData || it.imageData)" class="preview-img" [alt]="it.name" (error)="onImgError($event)" />
          <div class="info">
            <div class="name">{{ it.name }}</div>
            <div class="muted">{{ it.price | currency:'EUR' }} × {{ it.qty }}</div>
          </div>
          <div class="sum">{{ (it.price * it.qty) | currency:'EUR' }}</div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .drawer{ position:fixed; inset:0; background:rgba(0,0,0,.35); display:grid; place-items:center; padding:1rem; z-index:50; }
    .drawer-card{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; max-width:720px; width:100%; padding:1rem; }
    .drawer-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
    .items .row{ display:grid; grid-template-columns: 56px 1fr auto; gap:.6rem; align-items:center; padding:.4rem 0; }
    .items .row + .row{ border-top:1px solid #e5e7eb; }
    .items .info .name{ font-weight:700; }
    .items .sum{ font-weight:800; }
  `]
})
export class HistoryPageComponent {
  constructor(public svc: HistoryService, private router:Router) {}
  sel = signal<OrderHistoryItem | null>(null);
  ps = inject(ProductService);
  open(o: OrderHistoryItem) { this.sel.set(o); }
  close() { this.sel.set(null); }
  remove(id:number){ this.svc.remove(id); if (this.sel()?.id === id) this.close(); }

  goBack(){
    this.router.navigate(['/products']);
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/no-image.png';
  }
}
