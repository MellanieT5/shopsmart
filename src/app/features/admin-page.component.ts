
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms"; //importi
import {NgFor, NgIf} from '@angular/common';
import { ProductService, Product } from "../core/product.service";
import { CurrencyPipe } from "@angular/common"; 
import {CATEGORIES, type Category} from '../core/categories';
import{HttpClient} from '@angular/common/http';
import{environment} from '../../environment';


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
          <option [ngValue]="''" disabled>-choose category-</option>
          <option *ngFor="let c of categories" [ngValue]="c">{{ c }}</option>
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
      <div class="info">
        <img class="thumb"
     [src]="svc.resolveImage(p.imageUrl || p.imageData)"
     [alt]="p.name || 'product'" />
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
  http=inject(HttpClient);
  apiBase=environment.apiBaseUrl;

  categories = CATEGORIES;

  // če izbereš novo sliko, jo začasno hranimo tu
  imageData: string | undefined;

  // če ni 0, smo v "edit" načinu
  editing = signal<Product | null>(null);

  form = this.fb.group({
  id:          this.fb.control(0, { nonNullable: true }),
  name:        this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
  price:       this.fb.control(0, { nonNullable: true }),
  category:    this.fb.control<'' | Category>('', { nonNullable: true }),
  description: this.fb.control(''),
  imageData:   this.fb.control(''),   // ostane, če bi kdaj rabila base64
  imageUrl:    this.fb.control(''),   // ⬅️ NOVO: URL iz /api/upload
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

  const fd = new FormData();
  fd.append('image', file); // ime fielda mora biti "image"

  this.http.post<{ url: string }>(`${this.apiBase}/api/upload`, fd).subscribe({
    next: (r) => {
      // r.url je relativna pot, npr. /uploads/abc.jpg
      // za prikaz v SPA ni nujno da dodamo base, a je čist OK:
      const full = r.url.startsWith('http') ? r.url : `${this.apiBase}${r.url}`;
      this.form.patchValue({ imageUrl: full });
      // opcijsko: pokaži thumbnail takoj
      this.imageData = full;
      this.form.patchValue({ imageData: full });
    },
    error: (e) => {
      console.error('upload failed', e);
      alert('Upload slike ni uspel.');
    }
  });
}
  
  openEdit(p: Product) {
    this.editing.set(p);
    this.imageData = p.imageData; // ohrani obstoječo sliko
    this.form.reset({
      id: p.id,
      name: p.name,
      price: p.price,
      category: (p.category as Category) ?? ('' as const),
      description: p.description ?? '',
      imageData: p.imageData ?? '',
      imageUrl:p.imageUrl ?? '',
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
       category: '' as const,
      description: '',
      imageData: '',
      imageUrl: ''
    });
  }

  onSubmit() {
   if (this.editing()) {
  const v = this.form.getRawValue();
  const next: Product = {
    id: v.id,
    name: (v.name || '').trim(),
    price: Number(v.price) || 0,
    category: v.category as Category,
    description: v.description?.trim() || undefined,
    imageUrl:  v.imageUrl || this.imageData || this.editing()!.imageUrl || undefined,
    imageData: this.imageData ?? v.imageData ?? this.editing()!.imageData ?? undefined,
  };
  this.svc.update(next);
  this.cancelEdit();
} else {
  const v = this.form.getRawValue();
  this.svc.add({
    name: (v.name || '').trim(),
    price: Number(v.price) || 0,
    category: v.category as Category,
    description: v.description?.trim() || undefined,
    imageUrl:  v.imageUrl || this.imageData || undefined,
    imageData: this.imageData,
  });
  this.imageData = undefined;
  this.form.reset({ id: 0, name: '', price: 0, category: '', description: '', imageData: '', imageUrl: '' });
}

  }
}
