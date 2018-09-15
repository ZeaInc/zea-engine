import {
    SystemDesc
} from '../../BrowserDetection.js';
import {
    Vec2,
    Vec3,
    Quat,
    Mat4,
    Box3,
    Xfo
} from '../../Math';
import {
    Signal
} from '../../Utilities';
import {
    ParameterOwner
} from '../ParameterOwner.js';
import {
    ParamFlags,
    ValueSetMode,
    Parameter,
    BooleanParameter,
    NumberParameter,
    ColorParameter,
    Vec2Parameter,
    XfoParameter
} from '../Parameters';

class CameraMouseAndKeyboard extends ParameterOwner {
    constructor(name = undefined) {
        if (name == undefined)
            name = "Camera";
        super(name);

        this.__defaultManipulationState = 'orbit';
        this.__manipulationState = this.__defaultManipulationState;
        this.__mouseDragDelta = new Vec2();
        this.__keyboardMovement = false;
        this.__keysPressed = [];
        this.__maxVel = 0.002;
        this.__velocity = new Vec3();

        this.__ongoingTouches = {};

        this.__orbitRateParam = this.addParameter(new NumberParameter('orbitRate', SystemDesc.isMobileDevice ? -0.002 : 0.01));
        this.__dollySpeedParam = this.addParameter(new NumberParameter('dollySpeed', 0.02));
        this.__mouseWheelDollySpeedParam = this.addParameter(new NumberParameter('mouseWheelDollySpeed', 0.002));

        this.movementFinished = new Signal();
    }

    setDefaultManipulationMode(mode) {
        this.__defaultManipulationState = mode;
    }

    look(dragVec, viewport) {
        const focalDistance = viewport.getCamera().getFocalDistance();
        const orbitRate = this.__orbitRateParam.getValue();

        if (this.__keyboardMovement) {
            const globalXfo = viewport.getCamera().getGlobalXfo(0);
            this.__mouseDownCameraXfo = globalXfo.clone();
            this.__mouseDownZaxis = globalXfo.ori.getZaxis();
            const targetOffset = this.__mouseDownZaxis.scale(-focalDistance);
            this.__mouseDownCameraTarget = globalXfo.tr.add(targetOffset);
        }

        const globalXfo = this.__mouseDownCameraXfo.clone();

        // Orbit
        const orbit = new Quat();
        orbit.rotateZ(dragVec.x * orbitRate * 0.12);
        // globalXfo.ori.multiplyInPlace(orbit);
        globalXfo.ori = orbit.multiply(globalXfo.ori);

        // Pitch
        const pitch = new Quat();
        pitch.rotateX(dragVec.y * orbitRate * 0.12);
        globalXfo.ori.multiplyInPlace(pitch);

        if (this.__keyboardMovement) {
            // TODO: debug this potential regression. we now use the generic method which emits a signal.
            // Avoid generating a signal because we have an animation frame occuring.
            // see: onKeyPressed
            viewport.getCamera().setGlobalXfo(0, globalXfo);
        } else {
            viewport.getCamera().setGlobalXfo(0, globalXfo);
        }
    }

    orbit(dragVec, viewport) {
        const focalDistance = viewport.getCamera().getFocalDistance();
        const orbitRate = this.__orbitRateParam.getValue();

        if (this.__keyboardMovement) {
            const globalXfo = viewport.getCamera().getGlobalXfo(0);
            this.__mouseDownCameraXfo = globalXfo.clone();
            this.__mouseDownZaxis = globalXfo.ori.getZaxis();
            const targetOffset = this.__mouseDownZaxis.scale(-focalDistance);
            this.__mouseDownCameraTarget = globalXfo.tr.add(targetOffset);
        }

        const globalXfo = this.__mouseDownCameraXfo.clone();

        // Orbit
        const orbit = new Quat();
        orbit.rotateZ(dragVec.x * -orbitRate);
        // globalXfo.ori.multiplyInPlace(orbit);
        globalXfo.ori = orbit.multiply(globalXfo.ori);

        // Pitch
        const pitch = new Quat();
        pitch.rotateX(dragVec.y * -orbitRate);
        globalXfo.ori.multiplyInPlace(pitch);

        globalXfo.tr = this.__mouseDownCameraTarget.add(globalXfo.ori.getZaxis().scale(focalDistance));

        if (this.__keyboardMovement) {
            // TODO: debug this potential regression. we now use the generic method which emits a signal.
            // Avoid generating a signal because we have an animation frame occuring.
            // see: onKeyPressed
            viewport.getCamera().setGlobalXfo(0, globalXfo);
        } else {
            viewport.getCamera().setGlobalXfo(0, globalXfo);
        }
    }

