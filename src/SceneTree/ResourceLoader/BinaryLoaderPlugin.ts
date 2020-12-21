function checkStatus(response: any) {
  if (!response.ok) {
    return false
  }

  return response
}

/**
 * Binary loader plugin.
 */
class BinaryLoaderPlugin {
  resourceLoader: any;
  init(resourceLoader: any) {
    this.resourceLoader = resourceLoader
  }

  /**
   * The type of file this pluglin handles.
   * @return {string} The type of file.
   */
  getType() {
    return 'binary'
  }

  loadFile(url: any) {
    this.resourceLoader.addWork(url, 1)

    const promise = new Promise(
      (resolve, reject) => {
        fetch(url).then((response) => {
          this.resourceLoader.addWorkDone(url, 1)
          if (checkStatus(response)) resolve(response.arrayBuffer())
          else reject(`loadBinary: ${response.status} - ${response.statusText}`)
        })
      },
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      () => {}
    )

    return promise
  }
}

export { BinaryLoaderPlugin }
