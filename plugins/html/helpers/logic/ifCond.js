export default function ifCond(v1, operator, v2, options){
    switch(operator){
        case '&&':
            return ( v1 && v2 ) ? options.fn(this) : options.inverse(this);
        case '||':
            return ( v1 || v2 ) ? options.fn(this) : options.inverse(this);
        case '==':
            return ( v1 == v2 ) ? options.fn(this) : options.inverse(this);
        case '===':
            return ( v1 === v2 ) ? options.fn(this) : options.inverse(this);
        case '!=':
            return ( v1 != v2 ) ? options.fn(this) : options.inverse(this);
        case '!==':
            return ( v1 !== v2 ) ? options.fn(this) : options.inverse(this);
        case '<':
            return ( v1 < v2 ) ? options.fn(this) : options.inverse(this);
        case '<=':
            return ( v1 <= v2 ) ? options.fn(this) : options.inverse(this);
        case '>':
            return ( v1 > v2 ) ? options.fn(this) : options.inverse(this);
        case '>=':
            return ( v1 >= v2 ) ? options.fn(this) : options.inverse(this);
        
    }
}