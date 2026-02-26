v2.0.1
- Added default entry as src/index.js

v2.0.0
- @wordpress/scripts:31.5.0 has to many vulnerabilities with npm audit so it is now only a dev dependency, we still use the @wordpress/scripts/config/webpack.config.js as the base configuartion but we write out an ESM file instead.
- @babel/plugin-proposal-class-properties is deprecated switched to @babel/plugin-transform-class-properties
- Added missing dependency packages

v1.6.9
- Args now also process CAWEB_NODE_OPTIONS, unknown flags cant be passed via NODE_OPTIONS when on Mac

v1.6.8
- Removed output.publicPath

v1.6.7
- Added index to historyApiFallback
- Updated test cases
- Added more options to the args parser
- Updated npm packages

v1.6.6
- Added new handlebars file
- Added historyApiFallback to devServer which directs to /404.html
- Updated replace helper function

v1.6.5
- Added output.publicPath
- Updated test cases
- Added head to handlebars-loader

v1.6.4
- Added options to the parseArgs function so that it would recognize args passed from the @caweb/cli launch/start command
- Updated npm packages

v1.6.3
- args now uses node:utils for parsing

v1.6.2
- devMiddleware added to devServer

v1.6.1
- Changed stats values back to true

v1.6.0
- webpack-merge is now used to merge modified wordpress/scripts config with our base config
- handlebars-loader, devServer, arguments moved to external files

v1.5.18
- Unpinning html-webpack-plugin since https://github.com/jantimon/html-webpack-plugin/issues/1881 has been resolved
- Updated npm packages 
- Workflows were also updated so that versioned branches are created when npm packages are published 

v1.5.17
- Repinning html-webpack-plugin@5.6.4 due to https://github.com/jantimon/html-webpack-plugin/issues/1881

v1.5.16
- Updated npm packages

v1.5.15
- Switch to peerDependency instead

v1.5.13
- Pinning html-webpack-plugin@5.6.4 due to https://github.com/jantimon/html-webpack-plugin/issues/1881

v1.5.12
- Added configuration testing
- Fixed stats config value

v1.5.11
- Updated npm packages 

v1.5.10
- Added media directory to static directory listing for devServer

v1.5.9
- Added thread-loader before wordpress ts babel-loader
- Added @babel/plugin-proposal-class-properties after ts babel-loader
- Added happyPackMode, transpileOnly true to ts-loader
- Removed vendor from react externals

v1.5.8
- We no longer have to splice the cleanWebpackPlugin since @wordpress/scripts now uses the webpack clean configuration

v1.5.7
- mixed-decls deprecation is obsolete, warnings are no longer silenced.

v1.5.6
- Updated npm packages

v1.5.5
- Updated plugins

v1.5.4
- Added jshint auditing back
- Updated npm packages

v1.5.3
- Added jandlebars, html-format, jshint-webpack-plugin npm packages

v1.5.2
- Added a11y-webpack-plugin back in

v1.5.1
- Added css-audit-webpack-plugin back in

v1.5.0
- Additional pages can now be created by adding html files to the /content/pages/ directory
- Updated npm packages

v1.4.4
- Fixed issue with bsAttr helper

v1.4.3
- Components resolve to templates components/<component> directory path
- Added new bootstrap helper

v1.4.2
- Added peerDependencies

v1.4.1
- updated npm packages

v1.4.0
- Main Webpack configuration has been moved back
- handlebars-loader helper files have been introduced, custom helpers can also be used
- tsconfig.json file was added

v1.3.44
- Updated npm packages

v1.3.43
- Updated npm packages

v1.3.42
- Updated npm packages

v1.3.41
- Updated npm packages

v1.3.40
- Updated npm packages

v1.3.39
- Updated npm packages

v1.3.38
- Updated npm packages

v1.3.37
- Updated npm packages

v1.3.37
- Updated npm packages

v1.3.36
- Updated npm packages

