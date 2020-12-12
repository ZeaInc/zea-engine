function checkStatus(response) {
  if (!response.ok) {
    return false
  }

  return response
}

/**
 * Binary loader plugin.
 */
class BinaryLoaderPlugin {
  init(resourceLoader) {
    this.resourceLoader = resourceLoader
  }

  /**
   * The type of file this pluglin handles.
   * @return {string} The type of file.
   */
  getType() {
    return 'binary'
  }

  loadFile(url) {
    this.resourceLoader.addWork(url, 1)

    const promise = new Promise(
      (resolve, reject) => {
        fetch(url).then((response) => {
          this.resourceLoader.addWorkDone(url, 1)
          if (checkStatus(response)) resolve(response.arrayBuffer())
          else reject(`loadBinary: ${response.status} - ${response.statusText}`)
        })
      },
      () => {}
    )

    return promise
  }
}

export { BinaryLoaderPlugin }
