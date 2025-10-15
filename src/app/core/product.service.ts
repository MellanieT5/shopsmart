// src/app/core/product.service.ts
import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './tokens';
import { catchError, of } from 'rxjs';
import type {Category} from './categories';


export type Product = { id: number; name: string; price: number; category: Category; description?:string };

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = inject(API_URL);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private storageKey = 'products-v1';

  products = signal<Product[]>([]);
  query = signal('');
  sortBy = signal<'name' | 'price'>('name');

  private norm (s:string){
    return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  }
  
  private wordsOf(s: string) {
  return this.norm(s)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}


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

  constructor() {
    if (this.isBrowser) this.load();
  }


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

  private persist() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products()));
    } catch (e) {
      console.warn('persist failed', e);
    }
  }

  /** API za komponento: dodaj in briši */
  add(product: Omit<Product, 'id'>) {
    const nextId = (this.products().reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1;
    const newProduct: Product = { id: nextId, ...product, price: Number(product.price) };
    this.products.update(list => [...list, newProduct]);
    this.persist();
  }

  remove(id: number) {
    this.products.update(list => list.filter(p => p.id !== id));
    this.persist();
  }
}
