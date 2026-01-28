/**
 * Various loader options for webpack handlebars loader.
 * @see https://github.com/pcardune/handlebars-loader
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const currentPath = path.dirname(fileURLToPath(import.meta.url));
const appPath = process.cwd();
const helperDirs = [...new Set([
        getAllHelpers( path.join( currentPath, '..', 'helpers') ),// our loader helpers
        fs.existsSync( path.join( appPath, 'helpers') ) ? // any custom helpers
        [
            path.join( appPath, 'helpers'),
            ...getAllHelpers( path.join( appPath, 'helpers') ),
        ] : []
    ].flat())];


// function to resolve partials
const partialResolver = ( partial, callback ) => {
    // fallback path to the @caweb/template package
    const fallbackPath = path.join( currentPath, '..', '..', 'template' );
    
    let partialDir = '';
   
    // template parameter specific partials
    switch ( partial ) {
        /**
         * Semantic elements are served from the /semantic/ directory
         * 
         * - header
         * - footer
         * 
         * @link https://www.w3schools.com/html/html5_semantic_elements.asp
         */
        case 'branding':
        case 'footer':
        case 'header': 
        case 'mobileControls': 
        case 'navFooter':
        case 'navHeader': 
        case 'utilityHeader': 
          partialDir = 'semantics';
          break;
    
        // content is served from the /content/ directory
        case 'index': 
        case 'content': 
          partialDir = 'content';
          break;
    
        // components are served from the /components/ directory
        case 'alert':
        case 'card':
          partialDir = `components/${partial}`;
          break;
        
        // forms are served from the /forms/ directory
        case 'searchForm':
          partialDir = 'forms';
          break;
        
        // tables are served from the /tables/ directory
        case partial.includes('Table'):
          partialDir = 'tables';
          break;
    }
    
    // if the partial was mapped to specific directories under the @caweb/template
    if( partialDir ){
        // we remove the Form from the name
        // we remove the Table from the name
        // we change the partial name from camelCase to dash-case
        partial = partial.replace(/(Form|Table)/, '').replace(/([A-Z])/g, '-$1').toLowerCase();

        // if the partial exists in the appPath, use that first
        // otherwise use the template path
        if( fs.existsSync( path.join( appPath, partialDir, `/${partial}.html` ) ) ){
            partial = path.join( appPath, partialDir, `/${partial}.html` );

        // if the @caweb/template is installed we use that as the fallback
        } else if( fs.existsSync( path.join( fallbackPath, partialDir, `/${partial}.html` ) ) ) {
            partial = path.join( fallbackPath, partialDir, `/${partial}.html` );
        }
    }

    callback(false, partial );

};

// get all helpers in a given path
function getAllHelpers( helpersPath ) {
    return fs.readdirSync(
        helpersPath,
        { 
            withFileTypes: true , 
            recursive: true
        }
    )
    .filter( dirent => dirent.isDirectory() )
    .map( dirent => path.join( dirent.parentPath, dirent.name ) );
}

export default {
    // rootRelative: appPath,
    partialResolver,
    helperDirs,
    precompileOptions: {
        // prevent certain helpers from being precompiled
        knownHelpersOnly: false,
        preventIndent: true,
    },
    extensions: ['.html', '.handlebars', '.hbs', '' ],
};