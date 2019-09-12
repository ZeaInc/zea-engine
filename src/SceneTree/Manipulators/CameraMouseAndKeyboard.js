import { SystemDesc } from '../../BrowserDetection.js';
import { Vec2, Vec3, Quat, Xfo } from '../../Math';
import { Signal } from '../../Utilities';
import { ParameterOwner } from '../ParameterOwner.js';
import { NumberParameter } from '../Parameters';

class CameraMouseAndKeyboard extends ParameterOwner {
  constructor(name = undefined) {
    if (name == undefined) name = 'Camera';
    super(name);

    this.__defaultManipulationState = 'orbit';
    this.__manipulationState = this.__defaultManipulationState;
    this.__mouseDragDelta = new Vec2();
    this.__keyboardMovement = false;
    this.__keysPressed = [];
    this.__maxVel = 0.002;
    this.__velocity = new Vec3();

    this.__ongoingTouches = {};

    this.__orbitRateParam = this.addParameter(
      new NumberParameter(
        'orbitRate',
        SystemDesc.isMobileDevice ? -0.002 : 0.01
      )
    );
    this.__dollySpeedParam = this.addParameter(
      new NumberParameter('dollySpeed', 0.02)
    );
    this.__mouseWheelDollySpeedParam = this.addParameter(
      new NumberParameter('mouseWheelDollySpeed', 0.0005)
    );

    this.movementFinished = new Signal();
  }

  setDefaultManipulationMode(mode) {
    this.__defaultManipulationState = mode;
  }

  look(event, dragVec) {
    const { viewport } = event;
    const camera = viewport.getCamera();

    const focalDistance = camera.getFocalDistance();
    const orbitRate = this.__orbitRateParam.getValue();

    if (this.__keyboardMovement) {
      const globalXfo = camera.getGlobalXfo();
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
      camera.setGlobalXfo(globalXfo);
    } else {
      camera.setGlobalXfo(globalXfo);
    }
  }