v1.3.35
- Updated npm packages

v1.3.34
- Updated npm packages

v1.3.33
- Changelog changed from txt to md
- Updated npm packages

v1.3.32
- Updated npm packages

v1.3.31
- Updated npm packages

v1.3.30
- Updated npm packages

v1.3.29
- Updated npm packages

v1.3.28
- Updated npm packages

v1.3.27
- Updated npm packages

v1.3.26
- Updated npm packages

v1.3.25
- Updated npm packages

v1.3.24
- Updated npm packages

v1.3.23
- Updated npm packages

v1.3.22
- Updated npm packages

v1.3.21
- Updated npm packages

v1.3.20
- Updated npm packages

v1.3.19
- Updated npm packages

v1.3.18
- Updated npm packages

v1.3.17
- Updated npm packages

v1.3.16
- Updated npm packages

v1.3.15
- Updated npm packages

v1.3.14
- Updated npm packages

v1.3.13
- Updated npm packages

v1.3.12
- Updated npm packages

v1.3.11
- Updated npm packages

v1.3.10
- Updated npm packages

v1.3.9
- Updated npm packages

v1.3.8
- Updated npm packages

v1.3.7
- Updated npm packages

v1.3.6
- Updated npm packages

v1.3.5
- Updated npm packages

v1.3.4
- Updated npm packages

v1.3.3
- Updated npm packages

v1.3.2
- Updated npm packages

v1.3.1
- Updated npm packages

v1.3.0
- Webpack configuration has been moved to @caweb/html-webpack-plugin

v1.2.28
- Updated npm packages

v1.2.27
- Updated npm packages

v1.2.26
- Updated npm packages

v1.2.25
- Updated npm packages

v1.2.24
- Updated npm packages

v1.2.23
- Updated npm packages

v1.2.22
- Updated npm packages

v1.2.21
- Updated npm packages

v1.2.20
- Updated npm packages

v1.2.19
- Updated npm packages

v1.2.18
- Added flags to webpack config, no longer using NODE_OPTIONS
- Updated npm package

v1.2.17
- Updated npm packages

v1.2.16
- Updated npm packages

v1.2.15
- Updated npm packages

v1.2.14
- Updated npm packages

v1.2.13
- Updated npm packages

v1.2.12
- Updated npm packages
- Added html-webpack-link-type-plugin package

v1.2.11
- Updated npm packages

v1.2.10
- Updated npm packages

v1.2.9
- Updated npm packages

v1.2.8
- Updated npm packages

v1.2.7
- Updated npm packages

v1.2.6
- We only add plugin if serving 

v1.2.5
- Updated npm packages

v1.2.4
- Updated npm packages

v1.2.3
- Updated npm packages

v1.2.2
- Added jshint, css-audit, and a11y files to skipAssets

v1.2.1
- Added  missing dependency

v1.2.0
- Webpack main configuration details moved to html plugin 

v1.1.5
- Update npm packages

v1.1.4 
- Resolved issue with --template flag not switching properly

v1.1.3
- Removed console messaging

v1.1.2
- Added flag to config to allow for switching from different templates

v1.1.1
- Added missing handlebars-loader dependency

v1.1.0
- Added sample site content
- Added header/footer template parameters

v1.0.5
- Update npm packages
- Added partialResolver to handlebars-loader

v1.0.4
- Update npm packages

v1.0.3
- Update npm packages

v1.0.2
- Update npm packages

v1.0.1
- Update jshint plugin

v1.0.0
- Initial CAWeb HTML Webpack Plugin added
- Updated Webpack Configurations
- Added Page Template to HTML Plugin
- WordPress CSS Audit Webpack Plugin added
- Added output folder option to WordPress CSS Audit Webpack Plugin
- JSHint Webpack Plugin added
- Accessibility Checker Webpack Plugin added
- Added jshint to workflow
- Cleaned up extra files 
