import { EventEmitter } from '../../Utilities/index'
import { loadTextfile, loadBinfile } from '../Utils.js'

const clean = (language) => {
  if (language.startsWith('en')) return 'En'
  else if (language.startsWith('es')) return 'Es'
  else if (language.startsWith('fr')) return 'Fr'
  else if (language.startsWith('gb') || language.startsWith('de')) return 'Gb'
  return language
}

const getLanguage = () => {
  if (!globalThis.navigator) {
    return 'en'
  }

  const searchParams = new URLSearchParams(window.location.search)

  if (searchParams.has('lang')) {
    return clean(searchParams.get('lang'))
  }

  const { navigator } = globalThis
  const browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage']
  let i
  let language

  // Support for HTML 5.1 "navigator.languages".
  if (Array.isArray(navigator.languages)) {
    for (i = 0; i < navigator.languages.length; i++) {
      language = navigator.languages[i]
      if (language && language.length) {
        return clean(language)
      }
    }
  }

  // Support for other well known properties in browsers.
  for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
    language = navigator[browserLanguagePropertyKeys[i]]
    if (language && language.length) {
      return clean(language)
    }
  }

  return null
}

const parseTsv = (text) => {
  const linesWithHeader = text.split('\n')
  const headers = linesWithHeader[0]
  const lines = linesWithHeader.slice(1)

  const languages = headers.split('\t').slice(1)

  const json = {}

  lines.forEach((line) => {
    const segments = line.split('\t')

    const labelId = segments[0]

    json[labelId] = {}

    languages.forEach((language, i) => {
      json[labelId][language] = segments[i + 1]
    })
  })

  return json
}

/** Class representing a label manager.
 * @private
 */
class LabelManager extends EventEmitter {
  /**
   * Create a label manager.
   */
  constructor() {
    super()
    this.__labelLibraries = {}

    this.__language = getLanguage()
    this.__foundLabelLibraries = []
  }

  /**
   * Load a label library into the manager.
   * @param {string} name - The name of the library.
   * @param {url} url - The URL of the library.
   */
  loadLibrary(name, url) {
    this.__foundLabelLibraries.push(name)

    if (name.endsWith('.labels')) {
      loadTextfile(url, (text) => {
        this.__labelLibraries[name] = JSON.parse(text)

        this.emit('labelLibraryLoaded', { library: name })
      })
    } else if (name.endsWith('.tsv')) {
      loadTextfile(url, (text) => {
        const json = parseTsv(text)
        this.__labelLibraries[name] = json

        this.emit('labelLibraryLoaded', { library: name })
      })
    } else if (name.endsWith('.xlsx')) {
      if (globalThis.navigator && !window.XLSX) {
        throw new Error('No "XLSX" library found.')
      }

      // Example taken from here:
      // https://stackoverflow.com/questions/8238407/how-to-parse-excel-file-in-javascript-html5
      // and here:
      // https://github.com/SheetJS/js-xlsx/tree/master/demos/xhr
      loadBinfile(url, (data) => {
        const unit8array = new Uint8Array(data)
        const workbook = XLSX.read(unit8array, {
          type: 'array',
        })
        const json = {}
        workbook.SheetNames.forEach(function (sheetName) {
          // Here is your object
          const rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])
          rows.forEach(function (row) {
            const identifier = row.Identifier
            delete row.Identifier
            json[identifier] = row
          })
        })

        this.__labelLibraries[name] = json

        this.emit('labelLibraryLoaded', { library: name })
      })
    }
  }

  /**
   * Checks if the library is found.
   * @param {string} name - The name of the library.
   * @return {boolean} - Returns true if the library is found.
   */
  isLibraryFound(name) {
    return this.__foundLabelLibraries.includes(name)
  }

  /**
   * Checks if the library is loaded.
   * @param {string} name - The name of the library.
   * @return {boolean} - Returns true if the library is loaded.
   */
  isLibraryLoaded(name) {
    return name in this.__labelLibraries
  }

  /**
   * The getLabelContent method.
   * @param {string} libraryName - The name of the library.
   * @param {string} labelName - The name of the label.
   * @return {string} - The return value.
   */
  getLabelContent(libraryName, labelName) {
    const library = this.__labelLibraries[libraryName]

    if (!library) {
      throw new Error(
        "LabelLibrary: '" +
          libraryName +
          "' not found in LabelManager. Found: [" +
          Object.keys(this.__labelLibraries) +
          ']'
      )
    }

    const label = library[labelName]

    if (!label) {
      throw new Error(
        "Label: '" +
          labelName +
          "' not found in LabelLibrary: '" +
          libraryName +
          "'. Found: [" +
          Object.keys(library) +
          ']'
      )
    }

    const labelText = label[this.__language]

    if (!labelText) {
      if (label['En']) return label['En']
      throw new Error("labelText: '" + language + "' not found in Label. Found: [" + Object.keys(label) + ']')
    }

    return labelText
  }

  /**
   * The setLabelText method.
   * @param {string} libraryName - The name of the library.
   * @param {string} labelName - The name of the label.
   * @param {string} labelText - The text of the label.
   */
  setLabelText(libraryName, labelName, labelText) {
    let library = this.__labelLibraries[libraryName]
    if (!library) {
      library = {}
      this.__labelLibraries[libraryName] = library
    }
    let label = library[labelName]
    if (!label) {
      label = {}
      library[labelName] = label
    }
    label[this.__language] = labelText
    // TODO: Push to server.
  }

  /**
   * Set the language.
   * @param {string} ln - Language key.
   */
  setLanguage(ln) {
    this.__language = ln
  }
}

const labelManager = new LabelManager()
export { labelManager }
