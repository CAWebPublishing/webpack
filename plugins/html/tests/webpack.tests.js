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
import CAWebHtmlWebpackPlugin from '../index.js';

export default {
    plugins: [
        new CAWebHtmlWebpackPlugin({
            templateParameters: {
            }
        })
    ],
    devServer: {
        static: [
            // we all serving the local template media files for testing
            {
                directory: path.join( process.cwd(), '..', 'template', 'media' ),
            },
        ]
    }
};