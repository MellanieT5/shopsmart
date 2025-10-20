import { Component, ChangeDetectionStrategy, inject, ViewEncapsulation } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../core/cart.service';
import { HistoryService } from '../core/history.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation:ViewEncapsulation.None,

   styles: [`
    .wrap { max-width: 920px; margin: 1rem auto; display: grid; gap: 1rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:1rem; box-shadow:0 8px 24px rgba(0,0,0,.04); }
    .row  { display:flex; gap:.5rem; align-items:center; }
    .muted { opacity:.75; }
    .actions { display:flex; gap:.6rem; justify-content:flex-end; margin-top:1rem; }
    .btn { background:#4f6ef7; color:#fff; border:none; padding:.55rem .9rem; border-radius:10px; cursor:pointer; }
    .btn.secondary { background:#eef2ff; color:#374151; }
    .btn:disabled { opacity:.55; cursor:not-allowed; }
    input, select { width:100%; padding:.55rem .6rem; border:1px solid #d1d5db; border-radius:10px; font:inherit; }
    label { font-weight:600; font-size:.92rem; }
    .err { color:#dc2626; font-size:.82rem; }
    .confetti { position: fixed; top:-10px; left:0; width:100%; pointer-events:none; z-index:2000; }
    .confetti i { position:absolute; width:10px; height:14px; will-change: transform, opacity; opacity:0; }
    @keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity:1; } 100% { transform: translateY(110vh) rotate(720deg); opacity:0; } }
    .thanks { font-size: 1.1rem; font-weight:700; color:#10b981; margin-top:.75rem; text-align:center; }
  `],
  template: `
  <div class="wrap">
    <h2>Checkout</h2>

    <div class="grid-2">
      <!-- LEFT: naslov + opcije -->
      <form class="card" [formGroup]="form" (ngSubmit)="placeOrder()">
        <div class="grid-2">
          <div>
            <label>Ime</label>
            <input formControlName="firstName" placeholder="Ana" />
            <div class="err" *ngIf="t('firstName').touched && t('firstName').invalid">Obvezno polje</div>
          </div>
          <div>
            <label>Priimek</label>
            <input formControlName="lastName" placeholder="Novak" />
            <div class="err" *ngIf="t('lastName').touched && t('lastName').invalid">Obvezno polje</div>
          </div>
        </div>

        <div>
          <label>Naslov</label>
          <input formControlName="address" placeholder="Glavna ulica 1" />
          <div class="err" *ngIf="t('address').touched && t('address').invalid">Obvezno polje</div>
        </div>

        <div class="grid-2">
          <div>
            <label>Mesto</label>
            <input formControlName="city" placeholder="Maribor" />
            <div class="err" *ngIf="t('city').touched && t('city').invalid">Obvezno polje</div>
          </div>
          <div>
            <label>Poštna številka</label>
            <input formControlName="postal" placeholder="2000" />
            <div class="err" *ngIf="t('postal').touched && t('postal').invalid">4–6 številk</div>
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label>Dostava</label>
            <select formControlName="shipping">
              <option value="home">Pošiljanje na dom</option>
              <option value="pickup">Osebni prevzem</option>
              <option value="locker">Paketomat</option>
            </select>
          </div>
          <div>
            <label>Plačilo</label>
            <select formControlName="payment">
              <option value="card">Kartica (fake)</option>
              <option value="cod">Po povzetju</option>
              <option value="paypal">PayPal (fake)</option>
            </select>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn secondary" (click)="back()">Nazaj</button>
          <button class ="btn" type="submit" [disabled]="!canBuy()"> Kupi </button>
        </div>


        <div *ngIf="done" class="thanks">🎉 Hvala za nakup! 🎉</div>
      </form>

      <!-- RIGHT: povzetek košarice -->
      <div class="card">
        <div *ngIf="cart.lines().length; else empty">
          <div *ngFor="let line of cart.lines()" class="row" style="padding:.25rem 0">
            <strong>{{ line.product.name }}</strong>
            <span class="muted">— {{ line.product.price | currency:'EUR' }} × {{ line.qty }}</span>
            <span style="margin-left:auto">= <strong>{{ line.lineTotal | currency:'EUR' }}</strong></span>
          </div>

          <div class="row" style="border-top:1px dashed #e5e7eb; margin-top:.5rem; padding-top:.5rem">
            <span class="muted">Skupaj</span>
            <span style="margin-left:auto; font-weight:700">{{ total() | currency:'EUR' }}</span>
          </div>
        </div>
        <ng-template #empty>
          <div>Košarica je prazna.</div>
        </ng-template>
      </div>
    </div>
  </div>

  <div class="confetti" #confettiHost></div>
  `
  
  
  
})
export class CheckoutPageComponent {
  cart = inject(CartService);
  router = inject(Router);
  history=inject(HistoryService);


back() {
    this.router.navigateByUrl('/cart');
}




