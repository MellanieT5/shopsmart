import { Routes } from '@angular/router';
import {ProductsPageComponent} from './features/products-page.component';
import { CartPageComponent } from './features/cart-page.component';
import { AdminPageComponent } from './features/admin-page.component';

export const routes: Routes = [
    {path: '', redirectTo:'products', pathMatch:'full'},
    {path: 'products', component: ProductsPageComponent},
    {path: 'cart', component: CartPageComponent},
    {path: 'admin', component: AdminPageComponent},
    {path: '**', redirectTo:'products'}

];

//''(prazna pot)--> preusmeri na /products
// /products-->odpre stran z izdelki
// /cart --> prikaže košarico
// /admin--> prikaže administratorsko stran
// **--> 2catch all" -če gre kdo na naroben naslov, ga preusmeri nazaj