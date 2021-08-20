// eslint-disable-next-line require-jsdoc
function isIOSDevice() {
  return (
    (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i)) != null
  )
}

// eslint-disable-next-line require-jsdoc
function isMobileDevice() {
  return (
    (navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Pixel/i) ||
      navigator.userAgent.match(/Windows Phone/i)) != null
  )
}

// eslint-disable-next-line require-jsdoc
function getBrowserDesc() {
  const nVer = navigator.appVersion
  const nAgt = navigator.userAgent
  let browserName = navigator.appName
  let fullVersion = '' + parseFloat(navigator.appVersion)
  let majorVersion = parseInt(navigator.appVersion, 10)
  let nameOffset
  let verOffset
  let ix

  if (navigator.brave) {
    browserName = 'Brave'
    verOffset = nAgt.indexOf('Chrome')
    fullVersion = nAgt.substring(verOffset + 7, nAgt.indexOf(' ', verOffset + 7))
  }

  // In Opera, the true version is after "Opera" or after "Version"
  else if ((verOffset = nAgt.indexOf('Opera')) != -1) {
    browserName = 'Opera'
    fullVersion = nAgt.substring(verOffset + 6)
    if ((verOffset = nAgt.indexOf('Version')) != -1) fullVersion = nAgt.substring(verOffset + 8)
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
    browserName = 'Microsoft Internet Explorer'
    fullVersion = nAgt.substring(verOffset + 5)
  } else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
    browserName = 'Edge'
    fullVersion = nAgt.substring(verOffset + 4)
  }
  // In Chrome, the true version is after "Chrome"
  else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
    browserName = 'Chrome'
    fullVersion = nAgt.substring(verOffset + 7, nAgt.indexOf(' ', verOffset + 7))
  }

  // TOOD: Parse Samsung userAgent
  // https://developer.samsung.com/technical-doc/view.do?v=T000000203

  // In Safari, the true version is after "Safari" or after "Version"
  else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
    browserName = 'Safari'
    fullVersion = nAgt.substring(verOffset + 7)
    if ((verOffset = nAgt.indexOf('Version')) != -1) fullVersion = nAgt.substring(verOffset + 8)
  }
  // In Firefox, the true version is after "Firefox"
  else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
    browserName = 'Firefox'
    fullVersion = nAgt.substring(verOffset + 8)
  }
  // In most other browsers, "name/version" is at the end of userAgent
  else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
    browserName = nAgt.substring(nameOffset, verOffset)
    fullVersion = nAgt.substring(verOffset + 1)
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName
    }
  }
  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(';')) != -1) fullVersion = fullVersion.substring(0, ix)
  if ((ix = fullVersion.indexOf(' ')) != -1) fullVersion = fullVersion.substring(0, ix)

  majorVersion = parseInt('' + fullVersion, 10)
  if (isNaN(majorVersion)) {
    fullVersion = '' + parseFloat(navigator.appVersion)
    majorVersion = parseInt(navigator.appVersion, 10)
  }

  return {
    browserName,
    fullVersion,
    majorVersion,
    appName: navigator.appName,
    userAgent: navigator.userAgent,
  }
}

// eslint-disable-next-line require-jsdoc
function getGPUDesc() {
  let webgl
  try {
    webgl = document.createElement('canvas').getContext('webgl')
  } catch (e) {}
  if (!webgl) return
  let webgl2
  try {
    webgl2 = document.createElement('canvas').getContext('webgl2')
  } catch (e) {}

  const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info')
  if (!debugInfo) {
    console.warn('Unable to determine GPU Info:')
    return {
      vendor: 'Unknown',
      renderer: 'Unknown',
      gpuVendor: 'Unknown',
      maxTextureSize: 'Unknown',
      supportsWebGL2: webgl2 != undefined,
    }
  }

  const vendor = webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
  const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
  const maxTextureSize = webgl.getParameter(webgl.MAX_TEXTURE_SIZE)
  let gpuVendor
  if (renderer.match(/NVIDIA/i)) {
    gpuVendor = 'NVidia'
  } else if (renderer.match(/AMD/i) || renderer.match(/Radeon/i)) {
    gpuVendor = 'AMD'
  } else if (renderer.match(/Intel/i)) {
    gpuVendor = 'Intel'
  } else if (renderer.match(/Mali/i)) {
    gpuVendor = 'ARM'
  } else if (renderer.match(/Apple/i)) {
    gpuVendor = 'Apple'
  } else if (renderer.match(/Adreno/i)) {
    gpuVendor = 'Adreno'
  } else if (renderer.match(/Google Swiftshader/i)) {
    gpuVendor = 'Google'
  } else {
    console.warn('Unable to determine GPU vendor:', renderer)
  }

  return {
    vendor,
    renderer,
    gpuVendor,
    maxTextureSize,
    supportsWebGL2: webgl2 != undefined,
  }
}

