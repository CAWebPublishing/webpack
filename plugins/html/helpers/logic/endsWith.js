export default function endsWith(word, search, options){
    return word.endsWith(search) ? options.fn(this) : options.inverse(this);
}