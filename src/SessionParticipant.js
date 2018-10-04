import {
    Vec3,
    Xfo,
    Color,
    EulerAngles,
    typeRegistry
} from './Math';
import {
    Signal
} from './Utilities';
import {
    Cone,
    Cuboid,
    Sphere,
    TreeItem,
    GeomItem,
    AudioItem,
    Material,
    MarkerpenTool
} from './SceneTree';


function random(min, max) {
    return Math.floor(Math.random() * max) + min;
}

let avatarColors = [
    new Color(0.0, 0.15, 0.15),
    new Color(0.0, 0.85, 0.15),
    new Color(0.0, 0.15, 0.85),
    new Color(0.0, 0.85, 0.85),
    new Color(0.75, 0.15, 0.15),
    new Color(0.75, 0.85, 0.15),
    new Color(0.75, 0.15, 0.85),
    new Color(0.75, 0.85, 0.85)
];
let randomAvatarColor = () => {
    return avatarColors[random(0, avatarColors.length)];
}

let convertValuesFromJSON = (value) => {
    if (value == undefined) {
        return undefined;
    } else if (value.className) {
        const newval = typeRegistry.getType(value.className).create();
        newval.fromJSON(value);
        return newval;
    } else if (Array.isArray(value)) {
        let arr = [];
        for (const element of value)
            arr.push(convertValuesFromJSON(element));
        return arr;
    } else if (typeof value === "object") {
        const dict = {};
        for (let key in value)
            dict[key] = convertValuesFromJSON(value[key]);
        return dict;
    } else {
        return value;
    }
}


let convertValuesToJSON = (value) => {
    if (value == undefined) {
        return undefined;
    } else if (value.toJSON) {
        const result = value.toJSON();
        result.className = value.constructor.name;
        return result;
    } else if (Array.isArray(value)) {
        let arr = [];
        for (const element of value)
            arr.push(convertValuesToJSON(element));
        return arr;
    } else if (typeof value === "object") {
        const dict = {};
        for (let key in value)
            dict[key] = convertValuesToJSON(value[key]);
        return dict;
    } else {
        return value;
    }
}


class SessionParticipant {

    constructor(renderer, visualivePlatform, parentTreeItem, user, isLocalUser) {
        console.log("SessionClient:" + isLocalUser);
        this.__renderer = renderer;
        this.__parentTreeItem = parentTreeItem;
        this.__user = user;
        this.__isLocalUser = isLocalUser;
        this.__avatarScale = 1.0;
        this.__avatarColor = randomAvatarColor()

        this.__controllers = [];

        this.__treeItem = new TreeItem(user.id);
        // this.__treeItem.setVisible(visible);

        this.userMarker = new MarkerpenTool('marker');
        this.userMarker.color = this.__avatarColor;
        this.__treeItem.addChild(this.userMarker.getTreeItem());

        this.__avatarTreeItem = new TreeItem('avatar');
        this.__treeItem.addChild(this.__avatarTreeItem);

        this.__parentTreeItem.addChild(this.__treeItem);
        this.__treeItem.setSelectable(false);

        this.__material = new Material('user' + user.id + 'Material', 'SimpleSurfaceShader');
        this.__material.addParameter('BaseColor', this.__avatarColor);


        if (isLocalUser) {
            const sendMessage = (type, data, persisted) => {
                data.type = type;
                data.userId = this.__user.id;
                visualivePlatform.sendMessage(convertValuesToJSON(data), persisted);
            }

            this.__renderer.viewChanged.connect((data) => {
                sendMessage('viewChanged', data, false);
            });

            // this.__renderer.pointerMoved.connect((data) => {
            //     sendMessage('pointerMoved', data, false);
            // });

            this.__renderer.actionStarted.connect((data) => {
                const strokeData = this.onStrokeStarted(data);
                sendMessage('strokeStarted', strokeData, true);
            });
            this.__renderer.actionOccuring.connect((data) => {
                this.onStrokePoint(data);
                sendMessage('strokePoint', data, true);
            });
            this.__renderer.actionEnded.connect((msg) => {
                this.onStrokeEnded(msg);
                sendMessage('strokeEnded', msg, true);
            });
        } else {
            // Participants can be added to the session before they hav joined. 
            // this is because the system remembers data from previous sessions,
            // and adds previous users if they were in the previous sessions.
            // this.setCameraAndPointer();
        }
    }

    setAudioStream(stream) {
        if(this.__audioIem) {
            return;
        }
        this.__audioIem = new AudioItem('audio', stream);
        const head = this.__avatarTreeItem.getChild(0);
        if (head) {
            head.addChild(this.__audioIem);
        }
    }

    setAvatarVisibility(visible) {
        this.__avatarTreeItem.setVisible(visible);
    }

    onPointerMoved(data) {
        // TODO: show a pointer beam.
    }

