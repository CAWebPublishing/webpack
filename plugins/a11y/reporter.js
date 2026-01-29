/**
 * External dependencies
 */
import path from 'path';
import fs from 'fs';
import HandleBars from 'handlebars';
import htmlFormat from 'html-format';

import endsWith from '@caweb/webpack/helpers/logic/endsWith.js';


const templateDir = path.resolve( 'node_modules', '@caweb', 'template' );

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

let title = `IBM Accessibility Equal Access Toolkit: Accessibility Checker Report`;


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

function initHandleBars(){
  // Register partials.
  Object.entries(templatePartials).forEach(([p, f]) => HandleBars.registerPartial(p, fs.readFileSync(path.resolve(templateDir, f )).toString() ) );

  
  // Register custom helpers.
  HandleBars.registerHelper('endsWith', endsWith )

  return HandleBars.compile(fs.readFileSync(path.resolve(templateDir, 'patterns', 'default.html')).toString() )

}

/**
 * JSHint Reporter
 * 
 * @param {*} results 
 * @param {*} data 
 * @param {*} opts 
 */
function reporter(data, opts){
  let output = [];
  
  let {
    outputFolder, 
    outputFilename
  } = opts;

  let {counts, startScan, URL } = data?.summary;

  let totalIssues = (counts?.violation || 0) + 
    (counts?.potentialviolation || 0) + 
    (counts?.recommendation || 0) + 
    (counts?.potentialrecommendation || 0) + 
    (counts?.manual || 0);
  let totalViolations = counts?.violation || 0;
  let totalReviewsNeeded = counts?.potentialviolation || 0;
  let totalRecommendations = (counts?.recommendation || 0) + 
    (counts?.potentialrecommendation || 0) + 
    (counts?.manual || 0);

  // currentStatus is the total number of elements minus 
  // the number of elementsViolationReview minus the recommendations
  // all divided by the total number of elements
  let currentStatus = (
    (counts?.elements || 0) - 
    ( (counts?.elementsViolationReview || 0) - (counts?.recommendation || 0) )
  ) / (counts?.elements || 0);

  let violationIcon = '<span class="ca-gov-icon-close-line text-danger align-bottom mx-2"></span>';
  let reviewIcon = '<span class="ca-gov-icon-warning-triangle text-warning align-bottom mx-2"></span>';
  let recommendationIcon = '<span class="ca-gov-icon-info text-primary align-bottom mx-2"></span>';

  output.push(
    '<div class="container">', // open container
    '<div class="row">', // open row
    '<div class="col-12">', // open column
    `<h1 class="page-title my-4">${title}</h1>`,
    '</div>', // end col-12
    '</div>', // end row
    '<div class="row">', // open row
    '<div class="col-3">', // open column 3
    `<p>${ new Date(startScan).toLocaleString() }</p>`,
    '<strong>Scanned page:</strong>',
    `<p class="text-break">${ URL }</p>`,
    '</div>', // end col-3
    '<div class="col-9">', // open column 9
    '<div class="d-flex p-4" style="background-color: #e8daff; border: 1px solid #8a3ffc">', // open div
    '<div class="w-25">', // open div
    '<p class="fw-bold">Current status</p>',
    `<strong class="fs-1">${Math.ceil(currentStatus * 100)}%</strong>`,
    '<p>Percentage of elements with no detected violations or items to review</p>',
    '</div>', // end div
    '<div class="ps-4 w-75">', // open div
    '<p>This report summarizes automated tests and is generated by <a href="https://www.ibm.com/able/toolkit/tools/#develop" target="_blank">IBM Equal Access Tools</a>. You have to perform additional manual tests to complete accessibility assessments. Use the <a href="https://ibm.com/able/toolkit" target="_blank">IBM Equal Access Toolkit</a> to guide you.</p>',
    '<p class="mb-0">More resources:</p>',
    '<ul class="list-group list-group-flush">',
    '<li class="list-group-item bg-transparent p-0 border-0"><a href="https://www.ibm.com/able/toolkit/develop/overview/#unit-testing" target="_blank">Quick unit test for developers</a></li>',
    '<li class="list-group-item bg-transparent p-0 border-0"><a href="https://www.ibm.com/able/toolkit/verify/overview" target="_blank">Full accessibility test process</a></li>',
    '</ul>',
    '</div>', // end div
    '</div>', // end div
    '<div class="d-flex my-4">', // open div
    '<div class="flex-grow-1 cursor-pointer border border-2 p-2 me-2">', // open div
    `<strong>Violations${violationIcon}</strong>`,
    `<strong class="fs-1 d-block">${totalViolations}</strong>`,
    '<span>Accessibility failures that need to be corrected</span>',
    '</div>', // end div
    '<div class="flex-grow-1 cursor-pointer border border-2 p-2 me-2">', // open div
    `<strong>Needs review${reviewIcon}</strong>`,
    `<strong class="fs-1 d-block">${totalReviewsNeeded}</strong>`,
    '<span>Issues that may not be a violation; manual review is needed</span>',
    '</div>', // end div
    '<div class="flex-grow-1 cursor-pointer border border-2 p-2 me-2">', // open div
    `<strong>Recommendations${recommendationIcon}</strong>`,
    `<strong class="fs-1 d-block">${totalRecommendations}</strong>`,
    '<span>Opportunities to apply best practices to further improve accessibility</span>',
    '</div>', // end div
    '</div>', // end div
    '<div class="d-flex">', // open div
    // '<select>', // open select
    // '<option value="review"><span class="ca-gov-icon-warning-triangle text-warning align-bottom me-2"></span>Needs review</option>', // option
    // '<option value="recommendations"><span class="ca-gov-icon-info text-primary align-bottom me-2"></span>Recommendations</option>', // option
    // '<option value="rules"><span class="ca-gov-icon-close-line text-danger align-bottom me-2"></span>Violations</option>', // option
    // '</select>', // end select
    `<p class="ms-auto me-2">${violationIcon}${totalViolations}</p>`,
    `<p class="mx-2">${reviewIcon}${totalReviewsNeeded}</p>`,
    `<p class="mx-2">${recommendationIcon}${totalRecommendations}</p>`,
    `<p></p>`,
    `<p class="ms-5">${totalIssues} issues found</p>`,
    '</div>', // end div
    '</div>', // end col-9
    '</div>', // end row
    '<div class="row">', // open row
    '<div class="col-12">', // open column
    '<table class="table">', // open table
    '<thead>', // open thead
    '<th>Issues</th>', // th
    '<th>Element roles</th>', // th
    '<th>Requirements</th>', // th
    '<th>Rules</th>', // th
    '</thead>', // end thead
    '<tbody>', // open tbody
    ...data?.results?.map( result => {
      if( 'pass' === result.level ){
        return null; // we skip the passed results
      }

      let icon = recommendationIcon;

      if( 'violation' === result.level ){
        icon = violationIcon;
      }else if( 'potentialviolation' === result.level ){
        icon = reviewIcon;
      }

      return `<tr><td>${icon}</td><td>${result.path.aria}</td><td>${result.category}</td><td>${result.ruleId}</td></tr>`
    }).filter(Boolean),
    '</tbody>', // end tbody
    '</table>', // end table
    '</div>', // end col-12
    '</div>', // end row
    '</div>', // end container
  )

  HandleBars.registerPartial('index', output.join('\n') );

  let template = initHandleBars();

  fs.mkdirSync( outputFolder, {recursive: true} );


  // we generate the outputFilename
  fs.writeFileSync(
    path.join(outputFolder, outputFilename),
    htmlFormat(
      template({
        title,
        scheme: 'oceanside',
        assets: [ 
        fs.existsSync( path.join(outputFolder, 'a11y.update.js' ) ) ? 
          'a11y.update.js' : '' // if the hot module update file exists, add it
        ].filter(Boolean)
      }),
      "  ".repeat(4), 250
    )
  );
}

