This plugin utilizes the HTML Webpack Plugin to launch static generated pages using the CAWebPublishing Template

<i>This package is inspired by [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)</i>

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
All html-webpack-plugin [options](https://github.com/jantimon/html-webpack-plugin?tab=readme-ov-file#options) are available along with the following:  
<code>template</code> - blank or default, Default will launch a site with a templated header/footer area, blank will not.  
<code>scheme</code> - Colorscheme to utilitze.  
**Available schemes:**  
* delta
* eureka
* mono
* oceanside
* orangecounty
* pasorobles
* sacramento
* santabarbara
* santacruz
* shasta
* sierra
* trinity
