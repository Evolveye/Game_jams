class Dialogs {
  static init( box, msgClass, sfx ) {
    this.box = box
    this.msgClass = msgClass

    if ( sfx )
      this.sfx = new Audio( sfx )
  }

  static async pause( secondsOrCb ) {
    if ( isNaN( secondsOrCb ) ) {
      return await new Promise( next => {
        let i = setInterval( () => {
          if ( !secondsOrCb() )
            return

          next()
          clearInterval( i )
        }, 1000 )
      } )
    }
    else
      return new Promise( resolve => setTimeout( resolve, (/*keys[ 88 ]  ?  1  :  */secondsOrCb) * 1000 ) )
  }

  static say( message ) {
    if ( !this.box )
      return

    this.box.insertAdjacentHTML( `beforeend`, `<p class="${this.msgClass}">${message}</p>`)
    this.box.scrollTop = this.box.scrollHeight

    if ( this.sfx )
      this.sfx.play()
  }
}

// 0: nothing
// 1: nothing
// 2: conveyor
// 3: spawn
// 4: despawn
// 5: cloth
// 6: dirtyCloth
// 7: barrel
// 8: washmachine

const levels = [
  { num: 1,
    clothesToClear: 1,
    map: [
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 6, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 4, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1 ]
    ],
    data: { washmachines:1 },
    async dialogs() {
      const D = Dialogs

      await D.pause( 2 )
      D.say( `Witam. Gra jest prosta - nie było czasu na nic konkretniejszego.` )
      await D.pause( 1 )
      D.say( `Masz pralkę, ubranie wyglądajacą jak mumia i "zrzut". Poklikaj aż przejdziesz poziom ^^` )
      await D.pause( 5 )
      D.say( `Warto dodać, że aby wyciągnąć pranie z pralki potrzebujesz miejsca z jej prawej strony` )
    }
  },
  { num: 2,
    clothesToClear: 1,
    map: [
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 6, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 4, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1 ]
    ],
    data: { barrels:1 },
    async dialogs() {
      const D = Dialogs

      await D.pause( 2 )
      D.say( `W grze dostępne są także beczki do prania.` )
      await D.pause( 2 )
      D.say( `Działają one nieco wolniej od zwykłej pralki` )
    }
  },
  { num: 3,
    clothesToClear: 6,
    map: [
      [ 1, 1, 1, 1, 1 ],
      [ 1, 3, 1, 4, 1 ],
      [ 1, 1, 1, 1, 1 ],
    ],
    data: { barrels:2 },
    async dialogs() {
      const D = Dialogs

      await D.pause( 2 )
      D.say( `No i oczywiście zaczniesz z beczką >:-----DDDD` )
      await D.pause( 5 )
      D.say( `Tym razem masz do dostarczenia więcej niż 1 ubranie. Tutaj zapoznam Cię z mechaniką dostarczania ubrań` )
      await D.pause( 15 )
      D.say( `Czadowa prawda?` )
    }
  },
  { num: 4,
    clothesToClear: 10,
    map: [
      [ 1, 1, 1, 1, 1, 1 ],
      [ 1, 3, 1, 1, 4, 1 ],
      [ 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1 ],
      [ 1, 3, 1, 1, 4, 1 ],
      [ 1, 1, 1, 1, 1, 1 ],
    ],
    data: { barrels:2, washmachines:1   },
    async dialogs() {
      const D = Dialogs

      await D.pause( 2 )
      D.say( `
        Oczywiście nie mogę sprawdzić czy odkryłeś sztuczkę na szybsze dostarczanie mumii na zrzut
        ale po przeczytaniu tego tekstu pewnie o tym pomyślisz
      ` )
    }
  },
  { num: 5,
    clothesToClear: 10,
    map: [
      [ 1, 1, 1, 1 ],
      [ 1, 1, 4, 1 ],
      [ 1, 3, 1, 1 ],
      [ 1, 1, 1, 1 ],
    ],
    data: { washmachines:1, conveyors:1 },
    async dialogs() {
      const D = Dialogs

      await D.pause( 2 )
      D.say( `A gdybyś miał do dyspozycji kilka taśmociągów? :thinking:` )
      await D.pause( 4 )
      D.say( `Ustaw to wybitnie dobrze, i odpoczywaj` )
    }
  },
  { num: 6,
    clothesToClear: 1,
    map: [
      [ 1, 1, 1, 1 ],
      [ 1, 1, 4, 1 ],
      [ 1, 3, 1, 1 ],
      [ 1, 1, 1, 1 ],
    ],
    data: { washmachines:1, conveyors:1 },
    async dialogs() {
      const D = Dialogs

      await D.pause( 2 )
      D.say( `Znów ten sam poziom, ale zablokowaliśmy Ci możliwość podnoszenia ubrań :V` )
    }
  },
  { num: 7,
    clothesToClear: 2,
    map: [
      [ 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 4, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 3, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1 ],
    ],
    data: { barrels:1, conveyors:3 },
    async dialogs() {
      const D = Dialogs

      await D.pause( 2 )
      D.say( `I znów to samo ale większe! Potężność!` )
      await D.pause( 5 )
      D.say( `Ah no i ten. Kliknij "R" aby obrócić kierunek wychodzący` )
    }
  },
  { num: 8,
    clothesToClear: 2,
    map: [
      [ 1, 1, 1, 1, 1 ],
      [ 1, 0, 1, 4, 1 ],
      [ 1, 1, 1, 1, 1 ],
      [ 1, 3, 1, 0, 1 ],
      [ 1, 1, 1, 1, 1 ],
    ],
    data: { barrels:1, conveyors:3 },
    async dialogs() {
      const D = Dialogs

      D.say( `Dajesz radę` )
      await D.pause( 2 )
      D.say( `A dasz radę przejsć taki wariant tego poziomu? ;>` )
    }
  },
  { num: 9,
    clothesToClear: 2,
    map: [
      [ 0, 1, 1, 1, 1, 1, 0 ],
      [ 1, 6, 1, 1, 1, 4, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 0, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 8, 1, 1, 1, 6, 1 ],
      [ 0, 1, 1, 1, 1, 1, 0 ],
    ],
    data: { conveyors:17 },
    async dialogs() {
      const D = Dialogs

      await D.pause( 3 )
      D.say( `*haha*` )
      await D.pause( 2 )
      D.say( `Genialny poziom` )
    }
  },
  { num: 10,
    clothesToClear: 1,
    map: [
      [ 0, 1, 1, 1, 1, 1, 0 ],
      [ 1, 6, 1, 1, 1, 4, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 0, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 8, 1, 1, 1, 6, 1 ],
      [ 0, 1, 1, 1, 1, 1, 0 ],
    ],
    data: { conveyors:1 },
    async dialogs() {
      const D = Dialogs

      await D.pause( 3 )
      D.say( `Cóż` )
      await D.pause( 2 )
      D.say( `Szybciej przechodzisz poziomy niż ja je kreuję.  Na tym musimy zakończyć - nie przygotowałem dla Ciebie nic więcej` )
      await D.pause( 10 )
      D.say( `Jakbyś miał tu jednak problem tu podpowiem, że musisz dobrze celować w środek ;f` )
    }
  }
]