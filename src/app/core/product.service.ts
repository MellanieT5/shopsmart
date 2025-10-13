//vsi deli aplikacije, ki rabijo podatke o izdelkih, jih bodo dobili iz enega mesta in to je tukaj. 

import{Injectable, inject, signal, computed, PLATFORM_ID} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {API_URL} from './tokens';
import { catchError, of  } from 'rxjs';

export type Product = {id:number; name: string; price: number; category: string};

@Injectable ({providedIn: 'root'})
 export class ProductService {
    private http=inject (HttpClient);
    private api= inject (API_URL);
    private platformId= inject(PLATFORM_ID)


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
    });

     constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.load(); // samo v brskalniku
    }
  }

    load() {
        this.http.get<Product[]>(`${this.api}/products.json`)
        .pipe(
            catchError(err=> {
                console.error('failed to load products.json', err);
                return of <Product[]>([]);
            })
        )
            .subscribe(list=>this.products.set(list));
        
    }
    
    remove(id:number): boolean {
        let removed = false;
        this.products.update(list=> {
            const next = list.filter (p=> p.id !==id);
            removed= next.length !==list.length;
            return next;
        });
        return removed;
    }



    }
  
 