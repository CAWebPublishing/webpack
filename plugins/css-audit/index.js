#!/usr/bin/env node

/**
 * External dependencies
 */
import { sync as resolveBin } from 'resolve-bin';
import spawn from 'cross-spawn';
import { getAllFilesSync } from 'get-all-files'
import EntryDependency from "webpack/lib/dependencies/EntryDependency.js";

import path from 'path';
import fs from 'fs';
import deepmerge from 'deepmerge';
import chalk from 'chalk';
import { fileURLToPath, URL } from 'url';

// default configuration
import {default as DefaultConfig} from './default.config.js';

const boldWhite = chalk.bold.white;
const boldGreen = chalk.bold.green;
const boldBlue = chalk.bold.hex('#03a7fc');
const currentPath = path.dirname(fileURLToPath(import.meta.url));

// CSS Audit Plugin
class CSSAuditPlugin {
    config = {}

    constructor(
      opts = {
        outputFolder: path.join(currentPath, 'bin', 'auditor', 'public')
      }
    ) {
      this.config = deepmerge(DefaultConfig, opts);
    }

    apply(compiler) {
      const staticDir = {
        directory: this.config.outputFolder,
        watch: true
      }
      let { devServer, output } = compiler.options;
      let hostUrl = 'localhost' === devServer.host ? `http://${devServer.host}`: devServer.host;
      let hostPort = devServer.port;

      if( hostPort && 80 !== hostPort )
      {
          hostUrl = `${hostUrl}:${hostPort}`;
      }
      
      // if dev server allows for multiple pages to be opened
      // add css-audit.html to open property.
      if( Array.isArray(devServer.open) ){
        devServer.open.push(`${hostUrl}/${this.config.rewrite ? this.config.rewrite : this.config.filename}.html`)
      }else if( 'object' === typeof devServer.open && Array.isArray(devServer.open.target) ){
        devServer.open.target.push(`${hostUrl}/${this.config.filename}.html`)
      }

      // add our static directory 
      if( Array.isArray(devServer.static) ){
        devServer.static.push(staticDir)
      }else{
        devServer.static = [].concat(devServer.static, staticDir );
      }
      
      // Wait for configuration preset plugins to apply all configure webpack defaults
      compiler.hooks.initialize.tap('CSS Audit Plugin', () => {
        compiler.hooks.compilation.tap(
          "CSS Audit Plugin",
          (compilation, { normalModuleFactory }) => {
            compilation.dependencyFactories.set(
              EntryDependency,
              normalModuleFactory
            );
          }
        );

        const { entry, options, context } = {
          entry: path.join(staticDir.directory, 'css-audit.update.js'),
          options: {
            name: 'css-audit.update'
          },
          context: staticDir.directory
        };

        const dep = new EntryDependency(entry);
        dep.loc = {
          name: options.name
        };
        
        fs.writeFileSync(
          path.join(staticDir.directory, `css-audit.update.js`),
          `` // required for hot-update to compile on our page, blank script for now
        );

        compiler.hooks.thisCompilation.tap('CSS Audit Plugin',
          /**
           * Hook into the webpack compilation
           * @param {Compilation} compilation
           */
          (compilation) => {
            
            compiler.hooks.make.tapAsync("CSS Audit Plugin", (compilation, callback) => {
              
              compilation.addEntry(
              context,
              dep, 
              options, 
              err => {
                callback(err);
              });
            });
            

            
        });

        compiler.hooks.done.tapAsync('CSS Audit Plugin',
          (stats, callback) => {
            let files = [];
            getAllFilesSync(compiler.options.output.path).toArray().forEach(f => {
                // we skip any Right to Left style sheets
                if( f.endsWith('.css') && ! f.endsWith('-rtl.css') ){
                  files.push(f)
                }
            })
            console.log(`<i> ${boldGreen('[webpack-dev-middleware] Running CSS Audit...')}`);

            let result = this.audit(files, this.config );

            if( result ){
              // we have to inject the css-audit.update.js file into the head in order for the webpack-dev-server scripts to load.
              let pageContent = fs.readFileSync(path.join(staticDir.directory, `${this.config.filename}.html`))
              
              fs.writeFileSync(
                path.join(staticDir.directory, `${this.config.filename}.html`),
                pageContent.toString().replace('</head>', `<script src="${compiler.options.output.publicPath}/css-audit.update.js"></script>\n</head>`)
              )
            }
            
            console.log(`<i> ${boldGreen('[webpack-dev-middleware] CSS Audit can be viewed at')} ${ boldBlue(new URL(`${hostUrl}/${this.config.filename}.html`).toString())  }`);

            callback();
          }
        )

      });
      
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
      colors,
      important,
      displayNone,
      selectors,
      mediaQueries,
      typography,
      propertyValues
    }){

      let filesToBeAudited = [];
      let filesWithIssues = [];
 
      // the css audit tool always outputs to its own public directory
      let defaultOutputPath = path.join(currentPath, 'bin', 'auditor', 'public');
      
      // we always make sure the output folder exists
      fs.mkdirSync( outputFolder, { recursive: true } );

      files.forEach( (paths, i) => {
        let resolvePath = path.resolve(paths);

        try {
            // if given path is a directory
            if( fs.statSync(resolvePath).isDirectory() ){

                // get all .css files
                getAllFilesSync(resolvePath).toArray().forEach(f => {
                    if( f.endsWith('.css') ){
                      filesToBeAudited.push(f)
                    }
                })
            // if given path is a file and a .css file
            }else if( fs.statSync(paths).isFile() && (paths.endsWith('.css') || paths.endsWith('.scss')) ){
              filesToBeAudited.push(paths)
            }
        // invalid path/file
        } catch (error) {
          filesWithIssues.push(paths)
        }

      });

      if( ! filesToBeAudited.length ){
        console.log('No file(s) or directory path(s) were given or default directory was not found.')
        console.log('Auditor did not execute.');

        fs.copyFileSync(
          path.join(currentPath, 'sample', 'no-files.html'),
          path.join(defaultOutputPath, `${filename}.html`),
        )

        return false;
      }

      /**
       * We combine process arguments from argv, argv0
       */
      const processArgs = [
        ...process.argv,
        ...process.argv0.split(' '),
        
      ]

      // we also add args from env.NODE_OPTIONS
      if( process.env.NODE_OPTIONS ){
        processArgs.push( ...process.env.NODE_OPTIONS.split(' ').filter(e=>e).map((o) => o.replaceAll("'", '')) )
      }
      
      /**
       * the css audit uses the filename for the title, rather than the project name
       * we fix that by passing the project name for the file name
       * then renaming the file to the intended file name.
       */
      let auditArgs = [
        colors && ! processArgs.includes('--no-colors') ? '--colors' : '',
        important && ! processArgs.includes('--no-important') ? '--important' : '',
        displayNone && ! processArgs.includes('--no-display-none') ? '--display-none' : '',
        selectors && ! processArgs.includes('--no-selectors') ? '--selectors' : '',
        mediaQueries && ! processArgs.includes('--no-media-queries') ? '--media-queries' : '',
        typography && ! processArgs.includes('--no-typography') ? '--typography' : '',
        format  ? `--format=${format}` : '',
        filename ? `--filename=${path.basename(process.cwd())}` : ''
      ].filter( e => e)
      

      if( propertyValues && ! processArgs.includes('--no-property-values') ){
        propertyValues.forEach((p) => {
          auditArgs.push(`--property-values=${p.replace(' ',',')}`)
        })
      }
      
      let { stdout, stderr } = spawn.sync( 
        'node ' + resolveBin('@caweb/css-audit-webpack-plugin', {executable: 'auditor'}),
        [
          ...filesToBeAudited,
          ...auditArgs
        ],
        {
          stdio: 'pipe',
          cwd: fs.existsSync(path.join(process.cwd(), 'css-audit.config.cjs')) ? process.cwd() : currentPath
        }
      )

      if( stderr && stderr.toString() ){
        console.log( stderr.toString() )
      }

      if( stdout && stdout.toString() ){
          

          // rename the file back to the intended file name instead of the project name
          let outputFile = path.join(outputFolder, `${filename}.html`);

          fs.renameSync(
            path.join(defaultOutputPath, `${path.basename(process.cwd())}.html`),
            outputFile
          )
          
          // we also move the style.css as well case the output path is different than the default.
          if( fs.existsSync( path.join( defaultOutputPath, 'style.css' ) ) ){
            fs.renameSync(
              path.join( defaultOutputPath, 'style.css' ),
              path.join( outputFolder, 'style.css' )
            )
          }

          let msg = stdout.toString().replace('undefined', '');
      
          // the command was ran via cli
          if( 'audit' === process.argv[2] ){
              console.log( msg );
              console.log( path.resolve(outputFile) )
          // otherwise it's being applied during the webpack process.
          }else{
              return msg;
          }

      }
      
    } // end of audit

} // end of class
  

export default CSSAuditPlugin;