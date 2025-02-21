
window.addEventListener('DOMContentLoaded', () => {
  const isDesktopWidth = () => window.innerWidth > 992; //Maximum px for mobile width

  const mainHeader = document.querySelector('header');
  const mobileOverlay = mainHeader?.querySelector('.mobile-controlled.overlay');
  
  const searchContainer = mainHeader?.querySelector('.search-container');

  const mainNav = mainHeader?.querySelector('.navigation');
  const mainNavUl = mainNav?.querySelector('.nav');

  const toggleMenuOpenButton = mainHeader?.querySelector('.mobile-control.ca-gov-icon-menu');
  const toggleMenuCloseButton = mainHeader?.querySelector('.mobile-control.ca-gov-icon-close-mark');

  const mobileCheck = () => { 
      if( isDesktopWidth() ){
        /**
           * Desktop Mode
           * - navigation is always shown in desktop mode
           * - append the search container after the branding logo
           * - append navigation after the mobile control overlay
           */
        if( mainNav ){
          // navigation is always shown in desktop mode
          mainNav.classList.add('show');

          // navigation ul should render as a row
          if( mainNavUl ){
            mainNavUl.classList.remove('flex-column');
          }
          mobileOverlay.after(mainNav);
        }
        // if in desktop we append the search container after the branding logo and the 
        if( searchContainer ){
          mainHeader.querySelector('.header-organization-banner')?.after(searchContainer);
        }
      }else{
        // if mobile menu is open
        if( 'true' === toggleMenuCloseButton.getAttribute('aria-expanded') ){
          // we make sure to close the mobile menu.
          toggleMenuCloseButton.click();
        }else{
          /**
           * Mobile Mode
           * - hide the main navigation in mobile
           * - append the search container and navigation to the mobile control overlay
           * - navigation ul should render as a column
           */

          // append the search container to the mobile control overlay
          if( searchContainer ){
            mobileOverlay.append(searchContainer);
          }

          // we hide the main navigation in mobile
          if( mainNav ){
            mobileOverlay.append(mainNav);

            // navigation ul should render as a column
            mainNavUl?.classList.add('flex-column');
          }

        }

      }
    
  };

  // on resize function (hide mobile nav)
  window.addEventListener('resize', mobileCheck);

  mainHeader?.addEventListener('mouseup', ({target}) => {
    if( [...target.classList].includes('global-header') && 'true' === toggleMenuCloseButton.getAttribute('aria-expanded')  ){
      toggleMenuCloseButton.click();
    }
  });

  // Escape key event listener
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && 'true' === toggleMenuCloseButton.getAttribute('aria-expanded') ) {
      toggleMenuCloseButton.click();
    }
  });


  // Mobile Overlay is being shown
  mobileOverlay?.addEventListener('shown.bs.collapse', () => {
    toggleMenuCloseButton.focus();
    mainHeader.classList.add('overlay');
    mainNav?.classList.add('visible');
    searchContainer?.classList.add('visible');
    document.body.classList.add('overflow-hidden');

  });

  // Mobile Overlay is hidden
  mobileOverlay?.addEventListener('hide.bs.collapse', () => {
    toggleMenuOpenButton.focus();
    mainHeader.classList.remove('overlay');
    document.body.classList.remove('overflow-hidden');

  });


  // ONLOAD
  // move duplicated logo to navigation drawer section
  mobileCheck();
});