function landingPage(data, opts ){
  let output = [];
    
  let {
    outputFolder, 
    outputFilename
  } = opts;

  
  output.push(
    `<div class="container"><div class="row"><div class="col-12"><h1 class="page-title my-4">${title} for ${process.cwd().split('\\').pop()}</h1></div></div></div>`,
    '<div class="container"><div class="row"><div class="col-12">',
    '<table class="table"><thead><tr><th>Page Auditted</th><th>Audit</th></thead><tbody>',
    ...data.sort().map(file => {
      // remove the .json extension from the file name
      file = file.replace(/\.json$/, '');

      return `<tr><td><a href="/${file}" target="_blank">/${file}</a></td><td><a href="${file}" target="_blank">${file}</a></td></tr>`
    }),
    '</tbody></table>',
    '</div></div></div>'
  )

  HandleBars.registerPartial('index', output.join('\n') );

  let template = initHandleBars();

  fs.mkdirSync( outputFolder, {recursive: true} );
  
  // we generate the outputFilename
  fs.writeFileSync(
    path.join(outputFolder, `${outputFilename}.html`),
    htmlFormat(
      template({
        title: `${title} for ${process.cwd().split('\\').pop()}`,
        scheme: 'oceanside',
        assets: [ 
        fs.existsSync( path.join(outputFolder, 'a11y.update.js' ) ) ? 
          'a11y.update.js' : '' // if the hot module update file exists, add it
        ].filter(Boolean)
      }),
      "  ".repeat(4), 250
    )
  );

}

function capitalCase(str){
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export {
  reporter,
  landingPage
}