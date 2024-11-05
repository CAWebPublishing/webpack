export default function toTitleCase(value){
    // if value is passed 
    if( value && value.length ){
        return value.split(' ').map( w => w.charAt(0).toUpperCase() + w.slice(1) ).join(' ')
    }
}