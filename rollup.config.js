import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import babelConfig from './babelrc.config'

const isBuild = process.env.isBuild || false

console.log(isBuild)

export default {
  input: 'src/index.js',
  output: {
    name: 'Tpl',
    file: isBuild ? 'dist/tpl.bundle.js' : '__jest__/tpl.js',
    format: isBuild ? 'umd' : 'cjs'
  },
  plugins: [
    commonjs(),
    babel({
      runtimeHelpers: true,
      ...babelConfig
    }),
    isBuild ? uglify() : undefined
  ]
}
