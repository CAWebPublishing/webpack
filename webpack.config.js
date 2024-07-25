/**
 * WebPack Configuration for California Department of Technology
 * 
 * Utilizes WordPress Scripts Webpack configuration as base.
 * 
 * @link https://webpack.js.org/configuration/
 */

/**
 * External dependencies
 */
import baseConfig from '@wordpress/scripts/config/webpack.config.js';
import path from 'path';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {HtmlWebpackSkipAssetsPlugin} from 'html-webpack-skip-assets-plugin';

import JSHintPlugin from '@caweb/jshint-webpack-plugin';
import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';
import A11yPlugin from '@caweb/a11y-webpack-plugin';

/**
 * Internal dependencies
 */
const webpackCommand = 'build' === process.argv[2] ? 'build' : 'serve' ;

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

let webpackConfig = {
  ...baseConfig,
  target: 'web',
  cache: false,
  stats: 'errors',
  output: {
    ...baseConfig.output,
    clean: true,
    //publicPath: `/public`
  },
  module: {
    ...baseConfig.module,
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
          partialResolver: function(partial, callback){
              // all template partials are loaded from the root sample directory
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
                
                // content is served from the /sample/index.html
                case 'content': 
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
  performance: {
    maxAssetSize: 500000,
    maxEntrypointSize: 500000
  },
};

/**
 * Serve Only
 */
if( 'serve' === webpackCommand ){
  const appPath = process.cwd();
  const samplePath = path.join( appPath, 'sample');
  const templates =  ['blank', 'default'];

  let template;

  // Allow for template to be selected via NODE_OPTIONS env variable
  if( process.env.NODE_OPTIONS ){
    let opts = process.env.NODE_OPTIONS.split(' ').filter(e=>e).map(o=>o.replaceAll("'", ''))
    if( opts.includes('--template') ){
      template = opts[opts.indexOf('--template') + 1]
    }
  }

  template = templates.includes(template) ? template : 'default';
  
  // Dev Server is added
  webpackConfig.devServer = { 
    ...baseConfig.devServer,
    hot: true,
    compress: true,
    open: [  'http://localhost:9000' ],
    port: 9000,
    static: [
      /**
       * Static files are served from the following files in the following order
       * we don't have to add the build directory since that is the output.path and proxied
       * public - Default
       * node_modules - Allows loading files from other npm packages
       * src - Allows loading files that aren't compiled
       */
      {
        directory: path.join(appPath, 'public'),
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

  let pageTemplate = {
    title : path.basename(appPath),
    filename: path.join( appPath, 'public', 'index.html'),
    template: path.join( appPath, 'node_modules', '@caweb', 'html-webpack-plugin', 'sample', `${template}.html`),
    favicon: fs.existsSync(path.join(samplePath, 'favicon.ico')) ? path.join(samplePath, 'favicon.ico') : false,
    minify: false,
    scriptLoading: 'blocking',
    inject: 'body',
    meta: {
      "Author": "CAWebPublishing",
      "Description": "State of California",
      "Keywords": "California,government",
      "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0"
    },
    templateParameters: {
      "title" : path.basename(appPath),
      "header": '/sample/structural/header.html',
      "content": '/sample/index.html',
      "footer": '/sample/structural/footer.html'
    },
    skipAssets: [
      /.*-rtl.css/, // we skip the Right-to-Left Styles
      /css-audit.*/, // we skip the CSSAudit Files
      /a11y.*/, // we skip the A11y Files
      /jshint.*/, // we skip the JSHint Files
    ]
  }

  // Page Template and additional plugins
  webpackConfig.plugins.push(
    new HtmlWebpackPlugin(pageTemplate),
    new HtmlWebpackSkipAssetsPlugin(),
    new JSHintPlugin(),
    new CSSAuditPlugin(),
    new A11yPlugin()
  )
}

export default webpackConfig;
