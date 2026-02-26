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
import fs from 'fs';
import path from 'path';
import * as prettier from 'prettier';

/**
 * Internal dependencies
 */

let output = [];

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
      // The postcss-loader is the 3rd loader
      rule.use[2].options.postcssOptions.plugins = 'postcssPlugins'
      // The sass-loader is last
      rule.use[rule.use.length-1].options.sassOptions = {
        silenceDeprecations: ['global-builtin', 'import', 'color-functions', 'if-function']
      };
      break;
    case new RegExp(/\.m?(j|t)sx?$/).toString():
      // @since @wordpress/scripts@30.20.0 babel-loader is used for js and ts files
      // Added the Transform class properties syntax plugin to the babel-loader.
      // @see https://babeljs.io/docs/en/babel-plugin-proposal-transform-class-properties
      rule.use[0].options.plugins.push('@babel/plugin-transform-class-properties');
      delete rule.use[0].options.cacheDirectory;
      delete rule.use[0].options.configFile;
      delete rule.use[0].options.babelrc;

      // this one only applies if hasReactFastRefresh and we are serving
      rule.use[0].options.plugins.push('react-refresh/babel');

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
// when importing the base configuration, the plugins are already instantiated so we have to loop through them and modify the options of the instantiated plugins.
baseConfig.plugins = baseConfig.plugins.map((plugin, i) => {
  const pluginName = plugin.constructor.name;
  
  switch(pluginName){
    case 'MiniCssExtractPlugin':
      // we only need the filename
      delete plugin.options.ignoreOrder;
      delete plugin.options.runtime;
      delete plugin.options.experimental;
      delete plugin.options.experimentalUseImportModule;
      
      break;
      case 'DefinePlugin':
        Object.entries(plugin.definitions).forEach( ([d, n]) => { 
          // these are booleans but come in as strings, so we set them again so they are boolean
          plugin.definitions[d] = ('true' === n)
        }) 
        break;
    case 'RtlCssPlugin':
      // we disable the RTL CSS generation we don't need them 
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

// Serialize all the data from webpack config and saves it to the output array
// this is the last chance to make any changes and some changes have to be made here otherwise prettier will fail to format the code correctly.
const serializeData = ( data ) => {
  Object.entries(data).forEach(([k, v]) => {
      // if the key is not a number, set it as the property key
      // if the key has a dash it has to be wrapped in quotes
      let key = Number.isNaN(Number(k)) ? (k.includes('-') || k.includes('.') ? `'${k}':` : `${k}:`) : '';

      // if the key is blank then the value is being used in an array.
      let isInArray = ! key.length;

      switch( typeof v ){
        case 'string':
          v = v.match(/(browserslist:)?.*\/node_modules\/(@wordpress\/)?([\w-]+)\/.*/g) ?
            v.replace(/(browserslist:)?.*\/node_modules\/(@wordpress\/)?([\w-]+)\/.*/g, '$1$2$3') : v;

          if(v.startsWith('browserslist:')){
            v = "browserslist.findConfig( '.' ) ? browserslist.findConfig( '.' ) : 'browserslist:extends @wordpress/browserslist-config'";
          } else if ( 'path' === k ){
            // since we want it to be dynamic based on where the user is running the webpack command
            v = "resolve( process.cwd(), 'build' )";
            // this is the filename for the MiniCssExtractPlugin which needs to be modified to match the mode
          } else if ( 'filename' === k && v.endsWith('.css') ){
            v = 'isProduction ? \'[name].min.css\' : \'[name].css\''
          } else if( 'mini-css-extract-plugin' === v ){
            v = 'MiniCssExtractPlugin.loader';
          // all of these values can be wrapped in a require.resolve since they are all packages that need to be resolved
          } else if( 
            '@wordpress/babel-preset-default' === v ||
            'react-refresh/babel' === v ||
            [ 'loader', 'use', 'target' ].includes(k)
          ){
            v = `require.resolve( '${v}' )`;

          } else if ('postcssPlugins' === v ){
            // we don't have to do anything, we just dont need it wrapped in quotes sinces its a constant.
          }else{
            // all other string values should be wrapped in quotes
            v = `'${v}'`;
            
          }
        case 'boolean':
        case 'number':

          // push to output
          output.push(`${ key } ${v}`);
          break;
        case 'object':
            // if the value is a regex
            if( v instanceof RegExp ){
              output.push(`${key}${v}`)
            // if the value is a boolean
            }else if ( v instanceof Boolean ){
              output.push(`${key}${v}`)
  
            // if the value is an array
            }else if( v instanceof Array ){
              output.push(`${key}[`)
              serializeData(v);
              output.push(`]`)
  
            // if the constructor name is not Object or Array, assume it a class
            // these are usually plugins used in the configurations
            } else if ( ! ['Object', 'Array'].includes( v.constructor.name ) ){
              // the DefinePlugin is part of the webpack package not a standalone plugin
              // so if the plugin is DefinePlugin we prefix the name with webpack.
              let pluginName = 'DefinePlugin' !== v.constructor.name ? v.constructor.name :`webpack.${v.constructor.name}`;

              let config = {};

              // each plugin has a different configuration 
              switch( pluginName ){
                case 'webpack.DefinePlugin':
                  config = v.definitions;
                  break;
                case 'TerserPlugin':
                  // the terserplugin does not need the minimizer, test option, but is missing the terserOptions
                  delete v.options.minimizer;
                  delete v.options.test;

                  // add the terserOptions
                  v.options.terserOptions = {
                    output: {
                      comments: /translators:/i,
                    },
                    compress: {
                      passes: 2,
                    },
                    mangle: {
                      reserved: [ '__', '_n', '_nx', '_x' ],
                    },
                  }
                case 'PhpFilePathsPlugin':
                case 'MiniCssExtractPlugin':
                  config = v.options;
                  break;
                case 'ReactRefreshPlugin': // this is the ReactRefreshWebpackPlugin
                  pluginName = 'ReactRefreshWebpackPlugin';
                  break;
                case 'CopyPlugin': // this is the CopyWebpackPlugin
                  pluginName = 'CopyWebpackPlugin'
                  config = v;
                
              }
  
              // if the plugin has configurations
              if( Object.keys(config).length ){
                
                output.push(`new ${pluginName}({`)
                serializeData( config );
                output.push('})')
              }else{

                // DependencyExtractionWebpackPlugin
                if( 'DependencyExtractionWebpackPlugin' === pluginName ){
                  output.push( `externals && new ${pluginName}()` );
                }else {
                  output.push(`new ${pluginName}()`)
                }
              }

  
            }else{
              output.push(`${key} {`)
              serializeData(v);
              output.push(`}`)
            }
          break;
        case 'function':
          // these functions can just be executed
          if( 'entry' === k ){
            output.push(`${key}${JSON.stringify(v('script'))}`);
          }else if( ['name', 'transform'].includes(k) ) {
            output.push(v.toString());
          }else if( ['implementation', 'filter'].includes(k) ){
            output.push( `${key}${v.toString()}` )
          }
          break;
      }
  })
}

// header information for the output file
let header = `/**\n * This file is autogenerated and should not be modified.
 * Last modified: ${ new Date().toString()}\n */`;

// Imports that have to be included
let imports = Object.entries({
  'CopyWebpackPlugin': 'copy-webpack-plugin',
  'webpack': 'webpack',
  'browserslist': 'browserslist',
  'MiniCssExtractPlugin': 'mini-css-extract-plugin',
  '{basename, dirname, relative, resolve, sep}': 'path',
  'TerserPlugin': 'terser-webpack-plugin',
  '{ realpathSync }': 'fs',
  'DependencyExtractionWebpackPlugin': '@wordpress/dependency-extraction-webpack-plugin',
  'postcssPlugins': '@wordpress/postcss-plugins-preset',
  '{ createRequire }': 'module',
  '{ getArgVal }': './lib/args.js',
  '{PhpFilePathsPlugin, getBlockJsonScriptFields, getBlockJsonModuleFields, fromProjectRoot, getProjectSourcePath}': './lib/utils.js',
}).map(([p, r]) => `import ${p} from '${r}';`).filter(Boolean).join('\n');

let constants = Object.entries({
  'isProduction': "getArgVal('mode', 'development') === 'production'",
  'hasReactFastRefresh': '! isProduction',
  'require': 'createRequire(import.meta.url)',
  'externals': 'getArgVal("externals", true)',
}).map(([p, r]) => `const ${p} = ${r};`).filter(Boolean).join('\n');

// start data serialization
serializeData( baseConfig );

// if an object was created we replace the leading comma that is created when joining the output
let formattedCode = await prettier.format(
  `${header}
  ${imports}\n
  ${constants}\n
  export default {${output.join(',').replace(/([{[(]),/g, '$1')}}`,
  {
    filepath: '.prettierrc.js'
  }
)

// we write this modified webpack config to the root
fs.writeFileSync( path.resolve('.', 'webpack.wp.config.js'), formattedCode );

// we create one utility file that will contain only the necessary @wordpress/scripts/utils functions/classes used
import { getPhpFilePaths, hasProjectFile, fromProjectRoot, getBlockJsonScriptFields, getBlockJsonModuleFields, getProjectSourcePath } from '@wordpress/scripts/utils/index.js';
import { getPackagePath } from '@wordpress/scripts/utils/package.js';

// we read the phpFilePathsPlugin file and replace the require statements into import statements since we want to write it as an ES module
let phpFilePathsPlugin = fs.readFileSync(
  path.resolve('.', 'node_modules', '@wordpress', 'scripts', 'plugins', 'php-file-paths-plugin', 'index.js')
)
.toString()
.replace("const { validate } = require( 'schema-utils' );", 
  [
    "import { validate } from 'schema-utils';",
    "import path, { join, sep, dirname } from 'path';",
    "import { existsSync, realpathSync, readFileSync } from 'fs';",
    "import { readPackageUp } from 'read-package-up';",
    "import FastGlob from 'fast-glob';\n",
  ].join('\n')
)
.replace("const { getPhpFilePaths } = require( '../../utils' );", [
  'const { sync: glob } = FastGlob;',
  'const { warn } = console;',
  'const { packageJson, path: pkgPath } = await readPackageUp({cwd: realpathSync( process.cwd() ) });',
  "const moduleFields = new Set( [ 'viewScriptModule', 'viewModule' ] );",
  "const scriptFields = new Set( [ 'viewScript', 'script', 'editorScript' ] );",
  `const hasProjectFile = ${hasProjectFile.toString()}`,
  `const fromProjectRoot = ${fromProjectRoot.toString()}`,
  `const getPackagePath = ${getPackagePath.toString()}`,
  getProjectSourcePath.toString(),
  getBlockJsonScriptFields.toString(),
  getBlockJsonModuleFields.toString(),
  getPhpFilePaths.toString(),
].join('\n\n'))
.replace("module.exports = PhpFilePathsPlugin", "export { PhpFilePathsPlugin, getBlockJsonScriptFields, getBlockJsonModuleFields, fromProjectRoot, getProjectSourcePath }")

// we write this modified plugin to the lib/utils.js folder
fs.writeFileSync( path.resolve('.', 'lib', 'utils.js' ), phpFilePathsPlugin );

export default baseConfig;
