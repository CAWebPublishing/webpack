/**
 * External Dependencies
 */
import {HtmlWebpackSkipAssetsPlugin} from 'html-webpack-skip-assets-plugin';

/**
 * Internal dependencies
 */
import CAWebHTMLPlugin from '../index.js';

export default {
  plugins: [
    new CAWebHTMLPlugin({
      templateParameters: {
        scheme: false // we use the entrypoints for testing
      },
      skipAssets: [
        /.*-rtl.css/, // we skip the Right-to-Left Styles
        /css-audit.*/, // we skip the CSSAudit Files
        /a11y.*/, // we skip the A11y Files
        /jshint.*/, // we skip the JSHint Files
      ]
    }),
    new HtmlWebpackSkipAssetsPlugin()
  ]
};
