const maps = [
  [
    [ 0, 0,  0,  0, 0,  0 ],
    [ 0, 41, 0,  0, 0,  0 ],
    [ 0, 5,  42, 0, 0,  0 ],
    [ 0, 43, 1,  1, 44, 0 ],
    [ 0, 0,  1,  1, 45, 0 ],
    [ 0, 0,  0,  0, 0,  0 ]
  ],
  [
    [ 0, 1, 1, 6, 0, 32, 1, 1, 1, 1, 1 ],
    [ 0, 1, 0, 0, 0, 1,  0, 0, 0, 0, 1 ],
    [ 0, 1, 0, 0, 0, 1,  1, 1, 1, 1, 1 ],
    [ 2, 1, 1, 1, 1, 2,  0, 0, 0, 0, 6 ],
    [ 0, 1, 0, 0, 0, 1 ],
    [ 0, 1, 6, 0, 6, 1 ],
    [ 0, 0, 0, 0, 0, 0 ]
  ],
  [
    [ 0, 0, 0, 0, 0,  0, 1, 33, 1, 6, 0, 0 ],
    [ 0, 0, 1, 6, 0,  0, 1, 0,  1, 0, 0, 0 ],
    [ 0, 0, 1, 0, 0,  0, 1, 1,  1, 1 ],
    [ 6, 1, 2, 1, 1,  1, 1, 0,  0, 1 ],
    [ 0, 0, 1, 0, 0,  0, 1, 0,  0, 1 ],
    [ 0, 0, 1, 0, 1,  1, 1, 1,  1, 1 ],
    [ 0, 0, 1, 1, 31, 0, 0, 0,  6, 0 ]
  ],
  [
    [ 33, 1, 1, 2, 1, 1, 1, 1, 33 ],
    [ 0,  0, 0, 0, 0, 1 ],
    [ 0,  0, 1, 0, 0, 1, 0, 1, 1,  1, 1 ],
    [ 6,  1, 1, 1, 1, 1, 0, 1, 0,  0, 1 ],
    [ 0,  0, 1, 0, 0, 1, 0, 1, 0,  0, 1 ],
    [ 0,  0, 1, 0, 1, 1, 1, 1, 1,  1, 1 ],
    [ 0,  0, 1, 1, 0, 6, 0, 0, 0,  6 ]
  ],
  [
    [ 34, 0,  1, 2, 1, 0, 1, 1, 35 ],
    [ 1,  0,  1, 0, 1, 1, 1, 0, 1  ],
    [ 1,  1,  1, 0, 1, 0, 1, 0, 1, 1, 1 ],
    [ 6,  0,  1, 0, 1, 1, 1, 1, 1, 0, 1 ],
    [ 0,  6,  1, 0, 1, 0, 0, 1, 0, 0, 1 ],
    [ 6,  0,  1, 0, 1, 1, 0, 1, 1, 1, 1 ],
    [ 1,  34, 1, 0, 0, 1, 1, 1, 0, 6 ]
  ],
  [
    [ 34, 0,  1, 2, 1, 0, 1, 1, 35 ],
    [ 1,  0,  1, 0, 1, 1, 1, 0, 1  ],
    [ 1,  1,  1, 0, 1, 0, 1, 0, 1, 1, 1 ],
    [ 6,  0,  1, 0, 1, 1, 1, 1, 1, 0, 1 ],
    [ 0,  6,  1, 0, 1, 0, 0, 1, 0, 0, 1 ],
    [ 6,  0,  1, 0, 1, 1, 0, 1, 0, 1, 1 ],
    [ 1,  34, 1, 0, 0, 1, 1, 1, 1, 6 ]
  ],
  // [
  //   [ 6,  1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 6  ],
  //   [ 1,  0, 0, 0, 1, 0, 2,  0, 1, 0, 0, 0, 1  ],
  //   [ 35, 1, 1, 1, 1, 1, 0,  1, 1, 1, 1, 1, 35 ],
  //   [ 1,  0, 0, 1, 0, 1, 1,  1, 0, 1, 0, 0, 1  ],
  //   [ 1,  0, 0, 1, 0, 0, 1,  0, 0, 1, 0, 0, 1  ],
  //   [ 6,  1, 1, 1, 0, 6, 35, 6, 0, 1, 1, 1, 6  ]
  // ]
]

maps[ 98 ] = [[]] // editor
maps[ 99 ] = [[]] // custom