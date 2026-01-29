//"use strict";
const path = require('path');
const fs = require('fs');
const htmlFormat = require('html-format');
const HandleBars = require('handlebars');

const endsWith = require('@caweb/webpack/helpers/logic/endsWith.js');

const templateDir = path.resolve('node_modules', '@caweb', 'template' );

let templatePartials = {
  'header': 'semantics/header.html',
  'footer': 'semantics/footer.html',
  'utilityHeader': 'semantics/utility-header.html',
  'branding': 'semantics/branding.html',
  'mobileControls': 'semantics/mobile-controls.html',
  'navHeader': 'semantics/nav-header.html',
  'navFooter': 'semantics/nav-footer.html',
  'alert': 'components/alert/alert.html',
  'searchForm': 'forms/search.html'
}

let sortedReport = {
  errors: [],
  warnings: [],
  info: []
};

let title = `JSHint Report for ${process.cwd().split('\\').pop()}`;

let output = [];

/**
 * Process data
 * 
 * Data Object
 * {
 *  functions,
 *  options,
 *  errors,
 *  globals,
 *  unused,
 *  member,
 *  file
 * }
 */
function addBreakdown({
  functions,
  options,
  errors,
  implieds,
  globals,
  unused,
  member,
  file
}){
  let functionList = [];
  let errorList = [];
  let unusedList = [];

  /**
   * Process function data
   * 
   * Function Data Object
   * {
   *  name,
   *  param,
   *  line,
   *  character,
   *  last,
   *  lastcharacter,
   *  metrics {
   *    complexity,
   *    parameters,
   *    statements
   *  }
   * }
   */
  if( functions ){
    functions.forEach(({ name, param, line, character, metrics }) => {
      let { complexity, parameters, statements } = metrics;

      functionList.push(
        '<li>',
        `<p><b>Name:</b> ${name}</p>`,
        param && param.length ? `<p><b>Parameters:</b> ${param}</p>` : '',
        `<p><b>Line:</b> ${line}</p>`,
        `<p><b>Col:</b> ${character}</p>`,
        `<p><b>Metrics:</b></p>`,
        '<ul>',
        `<li><b>Cyclomatic Complexity Number:</b> ${complexity}</li>`,
        `<li><b>Arguments:</b> ${parameters}</li>`,
        `<li><b>Statements:</b> ${statements}</li>`,
        '</ul>',
        '</li>'
      )
    })
  }


  /**
   * Process error data
   * 
   * Error Data Object
   * {
   *  id,
   *  raw,
   *  code,
   *  evidence,
   *  line,
   *  character,
   *  scope,
   *  a,
   *  b,
   *  c,
   *  d,
   *  reason
   * }
   */
  if( errors ){
    errors.forEach(({reason, evidence, line, character}) => {
      errorList.push(
        '<li>',
        `<p><b>Reason:</b> ${reason}</p>`,
        `<p><b>Evidence:</b> ${evidence}</p>`,
        `<p><b>Line:</b> ${line}</p>`,
        `<p><b>Col:</b> ${character}</p>`,
        '</li>'
      )
    })
  }

  /**
   * Unused Data
   * {
   *  name,
   *  line,
   *  character
   * }
   */
  if( unused ){
    unused.forEach(({name, line, character}) => {
      unusedList.push(
        '<li>',
        `<p><b>Name:</b> ${name}</p>`,
        `<p><b>Line:</b> ${line}</p>`,
        `<p><b>Col:</b> ${character}</p>`,
        '</li>'
      )
    })
  }

  return `<section id="${file.replace(/[\\:\.]/g, '-').toLowerCase()}" class="mb-5 border border-2">
    <div class="bg-light p-4"><h4>File: <a href="file://${file}" target="_blank" class="fst-italic fs-md text-break">${file}</a></h4></div>
    <div class="p-4">
    <h5>Functions: <span class="bg-light rounded-circle p-2">${functions.length}</span></h5>
    ${ functionList.length ? `<ol>${functionList.join('\n')}</ol>` : ''}
    <h5>Errors: <span class="bg-light rounded-circle p-2">${errors ? errors.length : 0}</span></h5>
    ${ errorList.length ? `<ol>${errorList.join('\n')}</ol>` : '' }
    <h5>Unused: <span class="bg-light rounded-circle p-2">${unused ? unused.length : 0}</span></h5>
    ${ unusedList.length ? `<ol>${unusedList.join('\n')}</ol>` : '' }
    </div>
    </section>`;
}

