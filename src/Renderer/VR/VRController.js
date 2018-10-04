import {
    SystemDesc
} from '../../BrowserDetection.js';
import {
    Vec3,
    Quat,
    EulerAngles,
    Xfo,
    Color
} from '../../Math';
import {
    Signal
} from '../../Utilities';
import {
    Lines,
    Plane,
    Sphere,
    GeomItem,
    TreeItem,
    Material,
    DataImage
} from '../../SceneTree';
import {
    GLMesh
} from '../GLMesh.js';
import {
    Gizmo
} from '../Gizmos/Gizmo.js';

class VRController extends Gizmo {
    constructor(vrstage, index) {
        super(new Color(0, 0, 1));

        this.__vrstage = vrstage;
        this.__index = index;
        this.__isDaydramController = SystemDesc.isMobileDevice;
        this.__treeItem = new TreeItem('VRController:' + index);
        // Controller coordinate system
        // X = Horizontal.
        // Y = Up.
        // Z = Towards handle base.

        this.__mat = new Material('mat1', 'FlatSurfaceShader');
        this.__mat.getParameter('BaseColor').setValue(new Color(.2, .2, .2, 1));


        if(!this.__isDaydramController) {
            // A Vive or Occulus Touch Controller
            
            /*
            Material:HandleMaterial
            Material:OtherButtons
            Material:Metal
            Material:Touchpad Material
            Material:Material #27
            */

            this.__vrstage.getTreeItem().addChild(this.__treeItem);

            const sphere = new Sphere(0.015);
            this.__sphereGeomItem = new GeomItem('VRControllerTip', sphere, this.__mat);
            this.__sphereGeomItem.setLocalXfo(0, new Xfo(new Vec3(0.0, -0.01, -0.015)));
            this.__treeItem.addChild(this.__sphereGeomItem);


            const asset = this.__vrstage.getAsset();
            if(asset) {
                asset.loaded.connect((entries) => {
                    const controllerTree = asset.getChildByName('HTC_Vive_Controller');
                    const idx = this.__treeItem.addChild(controllerTree);
                    controllerTree.setLocalXfo(idx, new Xfo(new Vec3(0, -0.035, 0.01), new Quat({ setFromAxisAndAngle: [new Vec3(0, 1, 0), Math.PI] })));
                });
            }

            // const uimat = new Material('uimat', 'FlatSurfaceShader');

            // this.__uiimage = new DataImage();
            // uimat.getParameter('BaseColor').setValue(this.__uiimage);

            // this.__uiGeomItem = new GeomItem('VRControllerUI', new Plane(), uimat);
            // this.__uiGeomItem.getLocalXfo().tr.set(0.0, -0.07, 0.05); 
            // this.__uiGeomItem.getLocalXfo().ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * -0.6);
            // this.__uiGeomItemGeomXfo = new Xfo();
            // this.__uiGeomItemGeomXfo.ori.setFromAxisAndAngle(new Vec3(0, 1, 0), -Math.PI);
            // this.__uiGeomItemGeomXfo.sc.set(0.3, 0.2, 1.0);
            // this.__uiGeomItem.setGeomOffsetXfo(this.__uiGeomItemGeomXfo)
            // this.__dims = { width: 200, height: 300 };
            // this.__uiGeomItem.setVisible(false);
            // this.__treeItem.addChild(this.__uiGeomItem);

            // let pointermat = new Material('pointermat', 'FlatSurfaceShader');
            // pointermat.getParameter('BaseColor').setValue(new Color(1.2, 0, 0));

            // let line = new Lines();
            // line.setNumVertices(2);
            // line.setNumSegments(1);
            // line.setSegment(0, 0, 1);
            // line.getVertex(0).set(0.0, 0.0, 0.0);
            // line.getVertex(1).set(0.0, 0.0, -1.0);
            // line.setBoundingBoxDirty();

            // this.__uiPointerItem = new GeomItem('VRControllerPointer', line, pointermat);
            // this.__uiPointerItem.getLocalXfo().tr.set(0.0, -0.08, -0.04);
            // this.__uiPointerItem.getLocalXfo().ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * -0.2);
            // this.__uiPointerItem.setVisible(false);
            // this.__treeItem.addChild(this.__uiPointerItem);
        }

        this.__touchpadPressed = false;
        this.touchpadTouched = new Signal();
        this.buttonPressed = new Signal();
        this.buttonReleased = new Signal();

        ///////////////////////////////////
        // UI
        this.showInHandUI = new Signal();
        this.hideInHandUI = new Signal();
        this.controllerMoved = new Signal();
        this.uivisibile = false;
        this.pointerVisible = false;

        ///////////////////////////////////
        // Xfo

        this.__xfo = new Xfo();

        // this.setVisible(true);
    }

