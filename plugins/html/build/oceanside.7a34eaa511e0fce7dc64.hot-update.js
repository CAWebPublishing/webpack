"use strict";
self["webpackHotUpdate_caweb_html_webpack_plugin"]("oceanside",{

/***/ "./src/styles/font-only.css":
/*!**********************************!*\
  !*** ./src/styles/font-only.css ***!
  \**********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

    if(true) {
      (function() {
        var localsJsonString = undefined;
        // 1730141973698
        var cssReload = __webpack_require__(/*! ../../node_modules/mini-css-extract-plugin/dist/hmr/hotModuleReplacement.js */ "./node_modules/mini-css-extract-plugin/dist/hmr/hotModuleReplacement.js")(module.id, {});
        // only invalidate when locals change
        if (
          module.hot.data &&
          module.hot.data.value &&
          module.hot.data.value !== localsJsonString
        ) {
          module.hot.invalidate();
        } else {
          module.hot.accept();
        }
        module.hot.dispose(function(data) {
          data.value = localsJsonString;
          cssReload();
        });
      })();
    }
  

/***/ }),

/***/ "./src/styles/colorschemes/oceanside.scss":
/*!************************************************!*\
  !*** ./src/styles/colorschemes/oceanside.scss ***!
  \************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

    if(true) {
      (function() {
        var localsJsonString = undefined;
        // 1730141977216
        var cssReload = __webpack_require__(/*! ../../../node_modules/mini-css-extract-plugin/dist/hmr/hotModuleReplacement.js */ "./node_modules/mini-css-extract-plugin/dist/hmr/hotModuleReplacement.js")(module.id, {});
        // only invalidate when locals change
        if (
          module.hot.data &&
          module.hot.data.value &&
          module.hot.data.value !== localsJsonString
        ) {
          module.hot.invalidate();
        } else {
          module.hot.accept();
        }
        module.hot.dispose(function(data) {
          data.value = localsJsonString;
          cssReload();
        });
      })();
    }
  

/***/ }),

/***/ "./src/scripts/components/mobile-controls.js":
/*!***************************************************!*\
  !*** ./src/scripts/components/mobile-controls.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
window.addEventListener('load', () => {
  const isDesktopWidth = () => window.innerWidth > 992; //Maximum px for mobile width

  const mainHeader = document.querySelector('header');
  const searchContainer = mainHeader ? mainHeader.querySelector('.search-container') : null;
  const mainNav = mainHeader ? mainHeader.querySelector('.navigation') : null;
  const mainNavUl = mainNav ? mainNav.querySelector('.nav') : null;
  const toggleMenuCloseButton = mainHeader ? mainHeader.querySelector('.mobile-control.ca-gov-icon-close-mark') : null;
  const mobileCheck = () => {
    if (isDesktopWidth()) {
      if (mainNav) {
        // navigation is always shown in desktop mode
        mainNav.classList.add('show');

        // navigation ul should render as a row
        if (mainNavUl) {
          mainNavUl.classList.remove('flex-column');
        }
      }
      // if in desktop we append the search container after the branding logo
      if (searchContainer && mainHeader) {
        mainHeader.querySelector('.header-organization-banner')?.after(searchContainer);
      }
    } else {
      // if mobile menu is open
      if ('true' === toggleMenuCloseButton.getAttribute('aria-expanded')) {
        // we make sure to close the mobile menu.
        toggleMenuCloseButton.click();
      } else {
        // we hide the main navigation in mobile
        if (mainNav) {
          mainNav.classList.remove('show');

          // navigation ul should render as a column
          if (mainNavUl) {
            mainNavUl.classList.add('flex-column');
          }
        }

        // if in mobile we append the search container to the mobile overlay
        if (searchContainer && mainHeader) {
          mainHeader.querySelector('.mobile-controlled.overlay')?.append(searchContainer);
        }
      }
    }
  };

  // on resize function (hide mobile nav)
  window.addEventListener('resize', mobileCheck);
  mainHeader?.addEventListener('mouseup', ({
    target
  }) => {
    if ([...target.classList].includes('global-header') && 'true' === toggleMenuCloseButton.getAttribute('aria-expanded')) {
      toggleMenuCloseButton.click();
    }
  });

  // Escape key event listener
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && 'true' === toggleMenuCloseButton.getAttribute('aria-expanded')) {
      toggleMenuCloseButton.click();
    }
  });
  if (mainNav) {
    mainNav.addEventListener('shown.bs.collapse', () => {
      mainHeader?.classList.add('overlay');
      mainNav.classList.add('visible');
      searchContainer?.classList.add('visible');
    });
    mainNav.addEventListener('hide.bs.collapse', () => {
      mainHeader?.classList.remove('overlay');
    });
  }

  // ONLOAD
  // move duplicated logo to navigation drawer section
  mobileCheck();
});

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("254e683fc99f114d3974")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=oceanside.7a34eaa511e0fce7dc64.hot-update.js.map