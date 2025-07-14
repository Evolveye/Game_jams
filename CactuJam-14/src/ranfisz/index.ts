import ImgManager from "../ImgManager"
import classes from "./ranfisz-init.module.css"
import ranfiszImgSrc from "./img/ranfisz.png"
import ranfiszWithoutCupImgSrc from "./img/ranfisz-without_cup.png"
import ranfiszDrinkingSrc from "./img/ranfisz-drinking.gif"
import ranfiszMuscularLeftLegImgSrc from "./img/leg-left.png"

export type LegsController = {
  rotateLeftLeg: (angle:number) => void
  rotateRightLeg: (angle:number) => void
}

export default class Ranfisz {
  static readonly img = {
    ranfiszImgSrc,
    ranfiszWithoutCupImgSrc,
    ranfiszMuscularLeftLegImgSrc,
  }

  static getRanfiszInitLegsHtml() {
    const ranfiszWithlegswrapper = document.createElement( `div` )
    ranfiszWithlegswrapper.className = classes.ranfiszWithlegswrapper
    ranfiszWithlegswrapper.append( ImgManager.createImage({ src:ranfiszWithoutCupImgSrc, class:classes.ranfisz, alt:`Ranfisz without cup` }) )
    ranfiszWithlegswrapper.append( ImgManager.createImage({ src:ranfiszMuscularLeftLegImgSrc, class:`${classes.leftLeg} ${classes.init}`, alt:`Ranfisz left leg` }) )
    ranfiszWithlegswrapper.append( ImgManager.createImage({ src:ranfiszMuscularLeftLegImgSrc, class:`${classes.rightLeg} ${classes.init}`, alt:`Ranfisz left leg as right leg` }) )

    return ranfiszWithlegswrapper
  }

  static getRanfiszDrinkingHtml() {
    return ImgManager.createImage({ src:ranfiszDrinkingSrc, class:classes.ranfisz, alt:`Ranfisz drinking on gif for Discord` })
  }

  static getRanfiszInit( cb?:() => void ) {
    const wrapper = document.createElement( `div` )
    const ranfisz = ImgManager.createImage({ src:ranfiszImgSrc, alt:`Ranfisz` })
    const drinkingRanfisz = this.getRanfiszDrinkingHtml()
    const dancingRanfisz = this.getRanfiszInitLegsHtml()

    wrapper.className = classes.wrapper

    wrapper.append( ranfisz )
    setTimeout( () => {
      wrapper.append( drinkingRanfisz )
      setTimeout( () => ranfisz.remove(), 100 )
    }, 3000 )

    setTimeout( () => {
      wrapper.append( ranfisz )
      setTimeout( () => drinkingRanfisz.remove(), 100 )
    }, 5000 )

    setTimeout( () => {
      wrapper.append( dancingRanfisz )
      setTimeout( () => ranfisz.remove(), 100 )
      cb?.()
    }, 6000 )

    return wrapper
  }

  static getRanfiszDancingLegsWithController( existingRanfiszContainer?:HTMLDivElement ) {
    let ranfiszWithlegswrapper = document.createElement( `div` )
    let leftLeg = ImgManager.createImage({ src:ranfiszMuscularLeftLegImgSrc, class:classes.leftLeg, alt:`Ranfisz left leg` })
    let rightLeg = ImgManager.createImage({ src:ranfiszMuscularLeftLegImgSrc, class:classes.rightLeg, alt:`Ranfisz left leg as right leg` })

    if (existingRanfiszContainer) {
      const maybeRanfiszWithlegswrapper = existingRanfiszContainer.querySelector( `.${classes.ranfiszWithlegswrapper}` ) as null | HTMLDivElement
      if (!maybeRanfiszWithlegswrapper) throw new Error( `Dancing ranfisz not found` )

      const maybeLeftLeg = existingRanfiszContainer.querySelector( `.${classes.leftLeg}` ) as null | HTMLImageElement
      if (!maybeLeftLeg) throw new Error( `Dancing ranfisz not found` )

      const maybeRightLeg = existingRanfiszContainer.querySelector( `.${classes.rightLeg}` ) as null | HTMLImageElement
      if (!maybeRightLeg) throw new Error( `Dancing ranfisz not found` )

      ranfiszWithlegswrapper = maybeRanfiszWithlegswrapper
      leftLeg = maybeLeftLeg
      rightLeg = maybeRightLeg
    } else {
      ranfiszWithlegswrapper.className = classes.ranfiszWithlegswrapper
      ranfiszWithlegswrapper.append( ImgManager.createImage({ src:ranfiszWithoutCupImgSrc, class:classes.ranfisz, alt:`Ranfisz without cup` }) )
      ranfiszWithlegswrapper.append( leftLeg )
      ranfiszWithlegswrapper.append( rightLeg )
    }

    return {
      html: ranfiszWithlegswrapper,
      rotateLeftLeg( angle:number ) {
        leftLeg.style.rotate = `${angle}deg`
      },
      rotateRightLeg( angle:number ) {
        rightLeg.style.rotate = `${-angle}deg`
      },
    }
  }
}
