This is a Webpack Plugin that utilizes the [Wordpress CSS Audit](https://github.com/WordPress/css-audit) to audit the projects css.


## Installation
<pre>npm install --save-dev @caweb/css-audit-webpack-plugin</pre>

## Get Started
In your Webpack configuration simply add the plugin to your existing plugin array.

<pre>
import CSSAuditPlugin from '@caweb/css-audit-webpack-plugin';

export default {
    plugins: [
        new CSSAuditPlugin()
    ]
}
</pre>

## Options