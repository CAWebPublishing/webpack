export default function toTitleCase(value, options){
    let response = '';

    // if parameter is passed 
    if( value && value.length ){
        response = value.split(' ').map( w => w.charAt(0).toUpperCase() + w.slice(1) ).join(' ');
    }

    // if nested content exists
    if( (value.fn && value.fn().length) || (options.fn && options.fn().length ) ){
        let content = value.fn ? value.fn() : options.fn();
        response +=  content.split(' ').map( w => w.charAt(0).toUpperCase() + w.slice(1) ).join(' ');
    }

    return response;
}