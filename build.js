import {readFileSync,writeFileSync} from 'node:fs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const logic=read('domain.js').replaceAll('export function ','function ');
const app=read('app.js').replace(/^import .*?;\n/,'');
const page=read('index.html')
  .replace('<link rel="stylesheet" href="style.css">',()=>`<style>${read('style.css')}</style>`)
  .replace('<script type="module" src="app.js"></script>',()=>`<script>${logic}\n${app}</script>`)
  .replace('href="./"','href="#"');
writeFileSync(new URL('Jass-Jura.html',import.meta.url),page);
console.log('Jass-Jura.html créé : ouvrir ce fichier dans un navigateur.');
