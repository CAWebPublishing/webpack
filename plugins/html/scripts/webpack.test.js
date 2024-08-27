/**
 * External Dependencies
 */
import {HtmlWebpackSkipAssetsPlugin} from 'html-webpack-skip-assets-plugin';
import {HtmlWebpackLinkTypePlugin} from 'html-webpack-link-type-plugin';

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
      template: 'test', // we use the test page for testing
      templateParameters: {
        scheme: false // we use the entrypoints for testing
      },
      skipAssets: [
        /.*-rtl.css/, // we skip the Right-to-Left Styles
        /css-audit.*/, // we skip the CSSAudit Files
        /a11y.*/, // we skip the A11y Files
        /jshint.*/, // we skip the JSHint Files
        /font-only.*/, // we skip the font-only Files
      ]
    }),
    new HtmlWebpackSkipAssetsPlugin(),
    new HtmlWebpackLinkTypePlugin(),
    new JSHintPlugin(),
    new CSSAuditPlugin({
      selectors: false
    }),
    new A11yPlugin()
  ]
};
