This is a Webpack Plugin that utilizes [JSHint](https://www.npmjs.com/package/jshint) to detect errors and potential problems in Javascript code.

The JSHint Settings used are an adapation of the [WordPress JavaScript Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/javascript/). The default WordPress JSHint Settings can be viewed [here](https://develop.svn.wordpress.org/trunk/.jshintrc).  

Our standard differs from the guidelines in the following ways:  
- ESVersion has been updated from 6 to 11



## Installation
<pre>npm install --save-dev @caweb/jshint-webpack-plugin</pre>

## Get Started
In your Webpack configuration simply add the plugin to your existing plugin array.

<pre>
import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';

export default {
    plugins: [
        new JSHintPlugin()
    ]
}
</pre>

## Options