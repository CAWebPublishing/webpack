//@ts-check
window.addEventListener('load', () => {
  
  const header = document.querySelector('header');
  const alerts = document.querySelector('.alerts');
  const utilityHeader = document.querySelector('.utility-header');

  window.addEventListener(
    'scroll',
    () => {
      if (!header) {
        return;
      }
      // downscroll code passed the header height
      if (document.body.scrollTop >= header.offsetHeight ||
        document.documentElement.scrollTop >= header.offsetHeight
      ) {
        // move the header up to the height of the alerts and utility if they exist, 
        // this will hide the alerts and utility header on scroll
        header.style.top = `-${(alerts?.scrollHeight ?? 0) + (utilityHeader?.scrollHeight ?? 0)}px`;
      } else {
        header.style.top = '0';
      }        
    }
  );

});
