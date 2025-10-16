//centralno hrani košarico in favorites

import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; 
import { ProductService } from './product.service';
import {Product} from './product.service';


export type CartItem = { productId: number; qty: number };  
export type toggleFav ={}
@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private storageCart = 'cart-v1';
  private storageFavs = 'favs-v1';

  private products = inject(ProductService);

  
  items = signal<CartItem[]>([]); //hrani vrstico košarice (ID izdelka+količina)
  favorites = signal<number[]>([]); //hrani favorites (ID favorites)


  lines= computed(()=>{
    const map= new Map(this.products.products(). map(p=> [p.id, p]));
    return this.items().map(it=> {
        const product = map.get(it.productId);
        return product
        ? {product, qty:it.qty, lineTotal: product.price * it.qty}
        :null;
    }).filter((x): x is NonNullable<typeof x> => !!x);
    });

    favoriteLines = computed (()=> {
      const map = new Map (this.products.products().map(p=>[p.id, p]));
      return this.favorites()
       .map(id=> map.get(id))
       .filter((p): p is Product=> !!p);
    });


  constructor() { //ob zagonu preberemo prejšnje stanje in ga nastavimo v signale, po reloadu se ohrani
    if (!this.isBrowser) return;
    try {
      const rawCart = localStorage.getItem(this.storageCart);
      const rawFavs = localStorage.getItem(this.storageFavs);
      if (rawCart) this.items.set(JSON.parse(rawCart));
      if (rawFavs) this.favorites.set(JSON.parse(rawFavs));
    } catch {}
  }

  private persist() { // za shranjevanje 
    if (!this.isBrowser) return;
    localStorage.setItem(this.storageCart, JSON.stringify(this.items()));
    localStorage.setItem(this.storageFavs, JSON.stringify(this.favorites()));
  }

  
  add(productId: number, qty = 1) {
    this.items.update(list => {
      const i = list.findIndex(x => x.productId === productId);
      if (i >= 0) { //če že obstaja, poveča qty
        const next = [...list];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      } //nov vnos
      return [...list, { productId, qty }];
    });
    this.persist();
  }

  //nastavi novo količino, če je <= odstrani iz košarice
  setQty(productId: number, qty: number) {
    this.items.update(list => {
      if (qty <= 0) return list.filter(x => x.productId !== productId); 
      return list.map(x => (x.productId === productId ? { ...x, qty } : x));
    });
    this.persist();
  }

  //filtrira in remova iz košarice
  remove(productId: number) {
    this.items.update(list => list.filter(x => x.productId !== productId));
    this.persist();
  }

  //filtrira in izprazni košarico
  clear() {
    this.items.set([]);
    this.persist();
  }

  //vsota količine
  count = computed(() => this.items().reduce((m, x) => m + x.qty, 0));

  //vzame ceno iz ProductService in jo zmnoži s količino
  total = computed(() => {
    const map = new Map(this.products.products().map(p => [p.id, p]));
    return this.items().reduce((sum, it) => {
      const p = map.get(it.productId);
      return p ? sum + p.price * it.qty : sum;
    }, 0);
  });

  //prikazuje stanje (prazen/ ali poln 💖)
  isFav(id: number) {
    return this.favorites().includes(id);
  }

  //doda/odstrani ID iz seznama in shrani 
  toggleFav(id: number) {
    this.favorites.update(list =>
      list.includes(id) ? list.filter(x => x !== id) : [...list, id]
    );
    this.persist();
  }
}
