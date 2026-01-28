/**
 * External dependencies
 */
import { parseArgs } from 'node:util';

// flags can be passed via argv0 
// we also add args from NODE_OPTIONS
let { values: flags } = parseArgs( {
    args: [
        ...process.argv,
        ...process.argv0.split(' '),
        process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.split(' ') : []
    ].filter( Boolean ),
    strict: false,
} )

// function to add a flag
function addFlag(flag, value = null){
    if( ! flagExists(flag) ){
        flags[flag] = value;
    }
}

// check if a flag exists
function flagExists(flag){
  return Object.keys(flags).includes(flag)
}

// get the value of a flag
function getArgVal(flag, defaultValue = null){
  return flagExists(flag) ? flags[flag] : (defaultValue ?? false);
}

export { 
  flags,
    flagExists, 
    addFlag,
    getArgVal 
};