import{Injectable, inject, signal, computed} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_URL} from './tokens';

export type Product = {id:number; name: string; price: number; category: string};

@Injectable ({providedIn: 'root'})
 export class ProductSerice {
    private http=inject (HttpClient);
    private api= inject (API_URL);

    products=signal<Product []>([]);
    query = signal ('');
    sortBy = signal<'name' | 'price'> ('name');

    filtered = computed (()=> {
        const q = this.query().toLowerCase();
        const base=this.products().filter(p=> p.name.toLowerCase().includes(q))
        const by =this.sortBy();
        return [...base].sort((a,b)=>
           by === 'name' ? a.name.localeCompare(b.name) : a.price - b.price
        );
    })
    load(){
        this.http.get<Product[]>(`${this.api}/products.json`).subscribe(this.products.set);
    }
  }
 