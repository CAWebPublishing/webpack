/**
 * These are tests for the CAWeb HTML Webpack Plugin
 */

/**
 * External Dependencies
 */
import path from 'path';
import CAWebHtmlWebpackPlugin from '@caweb/html-webpack-plugin';

/**
 * Internal Dependencies
 */
import CAWebJSHintPlugin from '../index.js';

export default {
    // entry: './src/index.scss',
    plugins: [

        // this is used just to generate HTML files for testing
        new CAWebHtmlWebpackPlugin(),

        new CAWebJSHintPlugin()

    ]
};