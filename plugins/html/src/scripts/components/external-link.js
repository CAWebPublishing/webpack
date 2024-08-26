//@ts-check

/* EXTERNAL LINK ICON */
window.addEventListener('load', () => {
  const ext = '<span class="ca-gov-icon-external-link" aria-hidden="true"></span>';

  // Check if link is external function
  /**
   * @param {HTMLAnchorElement} linkElement
   */
  function linkIsExternal(linkElement) {
    return window.location.host.indexOf(linkElement.host) > -1;
  }

  // Add any exceptions to not render here
  const cssExceptions = `:not(code *):not(.cagov-logo)`;

  // Looping thru all links inside of the main content body footer links
  /** @type {NodeListOf<HTMLAnchorElement>} */
  const externalLink = document.querySelectorAll(
    `main a${cssExceptions}, .footer-links a${cssExceptions}`
  );
  externalLink.forEach(element => {
    const anchorLink = element.href.indexOf('#') === 0;
    const localHost = element.href.indexOf('localhost') > -1;
    const localEmail = element.href.indexOf('@') > -1;
    const linkElement = element;
    if (
      linkIsExternal(linkElement) === false &&
      !anchorLink &&
      !localEmail &&
      !localHost
    ) {
      linkElement.innerHTML += ext; // += concatenates to external links
    }
  });
});
