#!/usr/bin/env node

/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fontBuildPath = path.join(currentPath, 'build', 'fonts');


// iterate over all svg files
fs.readdirSync(fontBuildPath).filter( (e) => e.endsWith('.svg')).forEach((c) => {
    
    // we can't use a parser otherwise some of the unicodes will be encoded
    // we parse the file ourselves.
    let svgContent = fs.readFileSync(path.join(fontBuildPath, c)).toString();

    // we only want the glyph with unicodes
    let icons = [ ...svgContent.matchAll(/glyph unicode=[^\n].*/g) ].map((i) => {
        let raw = i[0];
        let glyph = raw.match(/glyph-name="([\S]+)"/);

        // only if there is a name associated with the glyph.
        if( glyph ){

            let unicode = raw.match(/unicode="([\S]+)"/)[1];
            let name = glyph[1];
            let ws = name.replace(/[_-]/g, ' ').split(' ');
            
            // the styles is applied by certain editors/builders
            // divi - Applies Divi Theme Support
            // line - Applies Line Styles
            // solid - Applied Solid Styles
            let styles = [
                'divi',
                ws.includes('line') ? 'line' : 'solid'
            ]

            return {
                glyph: name,
                unicode,
                name: ws.map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(' '), // uppercase all words and join with a space
                search_terms: ws.join(' '),
                styles
            }
        }


    }).filter(e=>e); // clear out any null values

    // write svg json output
    fs.writeFileSync(
        path.join(fontBuildPath, `${c.substring(0, c.lastIndexOf('.'))}.json`),
        JSON.stringify( icons, null, 4 )
    )    

  })