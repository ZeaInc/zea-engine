/**
 * Detects the resizing of a DOM element.
 */
export const onResize = (element: any, callback: any) => {
    // First time we are called, create a list of watched elements
    // and hook up the event listeners.
    if (!(onResize as any).watchedElementData) {
        (onResize as any).watchedElementData = [];
        const checkForChanges = () => {
            (onResize as any).watchedElementData.forEach((data: any) => {
                if (data.element.offsetWidth !== data.offsetWidth || data.element.offsetHeight !== data.offsetHeight) {
                    data.offsetWidth = data.element.offsetWidth;
                    data.offsetHeight = data.element.offsetHeight;
                    data.callback();
                }
            });
        };
        // Listen to the window's size changes
        window.addEventListener('resize', checkForChanges);
        // Listen to changes on the elements in the page that affect layout
        const observer = new window.MutationObserver(checkForChanges);
        observer.observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true,
        });
    }
    // Save the element we are watching
    (onResize as any).watchedElementData.push({
        element: element,
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        callback,
    });
};
