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

// we import this current plugin to test it
import CAWebHTMLPlugin from '../index.js';

export default {
    plugins: [
        new CAWebHTMLPlugin({
            templateParameters: {
            }
        })
    ]
};