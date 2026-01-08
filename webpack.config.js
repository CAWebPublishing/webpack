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
import CAWebHTMLPlugin from '@caweb/html-webpack-plugin';
import { error } from 'console';

const webpackCommand = 'build' === process.argv[2] ? 'build' : 'serve' ;

// this is the path to this current file
const currentPath = path.dirname(fileURLToPath(import.meta.url));

// this is the path to the current project directory
const appPath = process.cwd();

// flags can be passed via argv0 
// we also add args from NODE_OPTIONS
let flags = [].concat(
  processArgs(process.argv),
  processArgs(process.argv0.split(' ')),
  processArgs(process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.split(' ') : []),
)

const cawebJson = fs.existsSync( path.join(appPath, 'caweb.json') ) ? 
  JSON.parse(fs.readFileSync(path.join(appPath, 'caweb.json'))) 
  : {};

// we use the caweb.json file to determine the site domain
if( cawebJson?.site?.domain ){
  let siteDomain = new URL(cawebJson.site.domain);

  // only add the flags if the site domain is not localhost
  if( 'localhost' !== siteDomain.host ){
    // we add the site domain to the flags
    flags.push(
      `--host`, siteDomain.host,
      '--server-type', siteDomain.protocol.replace(':', ''),
      '--port', '' !== siteDomain.port ? cawebJson.site.port : 80, // default port is 80
    );
  }
}


function processArgs( arr ){
  let tmp = [];

  arr.filter(Boolean).map((o) => {
    return o.replaceAll("'", '').split('=').forEach((e => tmp.push(e)))
  });

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
    // silence deprecation warnings from sass
    case new RegExp(/\.(sc|sa)ss$/).toString():
      rule.use[rule.use.length-1].options.sassOptions = {
        silenceDeprecations: ['global-builtin', 'import', 'color-functions', 'if-function']
      };
      break;
    case new RegExp(/\.m?(j|t)sx?$/).toString():
      // @since @wordpress/scripts@30.20.0 babel-loader is used for js and ts files
      
      // Added the Transform class properties syntax plugin to the babel-loader.
      // @see https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
      rule.use[0].options.plugins.push('@babel/plugin-proposal-class-properties');

      // we add thread-loader before the babel-loader
      // Spawns multiple processes and split work between them. This makes faster build.
      // @see https://webpack.js.org/loaders/thread-loader/
      rule.use = [{
        loader: 'thread-loader',
        options: {
          workers: -1,
        },
      }].concat(rule.use);        

    break;
  }
});

/**
 * we remove the WordPress devServer declaration since we can only have 1 when exporting multiple configurations
 * 
 * @see https://github.com/webpack/webpack-cli/issues/2408#issuecomment-793052542
 */
delete baseConfig.devServer;

let customTemplateHelpers = [];

// we allow the user to pass custom template helpers

if( fs.existsSync(path.join(appPath, 'helpers'), {withFileTypes: true} ) ) {
  // we add the helpers directory
  customTemplateHelpers = [ path.join(appPath, 'helpers') ];
  
  // we add any subdirectories
  fs.readdirSync(
      path.join(
        appPath, 'helpers'
      ), 
      {
        withFileTypes: true, 
        recursive: true
      } 
    )
    .filter( Dirent => Dirent.isDirectory()  )
    .map( Dirent => customTemplateHelpers.push( path.resolve(Dirent.parentPath, Dirent.name) ) )

} 

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

  stats: {
    errors: true,
  },
  
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

  // Determine how modules are resolved.
  // @see https://webpack.js.org/configuration/resolve/
  resolve: {
    // Allows extension to be leave off when importing.
    // @see https://webpack.js.org/configuration/resolve/#resolveextensions
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '...'],
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
            path.resolve(currentPath, 'helpers', 'bootstrap'),
            path.resolve(currentPath, 'helpers', 'logic'),
            path.resolve(currentPath, 'helpers', 'object'),
            path.resolve(currentPath, 'helpers', 'string')
          ].concat( customTemplateHelpers ),
          partialResolver: function(partial, callback){
            /**
             * All template partials are loaded from the root directory
             * if the file doesn't exist we fallback to our template partials
             */
            let fallbackPath = path.join( currentPath, '..', 'template' );
            let partialDir = '';

            // template parameter specific partials
            switch( partial ){
              /**
               * Semantic elements are served from the /semantic/ directory
               * 
               * - header
               * - footer
               * 
               * @link https://www.w3schools.com/html/html5_semantic_elements.asp
               */
              case 'branding':
              case 'footer':
              case 'header': 
              case 'mobileControls': 
              case 'navFooter':
              case 'navHeader': 
              case 'utilityHeader': 
                partialDir = 'semantics';
                break;

              // content is served from the /content/ directory
              case 'index': 
              case 'content': 
                partialDir = 'content';
                break;

              // components are served from the /components/ directory
              case 'alert':
              case 'card':
                partialDir = `components/${partial}`;
                break;
              
              // forms are served from the /forms/ directory
              case 'searchForm':
                partialDir = 'forms';
                break;
              
              // tables are served from the /tables/ directory
              case partial.includes('Table'):
                partialDir = 'tables';
                break;
            }

            if( partialDir ){
                // we remove the Form from the name
                // we remove the Table from the name
                // we change the partial name from camelCase to dash-case
                partial = partial.replace(/(Form|Table)/, '').replace(/([A-Z])/g, '-$1').toLowerCase();

                partial = fs.existsSync( path.join( appPath, partialDir, `/${partial}.html` )) ? 
                  path.join( appPath, partialDir, `/${partial}.html` ) :
                  path.join( fallbackPath, partialDir, `/${partial}.html` )
            }

            callback(false, partial );
          }
        }
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
  
  }
};

