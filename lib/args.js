/**
 * External dependencies
 */
import { parseArgs } from 'node:util';

/**
 * Internal dependencies  
 */

// process.argv first two values are the node executable and the script being executed, so we can ignore those
let argv = process.argv.slice(2);

// process.argv0 first value is the node executable, so we can remove that
let argv0 = process.argv0.replace(/.*node[.a-z\s]*/, '');

// flags can be passed via argv0 
// we also add args from NODE_OPTIONS
let { values: flags } = parseArgs( {
    args: [
        ...argv,
        ...argv0.split(' '),
        ...(process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.trim().replace(/(^'|'$)/g, '').split(' ') : []).filter( Boolean )
    ].filter( Boolean ),
    strict: false,
    allowPositionals: true,
    allowNegative: true,

    // in order for the flags to work with the cli's params, 
    // we need to set the options 
    options: {
      template: {
        type: 'string',
      },
      scheme: {
        type: 'string',
      },
      cwd: {
        type: 'string',
      },
      update: {
        type: 'boolean',
      },
      xdebug: {
        type: 'string'
      },
      spx: {
        type: 'string'
      },
      scripts: {
        type: 'boolean',
      },
      sync: {
        type: 'boolean',
      },
      plugin: {
        type: 'boolean',
        short: 'p'
      },
      theme: {
        type: 'boolean',
        short: 't'
      },
      multisite: {
        type: 'boolean',
        short: 'm'
      },
      subdomain: {
        type: 'boolean',
      }
    } 
} )

// function to add a flag
function addFlag(flag, value = null){
    if( ! flagExists(flag) ){
        flags[flag] = value;
    }
}

// check if a flag exists
function flagExists(flag){
  // parseArgs removes the leading dashes from flags, so we need to account for that
  return Object.keys(flags).includes(flag.replace(/^-+/, ''));
}

// get the value of a flag
function getArgVal(flag, defaultValue = null){
  return flagExists(flag) ? flags[flag.replace(/^-+/, '')] : (defaultValue ?? false);
}

// get all flags
function getAllFlags(){
  return flags;
}

export { 
  flags,
  flagExists, 
  addFlag,
  getArgVal,
  getAllFlags
};