#!/usr/bin/env node

/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let entry = {
    'font-only': path.join(currentPath, 'src', 'styles', 'font-only.css')
};

// create the entry directory
fs.mkdirSync('entry', {recursive: true});

let heading = `/**
 *  Autogenerated Entrypoint  
 *  DO NOT MODIFY
 */\n`;

// iterate over all colorschemes
fs.readdirSync(path.join(currentPath, 'src', 'styles', 'colorschemes')).forEach((c) => {
    let scheme = c.substring(0, c.indexOf('.')).replace(' ', '');
    let files = [
        path.join(currentPath, 'src', 'styles', 'colorschemes', c),
        path.join(currentPath, 'src', 'styles', 'index.scss'),
        path.join(currentPath, 'src', 'scripts', 'index.js')
      ]
    // add entries for each colorscheme 
    entry[scheme] = files;

    let correctFiles = files.map(f => `'${f.replace(process.cwd(), '').replaceAll('\\', '/')}'`)
    let output = `
import path from 'path';
import { fileURLToPath } from 'url';
const currentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default {
    entry: {
        'font-only': path.join(currentPath, 'src', 'styles', 'font-only.css'),
        ${scheme}: [
            path.join(currentPath, ${correctFiles.join('),\n' + `\t`.repeat(3) + 'path.join(currentPath, ')})
        ]
    }
};
    `;


    // write and entrypoint 
    // this allows for serving of a specific entry.
    fs.writeFileSync(
        `./entry/${scheme}.js`,
        `${heading} ${output}`
    )

  })


export default {entry};