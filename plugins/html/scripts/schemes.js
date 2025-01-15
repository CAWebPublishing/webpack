/**
 * External dependencies
 */
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { confirm, input } from '@inquirer/prompts';
import spawn from 'cross-spawn';

const bullet = chalk.yellow('-');
const info = chalk.cyan('i');

const removing = process.argv.includes( '-r' );

// if we are removing a colorscheme
if( removing ){
    console.log("Which colorscheme would you like to remove?");
}else{
    // if we are creating a new colorscheme
    console.log("Let's create a new Colorscheme!");
}

const scheme = await input(
        { 
            message: "Scheme Name:" 
        },
        {
            clearPromptOnDone: true
        }
    ).catch(
        () => {
            process.exit(1);
        }
    );

// if we are removing a colorscheme
if( removing ){
    // remove colorscheme file
    fs.unlinkSync ( path.resolve('src', 'styles', 'colorschemes', `${scheme}.scss`) );
    fs.unlinkSync ( path.resolve('entry', `${scheme}.js`) );

    console.log(`Removed colorscheme ${scheme}`);
    process.exit(0);
}else{
    console.log("Colorschemes require 4 colors:");
    console.log(info, "Enter color hex values in the format #RRGGBB");
    
    // lets get the 4 colors needed.
    const colors = {
        main: await input(
            { 
                message: "Main Color:" 
            }
        ).catch(
            () => {
                process.exit(1);
            }
        ),
        alt: await input(
            { 
                message: "Alternate Color:" 
            }
        ).catch(
            () => {
                process.exit(1);
            }
        ),
        highlight: await input(
            { 
                message: "Highlight Color:" 
            }
        ).catch(
            () => {
                process.exit(1);
            }
        ),
        standout: await input(
            { 
                message: "Standout Color:" 
            }
        ).catch(
            () => {
                process.exit(1);
            }
        )
    }
    
    // write colorscheme file
    fs.writeFileSync( 
        path.resolve('src', 'styles', 'colorschemes', `${scheme}.scss`),
        `/* -----------------------------------------
    ${scheme.toUpperCase()}
    ----------------------------------------- */
        
    // scss-docs-start color-variables
    $main: ${colors.main} !default;
    $alt: ${colors.alt} !default;
    $highlight: ${colors.highlight} !default;
    $standout: ${colors.standout} !default;
    // scss-docs-end color-variables
        
    @import '../';`
    );
    
    // update scripts in package.json
    spawn.sync('npm run update-scripts');
    
    // update entrypoints.
    spawn.sync('npm run create-entrypoint');
    
    // ask if user would like to serve up the new colorscheme
    let answer = await confirm(
        { 
            message: 'Would you like to serve up the new colorscheme?',
            default: true
        }
    ).catch(() => {process.exit(1);});
    
    if( answer ){
        // serve new colorscheme up
        spawn.sync(`npm run serve:${scheme}`, { stdio: 'inherit' });  
    }
}
