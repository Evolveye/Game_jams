type EventHandlers = {
  [K in keyof HTMLElementEventMap as `on${Capitalize<K>}`]?:(this:HTMLElement, ev:HTMLElementEventMap[K]) => void
}

type Arrayable<T> = T | T[]

type CustomProperties = {
  children?: Arrayable<number | string | HTMLElement | (() => HTMLElement)>
}

type Properties = EventHandlers & CustomProperties & {
  [key:string]: string | number | any // eslint-disable-line @typescript-eslint/no-explicit-any -- Required to connect other types
}

export default function createTag<T extends HTMLElement>( tag:string, { children, ...attributes }:Properties = {} ) {
  const element = document.createElement( tag ) as T
  const isEvent = (property:string): property is keyof HTMLElementEventMap => property.startsWith( `on` )

  for (const attribute in attributes) {
    if (isEvent( attribute )) {
      element.addEventListener(
        attribute.slice( 2 ).toLowerCase(), attributes[ attribute ] as (this:HTMLDocument, ev:DocumentEventMap[keyof DocumentEventMap]) => void,
      )
    } else {
      element.setAttribute( attribute, `${attributes[ attribute ]}` )
    }
  }

  const renderChildren = (children:CustomProperties[`children`]) => {
    switch (typeof children) {
      case `object`:
        if (Array.isArray( children )) {
          for (const c of children) renderChildren( c )
          break
        } else element.appendChild( children ); break
      case `function`: element.appendChild( children() ); break
      case `string`: element.append( children ); break
      case `number`: element.append( `${children}` ); break
    }
  }

  renderChildren( children )

  return element
}

declare global {
  interface Window {
    createTag: typeof createTag
  }
}

window.createTag = createTag
