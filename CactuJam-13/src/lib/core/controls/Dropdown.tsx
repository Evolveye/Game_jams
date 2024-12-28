"use client"

import React, { useId, useMemo, useState } from "react"
import useFormInputStateProps from "@lib/core/hooks/useFormInputStateProps"
import cn from "@lib/core/functions/createClassName"
import classes from "./Dropdown.module.css"
import useElementClick from "@lib/core/hooks/useElementClick"
import { ButtonProps } from "./ButtonInteractions"

export type DropdownOptionAsButton = {
  name: string
  label: React.ReactNode
  onClick?: ButtonProps[`onClick`]
}

export type DropdownOptionAsLabel = {
  name: string
  label: React.ReactNode
  value: string
  defaultChecked?: boolean
}

export type DropdownOption = DropdownOptionAsLabel | DropdownOptionAsButton

type ItemsRenderer = (props?:React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => React.ReactNode
export type DropdownProps<T extends string | DropdownOption> = {
  name: string
  className?: string
  defaultCheckedName?: string
  optionsClassName?: string
  optionsFilter?: string
  hoverable?: boolean
  multiselect?: boolean | number
  options: T[]
  optionsReloadDependency?: unknown[]
  disableRelativeWrapper?: boolean
  chooseShouldCloseDropdown?: boolean
  renderLabel?: (data:{
    values: (T & DropdownOptionAsLabel)[]
    htmlFor: string
    onClick: () => void
  }) => React.ReactNode
  renderCustomList?: (data:{
    renderItems: ItemsRenderer
  }) => React.ReactNode
  renderItem: (data:{
    option: T
    getItemKey: () => string
    Item: (props:{ children:React.ReactNode } & Pick<DropdownItemProps, `wrapperClassName` | `className` | `style`>) => React.ReactNode
  }) => React.ReactNode
}

export default function Dropdown<T extends string | DropdownOption>({ className, optionsFilter, disableRelativeWrapper, defaultCheckedName, optionsClassName, chooseShouldCloseDropdown, name, multiselect, hoverable, renderLabel, renderCustomList, renderItem, options, optionsReloadDependency = [] }:DropdownProps<T>) {
  const [ inputProps ] = useFormInputStateProps({
    internalState: true,
    defaultValue: defaultCheckedName
      ? (options.find( o => isValueOption( o ) && o.name === defaultCheckedName ) as T & DropdownOptionAsLabel)?.name
      : undefined,
  })

  const [ isOpened, setOpened ] = useState( false )
  const dropdownRef = useElementClick<HTMLDivElement>({ activate:isOpened, cb:clicked => !clicked && setOpened( false ) })
  const id = `${useId()}input`

  const inputType = multiselect ? `checkbox` : `radio`
  const valueNames = new Set( inputProps.value?.split( `,` ).filter( Boolean ) )
  const multiSelectLimit = typeof multiselect === `number` ? multiselect : !multiselect ? false : Infinity

  const handleItemChangeEvent = (optionName:string) => {
    if (valueNames.has( optionName )) valueNames.delete( optionName )
    else if (multiSelectLimit === false) {
      valueNames.clear()
      valueNames.add( optionName )
    } else if (valueNames.size < multiSelectLimit) valueNames.add( optionName )

    inputProps.onChange( [ ...valueNames ].join( `,` ) )

    if (chooseShouldCloseDropdown) setOpened( false )
  }

  const renderItems:ItemsRenderer = props => <ul {...props}>{optionsList}</ul>

  const optionsList = useMemo( () => {
    const optionsList:React.ReactNode[] = []
    let decorationId = 0

    for (const option of options) {
      if (!isValueOption( option )) continue
      if (optionsFilter && !option.name.includes( optionsFilter ) && !option.value.includes( optionsFilter )) continue
      optionsList.push( renderItem({
        option,
        getItemKey: () => typeof option === `object` ? option.name : `${decorationId++}`,
        Item: ({ children, ...props }) => {
          if (typeof option !== `object` || !(`value` in option)) throw new Error( `Select item should be an object with a value` )
          return (
            <DropdownItem
              key={option.name}
              name={`${name}:${option.name}`}
              {...props}
              label={children}
              onChange={() => handleItemChangeEvent( option.name )}
              checked={valueNames.has( option.name )}
              type={inputType}
              value={option.value}
            />
          )
        },
      }) )
    }

    return optionsList
  }, [ inputProps.value, optionsFilter, ...optionsReloadDependency ] )

  const selectedOptions = useMemo( () => {
    const selectedOptions:(T & DropdownOptionAsLabel)[] = []

    for (const option of options) {
      if (isValueOption( option ) && valueNames.has( option.name )) selectedOptions.push( option )
    }

    return selectedOptions
  }, [ inputProps.value ] )

  return (
    <div ref={dropdownRef} className={cn( classes.dropdown, !disableRelativeWrapper && classes.optionsWrapper, hoverable && classes.isHoverable, className )}>
      <input type="checkbox" id={id} hidden checked={isOpened} readOnly />

      {
        renderLabel?.({
          htmlFor: id,
          onClick: () => setOpened( b => !b ),
          values: selectedOptions,
        }) ?? (
          <label className={classes.dropdownLabel} onClick={() => setOpened( b => !b )} htmlFor={id}>
            <span>Select</span>
            <output>{selectedOptions.map( o => <React.Fragment key={o.name}>{o.label}</React.Fragment> )}</output>
          </label>
        )
      }

      {
        renderCustomList
          ? <div className={cn( classes.options, optionsClassName )}>{renderCustomList({ renderItems })}</div>
          : renderItems({ className:cn( classes.options, optionsClassName ) })
      }
    </div>
  )
}

export type DropdownItemProps = {
  wrapperClassName?: string
  className?: string
  style?: React.CSSProperties
  type: `checkbox` | `radio`
  value: string
  name: string
  checked?: boolean
  onChange: () => void
  label: React.ReactNode
}

export function DropdownItem({ wrapperClassName, className, style, label, ...props }:DropdownItemProps) {
  return (
    <li className={wrapperClassName} style={style}>
      <label className={className}>
        <input hidden {...props} />
        {label}
      </label>
    </li>
  )
}

function isValueOption<T extends string | DropdownOption>(option:T): option is T & DropdownOptionAsLabel {
  return typeof option === `object` && `value` in option
}
