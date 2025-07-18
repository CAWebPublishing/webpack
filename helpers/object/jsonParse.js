export default function jsonParse(value){
    // if value is passed 
    if( value && value.length ){
        return JSON.parse(value);
    }
}