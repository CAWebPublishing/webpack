
window.addEventListener('load', () => {
  const isDesktopWidth = () => window.innerWidth > 992; //Maximum px for mobile width

  const mainHeader = document.querySelector('header');
  const searchContainer = mainHeader ? mainHeader.querySelector('.search-container') : null;
  const mainNav = mainHeader ? mainHeader.querySelector('.navigation') : null;

  const mainNavUl = mainNav ? mainNav.querySelector('.nav') : null;
  const toggleMenuCloseButton = mainHeader ? mainHeader.querySelector('.mobile-control.ca-gov-icon-close-mark') : null;

  const mobileCheck = () => { 
      if( isDesktopWidth() ){
        if( mainNavUl ){
          mainNavUl.classList.remove('flex-column');
        }
        if( mainNav ){
          mainNav.classList.add('show');
        }
        if( searchContainer && mainHeader ){
          mainHeader.querySelector('.header-organization-banner')?.after(searchContainer);
        }
      }else{
        if( mainNavUl ){
          mainNavUl.classList.add('flex-column');
        }
        if( mainNav ){
          mainNav.classList.remove('show');
        }
        if( searchContainer && mainHeader ){
          mainHeader.querySelector('.mobile-controlled.overlay')?.append(searchContainer);
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
