import NextImage from "next/image"
import { cn, createStylesHook, CSSProperties } from "../../theming"

export type ImageJustify = `left` | `center` | `right`
export type ImageProps = {
  src: string
  alt: string
  href?: string
  fill?: boolean
  height?: number
  width?: number
  inline?: boolean
  priority?: boolean
  id?: string
  className?: string
  style?: CSSProperties
  align?: ImageJustify
  quality?: number
  loading?: `lazy`
}

export default function Image({ className, id, src, alt, fill, priority, quality, width, height, inline, loading, style, align }:ImageProps) {
  const [ classes ] = useStyles()

  if (align) {
    style ||= {}

    if (align === `center`) style[ `marginInline` ] = `auto`
    else if (align === `right`) style[ `marginLeft` ] = `auto`
  }

  if (inline) return (
    <figure className={cn( classes.inlineFigure, className )} style={{ width, height }}>
      <img id={id} className={classes.inlineImg} loading="lazy" src={src} alt={alt} />
    </figure>
  )

  if (width || height) {
    if (width && height) return (
      <NextImage id={id} className={cn( classes.img, className )} loading={loading} priority={priority} quality={quality} width={width} height={height} style={{ height:height ? undefined : `unset`, ...style }} src={src} alt={alt} />
    )

    return (
      <figure className={cn( classes.figure, className )} style={{ width, height }}>
        <img id={id} className={classes.img} loading="lazy" src={src} alt={alt}  />
      </figure>
    )
  }

  if (fill) return (
    <NextImage id={id} className={cn( classes.img, className )} loading={loading} priority={priority} quality={quality} src={src} alt={alt} />
  )

  return (
    <img id={id} className={cn( classes.img, className )} style={style} loading="lazy" src={src} alt={alt} />
  )
}

const useStyles = createStylesHook( ({ components }) => ({
  figure: {
    display: `flex`,
    alignItems: `center`,
    justifyContent: `center`,
    margin: 0,
  },
  img: {
    display: `block`,
    // width: `max-content`,
    maxWidth: `100%`,
    maxHeight: `100%`,

    ...components.Image,
  },
  inlineFigure: {
    display: `inline-block`,
    margin: 0,
    textAlign: `center`,
    width: `1em`,
    height: `1em`,
  },
  inlineImg: {
    verticalAlign: `middle`,
  },
}), `lib::Image` )
