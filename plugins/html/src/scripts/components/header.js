//@ts-check
window.addEventListener('load', () => {
  
  const header = document.querySelector('header');
  const pageContainer = document.querySelector('#page-container');
  const alerts = document.querySelector('.alerts');
  const utilityHeader = document.querySelector('.utility-header');

  const resetPosition = () => {
    if (!header) {
      return;
    }
    let scrollHeights = 0;
    
    // lets collect the scroll height of any elements above the header.
    let current = header.previousElementSibling;
    let miscElementHeights = 0;

    while( current ){
      miscElementHeights += current.clientHeight ;
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

    } else {
      header.style.top = `${miscElementHeights}px`; // reset header top position
    }

    // we add the misc element heights to the page container as margin-top
    pageContainer?.setAttribute('style', `margin-top: ${miscElementHeights}px;`);
  };

  // reset position on scroll
  window.addEventListener(
    'scroll', resetPosition
  );

  // reset position on load
  resetPosition();
});