    pan(dragVec, viewport) {
        const focalDistance = viewport.getCamera().getFocalDistance();
        const fovY = viewport.getCamera().getFov();
        const xAxis = new Vec3(1, 0, 0);
        const yAxis = new Vec3(0, 1, 0);

        const cameraPlaneHeight = 2.0 * focalDistance * Math.tan(0.5 * fovY);
        const cameraPlaneWidth = cameraPlaneHeight * (viewport.getWidth() / viewport.getHeight());
        const delta = new Xfo();
        delta.tr = xAxis.scale(-(dragVec.x / viewport.getWidth()) * cameraPlaneWidth)
        delta.tr.addInPlace(yAxis.scale((dragVec.y / viewport.getHeight()) * cameraPlaneHeight));

        viewport.getCamera().setGlobalXfo(0, this.__mouseDownCameraXfo.multiply(delta));
    }

    dolly(dragVec, viewport) {
        const dollyDist = dragVec.x * this.__dollySpeedParam.getValue();
        const delta = new Xfo();
        delta.tr.set(0, 0, dollyDist);
        viewport.getCamera().setGlobalXfo(0, this.__mouseDownCameraXfo.multiply(delta));
    }

    panAndZoom(panDelta, dragDist, viewport) {
        const focalDistance = viewport.getCamera().getFocalDistance();
        const fovY = viewport.getCamera().getFov();

        const xAxis = new Vec3(1, 0, 0);
        const yAxis = new Vec3(0, 1, 0);

        const cameraPlaneHeight = 2.0 * focalDistance * Math.tan(0.5 * fovY);
        const cameraPlaneWidth = cameraPlaneHeight * (viewport.getWidth() / viewport.getHeight());
        const delta = new Xfo();
        delta.tr = xAxis.scale(-(panDelta.x / viewport.getWidth()) * cameraPlaneWidth)
        delta.tr.addInPlace(yAxis.scale((panDelta.y / viewport.getHeight()) * cameraPlaneHeight));


        const zoomDist = dragDist * focalDistance;
        viewport.getCamera().setFocalDistance(this.__mouseDownFocalDist + zoomDist);
        delta.tr.z += zoomDist;
        viewport.getCamera().setGlobalXfo(0, this.__mouseDownCameraXfo.multiply(delta));
    }

    initDrag(viewport) {
        const focalDistance = viewport.getCamera().getFocalDistance();
        this.__mouseDragDelta.set(0, 0);
        this.__mouseDownCameraXfo = viewport.getCamera().getGlobalXfo(0).clone();
        this.__mouseDownZaxis = viewport.getCamera().getGlobalXfo(0).ori.getZaxis();
        const targetOffset = this.__mouseDownZaxis.scale(-focalDistance);
        this.__mouseDownCameraTarget = viewport.getCamera().getGlobalXfo(0).tr.add(targetOffset);
        this.__mouseDownFocalDist = focalDistance;
    }

    onMouseMove(event, mousePos, viewport) {

    }

