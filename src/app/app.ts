import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {ThemeService} from './core/theme.service';
import { NgSwitchCase, NgSwitch, NgSwitchDefault } from "@angular/common"



@Component({
  selector: 'app-root',
  standalone:true,
  imports:[RouterOutlet, RouterLink, NgSwitch, NgSwitchCase],
  templateUrl: './app.html',
  styleUrl: './app.scss'

})
export class App {
  protected readonly title = signal('shopsmart');
  theme=inject(ThemeService);
}
