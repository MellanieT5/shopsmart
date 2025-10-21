
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms"; //importi
import {NgFor, NgIf} from '@angular/common';
import { ProductService, Product } from "../core/product.service";
import { CurrencyPipe } from "@angular/common"; 
import {CATEGORIES, type Category} from '../core/categories';


@Component({
    selector:'app-admin-page',
    standalone: true,
    imports: [ReactiveFormsModule,NgFor,CurrencyPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    
    
    template: ` 
   <div class="admin-topbar">
  <div class="admin-title">Admin</div>
</div>

<div class="admin-wrap">
  <!-- LEFT: FORM -->
  <form class="admin-form" [formGroup]="form" (ngSubmit)="add()">
    <div>
      <label>Name</label>
      <input class="input" formControlName="name" placeholder="Name" />
    </div>

    <div>
      <label>Price</label>
      <input class="input" type="number" formControlName="price" />
    </div>

    <div>
      <label>Category</label>
      <select class="input" formControlName="category" required>
        <option value="" disabled>-choose category-</option>
        <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
      </select>
    </div>

    <div>
      <label>Description (optional)</label>
      <textarea class="input" formControlName="description"></textarea>
    </div>

    <div>
      <label>Choose file</label>
      <input class="file" type="file" accept="image/*" (change)="onImageSelected($event)" />
    </div>

    <button class="btn add-btn" type="submit" [disabled]="form.invalid">Add product</button>
  </form>

  <!-- RIGHT: LIST -->
  <div class="admin-list">
    <div class="admin-row" *ngFor="let p of svc.products(); trackBy: trackById">
      <img class="thumb" [src]="p.imageData || 'assets/no-image.png'" [alt]="p.name" />
      <div class="info">
        <div class="name">{{ p.name }}</div>
        <div class="meta">{{ p.price | currency:'EUR' }} • {{ p.category }}</div>
      </div>
      <div class="actions">
        <!-- Edit (za kasneje, ko boš hotla) -->
        <button type="button" class="btn btn-edit" disabled>Edit</button>
        <button type="button" class="btn btn-del" (click)="onDelete(p.id)">Delete</button>
      </div>
    </div>
  </div>
</div>


   `,

})
export class AdminPageComponent { 
    svc= inject (ProductService);
    fb= inject(FormBuilder); //vbrizgamo storitev in form builder

    categories=CATEGORIES; //izpostavimo senam kategorij za *ngFor v selectu 

    imageData:string|undefined;

    form = this.fb.nonNullable.group ({ //poskrbi, da value ni nikoli null
        name: ['', Validators.required], //naredi obvezno  
        price: [0, [Validators.required, Validators.min(0)]],//naredi obvezno
        category: ['' as Category | '', Validators.required], //naredi obvezno
        description: [''], //je optional
    });
    
    
    trackById = (_:number, p:Product) => p.id; //vrne primarni ključ -->za ngFor

    onDelete(id:number) {
        this.svc.remove(id); //pokliče ProductService.remove, ki odstrani produkt in persista v localStorage
    }

    onImageSelected(ev:Event) {
        const input=ev.target as HTMLInputElement;
        const file = input.files?.[0];
        if(!file) return;
        const reader= new FileReader();
        reader.onload = () => (this.imageData = String(reader.result));
        reader.readAsDataURL(file);
    }

add(){ //za submit
    if(this.form.invalid) return;

    const v=this.form.getRawValue(); //prebere trenutne vrednosti kontrol(ne "disabled" filtrov)
    this.svc.add({ //pripravi payload 
        name:v.name.trim(), 
        category:v.category as Category, //category casta v Category
        price:Number(v.price), //pretvori v število
        description:v.description.trim() || undefined, // po trimu spremeni polje v undefined, saj je polje opcijsko 
        imageData: this.imageData,
    });
    this.imageData=undefined;

    this.form.reset({name:'', price: 0, category: '', description: ''}); //vrne form v začetno stanje
    this.imageData=undefined;
    
}
}
 
