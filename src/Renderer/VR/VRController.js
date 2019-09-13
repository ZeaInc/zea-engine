import { SystemDesc } from '../../BrowserDetection.js';
import { Vec3, Quat, EulerAngles, Xfo, Mat4, Ray } from '../../Math';
import { Signal } from '../../Utilities';
import {
  Lines,
  Plane,
  Sphere,
  GeomItem,
  TreeItem,
  Material,
  DataImage,
} from '../../SceneTree';
import { GLMesh } from '../GLMesh.js';
import { GLGeomItem } from '../GLGeomItem.js';
import { GLTexture2D } from '../GLTexture2D.js';
import { GLFbo } from '../GLFbo.js';

class VRController {
  constructor(vrviewport, inputSource, id) {
    this.__vrviewport = vrviewport;
    this.__inputSource = inputSource;
    this.__id = id;
    this.__isDaydramController = SystemDesc.isMobileDevice;
    this.__treeItem = new TreeItem(
      'VRController:' + inputSource.handedness + id
    );
    // Controller coordinate system
    // X = Horizontal.
    // Y = Up.
    // Z = Towards handle base.

    if (!this.__isDaydramController) {
      // A Vive or Occulus Touch Controller
      this.__tip = new TreeItem('Tip');
      // Note: the tip of the controller need to be off
      // the end of the controller. getGeomItemAtTip
      // now searches a grid in that area and so we need to
      // ensure that the grid does not touch the controller,
      // else it will return the controller geom from
      // the getGeomItemAtTip function
      this.__tip.setLocalXfo(new Xfo(new Vec3(0.0, -0.05, -0.13)));
      this.__treeItem.addChild(this.__tip, false);
      vrviewport.getTreeItem().addChild(this.__treeItem);

      const asset = vrviewport.loadHMDResources().then(asset => {
        asset.loaded.connect(entries => {
          let srcControllerTree;
          if (id == 0)
            srcControllerTree = asset.getChildByName('LeftController');
          else if (id == 1)
            srcControllerTree = asset.getChildByName('RightController');
          if (!srcControllerTree)
            srcControllerTree = asset.getChildByName('Controller');
          const controllerTree = srcControllerTree.clone();

          controllerTree.setLocalXfo(
            new Xfo(
              new Vec3(0, -0.035, -0.085),
              new Quat({
                setFromAxisAndAngle: [new Vec3(0, 1, 0), Math.PI],
              }),
              new Vec3(0.001, 0.001, 0.001) // VRAsset units are in mm.
            )
          );
          this.__treeItem.addChild(controllerTree);
        });
      });

      this.__projMatrix = new Mat4();
      this.__activeVolumeSize = 0.04;
      this.__projMatrix.setOrthographicMatrix(
        this.__activeVolumeSize * -0.5,
        this.__activeVolumeSize * 0.5,
        this.__activeVolumeSize * -0.5,
        this.__activeVolumeSize * 0.5,
        this.__activeVolumeSize * -0.5,
        this.__activeVolumeSize * 0.5
      );
      this.createGeomDataFbo();
    }

    this.touchpadTouched = new Signal();
    this.buttonPressed = new Signal();
    this.buttonReleased = new Signal();
    this.__pressedButtons = [];

    // /////////////////////////////////
    // Xfo

    this.__mat4 = new Mat4();
    this.__xfo = new Xfo();

    // this.setVisible(true);
  }

  getHandedness() {
    return this.__inputSource.handedness;
  }

  getId() {
    return this.__id;
  }

  getTreeItem() {
    return this.__treeItem;
  }

  getTipItem() {
    return this.__tip;
  }

  getTipXfo() {
    return this.__tip.getGlobalXfo();
  }

  getTouchPadValue() {
    return this.__touchpadValue;
  }

  isButtonPressed(id = 1) {
    return this.__buttonPressed;
  }

  getControllerStageLocalXfo() {
    return this.__xfo;
  }

  getControllerTipStageLocalXfo() {
    return this.__xfo.multiply(this.__tip.getLocalXfo());
  }

