export default function replace(value, search, replace){
    // if value is passed 
    if( value && value.length ){
        return value.replace(new RegExp(search, "g"), replace);
    }
}