import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import babelConfig from './babelrc.config'

const isBuild = process.env.isBuild || false

const basePlugin = [
  commonjs(),
  babel({
    runtimeHelpers: true,
    ...babelConfig
  })
]

const plugins = isBuild ? basePlugin.concat([ uglify() ]) : basePlugin

const devOutputs = [
  {
    name: 'Tpl',
    file: 'dist/tpl.js',
    format: 'umd'
  },
  {
    name: 'Tpl',
    file: 'lib/tpl.js',
    format: 'cjs'
  }
]

const prodOutput = {
  name: 'Tpl',
  file: 'dist/tpl.bundle.js',
  format: 'umd'
}

const output = isBuild ? prodOutput : devOutputs

export default {
  input: 'src/index.js',
  output,
  plugins
}
