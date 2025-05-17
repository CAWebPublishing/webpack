export default function toLower(value, options){
    let response = '';

    // if parameter is passed 
    if( value && value.length ){
        response = value.toLowerCase();
    }

    // if nested content exists
    if( (value.fn && value.fn().length) || (options.fn && options.fn().length ) ){
        let content = value.fn ? value.fn() : options.fn();
        response +=  content.toLowerCase();
    }

    return response;
}