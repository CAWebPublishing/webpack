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

// only if serving do we add the plugins
if( 'serve' === webpackCommand ){
    let template = 'default';
    let scheme = 'oceanside';
    
    // Allow for template to be selected via NODE_OPTIONS env variable
    if( process.env.NODE_OPTIONS ){
        let opts = process.env.NODE_OPTIONS.split(' ').filter(e=>e).map(o=>o.replaceAll("'", ''))
        if( opts.includes('--template') ){
            template = opts[opts.indexOf('--template') + 1]
        }
        if( opts.includes('--scheme') ){
            scheme = opts[opts.indexOf('--scheme') + 1]
        }
    }
    
    // Page Template and additional plugins
    webpackConfig.plugins.push(
        new CAWebHTMLPlugin({
            template,
            templateParameters: {
                scheme
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
        new JSHintPlugin(),
        new CSSAuditPlugin(),
        new A11yPlugin()
    )
}

export default webpackConfig;
