declare module '*.css' {
  const classes: {[className: string]: string}
  export = classes;
}
declare module '*.png' {
  const src: string
  export = src;
}