  orbit(event, dragVec) {
    const { viewport } = event;
    const camera = viewport.getCamera();

    const focalDistance = camera.getFocalDistance();
    const orbitRate = this.__orbitRateParam.getValue();

    if (this.__keyboardMovement) {
      const globalXfo = camera.getGlobalXfo();
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

    globalXfo.tr = this.__mouseDownCameraTarget.add(
      globalXfo.ori.getZaxis().scale(focalDistance)
    );

    if (this.__keyboardMovement) {
      // TODO: debug this potential regression. we now use the generic method which emits a signal.
      // Avoid generating a signal because we have an animation frame occuring.
      // see: onKeyPressed
      camera.setGlobalXfo(globalXfo);
    } else {
      camera.setGlobalXfo(globalXfo);
    }
  }

  pan(event, dragVec) {
    console.log('Pab');
    const { viewport } = event;
    const camera = viewport.getCamera();

    const focalDistance = camera.getFocalDistance();
    const fovY = camera.getFov();
    const xAxis = new Vec3(1, 0, 0);
    const yAxis = new Vec3(0, 1, 0);

    const cameraPlaneHeight = 2.0 * focalDistance * Math.tan(0.5 * fovY);
    const cameraPlaneWidth =
      cameraPlaneHeight * (viewport.getWidth() / viewport.getHeight());
    const delta = new Xfo();
    delta.tr = xAxis.scale(
      -(dragVec.x / viewport.getWidth()) * cameraPlaneWidth
    );
    delta.tr.addInPlace(
      yAxis.scale((dragVec.y / viewport.getHeight()) * cameraPlaneHeight)
    );

    camera.setGlobalXfo(this.__mouseDownCameraXfo.multiply(delta));
  }

  dolly(event, dragVec) {
    const { viewport } = event;
    const camera = viewport.getCamera();

    const dollyDist = dragVec.x * this.__dollySpeedParam.getValue();
    const delta = new Xfo();
    delta.tr.set(0, 0, dollyDist);
    camera.setGlobalXfo(this.__mouseDownCameraXfo.multiply(delta));
  }

  panAndZoom(event, panDelta, dragDist) {
    const { viewport } = event;
    const camera = viewport.getCamera();

    const focalDistance = camera.getFocalDistance();
    const fovY = camera.getFov();

    const xAxis = new Vec3(1, 0, 0);
    const yAxis = new Vec3(0, 1, 0);

    const cameraPlaneHeight = 2.0 * focalDistance * Math.tan(0.5 * fovY);
    const cameraPlaneWidth =
      cameraPlaneHeight * (viewport.getWidth() / viewport.getHeight());
    const delta = new Xfo();
    delta.tr = xAxis.scale(
      -(panDelta.x / viewport.getWidth()) * cameraPlaneWidth
    );
    delta.tr.addInPlace(
      yAxis.scale((panDelta.y / viewport.getHeight()) * cameraPlaneHeight)
    );

    const zoomDist = dragDist * focalDistance;
    camera.setFocalDistance(this.__mouseDownFocalDist + zoomDist);
    delta.tr.z += zoomDist;
    camera.setGlobalXfo(this.__mouseDownCameraXfo.multiply(delta));
  }

  initDrag(event) {
    const { viewport } = event;
    const camera = viewport.getCamera();
    const focalDistance = camera.getFocalDistance();
    this.__mouseDragDelta.set(0, 0);
    this.__mouseDownCameraXfo = camera.getGlobalXfo().clone();
    this.__mouseDownZaxis = this.__mouseDownCameraXfo.ori.getZaxis();
    const targetOffset = this.__mouseDownZaxis.scale(-focalDistance);
    this.__mouseDownCameraTarget = camera.getGlobalXfo().tr.add(targetOffset);
    this.__mouseDownFocalDist = focalDistance;
  }

  aimFocus(event, pos) {
    const { viewport } = event;
    const camera = viewport.getCamera();

    if (this.__focusIntervalId) clearInterval(this.__focusIntervalId);

    const count = 20;
    let i = 0;
    const applyMovement = () => {
      const initlalGlobalXfo = camera.getGlobalXfo();
      const initlalDist = camera.getFocalDistance();
      const dir = pos.subtract(initlalGlobalXfo.tr);
      const dist = dir.normalizeInPlace();

      const orbit = new Quat();
      const pitch = new Quat();

      // Orbit
      {
        const currDir = initlalGlobalXfo.ori.getZaxis().clone();
        currDir.z = 0;
        const newDir = dir.negate();
        newDir.z = 0;

        orbit.setFrom2Vectors(currDir, newDir);
      }

      // Pitch
      {
        const currDir = initlalGlobalXfo.ori.getZaxis().clone();
        const newDir = dir.negate();
        currDir.x = newDir.x;
        currDir.y = newDir.y;
        currDir.normalizeInPlace();

        if (currDir.cross(newDir).dot(initlalGlobalXfo.ori.getXaxis()) > 0.0)
          pitch.rotateX(currDir.angleTo(newDir));
        else pitch.rotateX(-currDir.angleTo(newDir));
      }

      const targetGlobalXfo = initlalGlobalXfo.clone();
      targetGlobalXfo.ori = orbit.multiply(targetGlobalXfo.ori);
      targetGlobalXfo.ori.multiplyInPlace(pitch);

      // With each iteraction we get closer to our goal
      // and on the final iteration we should aim perfectly at
      // the target.
      const t = Math.pow(i / count, 2);
      const globalXfo = initlalGlobalXfo.clone();
      globalXfo.ori = initlalGlobalXfo.ori.lerp(targetGlobalXfo.ori, t);

      camera.setFocalDistance(initlalDist + (dist - initlalDist) * t);
      camera.setGlobalXfo(globalXfo);

      i++;
      if (i <= count) {
        this.__focusIntervalId = setTimeout(applyMovement, 20);
      } else {
        this.__focusIntervalId = undefined;
        this.movementFinished.emit();
      }
    };
    applyMovement();

    this.__manipulationState = 'focussing';
  }

  onMouseMove(event) {}

  onDoubleClick(event) {
    if (event.intersectionData) {
      const camera = event.viewport.getCamera();
      const pos = camera
        .getGlobalXfo()
        .tr.add(event.mouseRay.dir.scale(event.intersectionData.dist));
      this.aimFocus(event, pos);
    }
  }

  onDragStart(event) {
    this.__mouseDownPos = event.mousePos;
    this.initDrag(event);

    if (event.button == 2) {
      this.__manipulationState = 'pan';
    } else if (event.ctrlKey && event.altKey) {
      this.__manipulationState = 'dolly';
    } else if (event.ctrlKey || event.button == 2) {
      this.__manipulationState = 'look';
    } else {
      this.__manipulationState = this.__defaultManipulationState;
    }
  }

  onDrag(event) {
    const mousePos = event.mousePos;
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
        this.orbit(event, this.__mouseDragDelta);
        break;
      case 'look':
        this.look(event, this.__mouseDragDelta);
        break;
      case 'pan':
        this.pan(event, this.__mouseDragDelta);
        break;
      case 'dolly':
        this.dolly(event, this.__mouseDragDelta);
        break;
    }
  }

  onDragEnd(event) {
    this.movementFinished.emit();
    return false;
  }

