import {
  Signal
} from '../../Utilities';
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

    this.fileUpdated = new Signal();
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

  clone(flags) {
    const clonedParam = new FilePathParameter(this.__name);
    clonedParam.__file = this.__file;
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

    if (window.VisualiveSessionFactory) {

      // Listen to changes in the folder.
      // If a file is uploaded to the same folder, 
      // we will get notified.
      const visualiveSession = window.VisualiveSessionFactory.getInstance(
        resourceLoader.getCurrentUser(),
        resourceLoader.getProjectId(),
      )

      this.__unsubFileWithProgress = visualiveSession.sub(
        window.VisualiveSession.actions.FILE_WITH_PROGRESS,
        payload => {
          const changedFile = payload.file;
          // Currently the id provided does not match any existing ids, because
          // it is replaced after uploading is complete. Use file.name for now.
          // In the future, we should see the id of the upload matching
          // an id in drive if a file is being updated.
          if (changedFile.name == this.__file.name && 
            changedFile.progress && 
            changedFile.progress.percentageCompleted == 100) {
            this.fileUpdated.emit();
          }
        }
      )
    }

    if (mode == ValueSetMode.USER_SETVALUE)
      this.__flags |= ParamFlags.USER_EDITED;
    this.valueChanged.emit(mode);
  }
  //////////////////////////////////////////
  // Persistence


  toJSON(context, flags) {
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

  fromJSON(j, context, flags) {
    if (j.value) {
      if (j.value.indexOf('.') > 0) {
        this.setFilepath(j.value, ValueSetMode.DATA_LOAD)
        return;
      } else {
        if (resourceLoader.resourceAvailable(j.value)) {
          this.setValue(j.value, ValueSetMode.DATA_LOAD);
          this.__flags |= ParamFlags.USER_EDITED;
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

  destroy() {
    super.destroy();

  }


};


export {
  FilePathParameter
};
