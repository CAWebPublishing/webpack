v1.8.0
- Removed templating and css/js framework out, this is now solely used for Site Generation

v1.7.13
- Added card-none styles

v1.7.12
- Added Link Description to sub navigation items
- Fixed link description color 
- Added centered and right classes to card/panel headers

v1.7.11
- Removed hot update files

v1.7.10
- Padding to interactive elements changed from 1rem back to .5rem 0
- Padding for link grid and side navigation was made !important

v1.7.9
- Added the WordPress DependencyExtractionPlugin plugin definition back
- Added tsconfig.json to list of distributed files

v1.7.8
- Padding to interactive elements not applied to .et_pb_button and .btn classes

v1.7.7
- Padding to interactive elements changed from .5rem to 1rem

v1.7.6
- Added .tsx rule and ts-loader
- Added default tsconfig.json config file
- Removed the WordPress DependencyExtractionPlugin plugin definition
- Padding to interactive elements changed from .5rem 0 to .5rem
- Updated npm packages

v1.7.5 
- Added sr-only to social share links in the footer template
- Added text-decoration to a:hover:not(.btn) and a:focus:not(.btn)
- Removed anchor line-height fix and added padding to anchors to correct interactive element not meeting minimum size or spacing 
- Updated npm packages

v1.7.4
- Increased anchor line-height from 1.5 to 1.75 to correct interactive element not meeting minimum size or spacing 
- Updated npm packages

v1.7.3
- Search button focus outline has been lightened to correct color contrast a11y issue

v1.7.2
- Updated npm packages
- Added @caweb/icon-library when testing
- Updated entrypoints 

v1.7.1
- Updated webpack.config.js

v1.7.0
- All references related to icons have been removed from template source code and move to new @caweb/icon-library package

v1.6.2
- Changed serp class to searchpage both in css and body class name to better align with CAWeb theme

v1.6.1
- Fixed issue with scrolling removing styles when adding scroll-margin-top

v1.6.0
- Added new Search Engine Results Page (SERP) template
- Search Bar now only appears in header when not on SERP page

v1.5.29
- Added sanity check before scrolling 

v1.5.28
- Updated npm packages

v1.5.27
- Fixed issues with anchor links being hidden behind header still
- Updated npm packages

v1.5.26
- Fixed issue with console log errors being thrown when no location hash is present in url

v1.5.25
- Fixed issues with anchor links being hidden behind header

v1.5.24
- Removed statewide alerts link
- Focus outline color updated from 2ea3f2 to 0D81CE

v1.5.23
- Fixed issue with header height being affected by non div elements before the header
- Updated npm packages

v1.5.22
- Fixed issue with alerts/utility header scroll height not being calculated correctly

v1.5.21
- Updated endsWith logic helper
- Fixed issue with header top position/page-container margin-top not updating when scrolling when elements exist above the header

v1.5.20
- Recompiled src files

v1.5.19
- Added new assets parameters to head/footer sections for external files to be loaded

v1.5.18
- Added missing package rtlcss-webpack-plugin

v1.5.17
- Added missing package rtlcss-webpack-plugin

v1.5.16
- Fixed issue with breadcrumbs being numbered
- Resolved issue with anchor links being hidden behind fixed header
- Utility header and header alerts now hide when scrolled passed the header

v1.5.15
- Added default styles to nested ul/ol
- Silencing Dart Sass 3.0.0 deprecation warnings for 'global-builtin', 'import', 'color-functions', 'mixed-decls' until they are removed.
- Added scheme script to allow for schemes to be easily created/removed.

v1.5.14
- Added changes to dropdown menu popper config

v1.5.13
- Fixed issue with dropdown menu not scrolling in desktop mode

v1.5.12
- Restructured mobile controls to allow for menu to be scrollable

v1.5.11
- Added aria-labels to mobile open/close buttons
- Fixed issue with Footer nav links being centered when in mobile mode

v1.5.10
- Fixed font size for dropdown menu item

v1.5.9
- Fixed issue with navigation alignment when using Dropdown

v1.5.8
- Updated favicon file

