import { ChangeEvent } from "react"
import { cn } from "@lib/theming"
import { Button } from "@lib/components/controls"
import useStyles from "./ueStyles"

export type GameStartScreenProps = {
  className?: string
  onStartClick: () => void
}

export default function GameStartScreen({ className, onStartClick }:GameStartScreenProps) {
  const [ classes, theme ] = useStyles()

  const colors = {
    positive: colorHexToRgb( theme.atoms.colors.positive ),
    negative: colorHexToRgb( theme.atoms.colors.negative ),
    background: colorHexToRgb( theme.atoms.colors.background ),
  }

  const handleChange = (type:`positive` | `negative` | `background`, part:`r` | `g` | `b`, value:number) => {
    if (Number.isNaN( value )) value = 0

    console.log( theme.state, value, blendColors( theme.state[ `${type}Color` ], part, value ) )
    theme.setState( `${type}Color`, blendColors( theme.state[ `${type}Color` ], part, value ) )
  }

  const handle = (fn:(value:number) => void) => (e:ChangeEvent<HTMLInputElement>) => {
    fn( e.target.valueAsNumber )
  }

  type ColorType = keyof typeof colors
  type StateColor = keyof typeof theme.state

  return (
    <section className={cn( classes.gameStartScreen, className )}>
      <div style={{ textAlign:`center` }}>
        <h1>Wyprawa w nieznane</h1>
        <p>Jako przypadkowo wybrany podróżnik, nie masz pojęcia jak kierować statkami.</p>
        <p>Los jednak chciał, że musisz się tego prędko nauczyć. Z początku nie będzie łatwo, lecz z czasem powinieneś załapać.</p>
        <p>Kto wie, jakie niebezpieczeństwa na Ciebie czekają...</p>

        <br />

        <h1>Paleta barw</h1>
        <p>Możesz ustawić własne 3 kolory, z których składać się będzie kolorystyka aplikacji</p>
      </div>

      <div className={classes.colorsSetters} style={{ textAlign:`center` }}>
        {
          Object.keys( colors ).map( type => (
            <div key={type} className={classes.colorSetter}>
              <input type="number" min={0} max={255} value={colors[ type as ColorType ].r} onChange={handle( v => handleChange( type as ColorType, `r`, v ) )} />
              <input type="number" min={0} max={255} value={colors[ type as ColorType ].g} onChange={handle( v => handleChange( type as ColorType, `g`, v ) )} />
              <input type="number" min={0} max={255} value={colors[ type as ColorType ].b} onChange={handle( v => handleChange( type as ColorType, `b`, v ) )} />

              <div className={cn( classes.frame, classes.colorBox )} style={{ backgroundColor:theme.state[ `${type}Color` as StateColor ] }} />
            </div>
          ) )
        }
      </div>

      <Button variant="clean" body="Rozpocznij wyprawę" onClick={onStartClick} />
    </section>
  )
}

function colorHexToRgb( hex:string ) {
  return {
    r: parseInt( hex.slice( 1, 3 ), 16 ),
    g: parseInt( hex.slice( 3, 5 ), 16 ),
    b: parseInt( hex.slice( 5, 7 ), 16 ),
  }
}

function blendColors( hex:string, color:`r` | `g` | `b`, value:number ) {
  const hexValue = value.toString( 16 ).padStart( 2, `0` )
  const sliceIndex = color === `r` ? 1 : color === `g` ? 3 : 5

  return hex.slice( 0, sliceIndex ) + hexValue + hex.slice( sliceIndex + 2 )
}
