/**
 * This script is used to add the scroll-margin-top to each element with an id
 * This is used to ensure that the element is not hidden behind the header
 */
window.addEventListener('load', () => {
    // Function to update the scroll-margin-top for each element with an id    
    const updateScrollMarginTop = () => {
        let  mainHeader = document.querySelector('header');
        // for each element with an id we add the scroll-margin-top
        document.querySelectorAll('#page-container [id]').forEach(element =>
            element.style.scrollMarginTop = `${mainHeader.offsetHeight}px`
        );
    };

    // on resize function (recalculate margin-top)
    window.addEventListener('resize', updateScrollMarginTop);

    // on load function (recalculate margin-top)
    updateScrollMarginTop();
});
