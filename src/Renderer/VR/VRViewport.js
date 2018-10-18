import {
    SystemDesc
} from '../../BrowserDetection.js';
import {
    Vec2,
    Vec3,
    Quat,
    Mat4,
    Xfo,
    Color,
    Ray
} from '../../Math';
import {
    Signal
} from '../../Utilities';
import {
    TreeItem,
    VLAAsset,
    resourceLoader
} from '../../SceneTree';
import {
    BaseViewport
} from '../BaseViewport.js';
import {
    GLFbo
} from '../GLFbo.js';
import {
    GLTexture2D
} from '../GLTexture2D.js';
import {
    VRHead
} from './VRHead.js'
import {
    VRController
} from './VRController.js'
import {
    VRToolMoveStage
} from './Tools/VRToolMoveStage.js'
import {
    VRToolHoldObjects
} from './Tools/VRToolHoldObjects.js'
import {
    VRMarkerpenTool
} from './Tools/VRMarkerpenTool.js'
import {
    VRFlyTool
} from './Tools/VRFlyTool.js'

class VRViewport extends BaseViewport {
    constructor(renderer, vrDisplay /*, width, height*/ ) {
        super(renderer);
        this.__vrDisplay = vrDisplay;

        //////////////////////////////////////////////
        // Resources

        if (!SystemDesc.isMobileDevice && resourceLoader.resourceAvailable("VisualiveEngine/Vive.vla")) {
            this.__viveAsset = renderer.getScene().loadCommonAssetResource("VisualiveEngine/Vive.vla");
            this.__viveAsset.loaded.connect(()=>{
                const materialLibrary = this.__viveAsset.getMaterialLibrary();
                const materialNames = materialLibrary.getMaterialNames();
                for(let name of materialNames) {
                    const material = materialLibrary.getMaterial(name, false);
                    if(material)
                        material.setShaderName('SimpleSurfaceShader');
                }
            });
        }

        //////////////////////////////////////////////
        // Viewport params
        this.__projectionMatriciesUpdated = false;
        this.__presentingRequested = false;
        this.__canvasSizeScale = new Vec2(1, 1);
        this.__frustumDim = new Vec2(1, 1);

        // These values are in meters.
        this.__far = 1024.0;
        this.__near = 0.1;
        this.__vrDisplay.depthNear = this.__near;
        this.__vrDisplay.depthFar = this.__far;

        //////////////////////////////////////////////
        // Tree
        this.setBackground(renderer.getViewport().getBackground());
        this.__frameData = new VRFrameData();

        this.__stageTreeItem = new TreeItem('VRStage');
        this.__stageTreeItem.setSelectable(false);
        this.__stageTreeItem.setVisible(false);
        this.__renderer.getCollector().addTreeItem(this.__stageTreeItem);

        // Construct the head geom and add it directly to the Gizmo pass.
        this.__vrhead = new VRHead(this.__renderer.gl, this.__stageTreeItem);

        this.__vrControllers = [];
        this.__vrTools = {};
        this.__vrToolNames = [];
        this.__currentTool = undefined;

        //////////////////////////////////////////////
        // UI
        this.__uivisibile = 0;

        //////////////////////////////////////////////
        // Xfos
        const xfo = new Xfo();
        xfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * 0.5);
        this.setXfo(xfo); // Reset the stage Xfo.

        this.__leftViewMatrix = new Mat4();
        this.__leftProjectionMatrix = new Mat4();
        this.__rightViewMatrix = new Mat4();
        this.__rightProjectionMatrix = new Mat4();


        //////////////////////////////////////////////
        // Signals
        this.showInHandUI = new Signal();
        this.hideInHandUI = new Signal();
        this.pointerEvent = new Signal();
        this.resized = new Signal();

        // Signals to abstract the user view.
        // i.e. when a user switches to VR mode, the signals
        // simply emit the new VR data.
        this.viewChanged = new Signal();
        this.presentingChanged = new Signal();

        // Stroke Signals
        this.actionStarted = new Signal();
        this.actionEnded = new Signal();
        this.actionOccuring = new Signal();

        this.controllerAdded = new Signal();

