/**
 * External Dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Internal dependencies
 */
import CAWebHTMLPlugin from '../index.js';

const componentDir = path.join(process.cwd(), 'sample', 'components');

let plugins = [];

fs.readdirSync(componentDir).forEach((c) => {
    let p = fs.readFileSync( path.join(componentDir, c) ).toString();
    let t = c.replace(/\.*/, '').replace('-', ' ');

    plugins.push(
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
  plugins
};
