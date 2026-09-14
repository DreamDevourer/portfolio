import { defineConfig } from 'astro/config';
export default defineConfig({
  site:'https://nickdesign.netlify.app',output:'static',outDir:'../.site-build',
  build:{format:'file',assets:'static/redesign/build',inlineStylesheets:'never'},
  vite:{build:{cssMinify:false},css:{transformer:'postcss'}},
  trailingSlash:'never',
  server:{host:'127.0.0.1',port:4321},
});
