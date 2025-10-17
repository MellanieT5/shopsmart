import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import {ThemeService} from './core/theme.service';
import { NgIf } from "@angular/common"
import{FavoritesPanelComponent} from './features/favorites-panel.component';
import{CartService} from './core/cart.service'
import { CartPageComponent } from "./features/cart-page.component";




@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, RouterLink, NgIf, FavoritesPanelComponent],
  templateUrl: './app.html',

})

export class App {
  protected readonly title = signal('shopsmart');
  theme=inject(ThemeService);
  cart=inject(CartService);
  showFavs=signal(false);

  toggleFavs(){
    this.showFavs.update(open=> !open);
  }
}