v1.5.7
- Added new endsWith handlebar loader helper function
- Fixed issue with side navigatoin not word breaking
- Fixed issue with cagov logo repeating

v1.5.6
- Added new ifCond handlebar loader helper function

v1.5.5
- Refined toLower, toUpper, toTitleCase, replace helper functions

v1.5.4
- Updated npm scripts
- Fixed issue with initial scheme selection for plugin
- Added toLower, toUpper, toTitleCase, replace, jsonStringify, jsonParse handlebar loader helper functions

v1.5.3
- Updated anchor typography and nav-link variables colors to match schemes
- Added update scripts script

v1.5.2
- Fixed issue with webpack plugins still being added even when flags are passed
- Reverted multiple configuration export change back to single config export
- Reduced font size for footer social icons

v1.5.1
- updated npm packages
- Changed mobile control structure, navigation and search are now in the mobile overlay
- Added logic for header/footer nav, social share links, utility links, Google Search ID, template parameters passable via caweb.json
- Webpack configuration from @caweb/webpack package moved into this configuration
- Webpack config handles --mode flag appropriately 
- Webpack config now exports multiple configurations
- Webpack configuration now outputs minified files

v1.5.0
- Template parameters alerts, logo, passable via caweb.json
- Added logic for alerts, logo

v1.4.17
- Fixed issue with alerts rendering in mobile

v1.4.16
- Fixed issue with Card Standout triangle not centering properly

v1.4.15
- Removed selector false from test script
- Fixed issue with search and navigation flickering when loaded on mobile

v1.4.14
- Font weight variables removed
- Side navigation List and Step Lists styles added back to lists
- Fixed issue with mobile controls

v1.4.13
- Dark mode script turned off

v1.4.12
- Updated ca-gov-logo-svg
- Added link grid styles back
- Added breadcrumbs styles back
- Added side-navigation styles back

v1.4.11
- Added cursor- utility classes

v1.4.10
- Unnested search styles

v1.4.9
- Fixed issue with page-title,page-date not styling like containers
- Fixed issue with executive profiles dark text
- Fixed issue with understated card header color

v1.4.8
- Increased font size for Service Tile more button

v1.4.7
- Fixed issue with Service Tile more button

v1.4.6
- Removed margin-bottom from headings
- Fixed issue with social-share-colors
- Added new dark theme support for High Contrast Mode

v1.4.5
- Fixed issue with project sample favicon not picking up

v1.4.4
- External link now apply to all links with target = _blank

v1.4.3
- Dropdown nav menu width set to auto
- Removed background color from location banner more details button

v1.4.2
- Added sample images
- Test template was removed
- Updated test scripts
- Updated template files 

v1.4.1
- Added gray-50 to bootstrap gray mapping
- Added background color to footer

v1.4.0
- Added new test template and sample files
- Template source files have been completely redone
- Added Animate.css https://animate.style/
- Added Bootstrap Forced Colors CSS https://www.npmjs.com/package/bootstrap-forced-colors-css
- Updated npm packages
- Added html-webpack-link-type-plugin 

v1.3.3
- Updated Readme

v1.3.2
- Removed extra year from footer sample
- Added new font json script file
- Updated npm packages

v1.3.1
- Updated icon font library
- Moved icon font out of components directory
- Updated entrypoints to generate font-only sheet

v1.3.0
- Remediated State Template 6.3.2 source files

v1.2.2
- Added favicon to default

v1.2.1
- Removed console messages

v1.2.0
- Added new CAWebHTMLPlugin class which extends HtmlWebpackPlugin
- Moved @wordpress/scripts defaults to base configurations

v1.1.2
- Renamed index.html to blank.html to match args

v1.1.1
- Rolled changes back to index.html
- Added default.html for templating

v1.1.0
- Added State Template 6.3.2 source files
- Added script to generate multiple entrypoints for use when serving
- Added webconfig for multiple entrypoints based on colorschemes
- Added header/footer initial structural markup

v1.0.2
- Added content to template parameters

v1.0.1
- Added Page Template to HTML Plugin

v1.0.0
- Initial CAWeb HTML Webpack Plugin added
