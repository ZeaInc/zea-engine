const getFileFolder = function (filePath: any) {
  return filePath.substring(0, filePath.lastIndexOf('/')) + '/'
}

const loadfile = function (url: any, responseType: any, onSucceed: any, onFail: any, onProgress: any) {
  try {
    const xhr = new XMLHttpRequest()
    xhr.responseType = responseType
    xhr.addEventListener('timeout', function (event) {
      throw new Error('The request for ' + url + ' timed out.')
    })
    xhr.addEventListener('error', function (event) {
      throw new Error('The request for ' + url + ': xhr.readyState:' + xhr.readyState)
      onFail(xhr.statusText)
    })
    xhr.addEventListener('abort', function (event) {
      throw new Error('The request for ' + url + ': xhr.readyState:' + xhr.readyState)
      onFail(xhr.statusText)
    })
    xhr.addEventListener('loadend', function (event) {
      if (xhr.status == 200) onSucceed(xhr)
      else onFail(xhr.statusText)
    })
    xhr.open('GET', url, true)
    xhr.send()
    // xhr.open();
  } catch (err) {
    onFail(err)
  }
}

const loadTextfile = function (url: any, onSucceed: any, onFail = undefined, onProgress = undefined) {
  loadfile(
    url,
    'text',
    (xhr: any) => {
      onSucceed(xhr.responseText)
    },
    (statusText: any) => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      if (onFail != undefined) onFail(statusText)
      else {
        throw new Error('Unable to XHR File:' + url)
      }
    },
    (total: any, loaded: any) => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      if (onProgress != undefined) onProgress(total, loaded)
    }
  )
}

const loadJSONfile = function (url: any, onSucceed: any, onFail = undefined, onProgress = undefined) {
  loadfile(
    url,
    'json',
    (xhr: any) => {
      onSucceed(xhr.response, xhr)
    },
    (statusText: any) => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      if (onFail != undefined) onFail(statusText)
      else {
        throw new Error('Unable to XHR File:' + url)
      }
    },
    (total: any, loaded: any) => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      if (onProgress != undefined) onProgress(total, loaded)
    }
  )
}

const loadXMLfile = function (url: any, onSucceed: any, onFail = undefined, onProgress = undefined) {
  loadfile(
    url,
    'document',
    (xhr: any) => {
      onSucceed(xhr.responseXML)
    },
    (statusText: any) => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      if (onFail != undefined) onFail(statusText)
      else {
        throw new Error('Unable to XHR File:' + url)
      }
    },
    (total: any, loaded: any) => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      if (onProgress != undefined) onProgress(total, loaded)
    }
  )
}

const loadBinfile = function (url: any, onSucceed: any, onFail = undefined, onProgress = undefined) {
  loadfile(
    url,
    'arraybuffer',
    (xhr: any) => {
      onSucceed(xhr.response)
    },
    (statusText: any) => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      if (onFail != undefined) onFail(statusText)
      else {
        throw new Error('Unable to XHR File:' + url)
      }
    },
    (total: any, loaded: any) => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      if (onProgress != undefined) onProgress(total, loaded)
    }
  )
}

export { getFileFolder, loadTextfile, loadJSONfile, loadXMLfile, loadBinfile }
