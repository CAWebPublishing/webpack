#!/usr/bin/env node

/**
 * External dependencies
 */
import { sync as resolveBin } from 'resolve-bin';
import spawn from 'cross-spawn';
import { getAllFilesSync } from 'get-all-files'
import EntryDependency from "webpack/lib/dependencies/EntryDependency.js";
import path from 'path';
import { isUrl, isValidUrl } from 'check-valid-url';
import fs from 'fs';
import deepmerge from 'deepmerge';
import chalk from 'chalk';
import { fileURLToPath, URL } from 'url';

/**
 * Internal dependencies
 */
import { landingPage, reporter } from './reporter.js';

// default configuration
import {default as DefaultConfig} from './aceconfig.js';

const boldWhite = chalk.bold.white;
const boldGreen = chalk.bold.green;
const boldBlue = chalk.bold.hex('#03a7fc');
const currentPath = path.dirname(fileURLToPath(import.meta.url));

const pluginName = 'CAWebA11yWebpackPlugin';

// IBM Accessibility Checker Plugin
class A11yPlugin {
    config = {}

    constructor(opts = {}) {
      // the default publicPath is always the outputFolder
      DefaultConfig.publicPath = DefaultConfig.outputFolder;

      // the default output folder is always relative to the current working directory.
      DefaultConfig.outputFolder = path.join( process.cwd(), DefaultConfig.outputFolder );

      // if opts.outputFolder is defined
      if( opts.outputFolder && ! path.isAbsolute(opts.outputFolder)  ){
        opts.publicPath = opts.outputFolder;

        // we join the current working directory with the opts.outputFolder
        opts.outputFolder = path.join( process.cwd(), opts.outputFolder );
      }
      
      this.config = deepmerge(DefaultConfig, opts);
    }

    
    apply(compiler) {
      const staticDir = {
        directory: this.config.outputFolder,
        publicPath: encodeURI(this.config.publicPath).replace(':', ''),
        watch: true
      }

      let { devServer } = compiler.options;
      let auditUrl = `${devServer.server}://${devServer.host}:${devServer.port}`;
      let nodeModulePath = encodeURI(this.config.publicPath).replace(':', '') + '/node_modules';
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

      // if dev server allows for multiple pages to be opened
      // add outputFilename.html to open property.
      if( Array.isArray(devServer.open) ){
        devServer.open.push(`${staticDir.publicPath}/${this.config.outputFilename}.html`)
      }else if( 'object' === typeof devServer.open && Array.isArray(devServer.open.target) ){
        devServer.open.target.push(`${staticDir.publicPath}/${this.config.outputFilename}.html`)
      }

      // we always make sure the output folder exists
      fs.mkdirSync( staticDir.directory, { recursive: true } );

      // Hot Module Replacement
      if( compiler?.options?.devServer?.hot ){
        // we create a blank file for the hot update to compile on our page.
        // this is required for the hot-update to work.
        fs.writeFileSync(
          path.join(staticDir.directory, `a11y.update.js`),
          `` // required for hot-update to compile on our page, blank script for now
        );

        // we add the entry to the dependency factory during compilation
        compiler.hooks.compilation.tap(
          pluginName,
          (compilation, { normalModuleFactory }) => {
            compilation.dependencyFactories.set(
              EntryDependency,
              normalModuleFactory
            );

          }
        );

        // we add the entry before the compilation ends
        compiler.hooks.make.tapAsync(
          pluginName, 
          (compilation, callback) => {
            const { entry, options, context } = {
            entry: path.join( staticDir.directory, 'a11y.update.js'),
            options: {
              name: 'a11y.update'
            },
            context: 'a11y'
          };

          const dep = new EntryDependency(entry);
          dep.loc = {
            name: options.name
          };
          
          compilation.addEntry(
            context,
            dep, 
            options, 
            err => {
              callback(err);
            });
          });
      }

      compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
        // We can audit the html files now that the compilation is done.
        // we hook into the done hook to run the accessibility checker.
        compiler.hooks.done.tapAsync(
          pluginName,
          (stats, callback) => {

            console.log(`<i> ${boldGreen('[webpack-dev-middleware] Running IBM Accessibility scan...')}`);

            // we check the compilers output.publicPath
            // if it is not set, we scan the output.path as the publicPath
            let result = this.a11yCheck(
              ! compiler.options.output.publicPath || 
              'auto' === compiler.options.output.publicPath ? 
                compiler.options.output.path : 
                compiler.options.output.publicPath,
              this.config 
            );

            // if( result ){
            //   // we have to inject the a11y.update.js file into the head in order for the webpack-dev-server scripts to load.
            //   // let pageContent = fs.readFileSync(path.join(staticDir.directory, `${this.config.outputFilename}.html`))
              
            //   // fs.writeFileSync(
            //   //   path.join(staticDir.directory, `${this.config.outputFilename}.html`),
            //   //   pageContent.toString().replace('</head>', `<script src="./a11y.update.js"></script>\n</head>`)
            //   // )
            // }

            console.log(`<i> ${boldGreen('[webpack-dev-middleware] IBM Accessibilty Report can be viewed at')} ${ boldBlue(new URL(`${auditUrl}/${staticDir.publicPath}/${this.config.outputFilename}.html`).toString())  }`);

        });
      })
      
    }

    /**
     * Run accessibility checks
     * 
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
    a11yCheck(url, {
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


      let htmlOutput = outputFormat && outputFormat.includes('html');

      // we remove the html output since we generate our own html based on the json output.
      // outputFormat = outputFormat.filter(o => 'html' !== o );
      
      let acheckerArgs = [
        '--ruleArchive',
        ruleArchive,
        '--policies',
        Array.isArray(policies) ? policies.filter(e => e).join(',') : policies,
        '--failLevels',
        Array.isArray(failLevels) ? failLevels.filter(e => e).join(',') : failLevels,
        '--reportLevels',
        Array.isArray(reportLevels) ? reportLevels.filter(e => e).join(',') : reportLevels,
        '--outputFolder',
        outputFolder,
        '--outputFormat',
        outputFormat,
        '---outputFilenameTimestamp',
        outputFilenameTimestamp,
        url
      ];
    
      let isValid = fs.existsSync( url ) || 'localhost' === new URL(url).hostname || isUrl( url );
      let isDirectory = fs.existsSync( url ) && fs.statSync(url).isDirectory();

      if( isValid ){
       
        let outputDir = path.resolve('.',  outputFolder );

        let {stderr, stdout}  = spawn.sync( 
          resolveBin('accessibility-checker', {executable: 'achecker'}),
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
          fs.readdirSync(outputDir, {recursive: true}).reverse().forEach( file => {
            // process each json file file
            if( fs.statSync(path.join(outputDir, file)).isFile() ){
              if ( file.startsWith('summary_') ){
                // remove the summary files
                fs.rmSync( path.join(outputDir, file) )
                return;
              }

              let oldName = file;
              let newName = file;

              // remove the original output directory from the file name
              newName = isDirectory ? file.replace(url.replace(':', '_'), '') : file;
              
              newName = newName.replace(/^\\/, '');

              // for some reason .html files have an extra .html in the name
              newName = newName.endsWith('.html.html') ? newName.replace('.html.html', '.html') : newName;
              
              // if the new name is not the same as the old name.
              if( newName !== file ){
                // rename the file
                fs.renameSync(
                  path.join(outputDir, oldName ), 
                  path.join(outputDir, newName) );
              }

              // we add the file to the audit index
              if( ! auditIndex.includes(newName) && newName.endsWith('.html') ){
                auditIndex.push( newName );
              }
              
              // if we are generating html output, we need to generate the html file.
              if( htmlOutput ){
                // let jsonObj = JSON.parse(fs.readFileSync(path.join(outputDir, newName)));

                // we generate the html file
                // reporter( jsonObj, { outputFolder, outputFilename: newName.replace(/\.json$/, '') } );
              }
            
            }else if ( fs.statSync(path.join(outputDir, file)).isDirectory() ){
              // process each directory
              // delete any empty directories.
              if( 0 === fs.readdirSync(path.join(outputDir, file)).length  ){
                // remove the directory
                fs.rmSync(path.join(outputDir, file), {recursive: true});
              }
            }

          });

          // we generate the landing page.
          landingPage( auditIndex, {outputFolder, outputFilename} );

          // we generate the .
          if( 'a11y' === process.argv[2] ){
              // console.log( reportedFile )
          }else{
            return true;
              // return reportedFile;
          }
        }
      }else{
        console.log( `${url} is not a valid url.` )
      }

    } // end of a11yCheck

} // end of class
  

export default A11yPlugin;