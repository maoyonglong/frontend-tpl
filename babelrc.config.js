export default {
  plugins: [
    [
      '@babel/transform-runtime',
      {
        helpers: true
      }
    ]
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        'modules': false
      }
    ]
  ]
}
