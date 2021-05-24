import React, { useState } from "react"

import * as classes from "./main.module.css"

import badLuckMp3 from "../audio/bad_luck.mp3"
import goodLuckMp3 from "../audio/good_luck.mp3"

const audio = {
  badLuck: new Audio( badLuckMp3 ),
  goodLuck: new Audio( goodLuckMp3 ),
}

export default function LuckMatrice({ luckChance, onLuck, onBadLuck }) {
  const [ areCellsShowed, setCellsVisibility ] = useState( false )
  const [ luckyNumbers ] = useState( () => {
    const luckyNumbers = []

    if (1 > luckChance && luckChance > 0) luckChance *= 100
    if (luckChance > 100) luckChance = 100

    while (luckChance > 0) {
      const randomNum = Math.floor( Math.random() * 100 )

      if (luckyNumbers.includes( randomNum )) continue

      luckChance--
      luckyNumbers.push( randomNum )
    }

    return luckyNumbers
  } )

  const trs = []

  for (let i = 0;  i < 10;  ++i) {
    const tds = []

    for (let j = 0;  j < 10;  ++j) {
      const luckyIndex = luckyNumbers.includes( 10 * i + j )
      const onClick = () => {
        setCellsVisibility( true )

        if (luckyIndex) {
          audio.goodLuck.play()
          onLuck?.()
        } else {
          audio.badLuck.play()
          onBadLuck?.()
        }
      }

      tds.push(
        <td key={j} className={classes.luckyTableCell}>
          {areCellsShowed ? (
            <span className={`${classes.luckyCell} ${luckyIndex ? classes.isLucky : classes.isNotLucky}`} />
          ) : (
            <button className={classes.luckyCell} onClick={onClick} />
          )}

        </td>,
      )
    }

    trs.push( <tr key={i}>{tds}</tr> )
  }

  return (
    <table className={classes.luckyTable}>
      <tbody>{trs}</tbody>
    </table>
  )
}
