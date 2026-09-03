export default function isScheme(scheme, options ) {
    let validSchemes = [
        'delta',
        'eureka',
        'mono',
        'oceanside',
        'orangecounty',
        'pasorobles',
        'sacramento',
        'santabarbara',
        'santacruz',
        'shasta',
        'sierra',
        'trinity'
    ];

    let answer = validSchemes.includes(scheme);
    
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