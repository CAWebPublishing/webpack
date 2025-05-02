//@ts-check
window.addEventListener('DOMContentLoaded', () => {
  let location_hash = window.location.hash.replace(/(\|)/g, "\\$1");

  const header = document.querySelector('header');
  const pageContainer = document.getElementById('page-container');
  const alerts = document.querySelector('.alerts');
  const utilityHeader = document.querySelector('.utility-header');

  // scroll to target
  if( location_hash ){
    // location hash has leading #, so we remove it
    let target = document.getElementById(location_hash.substring(1));

    // if the location hash is not empty, we scroll to the target element
    setTimeout(() => {
      target?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 1000);
  }

  if (!header) {
    return;
  }

  const compactHeader = () => {
    let scrollHeights = 0;

    // lets collect the height of any elements above the header.
    let current = header.previousElementSibling;
    let miscElementHeights = 0;

    while( current ){
      // if current is a div, add its height to the miscElementHeights.
      if( 'DIV' === current.tagName ){
        miscElementHeights += current.clientHeight ;
      }
      current = current.previousElementSibling;
    }
    
    // downscroll code passed the header height
    if (document.body.scrollTop >= header.offsetHeight ||
      document.documentElement.scrollTop >= header.offsetHeight
    ) {
      // lets add the scroll heights of any alerts
      if( alerts ){
        scrollHeights += alerts.clientHeight;
      }

      // lets add the scroll heights of the utility header
      if( utilityHeader ){
        scrollHeights += utilityHeader.clientHeight;
      }

      // move the header up to the scroll height, minus any elements above the header
      header.style.top = `-${(scrollHeights - miscElementHeights)}px`;

      // we add the header height + misc element heights to the page container as margin-top, minus the scroll heights since those get hidden
      if( pageContainer ){
        pageContainer.style.marginTop =  `${(header.clientHeight + miscElementHeights - scrollHeights)}px`;
      }
    } else {
      // reset header to initial position
      header.style.top = `${miscElementHeights}px`; 

      if( pageContainer ){
        pageContainer.style.marginTop =  `${(header.clientHeight + miscElementHeights)}px`;
      }
    }

    // for each element with an id we add the scroll-margin-top
    document.querySelectorAll('#page-container [id]').forEach((element) => {
      if( element instanceof HTMLElement ){
        element.style.scrollMarginTop = `${header.clientHeight + miscElementHeights - scrollHeights}px`;
      }
    });
  };

  // reset position on scroll
  window.addEventListener(
    'scroll', compactHeader
  );

  compactHeader()
  
});
