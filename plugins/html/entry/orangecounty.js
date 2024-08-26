/**
 *  Autogenerated Entrypoint  
 *  DO NOT MODIFY
 */
 
import path from 'path';
import { fileURLToPath } from 'url';
const currentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default {
    entry: {
        'font-only': path.join(currentPath, 'src', 'styles', 'font-only.css'),
        orangecounty: [
            path.join(currentPath, '/src/styles/colorschemes/orangecounty.scss'),
			path.join(currentPath, '/src/scripts/index.js')
        ]
    }
};
    