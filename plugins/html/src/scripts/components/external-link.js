//@ts-check

/* EXTERNAL LINK ICON */
window.addEventListener('DOMContentLoaded', () => {
  const ext = '<span class="ca-gov-icon-external-link" aria-hidden="true"></span><span class="sr-only">opens in a new window</span>';
  
  // Add any exceptions to not render here
  const cssExceptions = `:not(code *):not(.cagov-logo)`;

  // Looping thru all links inside of the main content body footer links
  /** @type {NodeListOf<HTMLAnchorElement>} */
  const externalLink = document.querySelectorAll(
    `main a${cssExceptions}, .footer-links a${cssExceptions}`
  );
  externalLink.forEach(element => {
    const linkElement = element;
    if (
      '_blank' === element.getAttribute('target')
    ) {
      linkElement.innerHTML += ext; // += concatenates to external links
    }
  });
});
