import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import {terser} from 'rollup-plugin-terser';

const externalLibs = ['react', 'react-dom', 'react-redux', 'react-router-dom', 'redux', 'history'];
const globals = ['react', 'react-dom', 'react-redux', 'react-router-dom', 'redux', 'history'];
const noDeclarationFiles = { compilerOptions: { declaration: false } }

export default [{
  input: './src/index.tsx',
  output: [
    {
      file: 'libs/es/dva-lite.js',
      format: 'es',
      exports: 'named',
    },
    {
      file: 'libs/cjs/dva-lite.js',
      format: 'cjs',
      exports: 'named',
    },
  ],
  external: externalLibs,
  plugins: [
    resolve(),
    typescript({ tsconfigOverride: noDeclarationFiles }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
}, {
  input: './src/index.tsx',
  output: [
    {
      file: 'libs/umd/dva-lite.js',
      format: 'umd',
      name: 'dvaL',
      exports: 'named',
    }
  ],
  external: externalLibs,
  plugins: [
    resolve(),
    typescript({ useTsconfigDeclarationDir: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
}, {
  input: './src/index.tsx',
  output: [
    {
      file: 'libs/umd/dva-lite.min.js',
      format: 'umd',
      name: 'dvaL',
      exports: 'named',
    }
  ],
  external: externalLibs,
  plugins: [
    resolve(),
    typescript({ tsconfigOverride: noDeclarationFiles }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    terser({mangle: false}),],
}];