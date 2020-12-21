/* eslint-disable constructor-super */
import { BooleanParameter, NumberParameter } from './Parameters/index';
import { FilePathParameter } from './Parameters/FilePathParameter';
import { TreeItem } from './TreeItem.js';
/**
 * A special type of `TreeItem` that let you handle audio files.
 * <br>
 * <br>
 * **Parameters**
 * * **FilePath(`FilePathParameter`):**
 * * **Autoplay(`BooleanParameter`):**
 * * **PlayState(`NumberParameter`):**
 * * **Mute(`BooleanParameter`):**
 * * **Gain(`NumberParameter`):**
 * * **Loop(`BooleanParameter):**
 * * **SpatializeAudio(`BooleanParameter`):**
 * * **refDistance(`NumberParameter`):**
 * * **maxDistance(`NumberParameter`):**
 * * **rolloffFactor(`NumberParameter`):**
 * * **coneInnerAngle(`NumberParameter`):**
 * * **coneOuterGain(`NumberParameter`):**
 *
 * **Events**
 * * **loaded**
 * * **audioSourceCreated**
 * @private
 * @extends TreeItem
 */
class AudioItem extends TreeItem {
    __loaded: any;
    getAudioSource: any;
    isPlaying: any;
    loaded: any;
    mute: any;
    pause: any;
    play: any;
    stop: any;
    /**
     * Create an audio item.
     * @param {string} name - The name of the audio item.
     */
    constructor(name: any) {
        super(name);
        this.__loaded = false;
        const fileParam = this.addParameter(new FilePathParameter('FilePath'));
        let audioSource: any;
        let audioBuffer: any;
        const startAudioPlayback = () => {
            audioSource = (window as any).ZeaAudioaudioCtx.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.loop = loopParam.getValue();
            audioSource.muted = muteParam.getValue();
            audioSource.start(0);
            this.emit('audioSourceCreated', { audioSource });
        };
        fileParam.on('valueChanged', () => {
            const request = new XMLHttpRequest();
            request.open('GET', fileParam.getURL(), true);
            request.responseType = 'arraybuffer';
            request.onload = () => {
                const audioData = request.response;
                // Note: this code is not pretty and should not access the global object
                // However, its difficult to handle this case.
                // TODO: clean this up.
                (window as any).ZeaAudioaudioCtx.decodeAudioData(audioData, (buffer: any) => {
                    audioBuffer = buffer;
                    this.__loaded = true;
                    this.emit('loaded', {});
                    if (autoplayParam.getValue())
                        startAudioPlayback();
                }, (e: any) => {
                    console.log('Error with decoding audio data' + e.err);
                });
            };
            request.send();
        });
        const autoplayParam = this.addParameter(new BooleanParameter('Autoplay', false));
        const playStateParam = this.addParameter(new NumberParameter('PlayState', 0));
        playStateParam.on('valueChanged', (event: any) => {
            switch (playStateParam.getValue()) {
                case 0:
                    if (this.__loaded) {
                        if (audioSource) {
                            audioSource.stop(0);
                            audioSource = undefined;
                        }
                    }
                    break;
                case 1:
                    if (this.__loaded) {
                        startAudioPlayback();
                    }
                    break;
            }
        });
        this.isPlaying = () => {
            return playStateParam.getValue() != 0;
        };
        this.play = () => {
            playStateParam.setValue(1);
        };
        this.stop = () => {
            playStateParam.setValue(0);
        };
        this.pause = () => {
            playStateParam.setValue(0);
        };
        this.getAudioSource = () => {
            return audioSource;
        };
        const muteParam = this.addParameter(new BooleanParameter('Mute', false));
        this.addParameter(new NumberParameter('Gain', 1.0)).setRange([0, 5]);
        const loopParam = this.addParameter(new BooleanParameter('Loop', false));
        this.addParameter(new BooleanParameter('SpatializeAudio', true));
        this.addParameter(new NumberParameter('refDistance', 2));
        this.addParameter(new NumberParameter('maxDistance', 10000));
        // Defaults taken from here.: https://github.com/mdn/webaudio-examples/blob/master/panner-node/main.js
        this.addParameter(new NumberParameter('rolloffFactor', 1));
        this.addParameter(new NumberParameter('coneInnerAngle', 360));
        this.addParameter(new NumberParameter('coneOuterAngle', 0));
        this.addParameter(new NumberParameter('coneOuterGain', 1));
        muteParam.on('valueChanged', () => {
            if (audioSource)
                audioSource.muted = muteParam.getValue();
        });
        loopParam.on('valueChanged', () => {
            if (audioSource)
                audioSource.loop = loopParam.getValue();
        });
        this.mute = (value: any) => {
            muteParam.setValue(value);
        };
        // Note: Many parts of the code assume a 'loaded' signal.
        // We should probably deprecate and use only 'updated'.
        this.loaded = false;
    }
    /**
     * Returns loaded status of the audio item
     *
     * @return {boolean} - `The return value`.
     */
    isLoaded() {
        return this.__loaded;
    }
    /**
     * The setAudioStream method.
     * @param {any} audio - The audio value.
     */
    setAudioStream() {
        this.__loaded = true;
        this.emit('loaded', {});
        // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
        this.emit('audioSourceCreated', { audioSource });
    }
}
/** Class representing a audio file item in a scene tree.
 * @ignore
 * @extends AudioItem
 */
class FileAudioItem extends AudioItem {
    /**
     * Create a audio file item.
     * @param {string} name - The name of the audio file.
     */
    // @ts-expect-error ts-migrate(2377) FIXME: Constructors for derived classes must contain a 's... Remove this comment to see the full error message
    constructor(name: any) { }
}
export { AudioItem, FileAudioItem };
