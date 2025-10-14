import {Injectable, effect, signal, inject, PLATFORM_ID, computed} from "@angular/core"; //importaš
import {isPlatformBrowser} from '@angular/common';

type Theme= 'light' | 'dark' | 'system'; //narediš union

@Injectable({ providedIn: 'root'}) //je dostopen vsepovsod
export class ThemeService {
    private platformId= inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    theme= signal<Theme>('system');  //začetna vrednost je system--> kako ima uporabnik nastavljeno 

    effective=computed<'light' | 'dark'>(()=> {  //če effect dark--> dark, light-->light
        const t= this.theme();
        if (t === 'dark') return 'dark'; 
        if (t === 'light') return 'light';
        
        if (this.isBrowser && window.matchMedia?.('(prefers-color-scheme:dark)').matches) { //če je pa theme system, pa bo dalo dark ali light
            return 'dark';
        }
        return 'light';
    });

    constructor(){
        if (this.isBrowser){ //preveri, da smo na browserju in ne na strežniku
            const saved= localStorage.getItem('theme') as Theme | null; //če je brskalnik, pogleda v localStorage ali je uporabnik že prej izbral temo
            if (saved) this.theme.set(saved); //če najde jo nastavi
        }

    effect(()=>{
        const eff=this.effective(); //se izvede vsakič, ko se this.effect/this.theme spremeni
        if(this.isBrowser){
            const root=document.documentElement; //manipulirap HTML element, če je dark, doda v html-->force dark, za light isto

            root.classList.toggle('force-dark', this.theme() === 'dark');
            root.classList.toggle('force-light', this.theme()=== 'light');

            localStorage.setItem('theme', this.theme());//shraniš, da se naslednič spet uporabi ista izbira
        }
    });
    if (this.isBrowser && window.matchMedia){ //preveri, če brskalnik podpira matchMedia
        const mq = window.matchMedia ('(prefers-color-scheme:dark)'); //usvari media query listener--> za spremembo sistemske teme
        mq.addEventListener?.('change', ()=> {
            if (this.theme()=== 'system') { //če je izbran sistem, sproži reakcijo, da se updejta tema
                this.theme.update(v=>v);
            }
        });
    }
    }

    set(t:Theme) {this.theme.set(t);} 
    cycle() {
        const order:Theme[] = ['system', 'light','dark']; //vrstni red tem
        const i=order.indexOf(this.theme()); //i poišče trnutno temo
        this.set(order[(i+1)% order.length]); //doda 1, vzame ostanek z dolžino tabele-->krog, nastavi novo temo
    }
}