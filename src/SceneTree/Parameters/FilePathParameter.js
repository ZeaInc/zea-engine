import {
    ValueSetMode,
    ParamFlags,
    Parameter
} from './Parameter.js';
import {
    resourceLoader
} from '../ResourceLoader.js';

class FilePathParameter extends Parameter {
    constructor(name, exts) {
        super(name, '', 'FilePath');

        if (exts)
            this.setSupportedExts(exts);
    }

    setSupportedExts(exts) {
        // Note: supported Extensions should be in the format ext1|exts2|ext3
        this.__reextensions = new RegExp('\\.(' + exts + ')$', "i");
    }

    getFilepath() {
        if (this.__file) {
            return resourceLoader.getFilepath(this.__file.id);
        }
        return '';
    }

    setFilepath(filePath, mode) {
        const resourceId = resourceLoader.resolveFilePathToId(filePath);
        if (!resourceId) {
            console.warn("Resource unavailable:" + filePath);
            return;
        }
        this.setValue(resourceId, mode);
    }

    getFilename() {
        if (this.__file) {
            return this.__file.name;
        }
    }

    getExt() {
        const filename = this.getFilename();
        const suffixSt = filename.lastIndexOf('.')
        if (suffixSt != -1)
            return filename.substring(suffixSt).toLowerCase()
    }

    getStem() {
        const filename = this.getFilename();
        if (filename) {
            const parts = filename.split('.');
            if (parts.length == 2)
                return parts[0];
            else
                return filename;
        }
    }

    getFileFolder() {
        if (this.__file) {
            if (this.__file.parent)
                return resourceLoader.getFile(this.__file.parent);
            return resourceLoader.getRootFolder();
        }
    }

    getFileFolderPath() {
        const filePath = this.getFilepath();
        if (filePath) {
            return filePath.substring(0, filePath.lastIndexOf("/")) + '/';
        }
    }

    getFile() {
        return this.__file;
    }

    getFileDesc() {
        // Can we settle on a convention?
        // console.warn("Deprecated method: 'getFileDesc'. Please use 'getFile'")
        return this.__file;
    }

    getURL() {
        return this.__file ? this.__file.url : undefined;
    }

    cloneMembers(clonedParam) {
        clonedParam.__file = this.__file;
    }

    clone() {
        const clonedParam = new FilePathParameter(this.__name);
        this.cloneMembers(clonedParam);
        return clonedParam;
    }


    setDirty(cleanerFn) {
        throw ("Cannot drive a filepath param from an oporator")
    }

    setValue(value, mode = ValueSetMode.USER_SETVALUE) { // 0 == normal set. 1 = changed via cleaner fn, 2=change by loading/cloning code.
        if (value == undefined) {
            throw ("Invalid value for setValue.");
        }
        if (value.indexOf('.') > 0) {
            console.warn("Deprecation warning for setValue. setValue should now only take a file id, not a path.");
            return this.setFilepath(value, mode)
        }
        // Note: equality tests only work on simple types.
        // Important here because file changes cause reloads..
        if (value == this.__value) {
            return;
        }

        // Note: the file path is selected by using the file browser
        // For now it can return an aboslute path(within the project)
        // and we convert to relative when we save.
        const resourceId = value;
        if (!resourceLoader.resourceAvailable(resourceId)) {
            console.warn("Resource unavailable:" + resourceId);
            return;
        }

        const file = resourceLoader.getFile(resourceId);
        if (this.__reextensions && !this.__reextensions.test(file.name)) {
            console.warn("Unsupported file type:" + file.name);
            return false;
        }

        this.__value = value;
        this.__file = file;

        if (mode == ValueSetMode.USER_SETVALUE)
            this.__flags |= ParamFlags.USER_EDITED;
        this.valueChanged.emit(mode);
    }
    //////////////////////////////////////////
    // Persistence


    toJSON(context) {
        if ((this.__flags & ParamFlags.USER_EDITED) == 0)
            return;
        const j = {};
        if (this.__file) {
            j.value = this.__file.id;
            // For cases where the file ID changed. 
            // e.g. if a file was deleted from the system, and
            // then re-added
            j.filepath = resourceLoader.getFilepath(this.__file.id)
        }
        return j;
    }

    fromJSON(j, context) {
        if (j.value) {
            if (j.value.indexOf('.') > 0) {
                this.setFilepath(j.value, ValueSetMode.DATA_LOAD)
                return;
            } else {
                if (resourceLoader.resourceAvailable(j.value)) {
                    this.setValue(j.value, ValueSetMode.DATA_LOAD);
                    return;
                }
            }
        }
        if (j.filepath) {
            const resourceId = resourceLoader.resolveFilePathToId(j.filepath);
            if (!resourceId) {
                console.warn("Resource unavailable:" + j.filepath);
            } else {
                this.setValue(resourceId, ValueSetMode.DATA_LOAD);
                return;
            }
        }
    }


};


export {
    FilePathParameter
};