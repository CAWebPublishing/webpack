This plugin utilizes the HTML Webpack Plugin to launch static generated pages using the CAWebPublishing Template (formerly the California State Template)

<i>This package is inspired by [wp-scripts](https://www.npmjs.com/package/@wordpress/scripts)</i>

## Plugins Used
- [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)

## Installation
<pre>npm install --save-dev @caweb/html-webpack-plugin</pre>

## Get Started
In your Webpack configuration simply add the plugin to your existing plugin array.

<pre>
import CAWebHTMLPlugin from '@caweb/html-webpack-plugin';

export default {
    plugins: [
        new CAWebHTMLPlugin()
    ]
}
</pre>

## Options