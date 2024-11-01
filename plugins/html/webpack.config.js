/**
 * WebPack Configuration for California Department of Technology
 * 
 * Utilizes WordPress Scripts Webpack configuration as base.
 *  
 * @link https://webpack.js.org/configuration/
 */

/**
 * External Dependencies
 */
import baseConfig from '@wordpress/scripts/config/webpack.config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// webpack plugins
import MiniCSSExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import RtlCssPlugin from 'rtlcss-webpack-plugin';
import {HtmlWebpackSkipAssetsPlugin} from 'html-webpack-skip-assets-plugin';
import {HtmlWebpackLinkTypePlugin} from 'html-webpack-link-type-plugin';

import TerserPlugin from 'terser-webpack-plugin';

import JSHintPlugin from '@caweb/jshint-webpack-plugin';
import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';
import A11yPlugin from '@caweb/a11y-webpack-plugin';

/**
 * Internal dependencies
 */
import CAWebHTMLPlugin from './index.js';

const webpackCommand = 'build' === process.argv[2] ? 'build' : 'serve' ;

// flags can be passed via argv0 
// we also add args from NODE_OPTIONS
const flags = [].concat(
  processArgs(process.argv),
  processArgs(process.argv0.split(' ')),
  processArgs(process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.split(' ') : [])
)

function processArgs( arr ){
  let tmp = [];

  arr.filter(Boolean).map((o) => {
    return o.replaceAll("'", '').split('=').forEach((e => tmp.push(e)))
 })

  return tmp
}

function getArgVal(flag){
  return flags.includes(flag) ? flags[flags.indexOf(flag) + 1] : false;
}


// Update some of the default WordPress webpack rules.
baseConfig.module.rules.forEach((rule, i) => {
  const r = new RegExp(rule.test).toString();

  switch(r){
    // WordPress adds a hash to asset file names we remove that hash.
    case new RegExp(/\.(bmp|png|jpe?g|gif|webp)$/i).toString():
      rule.generator.filename = 'images/[name][ext]';
      break;
    case new RegExp(/\.(woff|woff2|eot|ttf|otf)$/i).toString():
      rule.generator.filename = 'fonts/[name][ext]';
      break;
    case new RegExp(/\.svg$/).toString():
      // we don't want SVG to be asset/inline otherwise the resource may not be available.
      // the asset should be an asset/resource we move them to the fonts folder. 
      if( 'asset/inline' === rule.type ){
        rule.type = 'asset/resource';
        rule.generator = { filename: 'fonts/[name][ext]' };

        delete rule.issuer;
      }
      break;
  }
});

// we remove the WordPress CleanWebpackPlugin definition
// instead we use the Webpack output.clean definition
baseConfig.plugins.splice(1,1, false);

// Wordpress ignores the webpack --mode flag
// if the flag is passed we use that mode 
// otherwise use whatever Wordpress is using
let mode = getArgVal('--mode') ? getArgVal('--mode') : baseConfig.mode;

let webpackConfig = {
  mode,
  name: 'uncompressed',
  target: 'web',
  cache: false,
  stats: 'errors',
  output: {
    clean: false
  },
  performance: {
    maxAssetSize: 500000,
    maxEntrypointSize: 500000
  },
  module:{
    rules: [
      /**
       * Default template loader for html is lodash, 
       * lets switch to handlebars
       */
      {
        test: /\.html$/,
        loader: 'handlebars-loader',
        options:{
          rootRelative: process.cwd(),
          partialResolver: function(partial, callback){
              /**
               * All template partials are loaded from the root sample directory
               * if the file doesn't exist we fallback to our sample template partials
               */
              let partialPath = path.join( process.cwd(), 'sample' );
              let partialStructurePath = path.join( partialPath, 'structural' );

              // template parameter specific partials
              switch( partial ){
                // header/footer is served from the /sample/structural/ directory
                case 'footer':
                case 'header': 
                  partialPath = fs.existsSync(path.join( partialStructurePath, `/${partial}.html` )) ? path.join( partialStructurePath, `/${partial}.html` ) :
                  `./structural/${partial}.html`
                  
                  break;
                
                case 'content': 
                  // content is served from /sample/index.html
                  partialPath = fs.existsSync(path.join( partialPath, '/index.html' )) ? path.join( partialPath, '/index.html' ) :
                  './missing/content.html';

                  break;
                
                // if not a template parameter we let the loader handle it
                default:
                  partialPath = partial;
              }


              callback(false, partialPath );
          }
        }
      }
    ]
  },
};

/**
 * Serve Only
 */
if( 'serve' === webpackCommand ){
  const appPath = process.cwd();
  let template = flags.includes('--template') ? getArgVal('--template') : 'default';
  let scheme = flags.includes('--scheme') ? getArgVal('--scheme') : 'oceanside';
     
  // Dev Server is added
  webpackConfig.devServer = { 
    hot: true,
    compress: true,
    open: [  'http://localhost:9000' ],
    port: 9000,
    static: [
      /**
       * Static files are served from the following files in the following order
       * we don't have to add the build directory since that is the output.path and proxied
       * public - Default
       * sample - Allows loading sample files
       * node_modules - Allows loading files from other npm packages
       * src - Allows loading files that aren't compiled
       */
      {
        directory: path.join(appPath, 'public'),
      },
      {
        directory: path.join(appPath, 'sample'),
      },
      {
        directory: path.join(appPath, 'node_modules'),
      },
      {
        directory: path.join(appPath, 'src'),
      },
    ],
    proxy:[
      /**
       * WordPress Proxy Configuration is deprecated
       * @since 28.2.0
       */
      {
        context: ['/build'],
        target: 'http://localhost:9000',
        pathRewrite: {
          '^/build': ''
        },
        logLevel: 'info'
      },
      /**
       * We proxy the node_modules and src so they serve from the root
       */
      {
        context: ['/node_modules'],
        target: 'http://localhost:9000',
        pathRewrite: { '^/node_modules': '' },
      },
      {
        context: ['/src'],
        target: 'http://localhost:9000',
        pathRewrite: { '^/src': '' },
      }
    ]
  }

  // Page Template and additional plugins
  webpackConfig.plugins.push(
    new CAWebHTMLPlugin({
        template,
        templateParameters: {
            scheme: 'false' !== scheme ? scheme : false 
        },
        skipAssets: [
            /.*-rtl.css/, // we skip the Right-to-Left Styles
            /css-audit.*/, // we skip the CSSAudit Files
            /a11y.*/, // we skip the A11y Files
            /jshint.*/, // we skip the JSHint Files
            /font-only.js/, // we skip the font-only Files
          ]
    }),
    new HtmlWebpackSkipAssetsPlugin(),
    new HtmlWebpackLinkTypePlugin(),
    ! getArgVal('--no-jshint') ? new JSHintPlugin() : false,
    ! getArgVal('--no-audit') ? new CSSAuditPlugin() : false,
    ! getArgVal('--no-a11y') ? new A11yPlugin() : false
  )
}

export default [
  baseConfig,
  webpackConfig,
  mode === 'production' ?
  {
    name: 'compressed',
    dependencies: ['uncompressed'],
    devtool: false,
    output: {
      filename: '[name].min.js',
      chunkFilename: '[name].min.js?v=[chunkhash]',
    },
    plugins: [
  		new MiniCSSExtractPlugin( { filename: '[name].min.css' } ),
  		new RtlCssPlugin( { filename: '[name]-rtl.min.css' } ),
    ],
    optimization:{
      minimize: true,
      minimizer: [
        `...`,
        new CssMinimizerPlugin({test: /\.min\.css$/})
      ]
    }
  } : false
].filter(Boolean);
