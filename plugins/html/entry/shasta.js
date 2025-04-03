/**
 *  Autogenerated Entrypoint  
 *  DO NOT MODIFY
 */
 
import path from 'path';
import { fileURLToPath } from 'url';
const currentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default {
    entry: {
        shasta: [
            path.join(currentPath, 'node_modules/@caweb/icon-library/build/font-only.css'),
            path.join(currentPath, '/src/styles/colorschemes/shasta.scss'),
			path.join(currentPath, '/src/scripts/index.js')
        ]
    }
};
    