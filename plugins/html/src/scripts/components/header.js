//@ts-check
window.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const pageContainer = document.querySelector('#page-container');
  const alerts = document.querySelector('.alerts');
  const utilityHeader = document.querySelector('.utility-header');

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
      pageContainer?.setAttribute('style', `margin-top: ${(header.clientHeight + miscElementHeights - scrollHeights)}px;`);
    } else {
      // reset header to initial position
      header.style.top = `${miscElementHeights}px`; 

      pageContainer?.setAttribute('style', `margin-top: ${header.clientHeight + miscElementHeights}px;`);
    }

    // for each element with an id we add the scroll-margin-top
    document.querySelectorAll('#page-container [id]').forEach((element) => {
      element?.setAttribute('style', `scroll-margin-top: ${header.clientHeight + miscElementHeights - scrollHeights}px;`);
    });
  };

  // reset position on scroll
  window.addEventListener(
    'scroll', compactHeader
  );

  compactHeader()

});
