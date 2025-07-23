export default function jsonStringify(value){
    // if value is passed 
    if( value && value.length ){
        return JSON.stringify(value);
    }
}