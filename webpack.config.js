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
// import baseConfig from '@wordpress/scripts/config/webpack.config.js';
import baseConfig from './lib/webpack.wp.config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// webpack plugins
import { merge } from 'webpack-merge';
// import MiniCSSExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';
import {HtmlWebpackSkipAssetsPlugin} from 'html-webpack-skip-assets-plugin';
// import RtlCssPlugin from 'rtlcss-webpack-plugin';
// import {HtmlWebpackLinkTypePlugin} from 'html-webpack-link-type-plugin';

// import JSHintPlugin from '@caweb/jshint-webpack-plugin';
// import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';
// import A11yPlugin from '@caweb/a11y-webpack-plugin';

/**
 * Internal dependencies
*/
import { getArgVal } from './lib/args.js';
import handlebarsLoaderOptions from './lib/loader.js';
import { addToServer, getServer, updateTarget } from './lib/server.js';

// determine the webpack command
const webpackCommand = 'build' === process.argv[2] ? 'build' : 'serve' ;

// this is the path to this current file
const currentPath = path.dirname(fileURLToPath(import.meta.url));

// this is the path to the current project directory
const appPath = process.cwd();

// we read the caweb.json file if it exists
let caweb = fs.existsSync( path.join(appPath, 'caweb.json') ) ? 
  JSON.parse(fs.readFileSync(path.join(appPath, 'caweb.json'))) 
  : {};

let mode = getArgVal('--mode') ? getArgVal('--mode') : baseConfig.mode;
let isProduction = mode === 'production';
let devServer = false;

/**
 * DevServer is only added during 'serve' command
 * 
 * @see https://webpack.js.org/configuration/dev-server/
 */
if( 'serve' === webpackCommand ){
  // we use the caweb.json file to determine the site domain
  if( caweb?.site?.domain ){
    try {
      let siteDomain = new URL(caweb.site.domain);

      // only add the flags if the site domain is not localhost
      if( 'localhost' !== siteDomain.hostname ){
        addToServer( 'host', siteDomain.hostname );
        addToServer( 'server', siteDomain.protocol.replace(':', '') );
        
        // only add the port if it is specified
        if( '' !== siteDomain.port ){
          addToServer( 'port', siteDomain.port );
        }

        updateTarget( siteDomain.href );
      }

    } catch (e) {
      console.error(`\x1b[31mInvalid URL in caweb.json site.domain: ${caweb.site.domain}\x1b[0m`);
      console.error( '\x1b[31mEnsure the domain is a valid URL, e.g., https://example.com\x1b[0m' )
    }
    
  }

  // get the dev server config
  devServer = getServer();
}

// main webpack configuration object
let webpackConfig = {
  mode,
  // target: 'web',
  name: isProduction ? 'compressed' : 'uncompressed',
  
  /**
   * Output Configuration
   * @see https://webpack.js.org/configuration/output/
  */
 output: {
   filename: isProduction ? '[name].min.js' : '[name].js',
   chunkFilename: isProduction ? '[name].min.js?v=[chunkhash]' : '[name].js?v=[chunkhash]',
   pathinfo: false,
   clean: isProduction
  },
  
  /**
   * Resolve Configuration
   * 
   * @see https://webpack.js.org/configuration/resolve/
   */
  resolve: {
    extensions: ['.js', '.json'],
  },

  /**
   * Optimization Configuration
   * @see https://webpack.js.org/configuration/optimization/
  */
 optimization: {
   minimize: isProduction,
   minimizer: [
     isProduction ? new CssMinimizerPlugin({test: /\.min\.css$/}) : false
    ].filter(Boolean),
  },

  // This option determine how different types of module within the project will be treated.
  // @see https://webpack.js.org/configuration/module/
  module:{
    // This option sets up loaders for webpack configuration.
    // Loaders allow webpack to process various types because by default webpack only
    // understand JavaScript and JSON files.
    // @see https://webpack.js.org/concepts/#loaders
    rules: [
      /**
       * Default template loader for html is lodash, 
       * lets switch to handlebars-loader
       * @see https://github.com/pcardune/handlebars-loader
       */
      {
        test: /\.(html|handlebars|hbs)$/,
        loader: 'handlebars-loader',
        options: handlebarsLoaderOptions
      },
      // Handle `.tsx` and `.ts` files.
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true,
              transpileOnly: true,
            }
          }
        ],
      }
    ]
  },
  
  /**
   * Devtool Configuration
   * WordPress by default uses 'source-map' for devtool which affects build and rebuild speed.
   * For development we switch to 'eval' which is much faster.
   * For production we turn off devtool completely.
   * @see https://webpack.js.org/configuration/devtool/#devtool
   */
  devtool: isProduction ? 'source-map' : 'eval',
  
  /**
   * Turn off caching of generated modules and chunks.
   * @see https://webpack.js.org/configuration/cache/
   */
  cache: false,

  /**
   * Stats Configuration
   * @see https://webpack.js.org/configuration/stats/
   */
  stats: {
    errors: true,
    errorDetails: true,
  },


  /**
   * Performance Configuration
   * Throw hints when asset size exceeds the specified limit for production.
   * 
   * @see https://webpack.js.org/configuration/performance/
   */
  performance: {
    maxAssetSize: 350000,
    maxEntrypointSize: 500000,
    hints: isProduction ? 'warning' : false,
  },

  // WordPress already enqueues scripts and makes them available
  // in global scope so those scripts don't need to be included on the bundle. For webpack
  // to recognize those files, the global variable needs to be registered as externals.
  // These allows global variable listed below to be imported into the module.
  // @see https://webpack.js.org/configuration/externals/#externals
  externals: {
    // Third party dependencies.
    underscore: '_',
    jquery: 'jQuery',
    lodash: 'lodash',
    react: 'React',
    'react-dom': 'ReactDOM',

    // WordPress dependencies.
    '@wordpress/hooks': ['vendor', 'wp', 'hooks'],
    '@wordpress/i18n': ['vendor', 'wp', 'i18n'],
  
  },

  plugins: [
    // we remove empty scripts
    new RemoveEmptyScriptsPlugin(),

    // certain files can be skipped when serving
    new HtmlWebpackSkipAssetsPlugin({
      skipAssets: [
          /.*-rtl.css/, // we skip the Right-to-Left Styles
          /css-audit.*/, // we skip the CSSAudit Files
          /a11y.*/, // we skip the A11y Files
          /jshint.*/, // we skip the JSHint Files
        ]
    }),
  ],
  
  /**
   * DevServer is only added during 'serve' command
   * 
   * @see https://webpack.js.org/configuration/dev-server/
   */
  devServer
};

export default merge( baseConfig, webpackConfig );