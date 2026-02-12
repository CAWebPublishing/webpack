/**
 * These are tests for the CAWebPublishing Template
 */

/**
 * External Dependencies
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import deepmerge from 'deepmerge';
import Handlebars from 'handlebars';

/**
 * Internal Dependencies
*/
import { getArgVal, flags } from '../lib/args.js';

// this is the path to the current project directory
const appPath = process.cwd();

// this is the path to this current file
const currentPath = path.dirname(fileURLToPath(import.meta.url));

// we read the test data caweb.json file 
let testCaweb = JSON.parse( fs.readFileSync( path.join(currentPath, 'caweb.json') ) );

// we read the app caweb.json file if it exists
let defaultCaweb = fs.existsSync( path.join(appPath, 'caweb.json') ) ? 
JSON.parse(fs.readFileSync(path.join(appPath, 'caweb.json'))) 
: {};

// merge the two caweb.json files, with the project data taking precedence
let caweb = deepmerge( testCaweb, defaultCaweb  );

let templatePath = path.join(appPath, 'node_modules', '@caweb', 'template');
let template = getArgVal( 'template', path.join(templatePath, 'patterns', 'default.html') );
let scheme = getArgVal( 'scheme', 'oceanside' );
let favicon = caweb?.site?.favicon ?? null;


export default {
    plugins: [
        // this plugin generates the main landing page using the template found in patterns/index.html
        new HtmlWebpackPlugin({
            template: path.resolve(template),
            favicon,
            templateParameters: {
                ...caweb.site, // we spread the site data found in the caweb.json file
                scheme ,
            }
        }),

    ].filter(Boolean)
};