    onStrokeStarted(data) {
        return this.userMarker.startStroke(data.xfo);
    }
    onStrokePoint(data) {
        this.userMarker.addSegmentToStroke(data.xfo);
    }
    onStrokeEnded(data) {
        this.userMarker.endStroke();
    }

    setCameraAndPointer() {
        this.__avatarTreeItem.removeAllChildren();

        //let shape = new Cuboid(0.2 * this.__avatarScale, 0.2 * this.__avatarScale, 0.4 * this.__avatarScale);
        let shape = new Cone(0.2 * this.__avatarScale, 0.6 * this.__avatarScale, 4, true);
        shape.computeVertexNormals();
        let geomItem = new GeomItem('camera', shape, this.__material);
        let geomXfo = new Xfo();
        geomXfo.ori.setFromEulerAngles(new EulerAngles(Math.PI * 0.5, Math.PI * 0.25, 0.0));
        geomItem.setGeomOffsetXfo(geomXfo);

        if (this.__audioIem) {
            geomItem.addChild(this.__audioIem);
        }

        this.__avatarTreeItem.addChild(geomItem);

        this.__currentViewMode = 'CameraAndPointer';
    }

    setViveRepresentation() {
        this.__avatarTreeItem.removeAllChildren();
        const hmdHolder = new TreeItem("hmdHolder");
        if (this.__audioIem) {
            hmdHolder.addChild(this.__audioIem);
        }
        this.__avatarTreeItem.addChild(hmdHolder);
        if (this.__renderer.getScene().getResourceLoader().resourceAvailable("VisualiveEngine/Vive.vla")) {


            if (!this.__viveAsset) {
                this.__viveAsset = this.__renderer.getScene().loadCommonAssetResource("VisualiveEngine/Vive.vla");
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

            this.__viveAsset.loaded.connect((entries) => {
                const hmdTree = this.__viveAsset.getChildByName('HTC_Vive_HMD').clone();
                hmdTree.getLocalXfo().ori.setFromAxisAndAngle(new Vec3(0, 1, 0), Math.PI);
                hmdHolder.addChild(hmdTree);
            });
        }
        this.__currentViewMode = 'Vive';
    }

    updateViveControllers(data) {
        for (let i = 0; i < data.controllers.length; i++) {
            if (i >= this.__controllers.length) {

                const treeItem = new TreeItem("handleHolder" + i);

                this.__viveAsset.loaded.connect(() => {
                    const controllerTree = this.__viveAsset.getChildByName('HTC_Vive_Controller').clone();
                    controllerTree.getLocalXfo().tr.set(0, -0.035, 0.01);
                    controllerTree.getLocalXfo().ori.setFromAxisAndAngle(new Vec3(0, 1, 0), Math.PI);
                    treeItem.addChild(controllerTree);
                });


                this.__avatarTreeItem.addChild(treeItem);
                this.__controllers.push(treeItem);
            }
            this.__controllers[i].setVisible(true);
            this.__controllers[i].setLocalXfo(data.controllers[i].xfo);
        }
        // Hide any controllers that have turned off
        if (this.__controllers.length > data.controllers.length) {
            for (let i = data.controllers.length; i < this.__controllers.length; i++) {
                this.__controllers[i].setVisible(false);
            }
        }
    }

    onViewChanged(data) {
        switch (data.interfaceType) {
            case 'CameraAndPointer':
                if (this.__currentViewMode !== 'CameraAndPointer') {
                    this.setCameraAndPointer(data);
                }
                this.__avatarTreeItem.getChild(0).setLocalXfo(data.viewXfo);
                break;
                // case 'TabletAndFinger':
                //     if (this.__currentViewMode !== 'CameraAndPointer') {

                //     }
                break;
            case 'Vive':
                if (this.__currentViewMode !== 'Vive') {
                    this.setViveRepresentation(data);
                }

                this.__avatarTreeItem.getChild(0).setLocalXfo(data.viewXfo);
                if (data.controllers)
                    this.updateViveControllers(data);
                break;
            case 'Daydream':
                break;
            case 'Occulus':
                break;
        }

        //this.__treeItem.requestRedraw();
    };


    onUserMessage(data) {
        const tmp = convertValuesFromJSON(data)
        if (tmp.type == 'viewChanged') {
            this.onViewChanged(tmp);
        } else if (tmp.type == 'pointerMoved') {
            this.onPointerMoved(tmp);
        } else if (tmp.type == 'strokeStarted') {

            this.userMarker.color = tmp.color;
            this.userMarker.thickness = tmp.thickness;
            this.onStrokeStarted(tmp);
        } else if (tmp.type == 'strokePoint') {
            this.onStrokePoint(tmp);
        } else if (tmp.type == 'strokeEnded') {
            this.onStrokeEnded(tmp);
        }
    }

    destroy() {
        this.__parentTreeItem.removeChildByHandle(this.__treeItem);
        // Notr: the marker pen tool stays, as we don't want lines
        // dissappearing after a user quits.
    }
};

export {
    SessionParticipant
};