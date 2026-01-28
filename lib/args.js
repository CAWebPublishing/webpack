// flags can be passed via argv0 
// we also add args from NODE_OPTIONS
let flags = [].concat(
  processArgs(process.argv),
  processArgs(process.argv0.split(' ')),
  processArgs(process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.split(' ') : []),
)

// this function processes an array of arguments
// and returns an array of flags and values
function processArgs( arr ){
  let tmp = [];

  arr.filter(Boolean).map((o) => {
    return o.replaceAll("'", '').split('=').forEach((e => tmp.push(e)))
  });

  return tmp
}

// function to add a flag
function addFlag(flag, value = null){
    if( ! flagExists(flag) ){
        flags.push(flag);
        if( value ){
            flags.push(value);
        }
    }
}

// check if a flag exists
function flagExists(flag){
  return flags.includes(flag)
}

// get the value of a flag
function getArgVal(flag, defaultValue = null){
  return flagExists(flag) ? flags[flags.indexOf(flag) + 1] : (defaultValue ?? false);
}

export { 
  flags,
    flagExists, 
    addFlag,
    getArgVal 
};