const SystemDesc = (function () {
  if (!globalThis.navigator) {
    // When running in NodeJS
    return {
      isMobileDevice: false,
      isIOSDevice: false,
      browserName: 'Node',
      webGLSupported: false,
      gpuDesc: null,
      deviceCategory: 'High',
      hardwareConcurrency: 4,
    }
  }
  const isMobile = isMobileDevice()
  const browserDesc = getBrowserDesc()
  const gpuDesc = getGPUDesc()

  let deviceCategory = 'Low'
  if (gpuDesc) {
    // We divide devices into 3 categories.
    // 0: low end, we dial everything down as much as possible
    // 1: mid-range, Enb maps and Textures go to mid-lods.
    //    Typically these devices are laptops, so the textures can't be too blurry
    // 2: High-end: turn up as much as needed.
    if (!isMobile) {
      // Remove braces and split into parts
      const parts = gpuDesc.renderer.replace(/[()]/g, '').split(' ')
      if (gpuDesc.gpuVendor == 'NVidia') {
        const gtxIdx = parts.indexOf('GTX')
        if (gtxIdx != -1) {
          const model = parts[gtxIdx + 1]
          if (model.endsWith('M')) {
            // laptop GPU.
            const modelNumber = parseInt(model.substring(0, model.length - 2))
            if (modelNumber >= 900) {
              deviceCategory = 'Medium'
            } else {
              deviceCategory = 'Low'
            }
          } else {
            const modelNumber = parseInt(model)
            if (modelNumber >= 1030) {
              deviceCategory = 'High'
            } else {
              deviceCategory = 'Medium'
            }
          }
        } else {
          if (parts.includes('RTX') || parts.includes('TITAN') || parts.includes('Quadro')) {
            deviceCategory = 'High'
          } else {
            deviceCategory = 'Low'
          }
        }
      } else if (gpuDesc.gpuVendor == 'AMD') {
        const radeonIdx = parts.indexOf('Radeon')
        if (radeonIdx != -1) {
          const rxIdx = parts.indexOf('RX')
          if (rxIdx != -1) {
            if (parts[rxIdx + 1] == 'Vega') {
              deviceCategory = 'High'
            } else {
              const model = parts[rxIdx + 1]
              let modelNumber
              if (model.endsWith('X')) {
                modelNumber = parseInt(model.substring(0, model.length - 2))
                deviceCategory = 'High'
              } else {
                modelNumber = parseInt(model)
              }

              if (modelNumber >= 480) {
                deviceCategory = 'High'
              } else {
                deviceCategory = 'Medium'
              }
            }
          } else if (parts[radeonIdx + 1] == 'Pro') {
            const modelNumber = parseInt(parts[rxIdx + 1])
            if (modelNumber >= 450) {
              deviceCategory = 'Medium'
            } else {
              deviceCategory = 'Low'
            }
          } else if (parts[radeonIdx + 1] == 'Sky') {
            const modelNumber = parseInt(parts[rxIdx + 1])
            if (modelNumber >= 700) {
              deviceCategory = 'Medium'
            } else {
              deviceCategory = 'Low'
            }
          } else {
            deviceCategory = 'Low'
          }
        } else {
          if (parts.includes('FirePro') || parts.includes('Quadro')) {
            deviceCategory = 'High'
          } else {
            deviceCategory = 'Low'
          }
        }
      } else if (gpuDesc.gpuVendor == 'Adreno') {
        deviceCategory = 'Low'
      } else if (gpuDesc.gpuVendor == 'Intel') {
        deviceCategory = 'Low'
      } else if (gpuDesc.gpuVendor == 'Google') {
        deviceCategory = 'Low'
      }
    } else {
      deviceCategory = 'Low'
    }
  }

  let hardwareConcurrency = globalThis.navigator.hardwareConcurrency
  if (!hardwareConcurrency) {
    if (isMobile) hardwareConcurrency = 4
    else hardwareConcurrency = 6
  }

  return {
    isMobileDevice: isMobile,
    isIOSDevice: isIOSDevice(),
    browserName: browserDesc.browserName,
    fullVersion: browserDesc.fullVersion,
    majorVersion: browserDesc.majorVersion,
    appName: browserDesc.appName,
    userAgent: browserDesc.userAgent,
    webGLSupported: gpuDesc != undefined,
    gpuDesc,
    deviceCategory,
    hardwareConcurrency,
  }
})()

if (!globalThis.ZeaSystemDesc) {
  globalThis.ZeaSystemDesc = SystemDesc
}

export { SystemDesc }
