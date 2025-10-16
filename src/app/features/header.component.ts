import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../core/theme.service';
import { FavoritesPanelComponent } from '../features/favorites-panel.component';
import {RouterLink, RouterOutlet} from '@angular/router';
import { CartService } from '../core/cart.service';


@Component ({
    selector:'app-header',
    standalone:true,
    imports:[FavoritesPanelComponent, RouterLink, RouterOutlet],
    template: `
    <nav class = "top-bar">
        <a routerLink="/products">Products </a>
        <a routerLink="/cart">Cart </a>
        <a routerLink="/admin"> Admin </a>
        <span style="margin-left:auto;"> </span>

        <div class="fav-wrap">
        <button (click)="toggleFavs()"
           [class.active]="cart.favorites().length> 0">
        ♥
        </button>
            <app-favorites-panel
            [open]="showFavs()" 
            (close)="showFavs.set(false)">
            </app-favorites-panel>



             <span class="spacer"></span>


         <button (click)="theme.toggle()">
            {{theme.effective()=== 'dark' ? '🌟': '☀️'}}
        </button>
        </div>


    </nav>


     <router-outlet></router-outlet>

    `,
    styles: [`
    .top-bar { display:flex;  gap:.5rem; align-items:center; padding:.5rem; }
    .spacer{flex: 1 1 auto;}
    .fav-wrap{position:relative;}
    button.active { color:#ff2b77; }
    `]
})

export class HeaderComponent {
    theme= inject (ThemeService);
    cart=inject(CartService);
    showFavs=signal(false);

    toggleFavs() {
        this.showFavs.update(open=> !open);
    }
}