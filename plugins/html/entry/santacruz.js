/**
 *  Autogenerated Entrypoint  
 *  DO NOT MODIFY
 */
 
import path from 'path';
import { fileURLToPath } from 'url';
const currentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default {
    entry: {
        santacruz: [
            path.join(currentPath, '/src/styles/colorschemes/santacruz.scss'),
			path.join(currentPath, '/src/styles/index.scss'),
			path.join(currentPath, '/src/scripts/index.js')
        ]
    }
};
    