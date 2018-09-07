import {
    JSON_stringify_fixedPrecision
} from './Common.js';
import {
    Vec3
} from './Vec3.js';
import {
    Mat4
} from './Mat4.js';
import {
    Quat
} from './Quat.js';
import {
    typeRegistry
} from './TypeRegistry.js';

const sc_helper = new Vec3(1, 1, 1);

class Xfo {
    constructor(tr = undefined, ori = undefined, sc = undefined) {

        if (tr instanceof Float32Array) {
            this.__data = x;
            return;
        } 

        this.__data = new Float32Array(10);

        if (tr instanceof Vec3) {
            this.tr = tr;
        } else if (tr instanceof Quat && ori == undefined && sc == undefined) {
            this.ori = tr; // Xfo constructor with just a Quat.
            this.sc.set(1, 1, 1);
            return;
        } else {
            this.tr = new Vec3();
        }

        if (ori instanceof Quat) {
            this.ori = ori;
        } else {
            this.ori = new Quat();
        }

        if (sc instanceof Vec3) {
            this.sc = sc;
        } else {
            this.sc.set(1, 1, 1);
        }
    }


    get tr() {
        return Vec3.createFromFloat32Buffer(this.__data, 0);
    }

    set tr(val) {
        this.tr.setFromOther(val)
    }

    get ori() {
        return Quat.createFromFloat32Buffer(this.__data, 3);
    }

    set ori(val) {
        this.ori.setFromOther(val)
    }

    get sc() {
        return Vec3.createFromFloat32Buffer(this.__data, 7);
    }

    set sc(val) {
        this.sc.setFromOther(val)
    }

    set(tr, ori, sc = undefined) {
        this.tr = tr;
        this.ori = ori;
        if (sc instanceof Vec3)
            this.sc = sc;
    }

    setFromOther(xfo) {
        this.__data.set(xfo.__data)
    }

    isIdentity() {
        return this.tr.isNull() && this.ori.isIdentity() && this.sc.is111();
    }

    setLookAt(pos, target, up) {
        // Note: we look along the -z axis. Negate the direction.
        const dir = pos.subtract(target);
        const dirLen = dir.length();
        if (dirLen < Number.EPSILON) {
            throw ("Invalid dir");
            return;
        }
        this.ori.setFromDirectionAndUpvector(dir, up);
        this.tr = pos;
    }

    /// Multiplies two transforms
    multiply(xfo) {

        if ((this.sc.x != this.sc.y || this.sc.x != this.sc.z) && !xfo.ori.isIdentity()) {
            if (Math.abs(this.sc.x - this.sc.y) > 0.000001 || Math.abs(this.sc.x - this.sc.z) > 0.000001) {
                console.warn('Xfo.multiply: Cannot multiply to xfos with non-uniform scaling without causing shearing. Use Mat44s instead.');
            }
        }

        const result = new Xfo(
            this.tr.add(this.ori.rotateVec3(this.sc.multiply(xfo.tr))),
            this.ori.multiply(xfo.ori),
            this.sc.multiply(xfo.sc)
        );
        return result;
    }


    inverse() {
        const result = new Xfo();
        result.sc = this.sc.inverse();
        result.ori = this.ori.inverse();
        result.tr = result.ori.rotateVec3(this.tr.negate().multiply(result.sc));
        return result;
    }

    transformVec3(vec3) {
        return this.tr.add(this.ori.rotateVec3(this.sc.multiply(vec3)));
    }

    toMat4() {
        const scl = new Mat4(
            this.sc.x, 0, 0, 0,
            0, this.sc.y, 0, 0,
            0, 0, this.sc.z, 0,
            0, 0, 0, 1.0);

        const rot = this.ori.toMat4();

        const trn = new Mat4();
        trn.translation = this.tr;

        return trn.multiply(rot).multiply(scl);
    }


    setFromFloat32Array(float32array) {
        if (float32array.length == 7) {
            this.__data.set(float32array)
            this.sc.set(1, 1, 1);
            return;
        }
        if (float32array.length == 8) {
            this.__data.set(float32array.subarray(0, 7))
            const scl = float32array[7];
            this.sc.set(scl, scl, scl);
            return;
        }
        if (float32array.length == 10) {
            this.__data.set(float32array)
            return;
        }
    }

    clone() {
        return new Xfo(this.__data.slice(0, 8))
    }

    //////////////////////////////////////////
    // Static Methods

    static create(...args) {
        return new Xfo(...args);
    }


    static createFromJSON(json) {
        let result = new Xfo();
        result.fromJSON(json);
        return result;
    }

    static createFromFloat32Buffer(buffer, offset = 0) {
        return new Xfo(new Float32Array(buffer, offset * 4, 10)); // 4 bytes per 32bit float
    }

    // Returns an Xfo that is bound to a portion of the given typed array.
    static createFromFloat32Array(array, offset = 0) {
        return new Xfo(array.subarray(offset * 4, 10));
    }

    static numFloat32Elements() {
        return 10;
    }

    /////////////////////////////
    // Persistence


    toJSON() {
        const j = {
            tr: this.tr.toJSON(),
            ori: this.ori.toJSON()
        };
        if (!this.sc.is111())
            j.sc = this.sc.toJSON();
        return j;
    }

    fromJSON(j) {
        this.tr.fromJSON(j.tr);
        this.ori.fromJSON(j.ori);
        if (j.sc) {
            this.sc.fromJSON(j.sc);
        }
    }

    toString() {
        return JSON_stringify_fixedPrecision(this.toJSON())
    }
};

typeRegistry.registerType('Xfo', Xfo);

export {
    Xfo
};
// export default Xfo;