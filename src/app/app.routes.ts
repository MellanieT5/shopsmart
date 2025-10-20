import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing-page.component';
import {ProductsPageComponent} from './features/products-page.component';
import { CartPageComponent } from './features/cart-page.component';
import { AdminPageComponent } from './features/admin-page.component';
import {ProductDetailComponent} from './features/product-detail.comonent';
import { CheckoutPageComponent } from './features/checkout-page.component';

export const routes: Routes = [
    {path: '', component:LandingPageComponent},
    {path:'products', loadComponent:()=>import('./features/products-page.component').then(m=>m.ProductsPageComponent)},
    {path: '', redirectTo:'products', pathMatch:'full'},
    {path: 'products', component: ProductsPageComponent},
    {path: 'products/:id', component: ProductDetailComponent},
    {path: 'cart', component: CartPageComponent},
    {path: 'admin', component: AdminPageComponent},
    {path: 'checkout', component: CheckoutPageComponent}, 
    {path:'history', loadComponent:()=>import('./features/history-page.component').then(m=>m.HistoryPageComponent)},


//TOTI JE VEDNO NA KONCI
    {path: '**', redirectTo:'products'},

];

//''(prazna pot)--> preusmeri na /products
// /products-->odpre stran z izdelki
// /cart --> prikaže košarico
// /admin--> prikaže administratorsko stran
// **--> 2catch all" -če gre kdo na naroben naslov, ga preusmeri nazaj