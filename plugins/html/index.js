#!/usr/bin/env node

/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import deepmerge from 'deepmerge';
import { fileURLToPath, URL } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

/*
const boldWhite = chalk.bold.white;
const boldGreen = chalk.bold.green;
const boldBlue = chalk.bold.hex('#03a7fc');
*/
const currentPath = path.dirname(fileURLToPath(import.meta.url));
const appPath = process.cwd();
const templatePath = path.resolve(currentPath, '..', 'template');
const iconLibraryPath = path.resolve(currentPath, '..', 'icon-library');

/**
 * Launches CAWeb HTML Markup
 *
 * Requires the devServer to be able to writeToDisk
 * devMiddleware: {
 *    writeToDisk: true,
 * }
 * 
 * @class CAWebHTMLPlugin
 * @typedef {CAWebHTMLPlugin}
 * @extends {HtmlWebpackPlugin}
 */
class CAWebHtmlWebpackPlugin extends HtmlWebpackPlugin{

  // we change some of the html-webpack-plugin defaults
  constructor(opts = {}) {
    let templates = ['index', 'blank', 'default', 'search'];

    let defaultOptions = {
      title: path.basename( appPath ),
      inject: 'body',
      template: path.join( templatePath, 'patterns', 'index.html'),
      scriptLoading: 'blocking',
      templateParameters: {
        "template": "index",
        "title": path.basename( appPath ),
        "scheme": "oceanside",
        "meta": {
          "Author": "CAWebPublishing",
          "Description": "State of California",
          "Keywords": "California,government",
          "viewport": "width=device-width, initial-scale=1.0, maximum-scale=2.0"
        }
      },
      assets: []
    }

    // if there is a favicon.ico file in the media directory we use that
    // otherwise we fallback to the template favicon.ico
    // defaultOptions.favicon = fs.existsSync(path.join(appPath, 'media', 'favicon.ico')) ?
    //   path.join(appPath, 'media', 'favicon.ico') :
    //   path.join(templatePath, 'media', 'favicon.ico');

    //   // the templateParameters.favicon is not set, set it
    // if( ! defaultOptions.templateParameters.favicon ){
    //   defaultOptions.templateParameters.favicon = defaultOptions.favicon;
    // }

    // if there is a logo file in the media directory we use that
    // if( fs.existsSync(path.join(appPath, 'media', 'logo.png')) ){
    //   defaultOptions.assets.push( path.join(appPath, 'media', 'logo.png') );
    //   defaultOptions.templateParameters.logo = '/media/logo.png';

    //   // otherwise we fallback to the template logo.png
    // }else{
    //   // remove the appPath from the templath path
    //   // replace all backslashes with forward slashes
    //   // this is to make sure the logo.png in the branding.html is in the right place
    //   defaultOptions.templateParameters.logo = 
    //     path.join(
    //       templatePath,
    //       'media', 'logo.png'
    //     )
    //      .replace(appPath, '')
    //     .replace(/\\/g, '/');
    // }
      
    // update templateParameters.title to match user options.
    if( opts.title ){
      defaultOptions.templateParameters.title = opts.title;
    }

    // if template selection is one of ours
    if( opts.template && templates.includes(opts.template) ){
      let template = 'default' === opts.template ? 'index' : opts.template;
      
      // update template file based on template selection 
      opts.template = path.join( templatePath, 'patterns', `${template}.html`);
      
      // update default.templateParameters.template to match user options.
      defaultOptions.templateParameters.template = template;
    }
   
    // if the user options has meta tags we merge them with the defaultOptions.templateParameters.meta
    // and clear the meta key
    if( opts.meta ){
      defaultOptions.templateParameters.meta = {
        ...defaultOptions.templateParameters.meta,
        ...opts.meta
      }

      delete opts.meta;
    }

    // if there is a caweb.json file we merge the site data with the templateParameters
    if( fs.existsSync( path.join(appPath, 'caweb.json') ) ){

      let dataFile = JSON.parse( fs.readFileSync( path.join(appPath, 'caweb.json') ) );

      // if there is a dataFile.site 
      if( dataFile.site ){
        // we remove the title key from the dataFile.site
        // this is to avoid overwriting the title set in the defaultOptions.templateParameters
        if( dataFile.site.title ){
          delete dataFile.site.title;
        }
        
        // we merge the defaultOptions.templateParameters, user options.templateParameters, and the dataFile.site
        opts.templateParameters = {
          ...defaultOptions.templateParameters,
          ...opts.templateParameters,
          ...dataFile.site
        }

        // some properties are used in different ways and not as templateParameters
        // if there is a dataFile.site.favicon we use that
        if( dataFile.site.favicon ){
          defaultOptions.favicon = dataFile.site.favicon;
        }
      }
      
    }

    super(deepmerge(defaultOptions, opts));

  }