    getID() {
        return this.__index;
    }

    getTreeItem() {
        return this.__treeItem;
    }

    setVisible(val) {
        // this.__geomItem0.setVisible(val);
        // this.__geomItem1.setVisible(val);
    }

    setTipColor(val) {
        this.__mat.getParameter('BaseColor').setValue(val);
    }

    update(gamepad) {
        if (gamepad.pose.position)
            this.__xfo.tr.setDataArray(gamepad.pose.position);
        if (gamepad.pose.orientation)
            this.__xfo.ori.setDataArray(gamepad.pose.orientation);

        if (!this.__treeItem)
            return;
        this.__treeItem.setLocalXfo(0, this.__xfo);

        ////////////////////////////////////////////
        /*
        let controllerUpVec = this.__treeItem.getGlobalXfo().ori.getYaxis();
        let vecToHead = this.__treeItem.getGlobalXfo().tr.subtract(this.__vrstage.getVRHead().getXfo().tr);
        vecToHead.normalizeInPlace();
        let angle = controllerUpVec.angleTo(vecToHead);
        if (angle < 1.0) {
            if (!this.uivisibile) {
                this.uivisibile = true;
                this.__uiGeomItem.setVisible(true);
                if (this.pointerVisible)
                    this.hidePointer();
                this.showInHandUI.emit();
            }

        } else {
            if (this.uivisibile) {
                this.hideInHandUI.emit();
                this.uivisibile = false;
                this.__uiGeomItem.setVisible(false);
            }
        }
        if (this.pointerVisible) {
            this.controllerMoved.emit(this.getPointerXfo());
        }
        */


        this.__touchpadValue = gamepad.axes;
        // Button 0 is the touchpad clicker.
        if (gamepad.buttons[0].pressed) {
            if (this.__isDaydramController) {
                if (!this.__buttonPressed) {
                    this.__buttonPressed = true;
                    this.buttonPressed.emit();
                }
                return;
            } else {
                if (gamepad.axes[0] != 0 && gamepad.axes[1] != 0 && !this.__touchpadPressed) {
                    this.touchpadTouched.emit(gamepad.axes);
                    this.__touchpadPressed = true;
                }
            }
        } else {
            this.__touchpadPressed = false;
        }

        // Button 0 is the touchpad clicker.
        for (let j = 1; j < gamepad.buttons.length; ++j) {
            if (gamepad.buttons[j].pressed) {
                if (!this.__buttonPressed) {
                    this.__buttonPressed = true;
                    // if(gamepad.buttons[j].value)
                    //     this.__geomglDrawItem1.color.setFromOther(this.__highlightedColor);
                    // else
                    //     this.__geomglDrawItem1.color.setFromOther(this.__tipColor);
                    this.buttonPressed.emit();
                }
                return;
            }
        }

        if (this.__buttonPressed) {
            this.__buttonPressed = false;
            // this.__geomglDrawItem1.color.setFromOther(this.__tipColor);
            this.buttonReleased.emit();
        }
    }

    getTouchPadValue() {
        return this.__touchpadValue;
    }

    isButtonPressed() {
        return this.__buttonPressed;
    }

    getTipXfo() {
        return this.__xfo;
    }

    getTipGlobalXfo() {
        return this.__treeItem.getGlobalXfo(0);
    }

    //////////////////////////////////
    // UI
    getUIPlaneXfo() {
        return this.__uiGeomItem.getGeomXfo();
    }
    showPointer() {
        if(this.__sphereGeomItem)
            this.__sphereGeomItem.setVisible(false);
        this.__uiPointerItem.setVisible(true);
        this.pointerVisible = true;
    }
    hidePointer() {
        if(this.__sphereGeomItem)
            this.__sphereGeomItem.setVisible(true);
        this.__uiPointerItem.setVisible(false);
        this.pointerVisible = false;
    }
    setPointerLength(length) {
        let xfo = this.__uiPointerItem.getLocalXfo();
        xfo.sc.set(1, 1, length);
        this.__uiPointerItem.setLocalXfo(xfo);
    }

    getUIDimensions() {
        return this.__dims;
    }

    setUIPixelData(width, height, pixels) {
        this.__dims = {
            width,
            height
        };
        let dpm = 0.0005;//dots-per-meter (1 each 1/2mm)
        this.__uiGeomItemGeomXfo.sc.set(width*dpm, height*dpm, 1.0);
        this.__uiGeomItem.setGeomOffsetXfo(this.__uiGeomItemGeomXfo)
        this.__uiimage.setData(width, height, pixels);
    }

    getPointerXfo() {
        return this.__uiPointerItem.getGeomXfo();
    }

};

export {
    VRController
};