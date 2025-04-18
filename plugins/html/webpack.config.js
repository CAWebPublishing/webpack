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
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';

import JSHintPlugin from '@caweb/jshint-webpack-plugin';
import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';
import A11yPlugin from '@caweb/a11y-webpack-plugin';

/**
 * Internal dependencies
 */
import CAWebHTMLPlugin from './index.js';

const webpackCommand = 'build' === process.argv[2] ? 'build' : 'serve' ;
const currentPath = path.dirname(fileURLToPath(import.meta.url));

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

function flagExists(flag){
  return flags.includes(flag)
}

function getArgVal(flag){
  return flagExists(flag) ? flags[flags.indexOf(flag) + 1] : false;
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
    case new RegExp(/\.(sc|sa)ss$/).toString():
      rule.use[rule.use.length-1].options.sassOptions = {
        silenceDeprecations: ['global-builtin', 'import', 'color-functions', 'mixed-decls']
      };
      break;
  }
});

// we remove the WordPress CleanWebpackPlugin definition
// instead we use the Webpack output.clean definition
baseConfig.plugins.splice(1,1, false);

/**
 * we remove the WordPress devServer declaration since we can only have 1 when exporting multiple configurations
 * 
 * @see https://github.com/webpack/webpack-cli/issues/2408#issuecomment-793052542
 */
delete baseConfig.devServer;

// Wordpress ignores the webpack --mode flag
// if the flag is passed we use that mode 
// otherwise use whatever Wordpress is using
let mode = getArgVal('--mode') ? getArgVal('--mode') : baseConfig.mode;

let webpackConfig = {
  ...baseConfig,
  mode,
  name: 'uncompressed',
  target: 'web',
  // Turn off caching of generated modules and chunks.
  // @see https://webpack.js.org/configuration/cache/
  cache: false,

  stats: 'errors',
  
  // Determine where the created bundles will be outputted.
  // @see https://webpack.js.org/concepts/#output
  output: {
    ...baseConfig.output,
    clean: mode === 'production',
    pathinfo: false
  },

  performance: {
    maxAssetSize: 500000,
    maxEntrypointSize: 500000
  },

  // This option determine how different types of module within the project will be treated.
  // @see https://webpack.js.org/configuration/module/
  module:{
    ...baseConfig.module,
    // This option sets up loaders for webpack configuration.
    // Loaders allow webpack to process various types because by default webpack only
    // understand JavaScript and JSON files.
    // @see https://webpack.js.org/concepts/#loaders
    rules: [
      ...baseConfig.module.rules,
      /**
       * Default template loader for html is lodash, 
       * lets switch to handlebars
       */
      {
        test: /\.html$/,
        loader: 'handlebars-loader',
        options:{
          rootRelative: process.cwd(),
          helperDirs: [
            path.resolve(currentPath, 'helpers', 'logic'),
            path.resolve(currentPath, 'helpers', 'object'),
            path.resolve(currentPath, 'helpers', 'string')
          ],
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
  // WordPress already enqueues scripts and makes them available
  // in global scope so those scripts don't need to be included on the bundle. For webpack
  // to recognize those files, the global variable needs to be registered as externals.
  // These allows global variable listed below to be imported into the module.
  // @see https://webpack.js.org/configuration/externals/#externals
  externals: {
    // Third party dependencies.
    jquery: 'jQuery',
    underscore: '_',
    lodash: 'lodash',
    react: ['vendor', 'React'],
    'react-dom': ['vendor', 'ReactDOM'],
    
    // WordPress dependencies.
    '@wordpress/hooks': ['vendor', 'wp', 'hooks'],

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
    devMiddleware: {
      writeToDisk: true,
    },
    hot: true,
    compress: true,
    allowedHosts: 'auto',
    host: 'localhost',
    port: 9000,
    open: [  'http://localhost:9000' ],
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
    ! flagExists('--no-jshint') ? new JSHintPlugin() : false,
    ! flagExists('--no-audit') ? new CSSAuditPlugin() : false,
    ! flagExists('--no-a11y') ? new A11yPlugin() : false
  )

  // we add the SERP (Search Engine Results Page)
  // if the caweb.json has a google search id
  if( fs.existsSync( path.join(appPath, 'caweb.json') ) ){
    let dataFile = JSON.parse( fs.readFileSync( path.join(appPath, 'caweb.json') ) );
  
    if( dataFile.site.google.search ){
      webpackConfig.plugins.push(
        new CAWebHTMLPlugin({
          template: 'search',
          templateParameters: {
            scheme: 'false' !== scheme ? scheme : false
          },
          filename: 'serp.html',
          title: 'Search Results Page',
          skipAssets: [
            /.*-rtl.css/, // we skip the Right-to-Left Styles
            /css-audit.*/, // we skip the CSSAudit Files
            /a11y.*/, // we skip the A11y Files
            /jshint.*/, // we skip the JSHint Files
            /font-only.*/, // we skip the font-only Files
          ]
        })
      )
    }
    
  }

  
}

/**
 * Production only
 */
if( mode === 'production' ){
  // Config
  webpackConfig.name = 'compressed';
  webpackConfig.devtool = false;

  // Output
  webpackConfig.output.filename = '[name].min.js';
  webpackConfig.output.chunkFilename = '[name].min.js?v=[chunkhash]';
    
  // Plugins
  webpackConfig.plugins.push(
    new MiniCSSExtractPlugin( { filename: '[name].min.css' } ),
    new RtlCssPlugin( { filename: '[name]-rtl.min.css' } )
  )

  // Optimization
  webpackConfig.optimization.minimize = true;
  webpackConfig.optimization.minimizer.push(
    new CssMinimizerPlugin({test: /\.min\.css$/})
  )
}

// we remove empty scripts
webpackConfig.plugins.push(
  new RemoveEmptyScriptsPlugin()
);
export default webpackConfig;