  apply(compiler) {
    super.apply(compiler);

    compiler.hooks.compilation.tap("CAWebHtmlWebpackPlugin", (compilation) => {
       /**
       * Hook into the HtmlWebpackPlugin events
       * 
       * @link https://github.com/jantimon/html-webpack-plugin?tab=readme-ov-file#events
       */
      HtmlWebpackPlugin.getCompilationHooks(compilation).beforeEmit.tapAsync(
        "CAWebHtmlWebpackPlugin", 
        ({html, outputName, plugin}, cb) => {
          // if the html contains local assets those assets are added to the options.assets array 
          // and the assets are added to the compilation afterEmit
          let srcHrefAssets = html.match(/(src|href)="(.+?)"/g);
          let styleAssets = html.match(/style=".*url\((\S+)\)/g);
          
          let allAssets = [];

          // if the html contains url() in the style attributes
          if( styleAssets ){
            styleAssets = styleAssets.map( s => s.replace(/(style=".*url\(|["'()])/g, '') )
            // |["'\(\)]
            allAssets = [...allAssets, ...styleAssets];
          }

          // if the html contains src or href attributes
          if( srcHrefAssets ){  
            srcHrefAssets = srcHrefAssets.map( s => s.replace(/(src|href|=|")/g, '') );

            allAssets = [...allAssets, ...srcHrefAssets];
          }

          allAssets.forEach( asset =>{
              let localFile = asset.startsWith('/') || asset.startsWith('\\') ? 
                path.join( appPath, asset ) : 
                asset;

              // if the asset is a local file 
              // if the asset is not already in the options.assets array
              if( 
                fs.existsSync(localFile) && 
                fs.lstatSync(localFile).isFile() &&
                ! this.options.assets.includes(localFile)
              ){
                  this.options.assets.push(localFile);
              }
          });

            // any references to the node_modules directory are removed
            // any organizational packages @ are also removed
            // this might cause some conflicts with packages that are named the same as organiazational packages
            html = html.replace(/[\\\/]?node_modules[\\\/@]+/g, '/');
          
          // Tell webpack to move on
          cb(null, {html, outputName, plugin});
        },
      );

      HtmlWebpackPlugin.getCompilationHooks(compilation).afterEmit.tapAsync(
        "CAWebHtmlWebpackPlugin", 
        ({outputName, plugin}, cb) => {

          // if there are any assets in the options.assets array
          // we add them to the compilation and emit them
          this.options.assets.forEach( async (asset) => { 
            compilation.fileDependencies.add( asset );

            // we remove the appPath from the asset path
            // we remove the node_modules/@ from the asset path
            compilation.emitAsset( 
              asset.replace(appPath, '').replace(/[\\\/]?node_modules[\\\/@]+/g, ''),
              new compiler.webpack.sources.RawSource( fs.readFileSync(asset) ) 
            );

            // if the asset is the @caweb/icon-library font-only.css file we have to also add the font files
            if( asset.match(/@caweb\/icon-library\/build\/font-only-?.*.css/g) ){
              let fontPath = path.join( iconLibraryPath, 'build', 'fonts' );

              let fontFiles = fs.readdirSync(fontPath).filter( (file) => { 
                  return file.endsWith('.woff') || 
                    file.endsWith('.woff2') || 
                    file.endsWith('.eot') || 
                    file.endsWith('.svg') || 
                    file.endsWith('.ttf');
                });

              fontFiles.forEach( (file) => {
                  compilation.fileDependencies.add( file );

                  let filePath = path.join( fontPath, file );
                  
                  // we remove the appPath from the asset path
                  compilation.emitAsset( 
                    filePath.replace(appPath, '').replace(/[\\\/]?node_modules[\\\/@]+/g, ''),
                    new compiler.webpack.sources.RawSource( fs.readFileSync(filePath) ) 
                  );
              });
            }
          });
          
          // Tell webpack to move on
          cb(null, {outputName, plugin});
        },
      );
    });
  
  }
} // end of class
  

export default CAWebHtmlWebpackPlugin;