// This handlebars assumes we are using the @caweb/template as the fallback for any partials that are not found in the application. This allows us to use the default template partials without having to copy them into the application. It also allows us to use any custom partials that the application may have without having to worry about them being overwritten by the default template partials.
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const currentPath = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let appPath = process.cwd();
let fallbackPath = path.join(appPath, 'node_modules', '@caweb', 'template');

let templatePartials = {
    'branding': 'semantics/branding.html',
    'footer': 'semantics/footer.html',
    'header': 'semantics/header.html',
    'mobileControls': 'semantics/mobile-controls.html',
    'navFooter': 'semantics/nav-footer.html',
    'navHeader': 'semantics/nav-header.html',
    'utilityHeader': 'semantics/utility-header.html',
    'head': 'semantics/head.html',
    'alert': 'components/alert/alert.html',
    'searchForm': 'forms/search.html'
}

// Register partials.
Object.entries(templatePartials).forEach(
    ([p, f]) => {
        let partial = false;

        // if the application has a partial with the same name as the template partials we use that instead of the default template partial
        if( fs.existsSync( path.join(appPath, f) ) ){
            partial = path.join(appPath, f);
        // the fallback path exists we use that
        } else if( fs.existsSync( path.join(fallbackPath, f) ) ){
            partial = path.join(fallbackPath, f);
        }
        
        if( partial ) {
            Handlebars.registerPartial(p, fs.readFileSync(partial).toString() );
        }
    } );

// Register helpers.
fs.readdirSync( path.join(currentPath, '..', 'helpers'), { recursive:true } )
    .filter( (file) => file.endsWith('.js') )
    .filter( Boolean )
    .map( (file) => {
        let name = path.basename(file).replace('.js', '');
        let helper = require( path.join(currentPath, '..', 'helpers', file) ).default;

        Handlebars.registerHelper( name, helper );
     } );

// Register customer helpers from the application if they exist.
if( fs.existsSync( path.join(appPath, 'helpers') ) ){
    fs.readdirSync( path.join(appPath, 'helpers'), { recursive:true } )
        .filter( (file) => file.endsWith('.js') )
        .filter( Boolean )
        .map( (file) => {
            let name = path.basename(file).replace('.js', '');
            let helper = require( path.join(appPath, 'helpers', file) ).default;

            Handlebars.registerHelper( name, helper );
        } );
}

export default Handlebars;