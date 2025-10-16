import { Injectable, effect, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './cart.service';

type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  cart=inject(CartService);

  // privzeto "system" (prvi obisk)
  theme = signal<Theme>('system');

  // efektivna (upošteva OS, če je system)
  effective = computed<'light' | 'dark'>(() => {
    const t = this.theme();
    if (t === 'dark') return 'dark';
    if (t === 'light') return 'light';
    if (this.isBrowser && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  constructor() {
    if (this.isBrowser) {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved) this.theme.set(saved);
    }

    effect(() => {
      const t = this.theme();
      const eff = this.effective();
      if (!this.isBrowser) return;

      const root = document.documentElement;
      root.classList.toggle('dark', eff === 'dark');

      // pomagamo CSS-u vedeti ali je force ali system
      root.classList.toggle('force-dark', t === 'dark');
      root.classList.toggle('force-light', t === 'light');

      localStorage.setItem('theme', t);
    });

    // poslušaj spremembo OS teme, ko je izbrano "system"
    if (this.isBrowser && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', () => {
        if (this.theme() === 'system') this.theme.update(x => x); // recompute
      });
    }
  }

  set(t: Theme) { this.theme.set(t); }

  /** Preklopi med dark/light.
   *  Če si na "system", vzame trenutno efektivno (dark|light) in preklopi na nasprotno
   *  ter s tem nastavi trajno izbiro.
   */
  toggle() {
    const eff = this.effective();
    this.theme.set(eff === 'dark' ? 'light' : 'dark');
  }

  // gumb za povrnitev na system */
  useSystem() { this.theme.set('system'); }
}
