/**
 * External Dependencies
 */
import {HtmlWebpackSkipAssetsPlugin} from 'html-webpack-skip-assets-plugin';

/**
 * Internal dependencies
 */
import CAWebHTMLPlugin from '../index.js';
import JSHintPlugin from '@caweb/jshint-webpack-plugin';
import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';
import A11yPlugin from '@caweb/a11y-webpack-plugin';

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
    new HtmlWebpackSkipAssetsPlugin(),
    new JSHintPlugin(),
    new CSSAuditPlugin({
      selectors: false
    }),
    new A11yPlugin()
  ]
};
