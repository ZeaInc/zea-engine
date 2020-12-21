function checkStatus(response: any) {
  if (!response.ok) {
    return false
  }

  return response
}

/**
 * JSON loader plugin.
 */
class JsonLoaderPlugin {
  resourceLoader: any;
  init(resourceLoader: any) {
    this.resourceLoader = resourceLoader
  }

  /**
   * The type of file this pluglin handles.
   * @return {string} The type of file.
   */
  getType() {
    return 'json'
  }

  loadFile(url: any) {
    this.resourceLoader.addWork(url, 1)

    const promise = new Promise(
      (resolve, reject) => {
        fetch(url).then((response) => {
          this.resourceLoader.addWorkDone(url, 1)
          if (checkStatus(response)) resolve(response.json())
          else reject(`loadJSON: ${response.status} - ${response.statusText}`)
        })
      },
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      () => {}
    )

    return promise
  }
}

export { JsonLoaderPlugin }