/**
 * Serve Only
 */
if( 'serve' === webpackCommand ){
  let template = flags.includes('--template') ? getArgVal('--template') : 'default';
  let scheme = flags.includes('--scheme') ? getArgVal('--scheme') : 'oceanside';

  let host = flags.includes('--host') ? getArgVal('--host') : 'localhost';
  let port = flags.includes('--port') ? getArgVal('--port') : 9000;
  let server = flags.includes('--server-type') ? getArgVal('--server-type') : 'http';

  // Dev Server is added
  webpackConfig.devServer = { 
    devMiddleware: {
      writeToDisk: true,
    },
    hot: true,
    compress: true,
    allowedHosts: 'auto',
    server,
    host,
    port,
    open: [  `${server}://${host}:${port}` ],
    static: [
      /**
       * Static files are served from the following files in the following order
       * we don't have to add the build directory since that is the output.path and proxied
       * 
       * node_modules - Allows loading files from other npm packages
       */
      {
        directory: path.join(appPath, 'node_modules'),
      },
      /**
       * Static files are served from the following files in the following order
       * we don't have to add the build directory since that is the output.path and proxied
       * 
       * node_modules - Allows loading files from other npm packages
       */
      {
        directory: path.join(appPath, 'media'),
      }
    ],
    proxy:[
      /**
       * WordPress Proxy Configuration is deprecated
       * @since 28.2.0
       */
      {
        context: ['/build'],
        target: `${server}://${host}:${port}`,
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
        target: `${server}://${host}:${port}`,
        pathRewrite: { '^/node_modules': '' },
      },
      /**
       * We proxy the node_modules and src so they serve from the root
       */
      {
        context: ['/media'],
        target: `${server}://${host}:${port}`,
        pathRewrite: { '^/media': '' },
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
  if( cawebJson.site?.google?.search ){
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
          ]
        })
      )
  }
  
  // we add any additional pages
  let basePageDir = path.join(appPath, 'content', 'pages');
  if( fs.existsSync(basePageDir, {withFileTypes: true} ) ) {
    fs.readdirSync(
      basePageDir, 
      { withFileTypes: true, recursive: true }
    )
    .filter( Dirent => Dirent.isFile() && Dirent.name.endsWith('.html') )
    .map( Dirent => {
      let fileTemplate = path.join(Dirent.parentPath, Dirent.name);
      let p = fs.readFileSync( fileTemplate ).toString();
      let fileName = fileTemplate.replace(basePageDir, '');

      webpackConfig.plugins.push(
        new CAWebHTMLPlugin({
          template,
          filename: fileName,
          // replace .html, forward slashes with a space, uppercase the first letter of each word, remove Index
          // this is to make sure the title is readable
          // and not just a file name
          title: fileName.replace(/\.html$/, '').replace(/[\/\\]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(' Index', ''),
          templateParameters: {
            bodyHtmlSnippet: p,
          },
          skipAssets: [
            /.*-rtl.css/, // we skip the Right-to-Left Styles
            /css-audit.*/, // we skip the CSSAudit Files
            /a11y.*/, // we skip the A11y Files
            /jshint.*/, // we skip the JSHint Files
          ]
        })
      )
    });
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