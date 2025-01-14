document.addEventListener( 'DOMContentLoaded', () => {
	// Set is-dark-mode class if user has requested dark mode.
	if ( window.matchMedia( '(prefers-color-scheme: dark)' ).matches ){
		document.documentElement.setAttribute('data-bs-theme', 'dark');
	}

});
