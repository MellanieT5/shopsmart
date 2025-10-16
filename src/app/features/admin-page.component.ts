
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms"; //importi
import {NgFor} from '@angular/common';
import { ProductService, Product } from "../core/product.service";
import { CurrencyPipe } from "@angular/common"; 
import {CATEGORIES, type Category} from '../core/categories';


@Component({
    selector:'app-admin-page',
    standalone: true,
    imports: [ReactiveFormsModule,NgFor,CurrencyPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    
    
    template: ` 
    <h2>Admin</h2>
    
    <form [formGroup] = "form" (ngSubmit) = "add()"><!-- se sproži ob kliku gumba -->
        <input formControlName="name" placeholder="Name" />
        <input formControlName="price" type="number" inputmode="decimal" min="0" step="1" placeholder="Price"/> <!--da ti sešteva po 1 -->

        <select formControlName="category" required> <!--da lahko izbereš kategorijo -->
            <option value="" disabled>-choose category-</option>
            <option *ngFor="let c of categories" [value]="c"> {{c}} </option> <!--shrani izbrano vrednost direkt kot category, button je onemogočen, vse dokelr je forma neveljavna-->
            
      </select>
       
    <textarea
        formControlName="description"
        rows="3"
        placeholder="Description (optional)" > <!--kaj ti dejansko izpiše -->
    </textarea>


    <button type="submit" [disabled]="form.invalid"> Add product </button> 
   

      </form>  

    <ul> <!--seznam vseh produktov iz signala svc. products(), trackBy optimizira render, saj angular sledi elementom po id-->
        <li *ngFor = "let p of svc.products(); trackBy: trackById">
            {{p.id}} - {{p.name}} - {{p.price | currency:'EUR'}} - {{p.category}}
            <button type="button" (click)="onDelete(p.id)">Delete </button> <!--gumb pokliče onDelete-->
        
        </li>
    </ul>

   `,
styleUrls: ['../styles/features/admin-page.scss']

})
export class AdminPageComponent { 
    svc= inject (ProductService);
    fb= inject(FormBuilder); //vbrizgamo storitev in form builder

    categories=CATEGORIES; //izpostavimo senam kategorij za *ngFor v selectu 

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

add(){ //za submit
    if(this.form.invalid) return;

    const v=this.form.getRawValue(); //prebere trenutne vrednosti kontrol(ne "disabled" filtrov)
    this.svc.add({ //pripravi payload 
        name:v.name.trim(), 
        category:v.category as Category, //category casta v Category
        price:Number(v.price), //pretvori v število
        description:v.description.trim() || undefined, // po trimu spremeni polje v undefined, saj je polje opcijsko 
    });


    this.form.reset({name:'', price: 0, category: '', description: ''}); //vrne form v začetno stanje
}
}
 