  updatePose(refSpace, xrFrame, inputSource) {
    // //////////////////////////////
    // old..
    // const inputPose = xrFrame.getInputPose(inputSource, refSpace);
    // if(!inputPose.gripMatrix)
    //     return;
    // this.__mat4.setDataArray(inputPose.gripMatrix);
    // this.__xfo.fromMat4(this.__mat4);

    // //////////////////////////////
    // New.
    const inputPose = xrFrame.getInputPose(inputSource, refSpace);
    // const inputPose = xrFrame.getInputPose(refSpace, inputSource);
    // const inputPose = xrFrame.getPose(inputSource, refSpace);

    // We may not get a inputPose back in cases where the input source has lost
    // tracking or does not know where it is relative to the given frame
    // of reference.
    if (!inputPose || !inputPose.gripTransform) {
      return;
    }

    this.__mat4.setDataArray(inputPose.gripTransform.matrix);
    this.__xfo.fromMat4(this.__mat4);

    // const pos = inputPose.transform.position;
    // this.__xfo.tr.set(pos.x, pos.y,pos.z);
    // const ori = inputPose.transform.orientation;
    // this.__xfo.ori.set(ori.x, ori.y, ori.z, ori.x);
    // //////////////////////////////

    this.__treeItem.setLocalXfo(this.__xfo);

    // Reset the geom at tip so it will be recomuted if necessary
    this.__geomAtTip = undefined;
    this.__hitTested = false;
  }

  // ////////////////////////////////

  createGeomDataFbo() {
    // The geom data buffer is a 3x3 data buffer.
    // See getGeomItemAtTip below
    const gl = this.__vrviewport.getRenderer().gl;
    this.__geomDataBuffer = new GLTexture2D(gl, {
      type: 'FLOAT',
      format: 'RGBA',
      filter: 'NEAREST',
      width: 3,
      height: 3,
    });
    this.__geomDataBufferFbo = new GLFbo(gl, this.__geomDataBuffer, true);
    this.__geomDataBufferFbo.setClearColor([0, 0, 0, 0]);
  }

  getGeomItemAtTip() {
    if (this.__hitTested) return this.__geomAtTip;
    this.__hitTested = true;

    const renderer = this.__vrviewport.getRenderer();
    const gl = renderer.gl;
    const xfo = this.__tip.getGlobalXfo();

    this.__geomDataBufferFbo.bindAndClear();
    gl.viewport(0, 0, 3, 3);

    const renderstate = {
      viewports: [
        {
          region: [0, 0, 3, 3],
          cameraMatrix: xfo.toMat4(),
          viewMatrix: xfo.inverse().toMat4(),
          projectionMatrix: this.__projMatrix,
          isOrthographic: true,
        },
      ],
    };

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);

    renderer.drawSceneGeomData(renderstate);
    gl.finish();
    this.__geomDataBufferFbo.unbindForWriting();
    this.__geomDataBufferFbo.bindForReading();

    const geomDatas = new Float32Array(4 * 9);
    gl.readPixels(0, 0, 3, 3, gl.RGBA, gl.FLOAT, geomDatas);
    this.__geomDataBufferFbo.unbindForReading();

    // ////////////////////////////////////
    // We have a 3x3 grid of pixels, and we
    // scan them to find if any geom was in the
    // frustum.
    // Starting with the center pixel (4),
    // then left and right (3, 5)
    // Then top bottom (1, 7)
    const checkPixel = id => geomDatas[id * 4 + 3] != 0;
    const dataPixels = [4, 3, 5, 1, 7];
    let geomData;
    for (const pixelID of dataPixels) {
      if (checkPixel(pixelID)) {
        geomData = geomDatas.subarray(pixelID * 4, pixelID * 4 + 4);
        break;
      }
    }
    if (!geomData) return;

    const passId = Math.round(geomData[0]);
    const geomItemAndDist = renderer
      .getPass(passId)
      .getGeomItemAndDist(geomData);

    if (geomItemAndDist) {
      const ray = new Ray(xfo.tr, xfo.ori.getZaxis());
      const intersectionPos = ray.start.add(
        ray.dir.scale(geomItemAndDist.dist)
      );

      this.__geomAtTip = {
        controllerRay: ray,
        intersectionPos,
        geomItem: geomItemAndDist.geomItem,
        dist: geomItemAndDist.dist,
      };
      return this.__geomAtTip;
    }
  }
}

export { VRController };
