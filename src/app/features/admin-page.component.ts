
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
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
<form class="admin-form" [formGroup]="form" (ngSubmit)="onSubmit()">
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
  <div class="list-scroll">
    <div class="admin-row" *ngFor="let p of svc.products(); trackBy: trackById">
      <img class="thumb" [src]="p.imageData || 'assets/no-image.png'" [alt]="p.name" />
      <div class="info">
        <div class="name">{{ p.name }}</div>
        <div class="meta">{{ p.price | currency:'EUR' }} • {{ p.category }}</div>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-edit" (click)="openEdit(p)">Edit</button>
        <button type="button" class="btn btn-del" (click)="onDelete(p.id)">Delete</button>
      </div>
    </div>
  </div>
</div>

   `,

})
export class AdminPageComponent {
  svc = inject(ProductService);
  fb  = inject(FormBuilder);

  categories = CATEGORIES;

  // če izbereš novo sliko, jo začasno hranimo tu
  imageData: string | undefined;

  // če ni 0, smo v "edit" načinu
  editing = signal<Product | null>(null);

  form = this.fb.nonNullable.group({
    id:        0,                                // pri dodajanju = 0; pri edit = obstoječi id
    name:      ['', Validators.required],
    price:     0 as number,
    category:  '' as Category | '',
    description: [''],
    imageData: [''],                              // shranimo tudi obstojeci base64 url (če obstaja)
  });

  trackById = (_: number, p: Product) => p.id;

  onDelete(id: number) {
    this.svc.remove(id);
    // če brišeš ravno tisti, ki ga urejaš, prekini edit
    if (this.editing()?.id === id) this.cancelEdit();
  }

  onImageSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.imageData = String(reader.result);
      // če si v edit načinu, posodobi kontrolno vrednost, da se shrani ob "Save"
      this.form.patchValue({ imageData: this.imageData });
    };
    reader.readAsDataURL(file);
  }

  openEdit(p: Product) {
    this.editing.set(p);
    this.imageData = p.imageData; // ohrani obstoječo sliko
    this.form.reset({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category ?? '',
      description: p.description ?? '',
      imageData: p.imageData ?? '',
    });
    // fokus na ime (opcijsko): setTimeout(() => this.nameInput.nativeElement.focus());
  }

  cancelEdit() {
    this.editing.set(null);
    this.imageData = undefined;
    this.form.reset({
      id: 0,
      name: '',
      price: 0,
      category: '',
      description: '',
      imageData: '',
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    if (this.editing()) {
      // EDIT: združi stare vrednosti s posodobljenimi
    const next: Product = {
        id: v.id,
        name: v.name.trim(),
        price: Number(v.price),
        category: v.category as Category,
        description: v.description?.trim() || undefined,
        imageData: this.imageData ?? v.imageData ?? this.editing()!.imageData ?? undefined,
      };

      this.svc.update(next);
      this.cancelEdit();
    } else {
      // ADD: ustvari nov product
      this.svc.add({
        name: v.name.trim(),
        price: Number(v.price),
        category: v.category as Category,
        description: v.description?.trim() || undefined,
        imageData: this.imageData,
      });
      this.imageData = undefined;
      this.form.reset({
        id: 0, name: '', price: 0, category: '', description: '', imageData: ''
      });
    }
  }
}
