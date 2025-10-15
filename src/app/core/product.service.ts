
import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';//token, s katerim ugotovimo, če teče na brskalniku ali SSR
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http'; //za klice, branje JSON
import { API_URL } from './tokens'; //nosi base URL-ja do API-ja
import { catchError, of } from 'rxjs';//lovi napake, vrača prazen seznam namesto crasha 
import type {Category} from './categories';//tipkovni import (Typecript samo za tipe)


export type Product = { id: number; name: string; price: number; category: Category; description?:string };//definicija tipov

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = inject(API_URL);   //vbrizgamo te, da vemo, če lako uporabljamo localStorage
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private storageKey = 'products-v1';//ime ključa v local storage

  products = signal<Product[]>([]); //hrani seznam izdelkov
  query = signal(''); //besedilo za iskanje 
  sortBy = signal<'name' | 'price'>('name'); //ime ali price, za sortiranje

  private norm (s:string){  //norm: zniža črke in odstrani šumnike (čšž->csz)
    return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  }
  
  //niz-->na besede, vrne array besed praznih elementov
  private wordsOf(s: string) {
  return this.norm(s)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

//filtrira imena in cene ter ti vrne novi seznam s njimi
  filtered = computed(() => {
  const q = this.norm(this.query().trim());
  const by = this.sortBy();

  const base = this.products().filter(p => {
    if (!q) return true;
    // match na ZAČETKU katerekoli besede v imenu
    return this.wordsOf(p.name).some(w => w.startsWith(q));
  });

  return [...base].sort((a, b) =>
    by === 'name' ? a.name.localeCompare(b.name) : a.price - b.price
  );
});

  constructor() { //ob ustvarjanju storitve takoj naloži podatke (samo v brskalniku, ne na serverju)
    if (this.isBrowser) this.load();
  }


  //najprej poskusi prebrati products iz localStorage  in jih nastavi v signal, če uspe-->return
  load() {
    if (this.isBrowser) {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        try {
          this.products.set(JSON.parse(raw)); 
          return;
        } catch {}
      }
    }

    //če ni veljavnega localStorage, naredi HTTP GET, ob napaki dobimo prazen seznam. v subscribe postavi produts in takoj shrani localStorage
    this.http.get<Product[]>(`${this.api}/products.json`).pipe(
      catchError(err => {
        console.error('failed to load products.json', err);
        return of<Product[]>([]);
      }),
    ).subscribe(list => {
      this.products.set(list);
      this.persist();
    });
  }
//da trenutno vrednost signala v localStorage
//ovito je s try/catch, da ne pade, če nekaj gre narobe
  private persist() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products()));
    } catch (e) {
      console.warn('persist failed', e);
    }
  }

 //dodajanje in brisanje produktov
  add(product: Omit<Product, 'id'>) {
    const nextId = (this.products().reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1;
    const newProduct: Product = { id: nextId, ...product, price: Number(product.price) };
    this.products.update(list => [...list, newProduct]);
    this.persist();
  }
//odstrani produkt z ujemajočim id
  remove(id: number) {
    this.products.update(list => list.filter(p => p.id !== id));
    this.persist();
  }
}
