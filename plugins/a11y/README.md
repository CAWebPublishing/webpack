This is a Webpack Plugin that utilizes the [IBM Accessibility Checker](https://www.npmjs.com/package/accessibility-checker0) module to perform integrated accessibility testing. 

## Installation
<pre>npm install --save-dev @caweb/a11y-webpack-plugin</pre>

## Get Started
In your Webpack configuration simply add the plugin to your existing plugin array.

<pre>
import A11yPlugin from '@caweb/a11y-webpack-plugin';

export default {
    plugins: [
        new A11yPlugin()
    ]
}
</pre>

## Options