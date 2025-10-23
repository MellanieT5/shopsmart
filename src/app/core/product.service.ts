import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import type { Category } from './categories';
import { environment } from '../../environment'; // <— POMEMBNO: 2 nivoja gor

export type Product = {
  id: number;
  name: string;
  price: number;
  category: Category | string;
  description?: string;
  imageData?: string;   // base64 iz obrazca (ostane za tvoj UI)
  imageUrl?: string;    // URL ki ga hrani DB/API
  stock?: number;
  active?: number;
  createdAt?: string;
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private baseUrl = `${environment.apiBaseUrl}/api/products`;

  // UI state
  products = signal<Product[]>([]);
  query = signal('');
  sortBy = signal<'name' | 'price'>('name');
  category = signal<Category | 'all'>('all');

  private storageKey = 'products-v1';

  constructor() {
    if (this.isBrowser) this.load();
    console.log('API baseUrl =', this.baseUrl);   // ⬅️ dodaj
    this.load();
  }

  // helpers (filtriranje/sort)
  private norm(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  private wordsOf(s: string) {
    return this.norm(s).split(/[^a-z0-9]+/i).filter(Boolean);
  }
  filtered = computed(() => {
    const q = this.norm(this.query().trim());
    const by = this.sortBy();
    const cat = this.category();
    const base = this.products().filter(p => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      return this.wordsOf(p.name).some(w => w.startsWith(q));
    });
    return [...base].sort((a, b) => (by === 'name' ? a.name.localeCompare(b.name) : a.price - b.price));
  });
  setCategory(v: Category | 'all') { this.category.set(v); }

  // pretvori Product -> payload za API
  private toApi(p: Partial<Product>) {
    return {
      name: p.name,
      category: (p.category as any) ?? null,
      price: p.price != null ? Number(p.price) : null,
      description: p.description ?? null,
      // če nimaš imageUrl, uporabimo imageData (base64) kot placeholder
      imageUrl: p.imageUrl ?? p.imageData ?? null,
      stock: p.stock ?? 0,
      active: p.active ?? 1
    };
  }

  // ----- API klici -----
  load() {
    this.http.get<Product[]>(this.baseUrl).pipe(
      catchError(err => {
        console.error('GET /api/products failed, using cache if available:', err);
        if (this.isBrowser) {
          const raw = localStorage.getItem(this.storageKey);
          if (raw) {
            try {
              const cached = JSON.parse(raw) as Product[];
              this.products.set(cached);
              return of(cached);
            } catch {}
          }
        }
        this.products.set([]);
        return of<Product[]>([]);
      })
    ).subscribe(list => {
  const normalized = list.map((p: any) => ({
    id:         p.id ?? p.ID,
    name:       p.name ?? p.NAME ?? '',
    category:   p.category ?? p.CATEGORY ?? '',
    price:      Number(p.price ?? p.PRICE ?? 0),
    description: p.description ?? p.DESCRIPTION ?? undefined,
    imageUrl:   p.imageUrl ?? p.IMAGEURL ?? p.IMAGE_URL ?? undefined,
    stock:      p.stock ?? p.STOCK ?? 0,
    active:     p.active ?? p.ACTIVE ?? 1,
    createdAt:  p.createdAt ?? p.CREATEDAT ?? p.CREATED_AT ?? undefined,
  }));

  this.products.set(normalized);
  this.persist();
});

  }

  // Admin tvoj klic: add(...) -> POST
  add(product: Omit<Product, 'id'>) {
    const body = this.toApi(product);
    this.http.post<Product>(this.baseUrl, body).pipe(
      catchError(err => {
        console.error('POST /api/products failed:', err);
        return of(null as any);
      })
    ).subscribe(created => {
      if (!created) return;
      this.products.update(list => [...list, created]);
      this.persist();
    });
  }

  // Uredi -> PUT
  update(next: Product) {
    const body = this.toApi(next);
    this.http.put<Product>(`${this.baseUrl}/${next.id}`, body).pipe(
      catchError(err => {
        console.error('PUT /api/products/:id failed:', err);
        return of(null as any);
      })
    ).subscribe(updated => {
      if (!updated) return;
      const list = this.products();
      const idx = list.findIndex(p => p.id === next.id);
      if (idx === -1) return;
      const copy = [...list];
      copy[idx] = { ...copy[idx], ...updated };
      this.products.set(copy);
      this.persist();
    });
  }

  // Briši -> DELETE
  remove(id: number) {
    this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error('DELETE /api/products/:id failed:', err);
        return of(null);
      })
    ).subscribe(() => {
      this.products.update(list => list.filter(p => p.id !== id));
      this.persist();
    });
  }

  // cache
  private persist() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products()));
    } catch (e) {
      console.warn('persist failed', e);
    }
  }
}
