import chai from 'chai';
import {
    Xfo
} from '../../lib/Visualive.js';

chai.expect();
const expect = chai.expect;

describe('Xfo', function() {

    it('defaultConstructor', () => {
        let xfo = new Xfo();
        expect(xfo.toString()).to.deep.equal('TODO');
    });
    
    it('setFromDirectionAndUpvector', () => {
        let pos = new Vec3(1, 1, 0);
        let target = new Vec3();
        let up = new Vec3(0, 1, 0);
        let mat4 = new Mat4();
        mat4.setLookAt(pos, target, up);
        expect(mat4.toString()).to.be.equal('TODO');

        let xfo = new Xfo();
        xfo.setLookAt(pos, target, up);
        expect(xfo.toMat4().toString()).to.be.equal('TODO');
    }
}
});