        //////////////////////////////////////////////
        // UI
        if (this.__vrDisplay.stageParameters &&
            this.__vrDisplay.stageParameters.sizeX > 0 &&
            this.__vrDisplay.stageParameters.sizeZ > 0) {} else {
            if (this.__vrDisplay.stageParameters) {
                console.warn("VRDisplay reported stageParameters, but stage size was 0. Using default size.");
            } else {
                console.warn("VRDisplay did not report stageParameters");
            }
        }

        //////////////////////////////////////////////
        // Events
        window.addEventListener('vrdisplaypresentchange', this.__onVRPresentChange.bind(this), false);
        window.addEventListener('vrdisplayactivate', this.startPresenting.bind(this), false);
        window.addEventListener('vrdisplaydeactivate', this.stopPresenting.bind(this), false);



        //////////////////////////////////////////////
        // Tools Setup
        if (SystemDesc.isMobileDevice) {
            this.__vrTools['FlyTool'] = new VRFlyTool(this, this.__vrhead, this.__vrControllers);

            this.selectTool('FlyTool');
        } else {
            this.__vrTools['VRToolMoveStage'] = new VRToolMoveStage(this, this.__vrhead, this.__vrControllers);
            this.__vrTools['VRToolHoldObjects'] = new VRToolHoldObjects(this, this.__vrhead, this.__vrControllers);
            this.__vrTools['Markerpen'] = new VRMarkerpenTool(this, this.__vrhead, this.__vrControllers);

            this.__vrToolNames.push('VRToolMoveStage');
            this.__vrToolNames.push('VRToolHoldObjects');
            this.__vrToolNames.push('Markerpen');

            let markerpenTool = this.__vrTools['Markerpen'];
            markerpenTool.strokeStarted.connect((data) => {
                this.actionStarted.emit(data);
            });
            markerpenTool.strokeEnded.connect((data) => {
                this.actionEnded.emit(data);
            });
            markerpenTool.strokeSegmentAdded.connect((data) => {
                this.actionOccuring.emit(data);
            });

            this.selectTool('VRToolMoveStage');
            this.__currentToolIndex = 0;
            //this.selectTool('VRToolHoldObjects');
        }

        // Start the update loop that then drives the VRHead + VRController transforms in the scene.
        //this.startContinuousDrawing();

