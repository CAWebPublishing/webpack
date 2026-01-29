/**
 * External dependencies
 */

export function hasOwnProperty( obj, prop ) {
    return Object.prototype.hasOwnProperty.call( obj, prop );
}   


export default {
    format: 'html',
	filename: 'reports',
    outputFolder: '/audits/css',
    audits: [
        'colors',
        'important',
        'alphas',
        'display-none',
        'selectors',
        'media-queries',
        'typography',
        ['property-values', 'font-size'],
        ['property-values', 'padding,padding-top,padding-bottom,padding-right,padding-left'],
        ['property-values', 'margin,margin-top,marin-bottom,marin-right,marin-left'],
    ]
}