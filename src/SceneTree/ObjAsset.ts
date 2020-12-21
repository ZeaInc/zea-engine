/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
/* eslint-disable no-array-constructor */
import { Vec2, Vec3, Xfo, Color } from '../Math/index';
import { Async } from '../Utilities/index';
import { GeomItem } from './GeomItem';
import { AssetItem } from './AssetItem';
import { Mesh } from './Geometry/Mesh.js';
import { loadTextfile } from './Utils.js';
import { Material } from './Material.js';
import { resourceLoader } from './resourceLoader.js';
import { GeomLibrary } from './GeomLibrary.js';
import { MaterialLibrary } from './MaterialLibrary.js';
import { BooleanParameter, NumberParameter, StringParameter } from './Parameters/index';
import { FilePathParameter } from './Parameters/FilePathParameter';
// AssetItem.registerDataLoader('.obj', ObjDataLoader);
/**
 * Class designed to load and handle `.obj` files.
 * Which define the geometry and other properties for objects.
 *
 * **Parameters**
 * * **splitObjects(`BooleanParameter`):** _todo_
 * * **splitGroupsIntoObjects(`BooleanParameter`):** _todo_
 * * **loadMtlFile(`BooleanParameter`):** _todo_
 * * **unitsConversion(`NumberParameter`):** _todo_
 * * **defaultShader(`StringParameter`):** _todo_
 * * **ObjFilePath(`FilePathParameter`):** Used to specify the path to the file.
 *
 * **Events**
 * * **loaded:** Triggered once everything is loaded.
 * * **geomsLoaded:** Triggered once all geometries are loaded.
 *
 * @extends AssetItem
 */
