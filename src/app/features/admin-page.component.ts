//preprost obrazec za dodajanje/urejanje izdelkov 

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import {NgFor} from '@angular/common';
import { ProductService, Product } from "../core/product.service";
import { CurrencyPipe } from "@angular/common"; 
import {CATEGORIES, type Category} from '../core/categories';


@Component({
    selector:'app-admin-page',
    standalone: true,
    imports: [ReactiveFormsModule,NgFor,CurrencyPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
      styles: [`
      form {display:grid; gap:8px; max-width:360px; margin: .5rem 0;}
      input {padding:.4rem;}
      button {margin-top:.4rem;}
      ul {margin-top:1rem;}
      `],
    
    template: ` 
    <h2>Admin</h2>
    
    <form [formGroup] = "form" (ngSubmit) = "add()">
        <input formControlName="name" placeholder="Name" />
        <input formControlName="price" type="number" inputmode="decimal" min="0" step="1" placeholder="Price"/>

        <select formControlName="category" required>
            <option value="" disabled>-choose category-</option>
            <option *ngFor="let c of categories" [value]="c"> {{c}} </option>
            
      </select>
       
    <textarea
        formControlName="description"
        rows="3"
        placeholder="Description (optional)"
    ></textarea>


    <button type="submit" [disabled]="form.invalid"> Add product </button>
   

      </form>  

    <ul>
        <li *ngFor = "let p of svc.products(); trackBy: trackById">
            {{p.id}} - {{p.name}} - {{p.price | currency:'EUR'}} - {{p.category}}
            <button type="button" (click)="onDelete(p.id)">Delete </button>
        

       
        </li>
    </ul>
   `
})
export class AdminPageComponent {
    svc= inject (ProductService);
    fb= inject(FormBuilder);

    categories=CATEGORIES;

    form = this.fb.nonNullable.group ({
        name: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        category: ['' as Category | '', Validators.required],
        description: [''],
    });
    
    trackById = (_:number, p:Product) => p.id;

    onDelete(id:number) {
        this.svc.remove(id);
    }

add(){
    if(this.form.invalid) return;

    const v=this.form.getRawValue();
    this.svc.add({
        name:v.name.trim(),
        category:v.category as Category,
        price:Number(v.price),
        description:v.description.trim() || undefined,
    });


    this.form.reset({name:'', price: 0, category: '', description: ''});
}
}

