/* eslint-disable guard-for-in */
import { StringParameter } from '../Parameters/index'
import Registry from '../../Registry'
import { DataImage } from './DataImage.js'
import { labelManager } from './LabelManager.js'

/**
 * Represents a 2D label item the scene.
 * Since displaying text in the scene is not an easy task,
 * we've abstracted the complicated logic behind this class, transforming any text into a 2D image(`DataImage`).
 *
 * **Library List**
 * * LabelPack
 *
 * **Parameters**
 * * **Library(`StringParameter`):** Library you wan to use for your label, see **Library List** above.
 * * **Text(`StringParameter`):**
 * * **FontColor(`ColorParameter`):**
 * * **Margin(`NumberParameter`):**
 * * **BorderWidth(`NumberParameter`):**
 * * **BorderRadius(`NumberParameter`):**
 * * **Outline(`BooleanParameter`):**
 * * **OutlineColor(`BooleanParameter`):**
 * * **Background(`BooleanParameter`):**
 * * **ColorParameter(`BackgroundColor`):**
 * * **FillBackground(`BooleanParameter`):**
 * * **StrokeBackgroundOutline(`BooleanParameter`):**
 * * **FontSize(`NumberParameter`):** Represents FontSize of the label
 * * **Font(`StringParameter`):**
 *
 * **Events**
 * * **loaded:** Triggered when label's data is loaded.
 * * **updated:** Triggered when label's data changes.
 * * **labelRendered:** Triggered when the text image is rendered. Contains `width`, `height` and data of the image.
 *
 * @extends DataImage
 */
class Label extends DataImage {
  /**
   * Creates a label instance. Creating a canvas element that hosts the specified text.
   *
   * @param {string} name - The name value.
   * @param {string} library - The library value.
   */
  constructor(name, library) {
    super(name)

    this.__canvasElem = document.createElement('canvas')

    const libraryParam = this.addParameter(new StringParameter('Library'))
    this.addParameter(new StringParameter('Content', ''))

    const reload = () => {
      this.loadLabelData()
    }
    this.on('nameChanged', reload)

    if (library) libraryParam.setValue(library)

    this.__requestedRerender = false
    this.__needsRender = false
    this.loadLabelData()
  }

  /**
   * This method can be overridden in derived classes
   * to perform general updates (see GLPass or BaseItem).
   *
   * @param {object} event - The event object.
   * @private
   */
  __parameterValueChanged(event) {
    super.__parameterValueChanged(event)
    if (!this.__requestedRerender) {
      this.__requestedRerender = true
      this.loadLabelData()
    }
  }

  /**
   * Method in charge of basically doing everything, set text,
   * load/update it, get the library, load the font, etc.
   */
  loadLabelData() {
    const loadText = () => {
      return new Promise((resolve) => {
        const library = this.getParameter('Library').getValue()

        if (!library) {
          resolve()
          return
        }

        if (!labelManager.isLibraryFound(library)) {
          throw new Error(`Label libary not found: ${library}`)
        }

        const getLibraryText = () => {
          try {
            const content = labelManager.getLabelContent(library, this.getName())
            this.getParameter('Content').setValue(content)
          } catch (e) {
            // Note: if the text is not found in the labels pack
            // an exception is thrown, and we catch it here.
            console.warn(e)
          } finally {
            resolve()
          }
        }

        if (!labelManager.isLibraryLoaded(library)) {
          labelManager.on('labelLibraryLoaded', (event) => {
            const loadedLibrary = event.library
            if (loadedLibrary == library) getLibraryText()
          })
        } else {
          getLibraryText()
        }
      })
    }

    const onLoaded = () => {
      this.__requestedRerender = false
      this.__needsRender = true

      if (this.__loaded) {
        this.emit('updated', {})
        return
      }

      this.__loaded = true
      this.emit('loaded', {})
    }

    loadText().then(onLoaded)
  }

  /**
   * Renders the label text to a canvas element ready to display.
   * Here is where all parameters are applied to the canvas containing the text,
   * then the image data is extracted from the canvas context.
   */
  renderLabelToImage() {
    if (!Label.domToImageDep) {
      throw new Error('Missing "DOM to image" dependency. Did you call `Label.setDomToImageDep`?')
    }

    const content = this.getParameter('Content').getValue()
    const element = document.createElement('div')
    element.innerHTML = `<div>${content}</div>`
    document.body.appendChild(element)

    Label.domToImageDep.toPng(element).then((dataUrl) => {
      this.__data = dataUrl
      const img = new Image()
      img.src = dataUrl

      this.__data = img
      if (!this.__loaded) {
        this.__loaded = true
        this.emit('loaded')
      } else {
        this.emit('updated')
      }

      document.body.removeChild(element)
    })
  }

  /**
   *  Returns all parameters and class state values(Including data).
   *
   * @return {object} - The return value.
   */
  getParams() {
    if (this.__needsRender) this.renderLabelToImage()
    return super.getParams()
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const j = super.toJSON(context)
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    super.fromJSON(j, context)
    this.__getLabelText()
  }
}

Label.setDomToImageDep = (dep) => {
  Label.domToImageDep = dep
}

Registry.register('Label', Label)

export { Label }
