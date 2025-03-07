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
import spawn from 'cross-spawn';
import { getAllFilesSync } from 'get-all-files'
import EntryDependency from "webpack/lib/dependencies/EntryDependency.js";
import fs from 'fs';

const boldWhite = chalk.bold.white;
const boldGreen = chalk.bold.green;
const boldBlue = chalk.bold.hex('#03a7fc');
*/
const currentPath = path.dirname(fileURLToPath(import.meta.url));
const appPath = process.cwd();


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
    let templates = ['blank', 'default', 'search'];

    let defaultOptions = {
      title: path.basename( appPath ),
      favicon: fs.existsSync(path.join(appPath, 'sample', 'favicon.ico')) ? path.join(appPath, 'sample', 'favicon.ico') : path.join(currentPath, 'sample', 'favicon.ico'),
      inject: 'body',
      template: path.join( currentPath, 'sample', 'default.html'),
      scriptLoading: 'blocking',
      meta: {
        "Author": "CAWebPublishing",
        "Description": "State of California",
        "Keywords": "California,government",
        "viewport": "width=device-width, initial-scale=1.0, maximum-scale=2.0"
      },
      templateParameters: {
        "template": "default",
        "title": path.basename( appPath ),
        "scheme": "oceanside",
        "logo": "https://caweb.cdt.ca.gov/wp-content/uploads/sites/221/2023/06/caweb-publishing-logo.png"
      },
    }

    // update templateParameters.title to match user options.
    if( opts.title ){
      defaultOptions.templateParameters.title = opts.title;
    }

    // if template selection is one of ours
    if( opts.template && templates.includes(opts.template) ){
      let template = opts.template;
      // update template file based on template selection 
      opts.template = path.join( currentPath, 'sample', `${template}.html`);
      
      // update default.templateParameters.template to match user options.
      defaultOptions.templateParameters.template = template;
    }
   
    // if there is a caweb.json file we merge the site data with the templateParameters
    if( fs.existsSync( path.join(appPath, 'caweb.json') ) ){

      let dataFile = JSON.parse( fs.readFileSync( path.join(appPath, 'caweb.json') ) );

      // if there is a dataFile.site we merge the defaultOptions.templateParameters, user options.templateParameters, and the dataFile.site
      if( dataFile.site ){
        opts.templateParameters = {
          ...defaultOptions.templateParameters,
          ...opts.templateParameters,
          ...dataFile.site
        }
      }
      
    }

    super(deepmerge(defaultOptions, opts));

  }

  apply(compiler) {
    super.apply(compiler);
  }
} // end of class
  

export default CAWebHTMLPlugin;