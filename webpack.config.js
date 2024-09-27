/**
 * Webpack Configuration 
 * 
 * @see @caweb/html-webpack-plugin/webpack.config.js 
 * @link https://webpack.js.org/configuration/
 */

/**
 * External dependencies
 */
import webpackConfig from '@caweb/html-webpack-plugin/webpack.config.js';

import CAWebHTMLPlugin from '@caweb/html-webpack-plugin';
import JSHintPlugin from '@caweb/jshint-webpack-plugin';
import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';
import A11yPlugin from '@caweb/a11y-webpack-plugin';

import {HtmlWebpackSkipAssetsPlugin} from 'html-webpack-skip-assets-plugin';
import {HtmlWebpackLinkTypePlugin} from 'html-webpack-link-type-plugin';

const webpackCommand = 'build' === process.argv[2] ? 'build' : 'serve' ;

const flags = process.argv0.split(' ');

// only if serving do we add the plugins
if( 'serve' === webpackCommand ){

    let template = flags.includes('--template') ? flags[flags.indexOf('--template') + 1] : 'default';
    let scheme = flags.includes('--scheme') ? flags[flags.indexOf('--scheme') + 1] : 'oceanside';
       
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
        ! flags.includes('--no-jshint') ? new JSHintPlugin() : false,
        ! flags.includes('--no-audit') ? new CSSAuditPlugin() : false,
        ! flags.includes('--no-a11y') ? new A11yPlugin() : false
    )
}

export default webpackConfig;
