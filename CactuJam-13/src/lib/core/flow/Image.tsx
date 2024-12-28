/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import NextImage from "next/image"
import cn from "../functions/createClassName"
import Link from "../controls/Link"
import classes from "./image.module.css"

export type ImageJustify = `left` | `center` | `right` | `float left` | `float right`
export type ImageProps = {
  src: string
  alt: string
  href?: string
  fill?: boolean
  height?: number
  aspectRatio?: number
  width?: number
  inline?: boolean
  priority?: boolean
  className?: string
  id?: string
  style?: React.CSSProperties
  wrapperStyle?: React.CSSProperties
  align?: ImageJustify
  quality?: number
}

export default function Image({ className, id, fill, href, src, alt, priority, quality, width, height, aspectRatio, inline, wrapperStyle = {}, style, align }:ImageProps) {
  if (align && align !== `left`) {
    if (align === `float left`) wrapperStyle.float = `left`
    else if (align === `float right`) wrapperStyle.float = `right`
    else if (align === `center`) wrapperStyle.justifyContent = `center`
    else if (align === `right`) wrapperStyle.justifyContent = `right`
  }

  let imgElement = null
  const commonProps = {
    className: cn( classes.img, className ),
    style,
    alt,
    src,
    id,
  }

  if (inline) imgElement = <img {...commonProps} className={classes.inlineImg} loading="lazy" />

  const recalculatedDimensions = {
    width: typeof width !== `number` ? width : Math.round( width ),
    // height: typeof height !== `number` ? height : typeof width !== `number`
    //   ? Math.round( height )
    //   : Math.round( width ) < width ? Math.floor( height ) : Math.ceil( height ),
    height: typeof height !== `number` ? height : Math.round( height ),
  }

  if (recalculatedDimensions.width || recalculatedDimensions.height) {
    const { width, height } = recalculatedDimensions

    if (!aspectRatio && (!width || !height)) imgElement = <img {...commonProps} style={style} loading="lazy" width={width} height={height} />
    else {
      imgElement = (
        <NextImage
          {...commonProps}
          style={width ? { height:`unset`, ...style } : { width:`unset`, ...style }}
          width={width ? Math.round( width ) : (!height || !aspectRatio  ? undefined : height / aspectRatio)}
          height={height ? Math.round( height ) : (!width || !aspectRatio  ? undefined : width * aspectRatio)}
          quality={quality}
          priority={priority}
        />
      )
    }
  }

  if (fill) imgElement = (
    <NextImage
      {...commonProps}
      fill
      quality={quality}
      priority={priority}
    />
  )

  imgElement ??= <img {...commonProps} style={style} loading="lazy" />

  if (href) imgElement = <Link href={href}>{imgElement}</Link>
  if (!Object.keys( wrapperStyle ).length) return imgElement

  return (
    <figure className={classes.imageWrapper} style={wrapperStyle}>
      {imgElement}
    </figure>
  )
}

// const useStyles = ({ components }) => ({
//   imageWrapper: {
//     display: `flex`,
//     margin: 0,
//   },
//   img: {
//     maxWidth: `100%`,
//     maxHeight: `100%`,

//     ...components.Image,
//   },
//   inlineFigure: {
//     display: `inline-block`,
//     margin: 0,
//     textAlign: `center`,
//     width: `1em`,
//     height: `1em`,
//   },
//   inlineImg: {
//     verticalAlign: `middle`,
//   },
// })
