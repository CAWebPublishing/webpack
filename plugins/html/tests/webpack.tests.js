/**
 * These are tests for the CAWeb HTML Webpack Plugin
 */

/**
 * External Dependencies
 */
import path from 'path';

/**
 * Internal Dependencies
 */
// we use the local base webpack config as a starting point
import baseConfig from '../../../webpack.config.js';

// we import this current plugin to test it
import CAWebHtmlWebpackPlugin from '../index.js';

baseConfig.plugins.forEach( ( plugin, index ) => {
    // we only want to modify the CAWebHtmlWebpackPlugin instances
    if ( 'CAWebHtmlWebpackPlugin' === plugin.constructor.name  ) {
        // we update template parameters with the template in this projects node_modules
        // otherwise it uses the template from the base webpack config node_modules, which may not exist when testing.
        let templatePath = path.join(process.cwd(), 'node_modules', '@caweb', 'template');

        let template = path.join(templatePath, 'patterns', 'index.html');
        let favicon = path.join(templatePath, 'media', 'favicon.ico');
        let logo = path.join(templatePath, 'media', 'logo.png');

        // we only update the default options, not any user options
        // this allows for more flexible testing
        // plugin.userOptions.template = template;
        // plugin.options.template = template;
    
        // console.log(plugin)
        // we re-instantiate the plugin to test the new local plugin version
        // baseConfig.plugins[ index ] = new CAWebHtmlWebpackPlugin(plugin);
        // console.log( baseConfig.plugins[ index ] )

    }
        
} );

export default baseConfig;