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
import baseConfig from './webpack.wp.config.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// webpack plugins
import { merge } from 'webpack-merge';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

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

let mode = getArgVal('mode', 'development');
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
        let protocol = siteDomain.protocol.replace(':', '');

        addToServer( 'host', siteDomain.hostname );
        addToServer( 'server', protocol );
        
        // if the port is specified in the URL we use that. 
        if( '' !== siteDomain.port ){
          addToServer( 'port', siteDomain.port );
        // if not specified we use the default port 80 for http and 443 for https 
      } else {
          if( 'http' === protocol ){
              addToServer( 'port', 80 );
          } else if( 'https' === protocol ){
              addToServer( 'port', 443 );
          }
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
  entry: path.join( process.cwd(), 'src', 'index.js' ),
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
   clean: isProduction,
   path: path.resolve( process.cwd(), 'build' )
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
      },
      // Handle `.jsx` files.
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [

          // Spawns multiple processes and split work between them. This makes faster build.
          // @see https://webpack.js.org/loaders/thread-loader/
          {
            loader: 'thread-loader',
            options: {
              workers: - 1,
            },
          },

          // Transpiles JavaScript files using Babel. Translates newer syntax with less support
          // into older syntax with more support so the project can use newer syntax and have
          // them automatically translated into older syntax for compatibility suppoert.
          // @see https://www.npmjs.com/package/babel-loader
          // @see https://babeljs.io/
          {
            loader: 'babel-loader',
            options: {
              compact: false,
              presets: [

                // Preset that adds configuration for handling latest JavaScript syntax.
                // @see https://babeljs.io/docs/en/babel-preset-env
                ['@babel/preset-env', {
                  modules: false,
                  targets: '> 5%',
                }],

                // Preset that added configuration for handling react & JSX.
                // @see https://babeljs.io/docs/en/babel-preset-react
                '@babel/preset-react',
              ],
              plugins: [
                // Transform class properties syntax.
                // @see https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
                '@babel/plugin-transform-class-properties',
              ],
              cacheDirectory: false,
            },
          }
        ]
      },
    ]
  },
  
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

  /**
   * DevServer is only added during 'serve' command
   * 
   * @see https://webpack.js.org/configuration/dev-server/
   */
  devServer
};

export default merge( baseConfig, webpackConfig );