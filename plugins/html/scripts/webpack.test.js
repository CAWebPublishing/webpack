/**
 * External Dependencies
 */
import fs from 'fs';
import path from 'path';
import {HtmlWebpackSkipAssetsPlugin} from 'html-webpack-skip-assets-plugin';
import {HtmlWebpackLinkTypePlugin} from 'html-webpack-link-type-plugin';

/**
 * Internal dependencies
 */
import CAWebHTMLPlugin from '../index.js';
import JSHintPlugin from '@caweb/jshint-webpack-plugin';
import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';
import A11yPlugin from '@caweb/a11y-webpack-plugin';

const componentDir = path.join(process.cwd(), 'sample', 'components');

let componentPages = [];

fs.readdirSync(componentDir).forEach((c) => {
    let p = fs.readFileSync( path.join(componentDir, c) ).toString();
    let t = c.replace(/\.*/, '').replace('-', ' ');

    componentPages.push(
      new CAWebHTMLPlugin({
        filename: `components/${c}`,
        title: t.charAt(0).toUpperCase() + t.substring(1),
        templateParameters: {
          scheme: false, // we use the entrypoints for testing
          bodyHtmlSnippet: p,
        },
        skipAssets: [
          /.*-rtl.css/, // we skip the Right-to-Left Styles
          /css-audit.*/, // we skip the CSSAudit Files
          /a11y.*/, // we skip the A11y Files
          /jshint.*/, // we skip the JSHint Files
          /font-only.*/, // we skip the font-only Files
        ]
      })
    )
})


export default {
  plugins: [
    // This is the main page
  new CAWebHTMLPlugin({
    templateParameters: {
      scheme: false, // we use the entrypoints for testing
    },
    skipAssets: [
      /.*-rtl.css/, // we skip the Right-to-Left Styles
      /css-audit.*/, // we skip the CSSAudit Files
      /a11y.*/, // we skip the A11y Files
      /jshint.*/, // we skip the JSHint Files
      /font-only.*/, // we skip the font-only Files
    ]
  }),
  ...componentPages,
  new HtmlWebpackSkipAssetsPlugin(),
  new HtmlWebpackLinkTypePlugin(),
  new JSHintPlugin(),
  new CSSAuditPlugin(),
  new A11yPlugin()
  ]
};
