export default function ifCond(v1, operator, v2, options){
    let answer = false;

    switch(operator){
        case '&&':
            answer =  v1 && v2;
            break;
       case '||':
            answer = v1 || v2 ;
            break;
        case '==':
            answer = v1 == v2 ;
            break;
        case '===':
            answer = v1 === v2;
            break;
        case '!=':
            answer = v1 != v2 ;
            break;
        case '!==':
            answer = v1 !== v2 ;
            break;
        case '<':
            answer = v1 < v2 ;
            break;
        case '<=':
            answer = v1 <= v2 ;
            break;
        case '>':
            answer = v1 > v2 ;
            break;
        case '>=':
            answer = v1 >= v2 ;
            break;
        
    }

    // if the function is called as a block helper
    // return the answer if true and the options has a fn
    if( options['fn'] && answer ){
        return options.fn(this);
    // if the function is called as a block helper
    // return the answer if false and the options has an inverse
    }else if( options['inverse'] && !answer ){
        return options.inverse(this);
    
    // if the function is called as a subexpression
    // return the answer
    }else{
        return answer;
    }
}