class ObjAsset extends AssetItem {
    geomLibrary: any;
    geomsLoaded: any;
    materials: any;
    objfileParam: any;
    /**
     * Create an obj asset.
     * @param {string} name - The name of the object asset.
     */
    constructor(name: any) {
        super(name);
        // A signal that is emitted once all the geoms are loaded.
        // Often the state machine will activate the first state
        // when this signal emits.
        this.geomsLoaded = false;
        this.loaded = false;
        this.addParameter(new BooleanParameter('splitObjects', false));
        this.addParameter(new BooleanParameter('splitGroupsIntoObjects', false));
        this.addParameter(new BooleanParameter('loadMtlFile', true));
        this.addParameter(new NumberParameter('unitsConversion', 1.0));
        this.addParameter(new StringParameter('defaultShader', ''));
        this.objfileParam = this.addParameter(new FilePathParameter('FilePath'));
        this.objfileParam.on('valueChanged', () => {
            this.loaded = false;
            this.__loadObj(() => {
                this.emit('loaded', {});
            }, () => {
                this.emit('geomsLoaded', {});
            });
        });
        this.geomLibrary = new GeomLibrary();
        this.materials = new MaterialLibrary();
    }
    /**
     * Returns `GeomLibrary` object which hosts workers, buffers, streams and geometry objects.
     *
     * @return {GeomLibrary} - The return value.
     */
    getGeometryLibrary() {
        return this.geomLibrary;
    }
    /**
     * Returns `MaterialLibrary` object wich hosts images and `Material` objects.
     *
     * @return {MaterialLibrary} - The return value.
     */
    getMaterialLibrary() {
        return this.materials;
    }
    /**
     * The __loadObj method.
     * @param {function} onDone - The onDone value.
     * @param {function} onGeomsLoaded - The onGeomsLoaded value.
     * @private
     */
    __loadObj(onDone: any, onGeomsLoaded: any) {
        const url = this.objfileParam.getUrl();
        const fileFolder = url.substring(0, url.lastIndexOf('/')) + '/';
        const filename = url.substring(url.lastIndexOf('/') + 1);
        const parseMtlData = (mtlFileData: any) => {
            const lines = mtlFileData.split('\n');
            const WHITESPACE_RE = /\s+/;
            let material;
            const parseColor = function (elements: any) {
                if (elements.length == 3)
                    return new Color(parseFloat(elements[0]), parseFloat(elements[1]), parseFloat(elements[2]));
                else
                    throw new Error('Unable to parse a color from the following parts:' + elements.join('_'));
            };
            const parseMap = (elements: any) => {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'FileImage'.
                return new FileImage(elements[0], fileFolder + elements[0]);
            };
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line.startsWith('#'))
                    continue;
                if (line.includes('#'))
                    line = line.substring(0, line.indexOf('#')).trim();
                const elements = line.split(WHITESPACE_RE);
                const key = elements.shift();
                const value = elements.join(' ');
                switch (key) {
                    case 'newmtl':
                        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                        material = new Material(value);
                        material.setShaderName('StandardSurfaceShader');
                        this.materials.addMaterial(material);
                        break;
                    case 'Kd':
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        material.getParameter('BaseColor').setValue(parseColor(elements));
                        break;
                    case 'map_Kd':
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        material.getParameter('BaseColor').setValue(parseMap(elements));
                        break;
                    case 'Ks':
                        const specular = (parseFloat(elements[0]) + parseFloat(elements[1]) + parseFloat(elements[2])) / 3.0;
                        (material as any).roughness = 1.0 - specular;
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        material.getParameter('Roughness').setValue(1.0 - specular);
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        material.getParameter('Reflectance').setValue(specular);
                        break;
                    case 'map_Ks':
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        material.getParameter('Roughness').setValue(parseMap(elements /* flags=TEXTURE_INVERT */));
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        material.getParameter('Reflectance').setValue(0.2);
                        break;
                    case 'd':
                        const d = parseFloat(value);
                        if (d < 1.0) {
                            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                            material.setShaderName('TransparentSurfaceShader');
                            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                            material.getParameter('Opacity').setValue(d);
                        }
                        break;
                    case 'map_d':
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        material.getParameter('alpha').setValue(parseFloat(elements));
                        break;
                    case 'map_bump':
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        material.getParameter('normal').setValue(parseMap(elements /* flags=BUMP_TO_NORMAL */));
                        break;
                    default:
                    // console.warn("Unhandled material parameter: '" + key +"' in:" + filePath);
                }
            }
        };
        const async = new Async();
        async.incAsyncCount();
        async.on('ready', () => {
            buildChildItems();
        });
        const loadMtlFile = (mtlFile: any) => {
            return new Promise((resolve) => {
                loadTextfile(mtlFile.url, (fileData: any) => {
                    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'fileId'. Did you mean 'File'?
                    resourceLoader.addWorkDone(fileId, 1);
                    parseMtlData(fileData);
                    async.decAsyncCount();
                    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'fileId'. Did you mean 'File'?
                    resourceLoader.addWorkDone(fileId, 1);
                    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                    resolve();
                });
            });
        };
        const vertices = new Array();
        const normals = new Array();
        const texCoords = new Array();
        const geomDatas = {};
        const parseObjData = async (fileData: any) => {
            // performance.mark("parseObjData");
            // array of lines separated by the newline
            const lines = fileData.split('\n');
            const WHITESPACE_RE = /\s+/;
            let currGeom = undefined;
            let currMtl: any = undefined;
            const newGeom = (name: any) => {
                let suffix = 0;
                while (name in geomDatas) {
                    suffix++;
                    name = name + String(suffix);
                }
                currGeom = {
                    verticesRemapping: {},
                    texCoordsRemapping: {},
                    normalsRemapping: {},
                    vertexIndices: [],
                    texCoordIndices: [],
                    normalIndices: [],
                    numVertices: 0,
                    numTexCoords: 0,
                    numNormals: 0,
                    faceCounts: [],
                    material: currMtl,
                };
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                geomDatas[name] = currGeom;
            };
            newGeom(filename);
            const splitGroupsIntoObjects = this.getParameter('splitGroupsIntoObjects').getValue();
            const stop = false;
            // let numPolys = 0;
            for (let i = 0; i < lines.length && !stop; i++) {
                let line = lines[i].trim();
                if (line.startsWith('#'))
                    continue;
                if (line.includes('#'))
                    line = line.substring(0, line.indexOf('#')).trim();
                const elements = line.split(WHITESPACE_RE);
                const key = elements.shift();
                const value = elements.join(' ');
                switch (key) {
                    case '':
                    case 's':
                        // ignore shading groups
                        continue;
                    case 'mtllib':
                        if (!this.getParameter('loadMtlFile').getValue())
                            continue;
                        // Load and parse the mat lib.
                        async.incAsyncCount();
                        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'stem'.
                        resourceLoader.addWork(stem, 2);
                        // @ts-expect-error ts-migrate(2551) FIXME: Property 'resolveFilepath' does not exist on type ... Remove this comment to see the full error message
                        const mtlFile = resourceLoader.resolveFilepath(fileFolder + value);
                        if (mtlFile) {
                            await loadMtlFile(mtlFile);
                        }
                        break;
                    case 'o':
                        newGeom(value);
                        break;
                    case 'usemtl':
                        currMtl = value;
                        newGeom(value + Object.keys(geomDatas).length);
                        break;
                    case 'g':
                        if (splitGroupsIntoObjects)
                            newGeom(elements.join('_'));
                        break;
                    case 'v':
                        vertices.push(elements.map((i: any) => parseFloat(i)));
                        break;
                    case 'vt':
                        texCoords.push(elements.map((i: any) => parseFloat(i)));
                        break;
                    case 'vn':
                        normals.push(elements.map((i: any) => parseFloat(i)));
                        break;
                    case 'f': {
                        const v_poly = [];
                        const vt_poly = [];
                        const vn_poly = [];
                        for (let j = 0, eleLen = elements.length; j < eleLen; j++) {
                            // v/vt/vn
                            const indices = elements[j].split('/').map((i: any) => parseInt(i) - 1);
                            const v = indices[0];
                            // v_poly.push(v);
                            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                            let v_index = currGeom.verticesRemapping[v];
                            if (v_index == undefined) {
                                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                                v_index = currGeom.numVertices;
                                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                                currGeom.verticesRemapping[v] = v_index;
                                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                                currGeom.numVertices++;
                            }
                            v_poly.push(v_index);
                            if (indices.length > 1 && !isNaN(indices[1])) {
                                const vt = indices[1];
                                vt_poly.push(vt);
                            }
                            if (indices.length > 2 && !isNaN(indices[2])) {
                                const vn = indices[2];
                                vn_poly.push(vn);
                            }
                        }
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        currGeom.vertexIndices.push(v_poly);
                        if (vn_poly.length > 0)
                            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                            currGeom.normalIndices.push(vn_poly);
                        if (vt_poly.length > 0)
                            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                            currGeom.texCoordIndices.push(vt_poly);
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        if (currGeom.faceCounts[v_poly.length - 3] == undefined) {
                            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                            currGeom.faceCounts[v_poly.length - 3] = [];
                        }
                        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                        currGeom.faceCounts[v_poly.length - 3]++;
                        // numPolys++;
                        // if(numPolys == 16000)
                        //     stop = true;
                        break;
                    }
                    default: {
                        console.warn('Unhandled line:' + line);
                    }
                }
            }
            async.decAsyncCount();
        };
        const buildChildItems = () => {
            // performance.mark("parseObjDataDone");
            // performance.mark("buildObjTree");
            for (const geomName in geomDatas) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (geomDatas[geomName].numVertices == 0)
                    continue;
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                buildChildItem(geomName, geomDatas[geomName]);
            }
            // Done.
            onDone();
            onGeomsLoaded();
        };
        const buildChildItem = (geomName: any, geomData: any) => {
            const numVertices = geomData.numVertices;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
            const mesh = new Mesh(geomName);
            mesh.setFaceCounts(geomData.faceCounts);
            mesh.setNumVertices(numVertices);
            const positionsAttr = mesh.getVertexAttribute('positions');
            const unitsConversion = this.getParameter('unitsConversion').getValue();
            for (const vsrc in geomData.verticesRemapping) {
                const vtgt = geomData.verticesRemapping[vsrc];
                positionsAttr
                    .getValueRef(vtgt)
                    // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
                    .set(vertices[vsrc][0] * unitsConversion, vertices[vsrc][1] * unitsConversion, vertices[vsrc][2] * unitsConversion);
            }
            let normalsAttr;
            let texCoordsAttr;
            if (geomData.normalIndices.length > 0)
                normalsAttr = mesh.addVertexAttribute('normals', Vec3);
            if (geomData.texCoordIndices.length > 0)
                texCoordsAttr = mesh.addVertexAttribute('texCoords', Vec2);
            const loadedFaces = Array(geomData.faceCounts.length).fill(0);
            for (let i = 0; i < geomData.vertexIndices.length; i++) {
                const v_poly = geomData.vertexIndices[i];
                let faceId = 0;
                for (let j = 0; j < v_poly.length - 3; ++j) {
                    faceId += geomData.faceCounts[j];
                }
                faceId += loadedFaces[v_poly.length - 3];
                loadedFaces[v_poly.length - 3]++;
                mesh.setFaceVertexIndices(faceId, v_poly);
                // Set the texCoords and normals...
                if (normalsAttr) {
                    const vn_poly = geomData.normalIndices[i];
                    for (let j = 0; j < vn_poly.length; j++) {
                        const value = new Vec3(normals[vn_poly[j]][0], normals[vn_poly[j]][1], normals[vn_poly[j]][2]);
                        normalsAttr.setFaceVertexValue(faceId, j, value);
                    }
                }
                if (texCoordsAttr && geomData.texCoordIndices.length == geomData.vertexIndices.length) {
                    const vt_poly = geomData.texCoordIndices[i];
                    for (let j = 0; j < vt_poly.length; j++) {
                        const value = new Vec2(texCoords[vt_poly[j]][0], texCoords[vt_poly[j]][1]);
                        texCoordsAttr.setFaceVertexValue(faceId, j, value);
                    }
                }
            }
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Mesh' is not assignable to param... Remove this comment to see the full error message
            const geomItem = new GeomItem(geomName, mesh);
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'selectable' does not exist on type 'Geom... Remove this comment to see the full error message
            geomItem.selectable = true;
            // Move the transform of the geom item to the center of the geom.
            // This is so that transparent objects can render correctly, and the
            // transform gizmo becomes centered on each geom(for testing)
            const delta = mesh.getBoundingBox().center();
            {
                const offset = delta.negate();
                const positions = mesh.getVertexAttribute('positions');
                for (let i = 0; i < positions.length; i++)
                    positions.getValueRef(i).addInPlace(offset);
                mesh.setBoundingBoxDirty();
            }
            geomItem.getParameter('LocalXfo').setValue(new Xfo(delta));
            if (geomData.material != undefined && this.materials.hasMaterial(geomData.material)) {
                geomItem.getParameter('Material').setValue(this.materials.getMaterial(geomData.material));
            }
            else {
                const defaultShader = this.getParameter('defaultShader').getValue();
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                const material = new Material(geomName + 'mat');
                material.setShaderName(defaultShader != '' ? defaultShader : 'StandardSurfaceShader');
                this.materials.addMaterial(material);
                geomItem.getParameter('Material').setValue(material);
            }
            this.addChild(geomItem, false);
        };
        const loadObjData = () => {
            const fileId = this.objfileParam.getValue();
            resourceLoader.addWork(fileId, 2);
            loadTextfile(url, (fileData: any) => {
                resourceLoader.addWorkDone(fileId, 1);
                parseObjData(fileData);
                resourceLoader.addWorkDone(fileId, 1);
            });
        };
        loadObjData();
    }
}
export { ObjAsset };