/**
 * JSHint Reporter
 * 
 * @param {*} results 
 * @param {*} data 
 * @param {*} opts 
 */
function reporter(results, data, opts){
  let outputFolder = process.env.JSHINT_OUTPUT_DIR ? 
    path.resolve( process.env.JSHINT_OUTPUT_DIR ) : 
    path.join(__dirname, 'public')
  let outputFilename = path.join(outputFolder, `${process.env.JSHINT_OUTPUT_FILENAME ?? 'jshint'}.html` );
  let fileList = [];
  let fileSummary = [];
  let fileBreakdown = [];
  let summaryHeader = [];

  try{

    // process results.
    results.forEach((result) => {
      var file = result.file;
      var error = result.error;

      // add error to sorted report array
      switch( error.code.charAt(0) ){
        case 'E': // errors
          sortedReport.errors.push({...error, file: file})
          break;
        case 'I': // info
          sortedReport.info.push({...error, file: file})
          break;
        case 'W': // warnings
          sortedReport.warnings.push({...error, file: file})
          break;
      }

      fileList.push(
        `<li class="text-break mb-4"><a href="#${ file.replace(/[\\:\.]/g, '-').toLowerCase() }">${file}</a></li>`
      )

      fileSummary.push(
        `<li class="mb-3"><a href="#${ file.replace(/[\\:\.]/g, '-').toLowerCase( )}">${file}</a>: line ${error.line}, col ${error.character}, ${error.reason}</li>`
      )

    })

    data.forEach((d) => {
      fileBreakdown.push( addBreakdown(d) );
    })


    for(let [category] of Object.entries(sortedReport) ){
      if( sortedReport[category].length ){
        let cCase = capitalCase(category);
        // if there is just 1, drop the plural 
        if( 1 === sortedReport[category].length ){
          cCase = cCase.slice(0, -1)
        }
        summaryHeader.push(`${sortedReport[category].length} ${cCase} Detected`)
      }
    }


    fileList = Array.from( new Set( fileList ) );

    output.push(
      `<h1 class="page-title my-4">${title}</h1>`,
      '<div class="container">',
      '<div class="row">',
      '<div id="sidebar" class="col-4">',
      '<h2>Files</h2>',
      '<ol class="border-end border-2 pe-3">',
      ...fileList,
      '</ol>',
      '</div>',
      '<!-- End of Sidebar Column -->',
      '<div id="content" class="col-8">',
      `<h2>Summary: <em>${summaryHeader.join(' & ')}</em></h2>`,
      '<ol>',
      ...fileSummary,
      '</ol>',
      ...fileBreakdown,
      '</div>',
      '<!-- End of Content Column -->',
      '</div>',
      '<!-- End of Row -->',
      '</div>',
      '<!-- End of Container -->'
    )
    

  }catch(err){
    process.stderr.write(err.toString())
    process.exit(1)
  }

  fs.mkdirSync( outputFolder, {recursive: true} );

  // Register partials.
  Object.entries(templatePartials).forEach(([p, f]) => HandleBars.registerPartial(p, fs.readFileSync(path.resolve(templateDir, f )).toString() ) );

  // Register custom helpers.
  HandleBars.registerHelper('endsWith', endsWith )

  let template = HandleBars.compile(fs.readFileSync(path.resolve(templateDir, 'patterns', 'default.html')).toString() )

  // write html file
  fs.writeFileSync( 
    outputFilename,
    htmlFormat(
      template({
        title,
        scheme: 'oceanside',
        logo: 'https://caweb.cdt.ca.gov/wp-content/uploads/sites/221/2023/06/caweb-publishing-logo.png',
        partial: output.join('\n'),
      }),
      "  ".repeat(4), 250
    )
  );

}

function capitalCase(str){
  return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = {
  reporter
}