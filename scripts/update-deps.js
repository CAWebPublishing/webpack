#!/usr/bin/env node

/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

const localFile = path.join(process.cwd(), 'package.json');
const depPath = process.argv[2];

// only run if dependency path was passed.
if( depPath ){
    let currentPkg = JSON.parse( fs.readFileSync(localFile) );

    // iterate over dep path
    fs.readdirSync( path.resolve( depPath ) ).forEach( file => {
        // if directory has a package.json file
        if( 
            fs.statSync(path.resolve(depPath, file)).isDirectory() && 
            fs.existsSync(path.resolve(depPath, file, 'package.json')) 
        ){
            const {name, version} = JSON.parse( fs.readFileSync(path.resolve(depPath, file, 'package.json')) );

            // update package.json
            currentPkg.dependencies[name] = `^${version}`
        }
    })

    // write update back to file
    fs.writeFileSync(
		localFile,
		JSON.stringify( currentPkg, null, 2 )
	);
    
}else{
    console.log( 'Error: ', 'Dependency path not provided.')
}