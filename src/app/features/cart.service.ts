//drži stanje košarice

import {Injectable, computed, signal} from '@angular/core';
import type { Product } from '../core/product.service'; //importaš type 

export type CartItem = {product: Product; qty: number}; //product--> dejanski izdelek, qty--> količina izdelka 

@Injectable ({providedIn: 'root'}) //dostopen povsod
export class CartService { 
    items=signal<CartItem []>([]);//item shrani podatke (type CartIte), ki se bodo updajtali, ko se spremenijo, zaradi signala


    total = computed (()=> //ko se items spremeni, izračuna
      this.items().reduce((sum,it)=> sum + it.product.price * it. qty, 0)  
    );

//this.items--> CartService,
//  reduce--> metoda, ki združi vse elemente v eno vrednost.
//sum-->tekoča vsota. it-->trenutni element v polju
//sum+it... sešteje cene vseh izdelkov
//0--> začetna vrednost vsote


    add(p: Product, qty= 1){ //p:tipa produktov, qty: ima prevzeto vrednost 1, če je ne podaš
        this.items.update(list=> { //posodobitev  vrednost signala
            const i = list.findIndex (it=> it.product.id === p.id); // list-->trenutna vrednostna polja ,
        if  (i>=0){
            const copy = [...list];
            copy[i] = {...copy[i], qty: copy [i].qty + qty}; 
            return copy;
        }
        return [...list, {product: p, qty}];
        });
    }

    //list--> trenutna vrednostna polja
    //.findIndex--> išče indeks elementa v seznamu
    //===--> stroga primerjava
    //const copy = [...list], ...--> je spread operator: naredi kopijo polja
    //{...copy[i], qty: copy[i].qty + qty }}, {...objekt}--> naredi kopijo objekta, qty-->spremeni samo količino
    //return copy---> vrne novo stanje polja
    //return [...list, {product: p, qty}]--> dodaj nov element na konec polja 
    //-------------------------------------------------------------------------------------------------------------------------------------------------------
    //prevri, ali je izdelek že v košarici
    //če je -->samo poveča količino
    //če ni--> ga doda kot novega
    //this.items.update spremeni signal in tudi UI


    changeQty(productId:number, delta: number){
        this.items.update(list =>
            list
              .map(it=> //it v totem filu predstavlja CarItem
                it.product.id === productId ? {...it, qty: Math.max(1, it.qty + delta)} : it
              )
            .filter(it=>it.qty>0)
    
        );
    }
    //.map()--> ustvari novo polje, kjer vsak element lahko spremeniš
    //?:-->krajša oblika if/else, če pogoj drži vrni {...it, ...}, sicer vrni it 
    //math.max(1, it.qty+delta)-->prepreči, da bi količina šla pod 1
    //.filter() odstrani elemente, ki ne izpolnjujejo pogoja 
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------
    //delta je +1/-1 (kateri koli število, to je bil samo primer)
    //poveča ali zmanjša količino določenega izdelka 
    //math.max(1,...) prepreči, da bi količina šla pod 1
    //.filter odstranu izdelke z 0 količine (če bi jih kdaj bilo)

    remove(productId:number){
        this.items.update(list=>list.filter(it=>it.product.id !== productId)); //odstrani izdelek, glede na njihov ID
    }
    //.filter()-->vrne novo polje z elementi, ki niso enaki productId
    //!==ni enako 

    clear(){
        this.items.set([]);
    }
    //.set()-->metoda signala, ki mu nastaviš novo vrednost
    //[]--> prazno polje (košarica prazna)
}