#!/usr/bin/env node

/**
 * External dependencies
 */
import spawn from 'cross-spawn';
import EntryDependency from "webpack/lib/dependencies/EntryDependency.js";
import path from 'path';
import { isUrl, isValidUrl } from 'check-valid-url';
import fs from 'fs';
import deepmerge from 'deepmerge';
import chalk from 'chalk';
import { fileURLToPath, URL, pathToFileURL } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Internal dependencies
 */
import { landingPage } from './reporter.js';

// default configuration
import {default as DefaultConfig} from './aceconfig.js';

const pluginName = 'CAWebA11yWebpackPlugin';

// IBM Accessibility Checker Plugin
class CAWebA11yWebpackPlugin {
    config = {}

    constructor(opts = {}) {
      this.config = deepmerge(DefaultConfig, opts);
    }

    
    apply(compiler) {
      const staticDir = {
        directory: path.join( process.cwd(), this.config.outputFolder ),
        publicPath: encodeURI( this.config.outputFolder ).replace(':', ''),
        watch: true
      }

      let { devServer } = compiler.options;
      let auditUrl = `${devServer.server}://${devServer.host}:${devServer.port}`;
      let nodeModulePath = encodeURI(staticDir.publicPath) + '/node_modules/';
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

      // // add our static directory to the devServer
      if( Array.isArray(devServer.static) ){
        devServer.static.push(staticDir)
      }else{
        devServer.static = [].concat(devServer.static, staticDir );
      }

      // if dev server allows for multiple pages to be opened
      // add outputFilename.html to open property.
      if( Array.isArray(devServer.open) ){
        devServer.open.push(`${auditUrl}${this.config.outputFolder}/${this.config.outputFilename}.html`)
      }else if( 'object' === typeof devServer.open && Array.isArray(devServer.open.target) ){
        devServer.open.target.push(`${auditUrl}${this.config.outputFolder}/${this.config.outputFilename}.html`)
      }

      // we always make sure the output folder is cleared
      fs.rmSync( staticDir.directory, { recursive: true, force: true } );

      // Hot Module Replacement
      // if( compiler?.options?.devServer?.hot ){
      //   // we create a blank file for the hot update to compile on our page.
      //   // this is required for the hot-update to work.
      //   fs.writeFileSync(
      //     path.join(staticDir.directory, `a11y.update.js`),
      //     `` // required for hot-update to compile on our page, blank script for now
      //   );

      //   // we add the entry to the dependency factory during compilation
      //   compiler.hooks.compilation.tap(
      //     pluginName,
      //     (compilation, { normalModuleFactory }) => {
      //       compilation.dependencyFactories.set(
      //         EntryDependency,
      //         normalModuleFactory
      //       );

      //     }
      //   );

      //   // we add the entry before the compilation ends
      //   compiler.hooks.make.tapAsync(
      //     pluginName, 
      //     (compilation, callback) => {
      //       const { entry, options, context } = {
      //       entry: path.join( staticDir.directory, 'a11y.update.js'),
      //       options: {
      //         name: 'a11y.update'
      //       },
      //       context: 'a11y'
      //     };

      //     const dep = new EntryDependency(entry);
      //     dep.loc = {
      //       name: options.name
      //     };
          
      //     compilation.addEntry(
      //       context,
      //       dep, 
      //       options, 
      //       err => {
      //         callback(err);
      //       });
      //     });
      // }

      compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
        // We can audit the html files now that the compilation is done.
        // we hook into the done hook to run the accessibility checker.
        compiler.hooks.done.tapAsync(
          pluginName,
          (stats, callback) => {

            console.log('<i> \x1b[32m[webpack-dev-middleware] Running IBM Accessibility scan...\x1b[0m');
            /**
             * We run the accessibility checker
             * 
             * we scan the output.publicPath if its set and not set to 'auto'
             * otherwise we scan the output.path
             */
            let scanDir = compiler.options.output.publicPath && 'auto' !== compiler.options.output.publicPath ?
              compiler.options.output.publicPath :
              compiler.options.output.path;

            this.a11yCheck(
              scanDir,
              this.config 
            );

            console.log(`<i> \x1b[32m[webpack-dev-middleware] IBM Accessibilty Report can be viewed at \x1b[34m ${new URL(`${auditUrl}${staticDir.publicPath}/${this.config.outputFilename}.html`).toString()}\x1b[0m`);

        });
      })
      
    }

    /**
     * Run accessibility checks
     * 
     * @param {string}  target   The target URL or directory to scan.
     * @param {Object}  options
     * @param {boolean} options.debug            True if debug mode is enabled.
     * @param {boolean} options.ruleArchive   Specify the rule archive.
     * @param {boolean} options.policies   Specify one or many policies to scan.
     * @param {boolean} options.failLevels   Specify one or many violation levels on which to fail the test.
     * @param {boolean} options.reportLevels   Specify one or many violation levels that should be reported.
     * @param {boolean} options.labels   Specify labels that you would like associated to your scan.
     * @param {boolean} options.outputFormat   In which formats should the results be output.
     * @param {boolean} options.outputFilename   Filename for the scan results.
     * @param {boolean} options.outputFolder   Where the scan results should be saved.
     * @param {boolean} options.outputFilenameTimestamp   Should the timestamp be included in the filename of the reports?
     */
    a11yCheck( target, {
      debug, 
      ruleArchive,
      policies,
      failLevels,
      reportLevels,
      labels,
      outputFormat,
      outputFilename, 
      outputFolder,
      outputFilenameTimestamp
    }){

      // outputFolder should not be absolute
      outputFolder = path.isAbsolute(outputFolder) ? path.join( process.cwd(), outputFolder ) : outputFolder;
      
      // accessibility-checker CLI arguments
      let acheckerArgs = [
        '--ruleArchive',
        ruleArchive,
        '--policies',
        Array.isArray(policies) ? policies.filter(Boolean).join(',') : policies,
        '--failLevels',
        Array.isArray(failLevels) ? failLevels.filter(Boolean).join(',') : failLevels,
        '--reportLevels',
        Array.isArray(reportLevels) ? reportLevels.filter(Boolean).join(',') : reportLevels,
        '--outputFolder',
        outputFolder,
        '--outputFormat',
        outputFormat,
        '---outputFilenameTimestamp',
        outputFilenameTimestamp,
        target
      ];
    
      // checks for the target validity
      let isValid = fs.existsSync( target ) || 'localhost' === new URL(target).hostname || isUrl( target );
      // let isDirectory = fs.existsSync( target ) && fs.statSync(target).isDirectory();

      // if the target is valid, we run the accessibility checker
      if( isValid ){
       
        // we run the accessibility-checker CLI
        let {stderr, stdout}  = spawn.sync( 
          path.resolve(require.resolve('accessibility-checker'), '..', '..' , 'bin', 'achecker.js'),
          acheckerArgs,
          {
            stdio: 'pipe'
          }
        )

        if( stderr && stderr.toString() ){
            console.log( stderr.toString() );
        }
        
        if( stdout && stdout.toString()){
          let auditIndex = [];

          // we iterate thru the output directory in reverse order,
          // this way we can remove any empty directories at the end, since files are cycled first.
          fs.readdirSync(outputFolder, {recursive: true}).reverse().forEach( file => {
            let filePath = path.join(outputFolder, file);

            // process each json file file
            if( fs.statSync(filePath).isFile() ){
              if ( file.startsWith('summary_') ){
                // remove the summary files
                fs.rmSync( filePath )
                return;
              }
              
              // if the fle ends with .json or .html
              if( file.endsWith('.json') || file.endsWith('.html') ){
                let newName = file.replace( target.replace(':', '_') + '\\', '').replace('.html.html', '.html');

                // we rename the json/html file to remove the target from the filename
                fs.renameSync(
                  path.join(outputFolder, file),
                  path.join(outputFolder, newName)
                );

                // we add the file to the audit index
                if( file.endsWith('.html') && ! auditIndex.includes(newName) ){
                  auditIndex.push( newName );
                }
              }
            
            }else if ( fs.statSync(path.join(outputFolder, file)).isDirectory() ){
              // process each directory
              // delete any empty directories.
              if( 0 === fs.readdirSync(path.join(outputFolder, file)).length  ){
                // remove the directory
                fs.rmSync(path.join(outputFolder, file), {recursive: true});
              }
            }

          });

          // we generate the landing page.
          landingPage( auditIndex, {outputFolder, outputFilename} );

          // we generate the .
          if( 'a11y' === process.argv[2] ){
              console.log( 'Accessibility Report Generated File: ', path.join(outputFolder, `${outputFilename}.html`) )
          }else{
            return true;
          }
        }
      }else{
        console.log( `${target} is not a valid url or directory.` )
      }

    } // end of a11yCheck

} // end of class
  

export default CAWebA11yWebpackPlugin;