/* eslint-disable require-jsdoc */
import { Registry } from '../../Registry';
import { SystemDesc } from '../../SystemDesc.js';
import { NumberParameter } from '../Parameters/index';
import { FileImage } from './FileImage.js';
const supportWebp = window.navigator && navigator.userAgent.includes('Chrome');
/**
 * Class representing a LDR (low dynamic range) image.
 *
 * ```
 * const image = new LDRImage()
 * image.getParameter('FilePath').setUrl("https://storage.googleapis.com/zea-playground-assets/zea-engine/texture.png")
 * ```
 *
 * **Parameters**
 * * **PreferredSize(`NumberParameter`):** _todo_
 *
 * **Events:**
 * * **loaded:** Triggered when image data is loaded.
 *
 * **File Types:** jpg, jpeg, png
 *
 * @extends FileImage
 */
class LDRImage extends FileImage {
    __crossOrigin: any;
    /**
     * Create a LDR image.
     * @param {string} name - The name value.
     * @param {string} filePath - The filePath value.
     * @param {object} params - The params value.
     */
    constructor(name: any, filePath: any, params: any) {
        super(name, filePath, params);
        this.type = 'UNSIGNED_BYTE';
        this.addParameter(new NumberParameter('PreferredSize', -1));
        this.__crossOrigin = 'anonymous';
    }
    /**
     * Defines how to handle cross origin request.
     *
     * **Possible values:**
     * * **anonymous** - CORS requests for this element will have the credentials flag set to 'same-origin'.
     * * **use-credentials** - CORS requests for this element will have the credentials flag set to 'include'.
     * * **""** - Setting the attribute name to an empty value, like crossorigin or crossorigin="", is the same as anonymous.
     *
     * @default anonymous
     * @param {string} crossOrigin - The crossOrigin value.
     */
    setCrossOrigin(crossOrigin: any) {
        this.__crossOrigin = crossOrigin;
    }
    /**
     * The __loadData method.
     * @param {object} fileDesc - The fileDesc value.
     * @private
     */
    // @ts-expect-error ts-migrate(2416) FIXME: Property '__loadData' in type 'LDRImage' is not as... Remove this comment to see the full error message
    __loadData(fileDesc: any) {
        const ext = this.getParameter('FilePath').getExt();
        const format = 'RGB';
        if (ext == '.png') {
            this.format = 'RGBA';
        }
        let url = fileDesc.url;
        if (fileDesc.assets && Object.keys(fileDesc.assets).length > 0) {
            // @ts-expect-error ts-migrate(1251) FIXME: Function declarations are not allowed inside block... Remove this comment to see the full error message
            function chooseImage(params: any, filterAssets: any) {
                // Note: this is a filter to remove any corrupt data
                // generate by our broken server side processing system.
                filterAssets = filterAssets.filter((asset: any) => asset !== null);
                if (supportWebp) {
                    const resultFilter = filterAssets.filter((asset: any) => asset.format === 'webp');
                    if (resultFilter.length > 1) {
                        filterAssets = resultFilter;
                    }
                }
                else {
                    filterAssets = filterAssets.filter((asset: any) => asset.format !== 'webp');
                }
                if (params.maxSize) {
                    filterAssets = filterAssets.filter((asset: any) => asset.w <= params.maxSize);
                }
                if (params.filter) {
                    const resultFilter = filterAssets.filter((asset: any) => asset.url.includes(params.filter));
                    if (resultFilter.length > 1) {
                        filterAssets = resultFilter;
                    }
                }
                if (params.prefSize) {
                    filterAssets = filterAssets.map((asset: any) => Object.assign({
                        score: Math.abs(params.prefSize - asset.w),
                    }, asset));
                    // return low score, close to desire
                    // return _.sortBy(score, "score")[0].option.url;
                    filterAssets.sort((a: any, b: any) => (a.score > b.score ? 1 : a.score < b.score ? -1 : 0));
                }
                if (filterAssets.length > 0)
                    return filterAssets[0];
            }
            const params = {
                // @ts-expect-error ts-migrate(2533) FIXME: Object is possibly 'null' or 'undefined'.
                maxSize: SystemDesc.gpuDesc.maxTextureSize,
            };
            const prefSize = this.getParameter('PreferredSize').getValue();
            if (prefSize == -1) {
                if (fileDesc.assets.reduce)
                    (params as any).prefSize = fileDesc.assets.reduce.w;
            }
            else {
                (params as any).prefSize = prefSize;
            }
            const asset = chooseImage(params, Object.values(fileDesc.assets));
            if (asset) {
                console.log('Selected image:' +
                    fileDesc.name +
                    ' format:' +
                    asset.format +
                    ' :' +
                    asset.w +
                    'x' +
                    asset.h +
                    ' url:' +
                    asset.url);
                url = asset.url;
            }
        }
        else {
            console.warn('Images not processed for this file:' + fileDesc.name);
        }
        this.setImageURL(url, format);
    }
    /**
     * Uses the specify url to load an Image element and adds it to the data library.
     * Sets the state of the current object.
     *
     * @param {string} url - The url value.
     * @param {string} format - The format value.
     */
    setImageURL(url: any, format = 'RGB') {
        if (!format) {
            const suffixSt = url.lastIndexOf('.');
            if (suffixSt != -1) {
                const ext = url.substring(suffixSt).toLowerCase();
                if (ext == '.png') {
                    format = 'RGBA';
                }
            }
        }
        this.format = format;
        this.__loaded = false;
        let imageElem: any;
        const loaded = () => {
            this.getDOMElement = () => {
                return imageElem;
            };
            this.width = imageElem.width;
            this.height = imageElem.height;
            this.__data = imageElem;
            this.__loaded = true;
            this.emit('loaded', {});
        };
        const imageDataLibrary = FileImage.__imageDataLibrary();
        if (url in imageDataLibrary) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            imageElem = imageDataLibrary[url];
            if (imageElem.complete) {
                loaded();
            }
            else {
                imageElem.addEventListener('load', loaded);
            }
        }
        else {
            imageElem = new Image();
            imageElem.crossOrigin = this.__crossOrigin;
            imageElem.src = url;
            imageElem.addEventListener('load', loaded);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            imageDataLibrary[url] = imageElem;
        }
    }
}
FileImage.registerLoader('jpg|jpeg|png', LDRImage);
Registry.register('LDRImage', LDRImage);
export { LDRImage };
