//@ts-check
window.addEventListener('DOMContentLoaded', () => {
  let location_hash = window.location.hash.replace(/(\|)/g, "\\$1");

  const header = document.querySelector('header');
  const pageContainer = document.querySelector('#page-container');
  const alerts = document.querySelector('.alerts');
  const utilityHeader = document.querySelector('.utility-header');

  const compactHeader = () => {
    if (!header) {
      return;
    }
    let scrollHeights = 0;
    
    // lets collect the scroll height of any elements above the header.
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
        scrollHeights += alerts.scrollHeight;
      }

      // lets add the scroll heights of the utility header
      if( utilityHeader ){
        scrollHeights += utilityHeader.scrollHeight;
      }

      // move the header up to the scroll height, minus any elements above the header
      header.style.top = `-${(scrollHeights - miscElementHeights)}px`;

      // we add the header height + misc element heights to the page container as margin-top, minus the scroll heights since those get hidden
      pageContainer?.setAttribute('style', `margin-top: ${(header.offsetHeight + miscElementHeights - scrollHeights)}px;`);
    } else {
      header.style.top = `${miscElementHeights}px`; // reset header top position

      pageContainer?.setAttribute('style', `margin-top: ${miscElementHeights}px;`);
    }

  };

  // reset position on scroll
  window.addEventListener(
    'scroll', compactHeader
  );

  // scroll to target
  if( location_hash ){
    let target = document.querySelector(location_hash);

    setTimeout(() => {
      target?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 1000);
  }
});