  fb=inject(FormBuilder);

  done = false;

form=this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    city:['', Validators.required],
    postal:  ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]],
    shipping:['home', Validators.required],
    payment: ['card', Validators.required],
});

t=(k:keyof typeof this.form.controls) => this.form.controls[k];
total= () => this.cart.total();

canBuy(){
    return this.form.valid && this.cart.lines().length > 0;
}

placeOrder(){
  if(!this.canBuy()) {
    this.form.markAllAsTouched();
    return;
  }

  //da morajo vstavit osebne podatke
  const v=this.form.getRawValue();
  const order={
    date: new Date().toISOString(),
    total:this.cart.total(),
    itemCount:this.cart.lines().length,
    customer: {
      firstName: v.firstName,
      lastName: v.lastName,
      address:v.address,
      city:v.city,
      postal:v.postal,
      shipping:v.shipping,
      payment:v.payment,
    },

    items:this.cart.lines().map(l=> ({
      id:l.product.id,
      name:l.product.name,
      price:l.product.price,
      qty:l.qty,
      imageData:l.product.imageData,
    })),
  };
//shrani v zgodovino, ki je še trenutno nimam narejene
  this.history.add(order);

//pokaže koneti ter sporočlo
   this.launchConfetti();
   this.done=true;

  //počisti in preosmeri
   setTimeout(()=> {
    this.cart.clear();
    this.router.navigate (['/history']); 
  }, 3500); 
}
   



launchConfetti() {
  // Ustvari host direktno na body (ne zanašaj se na .confetti v templatu)
  const host = document.createElement('div');
  Object.assign(host.style, {
    position: 'fixed',
    top: '-10px',
    left: '0',
    width: '100%',
    height: '0px',
    pointerEvents: 'none',
    zIndex: '99999',
  } as CSSStyleDeclaration);
  document.body.appendChild(host);

  // poskrbi za @keyframes, če še ne obstaja
  const STYLE_ID = 'confetti-fall-keyframes';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes confetti-fall {
        0%   { transform: translateY(-10vh) rotate(0deg);   opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  const colors = ['#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6'];
  const W = window.innerWidth;
  const N = 140;

  for (let i = 0; i < N; i++) {
    const e = document.createElement('i');
    const size = 6 + Math.random() * 10;
    const left = Math.random() * W;
    const delay = Math.random() * 0.4;
    const duration = 1.8 + Math.random() * 1.6;

    Object.assign(e.style, {
      position: 'absolute',
      willChange: 'transform,opacity',
      background: colors[i % colors.length],
      left: `${left}px`,
      width: `${size}px`,
      height: `${size * 1.4}px`,
      transform: 'translateY(-10vh)',
      animation: `confetti-fall ${duration}s ease-in forwards`,
      animationDelay: `${delay}s`,
    } as CSSStyleDeclaration);

    host.appendChild(e);
  }

  // Po 3s pospravi host (čistimo DOM)
  setTimeout(() => host.remove(), 3000);
}


}
 
