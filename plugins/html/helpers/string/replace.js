export default function replace(value, search, replace, options){
    let response = '';

    // if parameter is passed 
    if( value && value.length ){
        response = value.replace(new RegExp(search, "g"), replace);
    }

    // if nested content exists
    if( value.fn && value.fn().length ){
        response +=  value.fn().replace(new RegExp(search, "g"), replace);
    }

    return response;
}