/**
 * External Dependencies
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentPath = path.dirname(fileURLToPath(import.meta.url));

let entry = {};

// iterate over all colorschemes
fs.readdirSync(path.join(currentPath, 'src', 'styles', 'colorschemes')).forEach((color) => {
  var scheme = color.substring(0, color.indexOf('.')).replace(' ', '');

  // add entries for each colorscheme 
  entry[scheme] = [
    path.join(currentPath, 'src', 'styles', 'colorschemes', color),
    path.join(currentPath, 'src', 'styles', 'index.scss'),
    path.join(currentPath, 'src', 'scripts', 'index.js')
  ]
})

export default {
  entry
}