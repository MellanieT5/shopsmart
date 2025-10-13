//za vizualno označevanje besedila, ki se ujema z iskalnim queryjem

import {Pipe, PipeTransform} from '@angular/core';//dodamo Pipe... iz angularja 

@Pipe ({
    name: 'highlight',// ime za HTML
    standalone:true // ne rabimo dodajat v module
})
export class HighlightPipe implements PipeTransform { //novi class highlightPipe
    transform(value: string, query:string): string { //transform je glavna metoda za obdelovanje podatkov
      if (!query) return value;//če ni query torej string naj returna value
      const regex = new RegExp(`(${query})`, 'gi' )
      return value.replace (regex, '<mark> $1 </mark>')
    }
        
    }