  onWheel(event) {
    const { viewport } = event;
    const camera = viewport.getCamera();
    const focalDistance = camera.getFocalDistance();
    const mouseWheelDollySpeed = this.__mouseWheelDollySpeedParam.getValue();
    const modulator = event.shiftKey ? 0.1 : 0.5;
    const zoomDist =
      event.deltaY * mouseWheelDollySpeed * focalDistance * modulator;
    const xfo = camera.getGlobalXfo();
    const movementVec = xfo.ori.getZaxis().scale(zoomDist);
    if (this.__mouseWheelZoomIntervalId)
      clearInterval(this.__mouseWheelZoomIntervalId);
    let count = 0;
    const applyMovement = () => {
      xfo.tr.addInPlace(movementVec);
      if (this.__defaultManipulationState == 'orbit')
        camera.setFocalDistance(camera.getFocalDistance() + zoomDist);
      camera.setGlobalXfo(xfo);

      count++;
      if (count < 10) {
        this.__mouseWheelZoomIntervalId = setTimeout(applyMovement, 10);
      } else {
        this.__mouseWheelZoomIntervalId = undefined;
        this.movementFinished.emit();
      }
    };
    applyMovement();
  }

  __integrateVelocityChange(event) {
    const { viewport } = event;
    const camera = viewport.getCamera();
    const delta = new Xfo();
    delta.tr = this.__velocity.normalize().scale(this.__maxVel);
    camera.setGlobalXfo(camera.getGlobalXfo().multiply(delta));
  }

  onKeyPressed(key, event) {
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
        this.__integrateVelocityChange(event)
        if (this.__keyboardMovement)
          window.requestAnimationFrame(animationFrame);
      }
      window.requestAnimationFrame(animationFrame);
    }
    */
    return false; // no keys handled
  }

  onKeyDown(key, event) {}

  onKeyUp(key, event) {
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

  // ///////////////////////////////////
  // Touch controls

  __startTouch(touch) {
    this.__ongoingTouches[touch.identifier] = {
      identifier: touch.identifier,
      pos: new Vec2(touch.pageX, touch.pageY),
    };
  }

  __endTouch(touch) {
    // let idx = this.__ongoingTouchIndexById(touch.identifier);
    // this.__ongoingTouches.splice(idx, 1); // remove it; we're done
    delete this.__ongoingTouches[touch.identifier];
  }

  // Touch events
  onTouchStart(event) {
    console.log('onTouchStart');
    event.preventDefault();
    event.stopPropagation();

    if (Object.keys(this.__ongoingTouches).length == 0)
      this.__manipMode = undefined;

    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      this.__startTouch(touches[i]);
    }
    this.initDrag(event);
  }

  onTouchMove(event) {
    event.preventDefault();
    event.stopPropagation();
    // console.log("this.__manipMode:" + this.__manipMode);

    const touches = event.touches;
    if (touches.length == 1 && this.__manipMode != 'panAndZoom') {
      const touch = touches[0];
      const touchPos = new Vec2(touch.pageX, touch.pageY);
      const touchData = this.__ongoingTouches[touch.identifier];
      const dragVec = touchData.pos.subtract(touchPos);
      if (this.__defaultManipulationState == 'look') {
        // TODO: scale panning here.
        dragVec.scaleInPlace(6.0);
        this.look(event, dragVec);
      } else {
        this.orbit(event, dragVec);
      }
    } else if (touches.length == 2) {
      const touch0 = touches[0];
      const touchData0 = this.__ongoingTouches[touch0.identifier];
      const touch1 = touches[1];
      const touchData1 = this.__ongoingTouches[touch1.identifier];

      const touch0Pos = new Vec2(touch0.pageX, touch0.pageY);
      const touch1Pos = new Vec2(touch1.pageX, touch1.pageY);
      const startSeparation = touchData1.pos.subtract(touchData0.pos).length();
      const dragSeparation = touch1Pos.subtract(touch0Pos).length();
      const separationDist = startSeparation - dragSeparation;

      const touch0Drag = touch0Pos.subtract(touchData0.pos);
      const touch1Drag = touch1Pos.subtract(touchData1.pos);
      const dragVec = touch0Drag.add(touch1Drag);
      // TODO: scale panning here.
      dragVec.scaleInPlace(0.5);
      this.panAndZoom(event, dragVec, separationDist * 0.002);
      this.__manipMode = 'panAndZoom';
    }
  }

  onTouchEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    const touches = event.changedTouches;
    // switch (this.__manipMode) {
    // case 'camera-manipulation':
    //     let touch = touches[0];
    //     let releasePos = new Vec2(touch.pageX, touch.pageY);
    //     viewport.getCamera().onDragEnd(event, releasePos);
    //     break;
    // }
    for (let i = 0; i < touches.length; i++) {
      this.__endTouch(touches[i]);
    }
  }

  onTouchCancel(event) {
    event.preventDefault();
    const touches = event.touches;
    for (let i = 0; i < touches.length; i++) {
      this.__endTouch(touches[i]);
    }
  }

  onDoubleTap(event) {
    if (event.intersectionData) {
      const { viewport } = event;
      const camera = viewport.getCamera();
      const pos = camera
        .getGlobalXfo()
        .tr.add(event.touchRay.dir.scale(event.intersectionData.dist));
      this.aimFocus(event, pos);
    }
    event.preventDefault();
  }
}

export { CameraMouseAndKeyboard };
// export default Camera;
