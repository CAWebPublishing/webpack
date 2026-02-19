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
// this is the current project directory
const appPath = process.cwd();

// this is the path to this current file
const currentPath = path.dirname(fileURLToPath(import.meta.url));

// this should be the path to the @caweb/template and @caweb/icon-library packages
const templatePath = path.join( 'node_modules', '@caweb', 'template');
const iconLibraryPath = path.join( 'node_modules', '@caweb', 'icon-library');

const allowedAssetExts = [
  '.js', '.css',
  '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.bmp', '.gif', '.ico', 
  '.woff', '.woff2', '.eot', '.ttf', '.otf'
]

// function to process assets from regex matches
const processAssets = ( assets = [] , type = 'style') => {
  return assets.map( asset => {
    return asset
      .replace(/[\w]+="/, '') // remove src=" or href=" or style="
      .replace(/"$/, '') // remove trailing "
  })
  .filter( asset => {
      let ext = path.extname( asset ).toLowerCase();
      let localFile = fs.existsSync( path.join( appPath, asset ) ) 

      return localFile && allowedAssetExts.includes( ext );

  })

}
  
const pluginName = 'CAWebHTMLPlugin';

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
class CAWebHTMLPlugin extends HtmlWebpackPlugin{

  // we change some of the html-webpack-plugin defaults
  constructor(opts = {}) {
    // the available templates in @caweb/template
    let templates = ['blank', 'default', 'search'];

    /**
     * Default options
     * we use the @caweb/template package as the default template source
     * 
     * @see https://github.com/jantimon/html-webpack-plugin/blob/main/index.js
     */
    let defaultOptions = {
      // we use the @caweb/template patterns/default.html as the default template
      template: path.join( templatePath, 'patterns', 'default.html'),
      
      // favicon
      favicon: path.join( templatePath, 'media', 'favicon.ico' ),
      
      // variables to pass to the template
      templateParameters: {
        // site title
        title: path.basename( appPath ),
        
        //site color scheme
        scheme: 'oceanside',

        // site logo, default is the @caweb/template/media/logo.png
        logo: path.join(templatePath, 'media', 'logo.png'),
        
        // meta tags
        meta: {
          Author: "CAWebPublishing",
          Description: "State of California",
          Keywords: "CAWebPublishing, California, government",
          viewport: "width=device-width, initial-scale=1.0,minimum-scale=1.0, maximum-scale=2.0"
        },

        // array of additional assets to include
        // this might be removed in the future
        assets: []
      },
      
      
      // array of additional assets to include
      // this might be removed in the future
      assets: []
    };

    // if there is a favicon.ico file in the media directory we use that
    if( fs.existsSync(path.join(appPath, 'media', 'favicon.ico')) ){
      defaultOptions.favicon = path.join(appPath, 'media', 'favicon.ico');
    }

    // if there is a logo file in the media directory we use that
    if( fs.existsSync(path.join(appPath, 'media', 'logo.png')) ){
      // defaultOptions.assets.push( path.join(appPath, 'media', 'logo.png') );
      defaultOptions.templateParameters.logo = '/media/logo.png';
    }
      
    // if template selection is one of ours
    if( opts.template && templates.includes(opts.template) ){
      
      // update template file based on template selection 
      opts.template = path.join( templatePath, 'patterns', `${opts.template}.html`);
    }

    /**
     * the html-webpack-plugin meta tags are missing the self closing forward slash
     * so if the user options has meta tags, we move them to the opts.templateParameters.meta
     * and delete the opts.meta key
     */
    if( opts.meta ){
      // ensure templateParameters exists
      opts.templateParameters = opts.templateParameters || {};

      // move opts.meta to opts.templateParameters.meta
      opts.templateParameters.meta = opts.meta
      
      // delete opts.meta
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

        // some properties are used in different ways and not just as templateParameters
        // if there is a dataFile.site.favicon we have to define that outside of the templateParameters
        if( dataFile.site.favicon ){
          defaultOptions.favicon = dataFile.site.favicon;
        }
      }
      
    }

    // call the parent class constructor with the merged options
    super(deepmerge(defaultOptions, opts));

  }

  apply(compiler) {
    super.apply(compiler);

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
       /**
       * Hook into the HtmlWebpackPlugin events
       * 
       * @link https://github.com/jantimon/html-webpack-plugin?tab=readme-ov-file#events
       */
      HtmlWebpackPlugin.getCompilationHooks(compilation).beforeEmit.tapAsync(
        pluginName, 
        ({html, outputName, plugin}, cb) => {
          // if the html contains local assets those assets are added to the options.assets array 
          let allAssets = processAssets(html.match(/(src|href|style)="(.+?)"/g));

          allAssets.forEach( asset =>{
            // we add the asset to the compilation file dependencies so webpack watches it for changes
            // compilation.fileDependencies.add( path.join( appPath, asset ) );
            let fn = asset.replace(appPath, '').replace(/[\\\/]?node_modules[\\\/@]+/g, '')

            // if the asset hasn't already been emitted, we emit this prevents the error where multiple assets emit to the same filename
            if( ! compilation.getAssets().map( (asset) => asset.name).includes( fn ) ){
              compilation.emitAsset( 
                // we remove the appPath from the asset path
                // we remove the node_modules/@ from the asset path
                asset.replace(appPath, '').replace(/[\\\/]?node_modules[\\\/@]+/g, ''),
                new compiler.webpack.sources.RawSource( fs.readFileSync(path.join( appPath, asset ) ) ) 
              );

            }
            
          });
          
          

          // compilation.fileDependencies.add( allAssets[0] );
          // Tell webpack to move on
          cb(null, {html, outputName, plugin});
        },
      );

      HtmlWebpackPlugin.getCompilationHooks(compilation).afterEmit.tapAsync(
        pluginName, 
        ({outputName, plugin}, cb) => {
          // if there are any assets in the options.assets array
          // we add them to the compilation and emit them
          this.options.assets.forEach( async (asset) => { 
            // console.log( asset );
            // compilation.fileDependencies.add( asset );

            // // we remove the appPath from the asset path
            // // we remove the node_modules/@ from the asset path
            // compilation.emitAsset( 
            //   asset.replace(appPath, '').replace(/[\\\/]?node_modules[\\\/@]+/g, ''),
            //   new compiler.webpack.sources.RawSource( fs.readFileSync(asset) ) 
            // );

            // // if the asset is the @caweb/icon-library font-only.css file we have to also add the font files
            // if( asset.match(/@caweb\/icon-library\/build\/font-only-?.*.css/g) ){
            //   let fontPath = path.join( iconLibraryPath, 'build', 'fonts' );

            //   let fontFiles = fs.readdirSync(fontPath).filter( (file) => { 
            //       return file.endsWith('.woff') || 
            //         file.endsWith('.woff2') || 
            //         file.endsWith('.eot') || 
            //         file.endsWith('.svg') || 
            //         file.endsWith('.ttf');
            //     });

            //   fontFiles.forEach( (file) => {
            //       compilation.fileDependencies.add( file );

            //       let filePath = path.join( fontPath, file );
                  
            //       // we remove the appPath from the asset path
            //       compilation.emitAsset( 
            //         filePath.replace(appPath, '').replace(/[\\\/]?node_modules[\\\/@]+/g, ''),
            //         new compiler.webpack.sources.RawSource( fs.readFileSync(filePath) ) 
            //       );
            //   });
            // }
          });
          
          // Tell webpack to move on
          cb(null, {outputName, plugin});
        },
      );
    });
  
  }
} // end of class
  

export default CAWebHTMLPlugin;