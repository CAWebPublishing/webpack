/**
 * This file is used base configuration DevServer settings for Webpack
 * 
 * @see https://webpack.js.org/configuration/dev-server/
 */
/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

const appPath = process.cwd();

// default url
let server = 'http';
let host = 'localhost';
let port = 9000;

// list of project directories to watch for changes
// by default css/js files are watched by webpack
// these directories are also added to the static file serving with watch true
let watchFiles = fs.readdirSync( 
        path.join( appPath ),
        { 
            withFileTypes: true, 
        } 
      )            
      .filter( (dirent) => {
        // we exclude certain directories from being watched
        let file = path.join( dirent.parentPath, dirent.name );
        let excluded = file.startsWith( `${appPath}\\build`) ||
            file.startsWith( `${appPath}\\src`) ||
            file.includes( `\\.`) ||
            file.includes( 'vendor' ) || 
            file.includes( 'node_modules' );

        return dirent.isDirectory() && ! excluded
      })
      .map( dirent => path.join( dirent.parentPath, dirent.name, '**', '*').replace(/\\/g, '/') )
    
// base dev server config
let devServer = {
    server,
    host,
    port,
    open: [ `${server}://${host}:${port}` ],

    static: [
      /**
       * Static files are served from the following files in the following order
       * we don't have to add the build directory since that is the output.path and proxied
       * 
       * node_modules - Allows loading files from other npm packages
       * media - Allows loading media files from the media directory
       */
      {
        directory: path.join(appPath, 'node_modules'),
        watch: false,
      },
      {
        directory: path.join(appPath, 'media'),
        watch: false,
      },
    ],

    proxy:[
      /**
       * WordPress Proxy Configuration is deprecated
       * @since 31.3.0
       */
      {
        context: ['/build'],
        target: `${server}://${host}:${port}`,
        pathRewrite: {
          '^/build': ''
        },
        logLevel: 'info'
      },
      /**
       * We proxy the node_modules and media directory so they serve from the root
       */
      {
        context: ['/node_modules'],
        target: `${server}://${host}:${port}`,
        pathRewrite: { '^/node_modules': '' },
      },
      {
        context: ['/media'],
        target: `${server}://${host}:${port}`,
        pathRewrite: { '^/media': '' },
      }
    ],

    liveReload: true,
    hot: true,
    
    // watchFiles
    // we watch all folders in the app except build, node_modules and src
    watchFiles: {
      paths: watchFiles,
      options: {
        depth: 2,
      },
    },
}

// function to get the server config
const getServer = () => {
    return devServer;
}

// function to add to the server config
const addToServer = ( key, value ) => {
    devServer[ key ] = value;
}

// function to update target url settings
const updateTarget = ( url ) => {
    // update which url to open
    devServer.open = [ url ];

    // update all the proxy targets
    devServer.proxy = devServer.proxy.map( ( proxy ) => {
        proxy.target = url;
        return proxy;
    } );

}

export { 
    getServer,
    addToServer,
    updateTarget
};