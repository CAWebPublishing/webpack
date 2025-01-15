/**
 * External Dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Internal dependencies
 */
import JSHintPlugin from '../index.js';

let plugins = [
  new JSHintPlugin()
];

export default {
    plugins
};
