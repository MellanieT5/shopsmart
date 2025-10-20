import {Component, inject} from '@angular/core';
import {NgFor, NgIf, CurrencyPipe, DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import { HistoryService, OrderHistoryItem } from '../core/history.service';
import {CartService} from '../core/cart.service';

@Component ({
    selector: 'app-history-page',
    standalone:true,
    imports: [NgIf, NgFor, CurrencyPipe,DatePipe],
    template: `
    <h2 class="page-title container">Order history</h2>

    <div class= "container" *ngIf="history.history().length; else empty">
        <div class="history-list">
            <div class="history-card" *ngFor="let h of history.history(); trackBy: trackById">
                <div class="history-top">
                    <div>
                        <div class="history-date"> {{h.date | date: 'medium'}} </div>
                        <div class = "histroy-items"> {{h.itemCount}} items </div>
                    </div>    
                    <div class= "history-total">{{h.total | currency: 'EUR'}} </div>
                </div>


                <div class="history-items-preview">
                    <img *ngFor="let it of h.items.slice(0,4)"
                    [src]="it.imageData" [alt]= "it.name" class="preview-img" />
                    <span *ngIf="h.items.length> 4" class="more">
                        +{{h.items.length -4}} more
                    </span>
                </div>

                <div class= "history-actions">
                    <button class="btn" (click)="repeat(h)"> Repeat order </button>
                    <button class= "btn btn-secondary" (click)="remove(h.id)">Remove </button>
                </div> 
            </div>
        </div>


        <div style="margin-top: .75rem;">
            <button class="btn btn-ghost" (click)="clearAll()">Clear history</button>
        </div>
</div>

<ng-template #empty>
    <div class="container"> <p> No past orders yet. </p> </div>
</ng-template>
    `
})

export class HistoryPageComponent{
    history=inject(HistoryService);
    cart= inject(CartService);

    trackById= (_:number, h:OrderHistoryItem) => h.id;

    repeat (h:OrderHistoryItem){
        h.items.forEach(it=>this.cart.add (it.id, it.qty));
    }
    remove(id:number) {this.history.remove(id);}
    clearAll() {this.history.clear();}
}