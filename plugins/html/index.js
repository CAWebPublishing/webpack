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
    let templates = ['blank', 'default', 'test'];

    let defaultOptions = {
      title: path.basename( appPath ),
      favicon: fs.existsSync(path.join(currentPath, 'sample', 'favicon.ico')) ? path.join(currentPath, 'sample', 'favicon.ico') : false,
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
        "title": path.basename( appPath ),
        "scheme": "oceanside"
      },
    }

    // update templateParameters.title to match user options.
    if( opts.title ){
      defaultOptions.templateParameters.title = opts.title;
    }

    // select template file based on template selection if template is one of ours
    if( opts.template && templates.includes(opts.template) ){
      opts.template = path.join( currentPath, 'sample', `${opts.template}.html`);
    }

    super(deepmerge(defaultOptions, opts));

  }

  apply(compiler) {
    super.apply(compiler);
  }
} // end of class
  

export default CAWebHTMLPlugin;