const getFileFolder = function (filePath) {
  return filePath.substring(0, filePath.lastIndexOf('/')) + '/'
}

const loadfile = function (url, responseType, onSucceed, onFail, onProgress) {
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

const loadTextfile = function (url, onSucceed, onFail = undefined, onProgress = undefined) {
  loadfile(
    url,
    'text',
    (xhr) => {
      onSucceed(xhr.responseText)
    },
    (statusText) => {
      if (onFail != undefined) onFail(statusText)
      else {
        throw new Error('Unable to XHR File:' + url)
      }
    },
    (total, loaded) => {
      if (onProgress != undefined) onProgress(total, loaded)
    }
  )
}

const loadJSONfile = function (url, onSucceed, onFail = undefined, onProgress = undefined) {
  loadfile(
    url,
    'json',
    (xhr) => {
      onSucceed(xhr.response, xhr)
    },
    (statusText) => {
      if (onFail != undefined) onFail(statusText)
      else {
        throw new Error('Unable to XHR File:' + url)
      }
    },
    (total, loaded) => {
      if (onProgress != undefined) onProgress(total, loaded)
    }
  )
}

const loadXMLfile = function (url, onSucceed, onFail = undefined, onProgress = undefined) {
  loadfile(
    url,
    'document',
    (xhr) => {
      onSucceed(xhr.responseXML)
    },
    (statusText) => {
      if (onFail != undefined) onFail(statusText)
      else {
        throw new Error('Unable to XHR File:' + url)
      }
    },
    (total, loaded) => {
      if (onProgress != undefined) onProgress(total, loaded)
    }
  )
}

const loadBinfile = function (url, onSucceed, onFail = undefined, onProgress = undefined) {
  loadfile(
    url,
    'arraybuffer',
    (xhr) => {
      onSucceed(xhr.response)
    },
    (statusText) => {
      if (onFail != undefined) onFail(statusText)
      else {
        throw new Error('Unable to XHR File:' + url)
      }
    },
    (total, loaded) => {
      if (onProgress != undefined) onProgress(total, loaded)
    }
  )
}

export { getFileFolder, loadTextfile, loadJSONfile, loadXMLfile, loadBinfile }