        // TODO: Make mobile phones start presenting immedietly.
        // if(SystemDesc.isMobileDevice && this.__vrDisplay) {
        //     // Update the view usng the VR
        //     const frameData = this.__vrViewport.getFrameData();
        //     if(frameData.pose.orientation) {
        //         const xfo = this.__viewports[0].getCamera().getLocalXfo();
        //         if(frameData.pose.position)
        //             xfo.tr.setDataArray(frameData.pose.position);
        //         if(frameData.pose.orientation)
        //             xfo.ori.setDataArray(frameData.pose.orientation);
        //         this.__viewports[0].getCamera().setLocalXfo(xfo);
        //     }
        // }

    }

    getVRDisplay() {
        return this.__vrDisplay;
    }

    getName() {
        return this.__name;
    }
    getWidth() {
        return this.__width;
    }
    getHeight() {
        return this.__height;
    }

    getAsset() {
        return this.__viveAsset;
    }

    getTreeItem() {
        return this.__stageTreeItem;
    }

    getVRHead() {
        return this.__vrhead;
    }

    getXfo() {
        return this.__stageXfo;
        // return this.__stageTreeItem.getGlobalXfo();
    }

    setXfo(xfo) {
        this.__stageXfo = xfo;
        this.__stageTreeItem.setGlobalXfo(xfo);
        this.__stageMatrix = xfo.inverse().toMat4();
        // this.__stageMatrix.multiplyInPlace(this.__sittingToStandingMatrix);
        this.__stageScale = xfo.sc.x;
    }

    resize(width, height) {
        this.__canvasWidth = width;
        this.__canvasHeight = height;
        // TODO: Support adaptive scaling of the viewport size to
        // enable higher Fps in heavy scenes. If the Fps drops below
        // a certain threshold, we can drop the viewport resolution.
        this.__width = this.__canvasWidth * this.__canvasSizeScale.x;
        this.__height = this.__canvasHeight * this.__canvasSizeScale.y;

        if (this.__fbo) {
            this.__fwBuffer.resize(this.__width, this.__height);
            this.__fbo.resize();
        }
        this.resized.emit();
    }

    ////////////////////////////
    // Continuous Rendering

    __requestAnimationFrame(cb) {
        this.__vrDisplay.requestAnimationFrame(cb);
    }

    isContinuouslyDrawing() {
        return this.__continuousDrawing;
    }

    startContinuousDrawing() {
        this.__continuousDrawing = true;

        const onAnimationFrame = () => {
            if (this.__continuousDrawing)
                this.__vrDisplay.requestAnimationFrame(onAnimationFrame);
            this.__frameRequested = true;
            this.__renderer.draw();
        }
        this.__vrDisplay.requestAnimationFrame(onAnimationFrame);
    }

    stopContinuousDrawing() {
        this.__continuousDrawing = false;
    }

    ////////////////////////////
    // Presenting

    canPresent() {
        return this.__vrDisplay.capabilities.canPresent;
    }

    isPresenting() {
        return this.__vrDisplay.isPresenting;
    }

    startPresenting() {
        //if (this.__vrDisplay.capabilities.canPresent) {
        if (this.__presentingRequested) {
            return false;
        }

        this.__presentingRequested = true;
        this.__vrDisplay.requestPresent([{
            source: this.__renderer.getGLCanvas()
        }]).then(() => {
            this.__presentingRequested = false;
        }, (e) => {
            console.warn("requestPresent failed:" + e);
            this.__presentingRequested = true;
        });
        // } else {
        //     console.warn("VRViewport does not support presenting.");
        // }
    }

    stopPresenting() {
        if (!this.__vrDisplay.isPresenting)
            return;

        this.__stageTreeItem.setVisible(false);
        this.__vrDisplay.exitPresent().then(function() {}, function() {
            console.warn("exitPresent failed.");
        });
    }

    togglePresenting() {
        if (this.__vrDisplay.isPresenting)
            this.stopPresenting();
        else
            this.startPresenting();
    }

    getHMDCanvasSize() {
        return this.__hmdCanvasSize;
    }

    __onVRPresentChange() {
        if (this.__vrDisplay.isPresenting) {
            const leftEye = this.__vrDisplay.getEyeParameters("left");
            const rightEye = this.__vrDisplay.getEyeParameters("right");
            this.__hmdCanvasSize = [
                Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2,
                Math.max(leftEye.renderHeight, rightEye.renderHeight)
            ];

            this.__stageTreeItem.setVisible(true);

            if (SystemDesc.isMobileDevice) {
                const xfo = this.__renderer.getViewport().getCamera().getGlobalXfo().clone();
                const yaxis = xfo.ori.getYaxis();
                const up = new Vec3(0, 0, 1);
                const angle = yaxis.angleTo(up);
                if (angle > 0.0001) {
                    let axis = yaxis.cross(up);
                    let align = new Quat();
                    align.setFromAxisAndAngle(axis, angle);
                    xfo.ori = align.multiply(xfo.ori);
                }
                //    xfo.tr.y = 0;
                //}
                this.setXfo(xfo);
            }

            this.startContinuousDrawing();

            this.presentingChanged.emit(true);
        } else {

            this.stopContinuousDrawing();

            this.__stageTreeItem.setVisible(false);
            // this.__vrhead.setVisible(false);
            // for (let vrController of this.__vrControllers)
            //     vrController.setVisible(false);

            this.presentingChanged.emit(false);
        }

        this.__renderer.__onResize();
    }

    ////////////////////////////
    // Events
    onMouseDown(event) {
        return false;
    }
    onMouseUp(event) {
        return false;
    }
    onMouseMove(event) {
        return false;
    }

    onKeyPressed(key) {
        switch (key) {
            case "":
                if (this.__vrDisplay.isPresenting)
                    this.stopPresenting();
                return true;
        }
        return false;
    }

    onKeyDown(key) {
        return false;
    }

    onKeyUp(key) {
        console.log(key);
        return false;
    }

    ////////////////////////////
    // Controllers

    selectTool(name) {
        console.log("activateTool:" + name + " this.__currentTool:" + (this.__currentTool ? this.__currentTool.constructor.name : ""));
        if (this.__currentTool != this.__vrTools[name]) {
            this.__currentTool = this.__vrTools[name];
            this.__currentTool.activateTool();
        }
    }

    updateHeadAndControllers() {

        this.__vrhead.update(this.__frameData);

        const gamepads = navigator.getGamepads();
        let id = 0;
        for (let gamepad of gamepads) {
            // Skip the new broken controller that is showing up.(maybe not a vive controller??)
            if (gamepad && gamepad.pose) {
                if (!this.__vrControllers[id]) {
                    const vrController = new VRController(this, id);
                    vrController.touchpadTouched.connect((vals) => {
                        // Disabling Changing tools for now till it is solid.
                        // if (vals[1] > 0) {
                        //     this.__currentToolIndex = (this.__currentToolIndex + 1) % this.__vrToolNames.length;
                        // } else if (vals[1] < 0) {
                        //     this.__currentToolIndex--;
                        //     if (this.__currentToolIndex < 0)
                        //         this.__currentToolIndex = this.__vrToolNames.length - 1;
                        // }
                        // this.selectTool(this.__vrToolNames[this.__currentToolIndex]);
                    });

                    vrController.showInHandUI.connect(() => {
                        this.__currentTool.deactivateTool();
                        this.__uivisibile++;
                        for (let controller of this.__vrControllers) {
                            if (controller != vrController && !controller.uivisibile)
                                controller.showPointer();
                        }
                        this.showInHandUI.emit(id, vrController);
                    });
                    vrController.hideInHandUI.connect(() => {
                        this.__currentTool.activateTool();
                        this.__uivisibile--;
                        if (this.__uivisibile > 0) // switch to pointer mode.
                            vrController.showPointer();
                        else {
                            // Hide all pointers
                            for (let controller of this.__vrControllers) {
                                if (controller != vrController)
                                    controller.hidePointer();
                            }
                        }
                        this.hideInHandUI.emit(id, vrController);
                    });


                    const sendEventToVisibleUIs = (xfo, eventNames, args) => {
                        const pointervec = xfo.ori.getZaxis().negate();
                        const ray = new Ray(xfo.tr, pointervec);
                        for (let controller of this.__vrControllers) {
                            if (controller.uivisibile) {
                                const planeXfo = controller.getUIPlaneXfo();
                                const plane = new Ray(planeXfo.tr, planeXfo.ori.getZaxis());
                                const res = ray.intersectRayPlane(plane);
                                if (res <= 0) {
                                    vrController.setPointerLength(1.0);
                                    return;
                                }
                                const hitOffset = xfo.tr.add(pointervec.scale(res)).subtract(plane.start);
                                const x = hitOffset.dot(planeXfo.ori.getXaxis()) / planeXfo.sc.x;
                                const y = hitOffset.dot(planeXfo.ori.getYaxis()) / planeXfo.sc.y;
                                if (Math.abs(x) > 0.5 || Math.abs(y) > 0.5) {
                                    vrController.setPointerLength(1.0);
                                    return;
                                }
                                vrController.setPointerLength(res);
                                const dim = controller.getUIDimensions();
                                args.clientX = Math.round((x * dim.width) + (dim.width / 2));
                                args.clientY = Math.round((y * -dim.height) + (dim.height / 2));
                                for (let e of eventNames) {
                                    this.pointerEvent.emit(controller, e, args);
                                }
                            }
                        }
                    }
                    vrController.buttonPressed.connect(() => {
                        if (!vrController.pointerVisible)
                            return;
                        const xfo = vrController.getPointerXfo();
                        sendEventToVisibleUIs(xfo, ['mousedown'], {
                            button: 0
                        });
                    });

                    vrController.buttonReleased.connect(() => {
                        if (!vrController.pointerVisible)
                            return;
                        const xfo = vrController.getPointerXfo();
                        sendEventToVisibleUIs(xfo, ['mouseup', 'click'], {
                            button: 0
                        });
                    });

                    vrController.controllerMoved.connect((xfo) => {
                        if (!vrController.pointerVisible)
                            return;
                        sendEventToVisibleUIs(xfo, ['mousemove'], {});
                    });

                    this.__vrControllers[id] = vrController;
                    this.controllerAdded.emit(id, vrController);
                }
                // Update the controllers pose in space.
                this.__vrControllers[id].update(gamepad);
                id++;
            }
        }

        if (this.__uivisibile == 0 && this.__currentTool) {
            this.__currentTool.evalTool();
        }

        /////////////////////////
        // Emit a signal for the shared session.
        const data = {
            interfaceType: 'Vive',
            viewXfo: this.__vrhead.getTreeItem().getGlobalXfo(),
            controllers: []
        }
        for (let controller of this.__vrControllers) {
            data.controllers.push({
                xfo: controller.getTreeItem().getGlobalXfo()
            });
        }
        this.viewChanged.emit(data);
    }


    draw(renderstate) {
        if (!this.__frameRequested) {
            console.log("hey!!");
            return;
        }


        this.__vrDisplay.getFrameData(this.__frameData);

        if (!this.__frameData.pose || (isNaN(this.__frameData.pose.orientation[0]) || !isFinite(this.__frameData.pose.orientation[0])))
            return false;

        if (!this.__projectionMatriciesUpdated) {
            this.__leftProjectionMatrix.setDataArray(this.__frameData.leftProjectionMatrix);
            this.__rightProjectionMatrix.setDataArray(this.__frameData.rightProjectionMatrix);
            // if (this.__vrDisplay.stageParameters) {
            //     this.__sittingToStandingMatrix.setDataArray(this.__vrDisplay.stageParameters.sittingToStandingTransform);
            // } else {
            //     this.__standingMatrix.setIdentify();
            //     let PLAYER_HEIGHT = 1.65;
            //     this.__sittingToStandingMatrix.translation.set(0, PLAYER_HEIGHT, 0);
            // }
            // this.__stageMatrix.multiplyInPlace(this.__sittingToStandingMatrix);
            this.__projectionMatriciesUpdated = true;
        }


        this.updateHeadAndControllers();
        this.bindAndClear(renderstate);


        renderstate.viewport = this;
        // renderstate.cameraMatrix = this.__standingMatrix;
        renderstate.viewScale = 1.0 / this.__stageScale;
        renderstate.viewXfo = this.__vrhead.getTreeItem().getGlobalXfo();
        renderstate.cameraMatrix = renderstate.viewXfo.toMat4();

        const width = this.__hmdCanvasSize[0];
        const height = this.__hmdCanvasSize[1];
        const gl = this.__renderer.gl;

        gl.viewport(0, 0, width * 0.5, height);
        this.__leftViewMatrix.setDataArray(this.__frameData.leftViewMatrix);
        this.__leftViewMatrix.multiplyInPlace(this.__stageMatrix);
        renderstate.viewMatrix = this.__leftViewMatrix;
        renderstate.projectionMatrix = this.__leftProjectionMatrix;
        renderstate.eye = 0; //'L';

        if (this.__backgroundTexture && this.__backgroundTexture.isLoaded()) {
            this.drawBackground(renderstate);
        }

        this.__renderer.drawScene(renderstate);

        gl.viewport(width * 0.5, 0, width * 0.5, height);
        this.__rightViewMatrix.setDataArray(this.__frameData.rightViewMatrix);
        this.__rightViewMatrix.multiplyInPlace(this.__stageMatrix);
        renderstate.viewMatrix = this.__rightViewMatrix;
        renderstate.projectionMatrix = this.__rightProjectionMatrix;
        renderstate.eye = 1; //'R';

        if (this.__backgroundTexture && this.__backgroundTexture.isLoaded()) {
            this.drawBackground(renderstate);
        }

        this.__renderer.drawScene(renderstate);

        this.__vrDisplay.submitFrame();
        this.__frameRequested = false;
    }

    drawOverlays(renderstate) {
        // No overlays in VR
        //(overlays will be 3d scene grometries at an appropriate dist to the head... maybe.)
        // Instead we will use the controllers and attach widgets there.
    }
};

export {
    VRViewport
};
//export default VRViewport;
