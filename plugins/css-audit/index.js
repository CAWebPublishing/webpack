#!/usr/bin/env node

/**
 * External dependencies
 */
import { sync as resolveBin } from 'resolve-bin';
import spawn from 'cross-spawn';
import EntryDependency from "webpack/lib/dependencies/EntryDependency.js";
import { flagExists, getArgVal, getAllFlags } from '@caweb/webpack/lib/args.js';

import path, { resolve } from 'path';
import fs from 'fs';
import deepmerge from 'deepmerge';
import chalk from 'chalk';
import { fileURLToPath, URL } from 'url';

// default configuration
import {default as DefaultConfig} from './css-audit.config.js';

const boldWhite = chalk.bold.white;
const boldGreen = chalk.bold.green;
const boldBlue = chalk.bold.hex('#03a7fc');
const currentPath = path.dirname(fileURLToPath(import.meta.url));

const pluginName = 'CAWebCSSAuditPlugin';

// CSS Audit Plugin
class CAWebCSSAuditPlugin {
    config = {};

    constructor(opts = {}) {
      this.config = deepmerge(DefaultConfig, opts);
    }

    apply(compiler) {
      const staticDir = {
        directory: path.join( process.cwd(), this.config.outputFolder ),
        publicPath: encodeURI(this.config.outputFolder).replace(':', ''),
        watch: true
      }
      
      let { devServer } = compiler.options;
      let auditUrl = `${devServer.server}://${devServer.host}:${devServer.port}`;
      let nodeModulePath = encodeURI(staticDir.publicPath) + '/node_modules';
      let pathRewrite = {};
      pathRewrite[`^${nodeModulePath}`] = '';
      
      let proxy = {
        context: [ nodeModulePath ],
        target: auditUrl,
        pathRewrite,
      };

      // we add the proxy to the devServer
      if( Array.isArray(devServer.proxy) ){
        devServer.proxy.push(proxy)
      }else{
        devServer.proxy = [].concat(devServer.proxy, proxy );
      }

      // add our static directory to the devServer
      if( Array.isArray(devServer.static) ){
        devServer.static.push(staticDir)
      }else{
        devServer.static = [].concat(devServer.static, staticDir );
      }
      
      // add url to devServer Open
      // if dev server allows for multiple pages to be opened
      // add filename.html to open property.
      if( Array.isArray(devServer.open) ){
        devServer.open.push(`${auditUrl}${this.config.outputFolder}/${this.config.filename}.html`)
      }else if( 'object' === typeof devServer.open && Array.isArray(devServer.open.target) ){
        devServer.open.target.push(`${auditUrl}${this.config.outputFolder}/${this.config.filename}.html`)
      }
      // Wait for configuration preset plugins to apply all configure webpack defaults
      // compiler.hooks.initialize.tap(pluginName, () => {
      //   compiler.hooks.compilation.tap(
      //     pluginName,
      //     (compilation, { normalModuleFactory }) => {
      //       compilation.dependencyFactories.set(
      //         EntryDependency,
      //         normalModuleFactory
      //       );
      //     }
      //   );

      //   // const { entry, options, context } = {
      //   //   entry: path.join(staticDir.directory, 'css-audit.update.js'),
      //   //   options: {
      //   //     name: 'css-audit.update'
      //   //   },
      //   //   context: staticDir.directory
      //   // };

      //   // const dep = new EntryDependency(entry);
      //   // dep.loc = {
      //   //   name: options.name
      //   // };
        
      //   // fs.writeFileSync(
      //   //   path.join(staticDir.directory, `css-audit.update.js`),
      //   //   `` // required for hot-update to compile on our page, blank script for now
      //   // );

      //   // compiler.hooks.thisCompilation.tap(pluginName,
      //   //   /**
      //   //    * Hook into the webpack compilation
      //   //    * @param {Compilation} compilation
      //   //    */
      //   //   (compilation) => {
            
      //   //     compiler.hooks.make.tapAsync(pluginName, (compilation, callback) => {
              
      //   //       compilation.addEntry(
      //   //       context,
      //   //       dep, 
      //   //       options, 
      //   //       err => {
      //   //         callback(err);
      //   //       });
      //   //     });
            

            
      //   // });
      compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {

        compiler.hooks.done.tapAsync(pluginName,
          (stats, callback) => {
            console.log('<i> \x1b[32m[webpack-dev-middleware] Running CSS Auditor...\x1b[0m');

            // get all .css files in the output directory and subdirectories
            let files = fs.readdirSync( compiler.options.output.path, {  recursive: true } ).filter( f => f.endsWith( '.css' ) ).map( f => path.join( compiler.options.output.path, f ) );

            if( this.audit(files, this.config ) ){
              console.log(`<i> \x1b[32m[webpack-dev-middleware] CSS Auditor completed successfully. Report can be viewed at \x1b[34m ${new URL(`${auditUrl}${staticDir.publicPath}/${this.config.filename}.html`).toString()}\x1b[0m`);
            }

            
          });
      });
      // });
      
    }

    /**
     * Run WordPress CSS Audit
     * 
     * @link https://github.com/WordPress/css-audit/blob/trunk/README.md
     * 
     * @param {Array} files
     * @param {Object}  options
     * @param {boolean} options.debug
     * @param {boolean} options.format
     * @param {boolean} options.filename
     * @param {boolean} options.outputFolder   Where the audit should be saved.
     * @param {boolean} options.colors
     * @param {boolean} options.important
     * @param {boolean} options.displayNone
     * @param {boolean} options.selectors
     * @param {boolean} options.mediaQueries
     * @param {boolean} options.typography
     * @param {Array} options.propertyValues
     */
    audit(files, {
      debug,
      format,
      filename,
      outputFolder,
      audits
    }){

      // outputFolder should not be absolute
      outputFolder = path.isAbsolute(outputFolder) ? path.join( process.cwd(), outputFolder ) : outputFolder;
      
      // if no  files are passed, exit
      if( ! files || ! files.length ){
        console.log( '\x1b[31mNo CSS files found to audit.\nAuditor did not execute.\x1b[0m' );

        // ensure the output folder exists before moving files
        fs.mkdirSync( outputFolder, { recursive: true } );
        
        // copy no files sample report
        fs.copyFileSync(
          path.join(currentPath, 'sample', 'no-files.html'),
          path.join(outputFolder, `${filename}.html`),
        )

        return;
      }

      // pass all audits except propertyValues since those take a value there may be multiple
      let propertyValues = [];
      let auditArgs = audits.map( (audit) => {
        if('string' === typeof audit) {
          return `--${audit}`;
        }else if( Array.isArray(audit) && 'property-values' === audit[0] ){
          // propertyValues += audit[1].split(',').map( v => v.trim() ).join(',');
          propertyValues = propertyValues.concat( audit[1].split(',').map( v => v.trim() ) );
          return false;
        }
      }).filter( Boolean );
      
      // push property values separately
      if( propertyValues ){
        auditArgs.push(`--property-values=${propertyValues.join(',')}`);
      }

      // add the format if set
      if( format ){
        auditArgs.push( `--format=${format}` );
      }

      /**
       * the css audit uses the filename for the title, rather than the project name
       * we fix that by passing the project name for the file name
       * then renaming the file to the intended file name.
       */
      auditArgs.push( `--filename=${path.basename(process.cwd())}` ); 

      let { stdout, stderr } = spawn.sync( 
        'node',
        [
          resolveBin(currentPath, {executable: 'auditor'}),
          ...files,
          ...auditArgs
        ],
        {
          stdio: 'pipe',
          cwd: path.join( currentPath, 'bin', 'auditor' ), // has to be set to the bin/auditor directory
        }
      )
      
      // if there was an error with the audit process
      if( stderr && stderr.toString() ){
        console.log( 'CSS Audit Error: ', stderr.toString() );
      }

      if( stdout && stdout.toString() ){
        // the css audit tool always outputs to its own public directory
        let defaultOutputPath = path.join(currentPath, 'bin', 'auditor', 'public');
        
        // rename the file back to the intended file name instead of the project name
        fs.renameSync(
          path.join(defaultOutputPath, `${path.basename(process.cwd())}.html`),
          path.join(defaultOutputPath, `${filename}.html`)
        )

        // ensure the output folder exists before moving files
        fs.mkdirSync( outputFolder, { recursive: true } );

        // move all files except .gitkeep to the output folder
        fs.readdirSync( defaultOutputPath ).filter( f => ! f.endsWith('.gitkeep')).forEach( (f) => {
          fs.renameSync(
            path.join( defaultOutputPath, f ),
            path.join( outputFolder, f )
          )
        })

        // clean up the default output message
        let msg = stdout.toString().replace('undefined', '').replace('template', 'css audit');
    
        // the command was ran via cli
        if( 'audit' === process.argv[2] ){
            console.log( msg );
            console.log( path.join(outputFolder, `${filename}.html`) )
        // otherwise it's being applied during the webpack process.
        }else{
            return msg;
        }

      }
      
    } // end of audit

} // end of class
  

export default CAWebCSSAuditPlugin;