export default function bsAttr(util, opt, options ) {
    // Check if the utility is valid
    switch ( util ) {
        case 'text':
            if( 'left' === opt ){
                opt = 'start';
            }else if( 'right' === opt ){
                opt = 'end';
            }

            break;
        case 'spacing':
            util = 'm';
            
            if( 'string' === typeof options && 'm' === options ){
                util = options;
            };

            switch ( opt ) {
                case 'left':
                    util +='e';
                    opt = 'auto';
                    break;
                
                case 'center':
                    util +='x';
                    opt = 'auto';
                    break;
                
                case 'right':
                    util +='s';
                    opt = 'auto';
                    break;
            }

            break;
    }
    
    return opt ? ` ${util}-${opt}` : '';

}