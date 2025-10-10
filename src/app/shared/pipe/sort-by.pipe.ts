//za sortiranje podatkov v HTML templatu glede na izbrano lastnost


import {Pipe, PipeTransform } from '@angular/core'; // dodaš pipo iz angularja

@Pipe({ //je dekorator
    name:'sortBy', //ime
    standalone:true //ne dodajaš ga v module
})

export class SortByPipe implements PipeTransform { //razred, s imenom SortByPipes, Pipe Transform je metoda
    transform <T extends Record<string, any>> (arr: T[], prop:keyof T): T[] { // kjer so ključi string,je lahko vrednost any
        //arr:[T] pipe prejme tabelo objektov, prop:keyof T--> uporabnik poda ime lastnosti, po katerem naj sortira(npr."name")
        if (!Array.isArray (arr)) return arr;//če to kar pride v pipe ni tabela, naj vrne nespremenjeno
        return [...arr].sort ((a,b)=>{
            const av = a [prop];
            const bv = b [prop];// vzamemo vrednosti po ključu prop za primerjavo
            if (typeof av === 'number' && typeof bv === 'number') {
                return av - bv;// če sta vrednosti številki naj sortira kot številke
            } 
            return String (av).localeCompare(String(bv)); //če sta obe stringa--> sortira kot tekst 
        });
    }
        
    }