    onDragStart(event, mouseDownPos, viewport) {

        this.__mouseDownPos = mouseDownPos;
        this.initDrag(viewport);

        if (event.altKey || event.button == 2) {
            this.__manipulationState = 'pan';
        } else if (event.ctrlKey && event.altKey) {
            this.__manipulationState = 'dolly';
        } else if (event.ctrlKey || event.button == 2) {
            this.__manipulationState = 'look';
        } else {
            this.__manipulationState = this.__defaultManipulationState;
        }
    }

    onDrag(event, mousePos, viewport) {
        // During requestPointerLock, the offsetX/Y values are not updated.
        // Instead we get a relative delta that we use to compute the total
        // delta for the drag.
        // if(this.__keyboardMovement){
        //     this.__mouseDragDelta.x = event.movementX;
        //     this.__mouseDragDelta.y = event.movementY;
        // }
        // else{
        //     this.__mouseDragDelta.x += event.movementX;
        //     this.__mouseDragDelta.y += event.movementY;
        // }
        if (this.__keyboardMovement) {
            this.__mouseDragDelta = mousePos;
        } else {
            this.__mouseDragDelta = mousePos.subtract(this.__mouseDownPos);
        }
        switch (this.__manipulationState) {
            case 'orbit':
                this.orbit(this.__mouseDragDelta, viewport);
                break;
            case 'look':
                this.look(this.__mouseDragDelta, viewport);
                break;
            case 'pan':
                this.pan(this.__mouseDragDelta, viewport);
                break;
            case 'dolly':
                this.dolly(this.__mouseDragDelta, viewport);
                break;
        }
    }

    onDragEnd(event, mouseUpPos, viewport) {
        this.movementFinished.emit();
        return false;
    }

    onWheel(event, viewport) {
        const focalDistance = viewport.getCamera().getFocalDistance();
        const mouseWheelDollySpeed = this.__mouseWheelDollySpeedParam.getValue();
        const zoomDist = event.deltaY * mouseWheelDollySpeed * focalDistance;
        const xfo = viewport.getCamera().getGlobalXfo(0);
        xfo.tr.addInPlace(xfo.ori.getZaxis().scale(zoomDist));
        if (this.__defaultManipulationState == 'orbit')
            viewport.getCamera().setFocalDistance( focalDistance + zoomDist);
        viewport.getCamera().setGlobalXfo(0, xfo);
        this.movementFinished.emit();
    }

    __integrateVelocityChange(velChange, viewport) {
        const delta = new Xfo();
        delta.tr = this.__velocity.normalize().scale(this.__maxVel);
        viewport.getCamera().setGlobalXfo(0, viewport.getCamera().getGlobalXfo(0).multiply(delta));
    }

    onKeyPressed(key, event, viewport) {
        // Note: onKeyPressed is called intiallly only once, and then we 
        // get a series of calls. Here we ignore subsequent events.
        // (TODO: move this logic to a special controller)
        /*
        switch (key) {
            case 'w':
                if (this.__keysPressed.indexOf(key) != -1)
                    return false;
                this.__velocity.z -= 1.0;
                break;
            case 's':
                if (this.__keysPressed.indexOf(key) != -1)
                    return false;
                this.__velocity.z += 1.0;
                break;
            case 'a':
                if (this.__keysPressed.indexOf(key) != -1)
                    return false;
                this.__velocity.x -= 1.0;
                break;
            case 'd':
                if (this.__keysPressed.indexOf(key) != -1)
                    return false;
                this.__velocity.x += 1.0;
                break;
            default:
                return false;
        }
        this.__keysPressed.push(key);
        if (!this.__keyboardMovement) {
            this.__keyboardMovement = true;
            let animationFrame = ()=>{
                this.__integrateVelocityChange()
                if (this.__keyboardMovement)
                    window.requestAnimationFrame(animationFrame);
            }
            window.requestAnimationFrame(animationFrame);
        }
        */
        return false;// no keys handled
    }

    onKeyDown(key, event, viewport) {}

