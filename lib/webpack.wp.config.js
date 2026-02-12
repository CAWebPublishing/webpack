/**
 * Modified WordPress Scripts Webpack Configuration 
 * 
 * @package CAWebPublishing 
 * @link https://webpack.js.org/configuration/
 */

/**
 * External Dependencies
 */
import baseConfig from '@wordpress/scripts/config/webpack.config.js';
import { getArgVal } from './args.js';

/**
 * Internal dependencies
 */

// Wordpress ignores the webpack --mode flag
// if the flag is passed we use that mode 
// otherwise use whatever Wordpress is using
let mode = getArgVal('mode') ? getArgVal('mode') : baseConfig.mode;
let isProduction = mode === 'production';

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

// Update some of the default WordPress plugins.
baseConfig.plugins = baseConfig.plugins.map((plugin, i) => {
  const pluginName = plugin.constructor.name;
  
  switch(pluginName){
    case 'MiniCssExtractPlugin':
      // we change the default naming of the CSS files
      plugin.options.filename = isProduction ? '[name].min.css' : '[name].css';
      break;
    case 'RtlCssPlugin':
      // we disable the RTL CSS generation
      plugin = false;
      break;
      
  }

  return plugin;
}).filter( Boolean );

/**
 * we remove the WordPress devServer declaration since we can only have 1 when exporting multiple configurations
 * 
 * @see https://github.com/webpack/webpack-cli/issues/2408#issuecomment-793052542
 */
delete baseConfig.devServer;

export default baseConfig;