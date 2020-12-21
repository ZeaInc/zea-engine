/* eslint-disable guard-for-in */
import { Color } from '../../Math/index';
import { BooleanParameter, NumberParameter, ColorParameter, StringParameter } from '../Parameters/index';
import { Registry } from '../../Registry';
import { DataImage } from './DataImage.js';
import { labelManager } from './LabelManager.js';
// http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x - The top left x coordinate
 * @param {Number} y - The top left y coordinate
 * @param {Number} width - The width of the rectangle
 * @param {Number} height - The height of the rectangle
 * @param {Number} [radius = 5] - The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] - Top left
 * @param {Number} [radius.tr = 0] - Top right
 * @param {Number} [radius.br = 0] - Bottom right
 * @param {Number} [radius.bl = 0] - Bottom left
 * @param {Boolean} [fill = false] - Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] - Whether to stroke the rectangle.
 * @param {Number} [strokeWidth] - The strokeWidth param.
 * @private
 */
function roundRect(ctx: any, x: any, y: any, width: any, height: any, radius: any, fill: any, stroke: any, strokeWidth: any) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {
            tl: radius,
            tr: radius,
            br: radius,
            bl: radius,
        };
    }
    else {
        const defaultRadius = {
            tl: 0,
            tr: 0,
            br: 0,
            bl: 0,
        };
        for (const side in defaultRadius) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }
}
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
    __canvasElem: any;
    __getLabelText: any;
    __needsRender: any;
    __requestedRerender: any;
    /**
     * Creates a label instance. Creating a canvas element that hosts the specified text.
     *
     * @param {string} name - The name value.
     * @param {string} library - The library value.
     */
    constructor(name: any, library: any) {
        super(name);
        this.__canvasElem = document.createElement('canvas');
        const fontSize = 22;
        const libraryParam = this.addParameter(new StringParameter('Library'));
        this.addParameter(new StringParameter('Text', ''));
        // or load the label when it is loaded.
        // const setLabelTextToLibrary = ()=>{
        //     const library = libraryParam.getValue();
        //     const name = this.getName();
        //     const text = textParam.getValue();
        //     labelManager.setLabelTextToLibrary(library, name, text);
        // }
        // textParam.on('valueChanged', setLabelText);
        this.addParameter(new ColorParameter('FontColor', new Color(0, 0, 0)));
        // this.addParameter(new StringParameter('TextAlign', 'left'))
        // this.addParameter(MultiChoiceParameter('TextAlign', 0, ['left', 'right']));
        // this.addParameter(new BooleanParameter('FillText', true))
        this.addParameter(new NumberParameter('Margin', fontSize * 0.5));
        this.addParameter(new NumberParameter('BorderWidth', 2));
        this.addParameter(new NumberParameter('BorderRadius', fontSize * 0.5));
        this.addParameter(new BooleanParameter('Outline', false));
        this.addParameter(new BooleanParameter('OutlineColor', new Color(0, 0, 0)));
        this.addParameter(new BooleanParameter('Background', true));
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '"#FBC02D"' is not assignable to ... Remove this comment to see the full error message
        this.addParameter(new ColorParameter('BackgroundColor', new Color('#FBC02D')));
        this.addParameter(new BooleanParameter('FillBackground', true));
        this.addParameter(new BooleanParameter('StrokeBackgroundOutline', true));
        this.addParameter(new NumberParameter('FontSize', 22));
        this.addParameter(new StringParameter('Font', 'Helvetica'));
        const reload = () => {
            this.loadLabelData();
        };
        this.on('nameChanged', reload);
        if (library)
            libraryParam.setValue(library);
        this.__requestedRerender = false;
        this.__needsRender = false;
        this.loadLabelData();
    }
    /**
     * This method can be overridden in derived classes
     * to perform general updates (see GLPass or BaseItem).
     *
     * @param {object} event - The event object.
     * @private
     */
    __parameterValueChanged(event: any) {
        super.__parameterValueChanged(event);
        if (!this.__requestedRerender) {
            this.__requestedRerender = true;
            this.loadLabelData();
        }
    }
    /**
     * Method in charge of basically do everything, set text, load/update it, get the library, load the font, etc.
     */
    loadLabelData() {
        const onLoaded = () => {
            this.__requestedRerender = false;
            this.__needsRender = true;
            if (!this.__loaded) {
                this.__loaded = true;
                this.emit('loaded', {});
            }
            else {
                this.emit('updated', {});
            }
        };
        const loadText = () => {
            return new Promise((resolve) => {
                const library = this.getParameter('Library').getValue();
                if (library == '') {
                    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                    resolve();
                    return;
                }
                if (!labelManager.isLibraryFound(library)) {
                    console.warn('Label Libary not found:', library);
                    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                    resolve();
                    return;
                }
                const getLibraryText = () => {
                    try {
                        const name = this.getName();
                        // console.log("Text Loaded:" + name);
                        const text = labelManager.getLabelText(library, name);
                        this.getParameter('Text').setValue(text);
                    }
                    catch (e) {
                        // Note: if the text is not found in the labels pack
                        // an exception is thrown, and we catch it here.
                        console.warn(e);
                    }
                    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                    resolve();
                };
                if (!labelManager.isLibraryLoaded(library)) {
                    labelManager.on('labelLibraryLoaded', (event: any) => {
                        const loadedLibrary = event.library;
                        if (loadedLibrary == library)
                            getLibraryText();
                    });
                }
                else {
                    getLibraryText();
                }
            });
        };
        const loadFont = () => {
            return new Promise((resolve) => {
                if ((document as any).fonts != undefined) {
                    const font = this.getParameter('Font').getValue();
                    const fontSize = this.getParameter('FontSize').getValue();
                    (document as any).fonts.load(fontSize + 'px "' + font + '"').then(() => {
                        // console.log("Font Loaded:" + font);
                        // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                        resolve();
                    });
                }
                else {
                    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                    resolve();
                }
            });
        };
        Promise.all([loadText(), loadFont()]).then(onLoaded);
    }
    /**
     * Renders the label text to a canvas element ready to display.
     * Here is where all parameters are applied to the canvas containing the text,
     * then the image data is extracted from the canvas context.
     */
    renderLabelToImage() {
        // console.log("renderLabelToImage")
        const ctx2d = this.__canvasElem.getContext('2d', {
            alpha: true,
        });
        let text = this.getParameter('Text').getValue();
        if (text == '')
            text = this.getName();
        const font = this.getParameter('Font').getValue();
        const fontColor = this.getParameter('FontColor').getValue();
        const textAlign = 'left'; // this.getParameter('TextAlign').getValue()
        const fontSize = this.getParameter('FontSize').getValue();
        const margin = this.getParameter('Margin').getValue();
        const borderWidth = this.getParameter('BorderWidth').getValue();
        const borderRadius = this.getParameter('BorderRadius').getValue();
        const outline = this.getParameter('Outline').getValue();
        const outlineColor = this.getParameter('OutlineColor').getValue();
        const background = this.getParameter('Background').getValue();
        const backgroundColor = this.getParameter('BackgroundColor').getValue();
        const fillBackground = this.getParameter('FillBackground').getValue();
        const strokeBackgroundOutline = this.getParameter('StrokeBackgroundOutline').getValue();
        // let ratio = devicePixelRatio / backingStoreRatio;
        const marginAndBorder = margin + borderWidth;
        const lines = text.split('\n');
        ctx2d.font = fontSize + 'px "' + font + '"';
        // console.log("renderLabelToImage:" + ctx2d.font);
        let width = 0;
        lines.forEach((line: any) => {
            width = Math.max(ctx2d.measureText(line).width, width);
        });
        const fontHeight = fontSize; // parseInt(fontSize)
        this.width = Math.ceil(width + marginAndBorder * 2);
        this.height = Math.ceil(fontHeight * lines.length + marginAndBorder * 2);
        ctx2d.canvas.width = this.width;
        ctx2d.canvas.height = this.height;
        this.__canvasElem.width = this.width;
        this.__canvasElem.height = this.height;
        // ctx2d.clearRect(0, 0, this.width, this.height);
        ctx2d.fillStyle = 'rgba(0, 0, 0, 0.0)';
        ctx2d.fillRect(0, 0, this.width, this.height);
        if (background) {
            ctx2d.fillStyle = backgroundColor.toHex();
            ctx2d.strokeStyle = outlineColor.toHex();
            roundRect(ctx2d, borderWidth, borderWidth, this.width - borderWidth * 2, this.height - borderWidth * 2, borderRadius, fillBackground, strokeBackgroundOutline, borderWidth);
        }
        ctx2d.font = fontSize + 'px "' + font + '"';
        ctx2d.textAlign = textAlign;
        ctx2d.fillStyle = fontColor.toHex();
        ctx2d.textBaseline = 'hanging';
        lines.forEach((line: any, index: any) => {
            ctx2d.fillText(line, marginAndBorder, marginAndBorder + index * fontHeight);
        });
        if (outline) {
            ctx2d.strokeStyle = outlineColor.toHex();
            ctx2d.lineWidth = 1.5;
            ctx2d.strokeText(text, marginAndBorder, marginAndBorder);
        }
        this.__data = ctx2d.getImageData(0, 0, this.width, this.height);
        this.__needsRender = false;
        this.emit('labelRendered', {
            width: this.width,
            height: this.height,
            data: this.__data,
        });
    }
    /**
     *  Returns all parameters and class state values(Including data).
     *
     * @return {object} - The return value.
     */
    getParams() {
        if (this.__needsRender)
            this.renderLabelToImage();
        return super.getParams();
    }
    // ////////////////////////////////////////
    // Persistence
    /**
     * The toJSON method encodes this type as a json object for persistence.
     *
     * @param {object} context - The context value.
     * @return {object} - Returns the json object.
     */
    toJSON(context: any) {
        const j = super.toJSON(context);
        return j;
    }
    /**
     * The fromJSON method decodes a json object for this type.
     *
     * @param {object} j - The json object this item must decode.
     * @param {object} context - The context value.
     */
    fromJSON(j: any, context: any) {
        super.fromJSON(j, context);
        this.__getLabelText();
    }
}
Registry.register('Label', Label);
export { Label };