    onKeyUp(key, event, viewport) {
        // (TODO: move this logic to a special controller)
        /*
        switch (key) {
            case 'w':
                this.__velocity.z += 1.0;
                break;
            case 's':
                this.__velocity.z -= 1.0;
                break;
            case 'a':
                this.__velocity.x += 1.0;
                break;
            case 'd':
                this.__velocity.x -= 1.0;
                break;
            default:
                return false;
        }
        let keyIndex = this.__keysPressed.indexOf(key);
        this.__keysPressed.splice(keyIndex, 1);
        if (this.__keysPressed.length == 0)
            this.__keyboardMovement = false;
        */
        return true;
    }

    /////////////////////////////////////
    // Touch controls

    __startTouch(touch, viewport) {
        this.__ongoingTouches[touch.identifier] = {
            identifier: touch.identifier,
            pos: new Vec2(touch.pageX, touch.pageY)
        };
    }
    __endTouch(touch, viewport) {
        // let idx = this.__ongoingTouchIndexById(touch.identifier);
        // this.__ongoingTouches.splice(idx, 1); // remove it; we're done
        delete this.__ongoingTouches[touch.identifier];
    }

    // Touch events
    onTouchStart(event, viewport) {
        // console.log("onTouchStart");
        event.preventDefault();
        event.stopPropagation();

        if (Object.keys(this.__ongoingTouches).length == 0)
            this.__manipMode = undefined;

        let touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            this.__startTouch(touches[i]);
        }
        this.initDrag(viewport);
    }

    onTouchMove(event, viewport) {
        event.preventDefault();
        event.stopPropagation();
        // console.log("this.__manipMode:" + this.__manipMode);

        let touches = event.changedTouches;
        if (touches.length == 1 && this.__manipMode != "panAndZoom") {
            let touch = touches[0];
            let touchPos = new Vec2(touch.pageX, touch.pageY);
            let touchData = this.__ongoingTouches[touch.identifier];
            let dragVec = touchData.pos.subtract(touchPos);
            if (this.__defaultManipulationState == 'look') {
                // TODO: scale panning here.
                dragVec.scaleInPlace(6.0);
                this.look(dragVec, viewport);
            } else {
                this.orbit(dragVec, viewport);
            }
        } else if (touches.length == 2) {
            let touch0 = touches[0];
            let touchData0 = this.__ongoingTouches[touch0.identifier];
            let touch1 = touches[1];
            let touchData1 = this.__ongoingTouches[touch1.identifier];

            let touch0Pos = new Vec2(touch0.pageX, touch0.pageY);
            let touch1Pos = new Vec2(touch1.pageX, touch1.pageY);
            let startSeparation = touchData1.pos.subtract(touchData0.pos).length();
            let dragSeparation = touch1Pos.subtract(touch0Pos).length();
            let separationDist = startSeparation - dragSeparation;

            let touch0Drag = touch0Pos.subtract(touchData0.pos);
            let touch1Drag = touch1Pos.subtract(touchData1.pos);
            let dragVec = touch0Drag.add(touch1Drag);
            // TODO: scale panning here.
            dragVec.scaleInPlace(0.5);
            this.panAndZoom(dragVec, separationDist * 0.002, viewport);
            this.__manipMode = "panAndZoom";
        }
    }

    onTouchEnd(event, viewport) {
        event.preventDefault();
        event.stopPropagation();
        let touches = event.changedTouches;
        // switch (this.__manipMode) {
        // case 'camera-manipulation':
        //     let touch = touches[0];
        //     let releasePos = new Vec2(touch.pageX, touch.pageY);
        //     viewport.getCamera().onDragEnd(event, releasePos, viewport);
        //     break;
        // }
        for (let i = 0; i < touches.length; i++) {
            this.__endTouch(touches[i]);
        }
    }

    onTouchCancel(event, viewport) {
        event.preventDefault();
        console.log("touchcancel.");
        let touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            this.__endTouch(touches[i]);
        }
    }


};

export {
    CameraMouseAndKeyboard
};
//export default Camera;