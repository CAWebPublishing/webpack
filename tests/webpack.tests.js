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
import { getArgVal } from '../lib/args.js';

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
let searchTemplate = getArgVal( 'search-template', path.join(templatePath, 'patterns', 'search.html') );

let scheme = getArgVal( 'scheme', 'oceanside' );
let favicon = caweb?.site?.favicon ?? null;

// // Additional pages directory
let basePageDir = path.join(appPath, 'content', 'pages');

let additionalPages = ! fs.existsSync( basePageDir ) ? [] :
    fs.readdirSync( basePageDir, { withFileTypes: true, recursive: true } )
        .filter( dirent => dirent.isFile() && (dirent.name.endsWith('.html') || dirent.name.endsWith('.handlebars')) )
        .map( ( dirent ) => {

            let fileTemplate = path.join( dirent.parentPath, dirent.name );
            
            // replace .html, uppercase the first letter of each word
            // this is to make sure the title is readable
            // and not just a file name
            let title = dirent.name.replace('.html', '').replace(/\b\w/g, c => c.toUpperCase());
            let content = fs.readFileSync( fileTemplate, 'utf-8' );
            let data = {
                ...caweb.site,
                scheme
            };
            let compiler = Handlebars.compile( content );
            let compiledContent = compiler(data);

            return new HtmlWebpackPlugin({
                template,
                filename: fileTemplate.replace(basePageDir, ''),
                title,
                templateParameters: {
                    ...caweb.site, // we spread the site data found in the caweb.json file
                    scheme,
                    partial: compiledContent,
                },

            });
        });

export default {
    plugins: [
        // this plugin generates the main landing page using the template found in patterns/index.html
        new HtmlWebpackPlugin({
            template,
            favicon,
            templateParameters: {
                ...caweb.site, // we spread the site data found in the caweb.json file
                scheme ,
            }
        }),

        // this plugin generates Search Results page using the template found in patterns/search.html
        caweb?.site?.google?.search ? new HtmlWebpackPlugin({
            template: searchTemplate,
            favicon,
            filename: 'serp.html',
            title: 'Search Results Page',
            templateParameters: {
                ...caweb.site, // we spread the site data found in the caweb.json file
                scheme 
            },
        }) : false,

        // this plugin generates additional pages under content/pages directory using the template found in patterns/index.html
        ...additionalPages
    ].filter(Boolean)
};