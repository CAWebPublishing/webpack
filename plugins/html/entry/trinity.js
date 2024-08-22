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
        trinity: [
            path.join(currentPath, '/src/styles/index.scss'),
			path.join(currentPath, '/src/styles/colorschemes/trinity.scss'),
			path.join(currentPath, '/src/scripts/index.js')
        ]
    }
};
    