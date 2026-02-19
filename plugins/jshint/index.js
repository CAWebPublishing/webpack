#!/usr/bin/env node

/**
 * External dependencies
 */
import spawn from 'cross-spawn';
import { getAllFilesSync } from 'get-all-files'
import EntryDependency from "webpack/lib/dependencies/EntryDependency.js";
import path from 'path';
import fs from 'fs';
import deepmerge from 'deepmerge';
import chalk from 'chalk';
import { fileURLToPath, URL } from 'url';
import { createRequire } from 'module';

// default configuration
import {default as DefaultConfig} from './jshint.config.js';

const boldWhite = chalk.bold.white;
const boldGreen = chalk.bold.green;
const boldBlue = chalk.bold.hex('#03a7fc');
const currentPath = path.dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);

const pluginName = 'CAWebJSHintPlugin';

// JSHint Plugin
class CAWebJSHintPlugin {
    config = {}

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
        devServer.open.push(`${auditUrl}${this.config.outputFolder}/${this.config.outputFilename}.html`)
      }else if( 'object' === typeof devServer.open && Array.isArray(devServer.open.target) ){
        devServer.open.target.push(`${auditUrl}${this.config.outputFolder}/${this.config.outputFilename}.html`)
      }
        
      // Wait for configuration preset plugins to apply all configure webpack defaults
      // compiler.hooks.initialize.tap('JSHint Plugin', () => {
      //     compiler.hooks.compilation.tap(
      //       "JSHint Plugin",
      //       (compilation, { normalModuleFactory }) => {
      //         compilation.dependencyFactories.set(
      //           EntryDependency,
      //           normalModuleFactory
      //         );
      //       }
      //     );

      //     //const dep = new EntryDependency(path.join( this.config.outputFolder, 'jshint.js'));
      //     const dep = new EntryDependency(path.resolve( 'src', 'index.js'));
      //     dep.loc = {
      //       name: 'jshint'
      //     };
          
      //     fs.writeFileSync(
      //       path.join(this.config.outputFolder, `jshint.js`),
      //       `` // required for hot-update to compile on our page, blank script for now
      //     );
      // });
      
      compiler.hooks.thisCompilation.tap(pluginName,(compilation) => {
          
          // compiler.hooks.make.tapAsync(pluginName, (compilation, callback) => {
            
          //   compilation.addEntry(
          //   'jshint',
          //   dep, 
          //   {
          //     name: 'jshint'
          //   }, 
          //   err => {
          //     callback(err);
          //   });
          // });
  

          // process assets and run the jshint on appropriate assets.
          
          compilation.hooks.processAssets.tapAsync(
            {
              name: pluginName,
              stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL  
            },
            /**
             * Hook into the process assets hook
             * @param {any} _
             * @param {(err?: Error) => void} callback
             */
            (assets, callback) => {
              let files = [];
  
              // Filter through assets and find js files to be audited.
              Object.entries(assets).forEach(([pathname, source]) => {
                if( pathname.endsWith('.js') ){
                  if( source['_source'] && source['_source']['_children'] ){
                    source['_source']['_children'].forEach((s, i) => {
                      if( 
                        'string' === typeof s && // is a string and
                        ! files.includes(path.resolve(s.replace(/[\n\s\S\w]*"(.*)"[\n\s\S\w]*/, '$1'))) && // not already in the files array
                        0 < s.indexOf('.js') && // has a .js reference and
                        0 > s.indexOf('node_modules') && // not referencing node_modules directory
                        0 > s.indexOf('jshint.js') && // not referencing our update javascript
                        0 > s.indexOf('a11y.update.js') && // not referencing our a11y javascript
                        0 > s.indexOf('audit.update.js') // not referencing our css-audit javascript
                      ){
                        files.push( path.resolve(s.replace(/[\n\s\S\w]*"(.*)"[\n\s\S\w]*/, '$1')) )
                      }
                    })    
                  }
                }
              })
  
              console.log('<i> \x1b[32m[webpack-dev-middleware] Running JSHint...\x1b[0m');
  
              if( this.hint(files, this.config) ){
                // we have to inject the jshint.update.js file into the head in order for the webpack-dev-server scripts to load.
                // let pageContent = fs.readFileSync(path.join(staticDir.directory, `${this.config.outputFilename}.html`))
                
                // fs.writeFileSync(
                //   path.join(staticDir.directory, `${this.config.outputFilename}.html`),
                //   pageContent.toString().replace('</head>', `<script src="./jshint.update.js"></script>\n</head>`)
                // )
                console.log(`<i> \x1b[32m[webpack-dev-middleware] JSHint can be viewed at \x1b[34m ${ new URL(`${auditUrl}${staticDir.publicPath}/${this.config.outputFilename}.html`).toString() }\x1b[0m`);
              }
  
              
              callback();
          });
  
      });
      }

    /**
     * Run JSHint
     *
     * @link https://www.npmjs.com/package/jshint
     * 
     * @param {Array} files
     * @param {Object}  options
     * @param {boolean} options.debug
     * @param {boolean} options.outputFilename   Filename for the scan results.
     * @param {boolean} options.outputFolder   Where the scan results should be saved.
     */
    hint(files, {
      debug,
      outputFolder,
      outputFilename
    }){

      // outputFolder should not be absolute
      outputFolder = path.isAbsolute(outputFolder) ? path.join( process.cwd(), outputFolder ) : outputFolder;
      
      // if no  files are passed, exit
      if( ! files || ! files.length ){
        console.log( '\x1b[31mNo JS files found to audit.\nAuditor did not execute.\x1b[0m' );

        // ensure the output folder exists before moving files
        fs.mkdirSync( outputFolder, { recursive: true } );
        
        // copy no files sample report
        fs.copyFileSync(
          path.join(currentPath, 'sample', 'no-files.html'),
          path.join(outputFolder, `${outputFilename}.html`),
        )

        return;
      }

      let hintConfigFile = path.join(currentPath, '.jshintrc');

      /**
       * JSHint does not allow for multiple configs so we have to merge and write 1 file
       */
      if( fs.existsSync(path.join(process.cwd(), '.jshintrc')) ){
        let hintConfig = fs.readFileSync(hintConfigFile);
        let customConfig = fs.readFileSync(path.join(process.cwd(), '.jshintrc'));

        hintConfig = hintConfig.toString().replace(/[\r\t\n]|\/{2}.*/g, '')
        hintConfig = JSON.parse(hintConfig)

        customConfig = customConfig.toString().replace(/[\r\t\n]|\/{2}.*/g, '')
        customConfig = JSON.parse(customConfig)

        hintConfigFile = path.join(currentPath, '.customrc');
        fs.writeFileSync( 
          hintConfigFile , 
          JSON.stringify(deepmerge(hintConfig, customConfig), null, 4) 
        )
      }
      
      // Set the env for our reporter.
      process.env.JSHINT_OUTPUT_DIR = outputFolder;
      process.env.JSHINT_OUTPUT_FILENAME = outputFilename;
      
      let hintArgs = [
        '--config',
        hintConfigFile,
        '--reporter',
        path.join(currentPath, 'reporter.cjs')
      ]

      let { stdout, stderr } = spawn.sync( 
        'jshint',
        [
          ...files,
          ...hintArgs
        ],
        {
          stdio: 'pipe',
        }
      )
      
      if( stderr && stderr.toString() ){
        console.log( stderr.toString())
      }

      if( stdout  ){
        if( 'jshint' === process.argv[2] ){
          console.log( stdout.toString() );
          console.log( path.join( outputFolder, `${outputFilename}.html` ) );
        }else{
          return path.join( outputFolder, `${outputFilename}.html` );
        }
      }else{
        console.log( 'No output generated.')
        return false;
      }
      
    } // end of hint

} // end of class
  

export default CAWebJSHintPlugin;