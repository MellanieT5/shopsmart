//preprost obrazec za dodajanje/urejanje izdelkov 

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import {NgFor} from '@angular/common';
import { ProductService, Product } from "../core/product.service";
import { CurrencyPipe } from "@angular/common"; 


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
    
    <form [formGroup]= "form" (ngSubmit)= "add()">
      <input formControlName ="name" placeholder="Name" />
      <input formControlName ="price" type= "number" step= "0.01" placeholder= "Price"/>
      <input formControlName = "category" placeholder ="Category" />
      <button type= "submit" [disabled]= "form.invalid"> Add product </button>
    </form>
    
    <ul>
        <li *ngFor = "let p of svc.products()">
            {{p.id}} - {{p.name}} - {{p.price | currency:'EUR'}} - {{p.category}}

       
        </li>
    </ul>
   `
})
export class AdminPageComponent {
    svc= inject (ProductService);
    fb= inject(FormBuilder);

    form = this.fb.nonNullable.group ({
        name: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        category: ['', Validators.required],
    });


add(){
    if (this.form.invalid) return;

    const v=this.form.getRawValue();
    const nextId =
  (this.svc.products().reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1;

    const newProduct: Product = {
        id:nextId,
        name:v.name,
        price:Number(v.price),
        category: v.category,
    };

    this.svc.products.update (list=> [...list, newProduct]);
    this.form.reset({name: '', price: 0, category: ''});
}
}