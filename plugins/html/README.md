This plugin utilizes the HTML Webpack Plugin to launch static generated pages using the CAWeb Template (formerly the California State Template)

<i>This package is inspired by [wp-scripts](https://www.npmjs.com/package/@wordpress/scripts) and [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)</i>

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

## How to use this repository
There are various different scripts that can be ran  

### Build
<code>npm run build</code> - will build all colorschemes minified and unminified.  
<code>npm run build:prod</code> - will build all colorschemes minified only.  
<code>npm run build:dev</code> - will build all colorschemes unminified only.  

<code>npm run build:&lt;colorscheme&gt;</code> - will build that specific colorscheme minified and unminified.  
<code>npm run build:&lt;colorscheme&gt;:prod</code> - will build that specific colorscheme minified only.  
<code>npm run build:&lt;colorscheme&gt;:dev</code> - will build that specific colorscheme unminified only.  

### Serve
<code>npm run serve:&lt;colorscheme&gt;</code> - will serve that specific colorscheme and also run a11y checks, css audits, jshints.  
<code>npm run serve:&lt;colorscheme&gt;:quick</code> - will serve that specific colorscheme without running a11y checks, css audits, jshints.  

### Update scripts
<code>npm run update-scripts</code> - This will regenerate the build/serve commands.  

### Creating Entrypoints
<code>npm run create-entrypoint</code> - This will generate a webpack entrypoint for each of the colorschemes in the ./src/styles/colorschemes directory.

### Icon JSON 
<code>npm run generate-json</code> - This will generate an json file based on all the icons in the build/fonts/ directory.
