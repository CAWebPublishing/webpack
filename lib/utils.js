/**
 * External dependencies
 */
import { validate } from 'schema-utils';
import path, { join, sep, dirname } from 'path';
import { existsSync, realpathSync, readFileSync } from 'fs';
import { readPackageUp } from 'read-package-up';
import FastGlob from 'fast-glob';


/**
 * Internal dependencies
 */
const { sync: glob } = FastGlob;

const { warn } = console;

const { packageJson, path: pkgPath } = await readPackageUp({cwd: realpathSync( process.cwd() ) });

const moduleFields = new Set( [ 'viewScriptModule', 'viewModule' ] );

const scriptFields = new Set( [ 'viewScript', 'script', 'editorScript' ] );

const hasProjectFile = ( fileName ) =>
	existsSync( fromProjectRoot( fileName ) )

const fromProjectRoot = ( fileName ) =>
	path.join( path.dirname( getPackagePath() ), fileName )

const getPackagePath = () => pkgPath

function getProjectSourcePath() {
	return process.env.WP_SOURCE_PATH || 'src';
}

function getBlockJsonScriptFields( blockJson ) {
	let result = null;
	for ( const field of scriptFields ) {
		if ( Object.hasOwn( blockJson, field ) ) {
			if ( ! result ) {
				result = {};
			}
			result[ field ] = blockJson[ field ];
		}
	}
	return result;
}

function getBlockJsonModuleFields( blockJson ) {
	let result = null;
	for ( const field of moduleFields ) {
		if ( Object.hasOwn( blockJson, field ) ) {
			if ( ! result ) {
				result = {};
			}
			result[ field ] = blockJson[ field ];
		}
	}
	return result;
}

function getPhpFilePaths( context, props ) {
	// Continue only if the source directory exists.
	if ( ! hasProjectFile( context ) ) {
		return [];
	}

	// Checks whether any block metadata files can be detected in the defined source directory.
	const blockMetadataFiles = glob( '**/block.json', {
		absolute: true,
		cwd: fromProjectRoot( context ),
	} );

	const srcDirectory = fromProjectRoot( context + sep );

	return blockMetadataFiles.flatMap( ( blockMetadataFile ) => {
		const paths = [];
		let parsedBlockJson;
		try {
			parsedBlockJson = JSON.parse( readFileSync( blockMetadataFile ) );
		} catch ( error ) {
			warn(
				`Not scanning "${ blockMetadataFile.replace(
					fromProjectRoot( sep ),
					''
				) }" due to detect render files due to malformed JSON.`
			);
			return paths;
		}

		for ( const prop of props ) {
			if (
				typeof parsedBlockJson?.[ prop ] !== 'string' ||
				! parsedBlockJson[ prop ]?.startsWith( 'file:' )
			) {
				continue;
			}

			// Removes the `file:` prefix.
			const filepath = join(
				dirname( blockMetadataFile ),
				parsedBlockJson[ prop ].replace( 'file:', '' )
			);

			// Takes the path without the file extension, and relative to the defined source directory.
			if ( ! filepath.startsWith( srcDirectory ) ) {
				warn(
					`Skipping "${ parsedBlockJson[ prop ].replace(
						'file:',
						''
					) }" listed in "${ blockMetadataFile.replace(
						fromProjectRoot( sep ),
						''
					) }". File is located outside of the "${ context }" directory.`
				);
				continue;
			}
			paths.push( filepath.replace( /\\/g, '/' ) );
		}
		return paths;
	} );
}

const phpFilePathsPluginSchema = {
	type: 'object',
	properties: {
		context: {
			type: 'string',
		},
		props: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
};

/**
 * The plugin recomputes PHP file paths once on each compilation. It is necessary to avoid repeating processing
 * when filtering every discovered PHP file in the source folder. This is the most performant way to ensure that
 * changes in `block.json` files are picked up in watch mode.
 */
class PhpFilePathsPlugin {
	/**
	 * PHP file paths from `render` and `variations` props found in `block.json` files.
	 *
	 * @type {string[]}
	 */
	static paths;

	constructor( options = {} ) {
		validate( phpFilePathsPluginSchema, options, {
			name: 'PHP File Paths Plugin',
			baseDataPath: 'options',
		} );

		this.options = options;
	}

	apply( compiler ) {
		const pluginName = this.constructor.name;

		compiler.hooks.thisCompilation.tap( pluginName, () => {
			this.constructor.paths = getPhpFilePaths(
				this.options.context,
				this.options.props
			);
		} );
	}
}

export { PhpFilePathsPlugin, getBlockJsonScriptFields, getBlockJsonModuleFields, fromProjectRoot, getProjectSourcePath };
