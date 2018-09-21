import {
    Signal
} from './Signal.js';

class Async {
    constructor(asyncCount=0) {
        this.__asyncCount = asyncCount;
        this.ready = new Signal(true);

        this.incAsyncCount = (count=1) => {
            this.__asyncCount+=count;
        };

        this.decAsyncCount = () => {
            if (this.__asyncCount > 0){
                this.__asyncCount--;
                if (this.__asyncCount == 0) {
                    this.__asyncsCompleted();
                }
            }
        };

        this.__asyncsCompleted = function(){
            this.ready.emit();
        }.bind(this)
    }

    get count(){
        return this.__asyncCount;
    }

};

export {
    Async
};
// export default Async;

