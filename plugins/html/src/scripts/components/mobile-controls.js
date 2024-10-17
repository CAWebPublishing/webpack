
window.addEventListener('load', () => {
  const isDesktopWidth = () => window.innerWidth > 992; //Maximum px for mobile width

  const mainHeader = document.querySelector('header');
  const searchContainer = mainHeader ? mainHeader.querySelector('.search-container') : null;
  const mainNav = mainHeader ? mainHeader.querySelector('.navigation') : null;

  const mainNavUl = mainNav ? mainNav.querySelector('.nav') : null;
  const toggleMenuCloseButton = mainHeader ? mainHeader.querySelector('.mobile-control.ca-gov-icon-close-mark') : null;

  const mobileCheck = () => { 
      if( isDesktopWidth() ){
        
        if( mainNav ){
          // navigation is always shown in desktop mode
          mainNav.classList.add('show');

          // navigation ul should render as a row
          if( mainNavUl ){
            mainNavUl.classList.remove('flex-column');
          }
        }
        // if in desktop we append the search container after the branding logo
        if( searchContainer && mainHeader ){
          mainHeader.querySelector('.header-organization-banner')?.after(searchContainer);
        }
      }else{
        // if mobile menu is open
        if( 'true' === toggleMenuCloseButton.getAttribute('aria-expanded') ){
          // we make sure to close the mobile menu.
          toggleMenuCloseButton.click();
        }else{
          // we hide the main navigation in mobile
          if( mainNav ){
            mainNav.classList.remove('show');

            // navigation ul should render as a column
            if( mainNavUl ){
              mainNavUl.classList.add('flex-column');
            }
          }

          // if in mobile we append the search container to the mobile overlay
          if( searchContainer && mainHeader ){
            mainHeader.querySelector('.mobile-controlled.overlay')?.append(searchContainer);
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

  if( mainNav ){
    mainNav.addEventListener('shown.bs.collapse', () => {
      mainHeader?.classList.add('overlay');
    });
    mainNav.addEventListener('hide.bs.collapse', () => {
      mainHeader?.classList.remove('overlay');
    });
  }

  // ONLOAD
  // move duplicated logo to navigation drawer section
  mobileCheck();
});
