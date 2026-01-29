/**
 * Configuration for Accessibility Checker
 * @link https://www.npmjs.com/package/accessibility-checker
 */
/**
 * External dependencies
 */
import path from 'path';
import { getArgVal, getAllFlags } from '@caweb/webpack/lib/args.js';

let levels = [
    'violation', 
    'potentialviolation',
    'recommendation',
    'potentialrecommendation',
    'manual',
    'pass'
];
let reportLevels = levels;
let failLevels = levels;

// remove any levels based on flags
Object.keys(getAllFlags()).forEach((flag) => {
    // remove any report levels
    if( flag.includes('no-report-levels-') ){  
      let r = flag.replace('no-report-levels-', '')
      delete reportLevels[reportLevels.indexOf(r)]
    }
    // remove any fails levels
    if( flag.includes('no-fail-levels-') ){  
      let f = flag.replace('no-fail-levels-', '')
      delete failLevels[failLevels.indexOf(f)]
    }
  })


export default {
    ruleArchive: "latest",
    policies: [
        'WCAG_2_1'
    ],
    failLevels: failLevels.filter( Boolean ),
    reportLevels: reportLevels.filter( Boolean ),
    outputFilename: 'reports',
    outputFolder: '/audits/a11y',
    outputFormat: [
        'html'
    ],
    outputFilenameTimestamp: false
}