function onResize(element, callback) {
  if (!onResize.watchedElementData) {
    // First time we are called, create a list of watched elements
    // and hook up the event listeners.
    onResize.watchedElementData = []

    const checkForChanges = function () {
      onResize.watchedElementData.forEach(function (data) {
        if (data.element.offsetWidth !== data.offsetWidth || data.element.offsetHeight !== data.offsetHeight) {
          data.offsetWidth = data.element.offsetWidth
          data.offsetHeight = data.element.offsetHeight
          data.callback()
        }
      })
    }

    // Listen to the window's size changes
    window.addEventListener('resize', checkForChanges)

    // Listen to changes on the elements in the page that affect layout
    const observer = new MutationObserver(checkForChanges)
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    })
  }

  // Save the element we are watching
  onResize.watchedElementData.push({
    element: element,
    offsetWidth: element.offsetWidth,
    offsetHeight: element.offsetHeight,
    callback: callback,
  })
}

export { onResize }
