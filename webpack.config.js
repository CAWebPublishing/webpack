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


// Page Template and additional plugins
webpackConfig.plugins.push(
    new CAWebHTMLPlugin(),
    new HtmlWebpackSkipAssetsPlugin(),
    new JSHintPlugin(),
    new CSSAuditPlugin(),
    new A11yPlugin()
)

export default webpackConfig;
