import { Injectable, signal } from '@angular/core';

export interface OrderHistoryItem {
  id: number;           
  date: string;         
  total: number;        
  itemCount: number;   
  items: Array<{
    id: number;
    name: string;
    price: number;
    qty: number;
    imageData?: string;
  }>;
  //podatki kupca
  customer?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postal: string;
    shipping: string;
    payment: string;
  };
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private key = 'shop_history_v1';
  private _history = signal<OrderHistoryItem[]>(this.load());

//samo za branje v komponentah
  history = this._history.asReadonly();

  private load(): OrderHistoryItem[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  private save() {
    localStorage.setItem(this.key, JSON.stringify(this._history()));
  }

  add(order: Omit<OrderHistoryItem, 'id'>) {
    const withId: OrderHistoryItem = { id: Date.now(), ...order };
    this._history.update(h => [withId, ...h]);
    this.save();
  }

  remove(id: number) {
    this._history.update(h => h.filter(o => o.id !== id));
    this.save();
  }

  clear() {
    this._history.set([]);
    this.save();
  }
}
