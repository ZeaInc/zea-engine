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
    typeRegistry
} from './TypeRegistry.js';

class Box3 {
    constructor(p0 = undefined, p1 = undefined) {
        if (p0 instanceof Float32Array) {
            this.setFromFloat32Array(p0);
            return;
        }
        if (p0 instanceof Vec3) {
            this.p0 = p0;
        } else {
            this.p0 = new Vec3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        }
        if (p1 instanceof Vec3) {
            this.p1 = p1;
        } else {
            this.p1 = new Vec3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        }
    }

    set(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }

    reset() {
        this.p0.x = Number.POSITIVE_INFINITY;
        this.p1.x = Number.NEGATIVE_INFINITY;
        this.p0.y = Number.POSITIVE_INFINITY;
        this.p1.y = Number.NEGATIVE_INFINITY;
        this.p0.z = Number.POSITIVE_INFINITY;
        this.p1.z = Number.NEGATIVE_INFINITY;
    }

    isValid() {
        return this.p0.x != Number.POSITIVE_INFINITY && this.p1.x != Number.NEGATIVE_INFINITY &&
            this.p0.y != Number.POSITIVE_INFINITY && this.p1.y != Number.NEGATIVE_INFINITY &&
            this.p0.z != Number.POSITIVE_INFINITY && this.p1.z != Number.NEGATIVE_INFINITY;
    }

    addPoint(point) {
        if (point.x != Number.POSITIVE_INFINITY && point.x != Number.NEGATIVE_INFINITY) {
            if (point.x < this.p0.x)
                this.p0.x = point.x;
            if (point.x > this.p1.x)
                this.p1.x = point.x;
        }
        if (point.y != Number.POSITIVE_INFINITY && point.y != Number.NEGATIVE_INFINITY) {
            if (point.y < this.p0.y)
                this.p0.y = point.y;
            if (point.y > this.p1.y)
                this.p1.y = point.y;
        }
        if (point.z != Number.POSITIVE_INFINITY && point.z != Number.NEGATIVE_INFINITY) {
            if (point.z < this.p0.z)
                this.p0.z = point.z;
            if (point.z > this.p1.z)
                this.p1.z = point.z;
        }
    }

    addBox3(box3, xfo = undefined) {
        if (xfo) {
            // transform each corner of the box33 into the new coord sys
            this.addPoint(xfo.transformVec3(box3.p0));
            this.addPoint(xfo.transformVec3(new Vec3(box3.p0.x, box3.p0.y, box3.p1.z)));
            this.addPoint(xfo.transformVec3(new Vec3(box3.p0.x, box3.p1.y, box3.p0.z)));
            this.addPoint(xfo.transformVec3(new Vec3(box3.p1.x, box3.p0.y, box3.p0.z)));
            this.addPoint(xfo.transformVec3(new Vec3(box3.p0.x, box3.p1.y, box3.p1.z)));
            this.addPoint(xfo.transformVec3(new Vec3(box3.p1.x, box3.p0.y, box3.p1.z)));
            this.addPoint(xfo.transformVec3(new Vec3(box3.p1.x, box3.p1.y, box3.p0.z)));
            this.addPoint(xfo.transformVec3(box3.p1));
        } else {
            this.addPoint(box3.p0);
            this.addPoint(box3.p1);
        }
    }

    size() {
        return this.p1.subtract(this.p0);
    }
    diagonal() {
        return this.p1.subtract(this.p0);
    }

    center() {
        let result = this.p1.subtract(this.p0);
        result.scaleInPlace(0.5);
        result.addInPlace(this.p0);
        return result;
    }

    toMat4() {
        let sc_x = this.p1.x - this.p0.x;
        let sc_y = this.p1.y - this.p0.y;
        let sc_z = this.p1.z - this.p0.z;
        return new Mat4(
            sc_x, 0, 0, 0,
            0, sc_y, 0, 0,
            0, 0, sc_z, 0,
            this.p0.x, this.p0.y, this.p0.z, 1.0);
    }


    clone() {
        return new Box3(
            this.p0.clone(),
            this.p1.clone()
        );
    }


    //////////////////////////////////////////
    // Static Methods

    static create(...args) {
        return new Box2(...args);
    }

    static sizeInBytes(){
        return 24;
    }

    //////////////////////////////////////////
    // Persistence

    toJSON() {
        return {
            p0: this.p0.toJSON(),
            p1: this.p1.toJSON()
        }
    }

    fromJSON(j) {
        this.p0.fromJSON(j.p0);
        this.p1.fromJSON(j.p1);
    }

    loadBin(data, byteOffset) {
        this.p0.loadBin(data, byteOffset);
        this.p0.loadBin(data, byteOffset + 12);
    }


    setFromFloat32Array(float32array) {
        this.p0 = new Vec3(float32array.buffer, float32array.byteOffset);
        this.p1 = new Vec3(float32array.buffer, float32array.byteOffset + 12);
    }

    toString() {
        return JSON_stringify_fixedPrecision(this.toJSON())
    }
};

typeRegistry.registerType('Box3', Box3);

export {
    Box3
};
// export default Box3;