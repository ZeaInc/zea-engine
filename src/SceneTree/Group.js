import { Vec2, Vec3, Color, Xfo } from '../Math';
import { Signal } from '../Utilities';
import {
  ValueSetMode,
  BooleanParameter,
  NumberParameter,
  StringParameter,
  Vec3Parameter,
  ColorParameter,
  XfoParameter,
  TreeItemParameter,
  ItemSetParameter,
  MultiChoiceParameter,
} from './Parameters';
import { MaterialParameter } from './Parameters/MaterialParameter.js';
import {
  QueryParameter,
  QUERY_TYPES,
  QUERY_MATCH_TYPE,
  QUERY_LOGIC,
} from './Parameters/QueryParameter.js';

import { QuerySet } from './Parameters/QuerySetParameter.js';

import { ItemFlags } from './BaseItem';
import { TreeItem } from './TreeItem';
import { BaseGeomItem } from './BaseGeomItem';
import { sgFactory } from './SGFactory.js';

const GROUP_INITIAL_XFO_MODES = {
  first: 0,
  average: 1,
};

class Group extends TreeItem {
  constructor(name) {
    super(name);

    // This setting makes selection propagate from items
    // to the group, which then propagates down to the items
    this.propagateSelectionToItems = false;
    this.propagateXfoToItems = true;
    this.propagateSelectionChangesFromItems = false;

    this.__calculatingInvInitialXfo = false;
    this.__invInitialXfo = undefined;
    this.__initialXfos = [];
    this.__signalIndices = [];

    this.__searchRootParam = this.insertParameter(
      new TreeItemParameter('SearchRoot'),
      0
    );
    this.__searchRootParam.valueChanged.connect(() => {
      this.resolveQueries();
    });

    this.__searchSetParam = this.insertParameter(new QuerySet('Queries'), 1);
    this.__searchSetParam.valueChanged.connect(changeType => {
      this.resolveQueries();
    });
    this.__itemsParam = this.insertParameter(new ItemSetParameter('Items'), 2);

    this.__initialXfoModeParam = this.insertParameter(
      new MultiChoiceParameter(
        'InitialXfoMode',
        GROUP_INITIAL_XFO_MODES.average,
        ['first', 'average']
      ),
      3
    );
    this.__initialXfoModeParam.valueChanged.connect(() => {
      this.recalcInitialXfo();
    });

    this.__highlightedParam = this.insertParameter(
      new BooleanParameter('Highlighted', false),
      4
    );
    this.__highlightedParam.valueChanged.connect(() => {
      this.__updateHighlight();
    });

    this.__updateHighlight = this.__updateHighlight.bind(this);
    const highlightColorParam = this.insertParameter(
      new ColorParameter('HighlightColor', new Color(0.5, 0.5, 1)),
      5
    );
    highlightColorParam.valueChanged.connect(this.__updateHighlight);
    const highlightFillParam = this.insertParameter(
      new NumberParameter('HighlightFill', 0.0, [0, 1]),
      6
    );
    highlightFillParam.valueChanged.connect(this.__updateHighlight);

    this.__materialParam = this.insertParameter(
      new MaterialParameter('Material'),
      7
    );
    this.__materialParam.valueChanged.connect(() => {
      this.__updateMaterial();
    });

    this.__updateCutaway = this.__updateCutaway.bind(this);
    this.insertParameter(
      new BooleanParameter('CutAwayEnabled', false),
      8
    ).valueChanged.connect(this.__updateCutaway);
    this.insertParameter(
      new Vec3Parameter('CutVector', new Vec3(1, 0, 0)),
      9
    ).valueChanged.connect(this.__updateCutaway);
    this.insertParameter(
      new NumberParameter('CutDist', 0.0),
      10
    ).valueChanged.connect(this.__updateCutaway);

    this.__globalXfoParam.valueChanged.connect(changeType => {
      if (!this.propagateXfoToItems) return;

      const items = Array.from(this.__itemsParam.getValue());
      // Only after all the items are resolved do we have an invXfo and we can tranform our items.
      if (
        !this.__calculatingInvInitialXfo &&
        items.length > 0 &&
        this.__invInitialXfo
      ) {
        let delta;
        const xfo = this.__globalXfoParam.getValue();
        const setDirty = (item, initialXfo) => {
          const clean = () => {
            if (!delta) {
              const xfo = this.__globalXfoParam.getValue();
              // Compute the skinning transform that we can
              // apply to all the items in the group.
              delta = xfo.multiply(this.__invInitialXfo);
            }
            return delta.multiply(initialXfo);
          };
          item.getParameter('GlobalXfo').setDirty(clean);
        };
        const len = items.length;
        for (let i = 0; i < len; i++) {
          setDirty(items[i], this.__initialXfos[i]);
        }
      }
    });

    this.mouseDownOnItem = new Signal();
  }

  destroy() {
    super.destroy();
  }

  clone(flags) {
    const cloned = new Group();
    cloned.copyFrom(this, flags);
    return cloned;
  }

  copyFrom(src, flags) {
    super.copyFrom(src, flags);
  }
  setOwner(owner) {
    super.setOwner(owner);

    if (this.__searchRootParam.getValue() == undefined)
      this.__searchRootParam.setValue(owner);
  }

  // //////////////////////////////

  __updateVisiblity() {
    if (super.__updateVisiblity()) {
      const value = this.getVisible();
      Array.from(this.__itemsParam.getValue()).forEach(item => {
        item.propagateVisiblity(this.__visible ? 1 : -1);
      });
      return true;
    }
    return false;
  }

  // /////////////////////////////

  __updateHighlight() {
    let highlighted = false;
    let color;
    if (this.getParameter('Highlighted').getValue()) {
      highlighted = true;
      color = this.getParameter('HighlightColor').getValue();
      color.a = this.getParameter('HighlightFill').getValue();
    } else if (this.getSelected()) {
      highlighted = true;
      color = TreeItem.getBranchSelectionOutlineColor();
    }

    Array.from(this.__itemsParam.getValue()).forEach(item => {
      if (highlighted)
        item.addHighlight('groupItemHighlight' + this.getId(), color, true);
      else item.removeHighlight('groupItemHighlight' + this.getId(), true);
    });
  }

  setSelected(sel) {
    super.setSelected(sel);
    this.__updateHighlight();
  }

  // ////////////////////////////////////////
  // Materials

  __updateMaterial() {
    const material = this.getParameter('Material').getValue();

    Array.from(this.__itemsParam.getValue()).forEach(item => {
      item.traverse(treeItem => {
        if (treeItem.hasParameter('Material')) {
          if (material) {
            treeItem.__backupMaterial = treeItem
              .hasParameter('Material')
              .getValue();
            treeItem.hasParameter('Material').setValue(material);
          } else {
            treeItem
              .hasParameter('Material')
              .setValue(treeItem.__backupMaterial);
          }
        }
      }, false);
    });
  }

  // ////////////////////////////////////////
  // Cutaways
  __updateCutaway() {
    const cutEnabled = this.getParameter('CutAwayEnabled').getValue();
    const cutAwayVector = this.getParameter('CutVector').getValue();
    const cutAwayDist = this.getParameter('CutDist').getValue();

    Array.from(this.__itemsParam.getValue()).forEach(item => {
      item.traverse(treeItem => {
        if (treeItem instanceof BaseGeomItem) {
          treeItem.setCutawayEnabled(cutEnabled);
          treeItem.setCutVector(cutAwayVector);
          treeItem.setCutDist(cutAwayDist);
        }
      }, true);
    });
  }

  // ////////////////////////////////////////
  // Items
  // This function is mostly used in our demos, and
  // should be removed from the interface
  setPaths(paths) {
    this.clearItems(false);
    paths.forEach(path => {
      const query = new QueryParameter(
        'path',
        QUERY_TYPES.PATH,
        QUERY_MATCH_TYPE.EXACT,
        QUERY_LOGIC.NEWSET
      );
      let value;
      if (Array.isArray(path)) value = path.join('/');
      else value = path;
      query.setValue(value);
      this.__searchSetParam.addItem(query, false);
    });
    this.__searchSetParam.valueChanged.emit();
  }
  // For backwards compatiblity.
  resolveItems(paths) {
    this.setPaths(paths);
  }

  resolveQueries() {
    const searchRoot = this.__searchRootParam.getValue();
    if (searchRoot == undefined) return;

    const queries = Array.from(this.__searchSetParam.getValue());
    if (queries.length == 0) return;

    let result = [];
    let set = []; // Each time we hit an OR operator, we start a new set.
    let prevset = [];
    let first = true;
    // Filter it down, and then merge into result.
    queries.forEach((query, index) => {
      try {
        if (!query.getEnabled() || query.getValue() == '') return;

        const negate = query.getNegate();
        const applyTest = (res, item) => {
          if (negate && !res) set.push(item);
          else if (!negate && res) set.push(item);
        };
        // If we hit an 'OR' query, we want the prevset
        // to the set generated before the previous query.
        // So: TestA && TestB || TestC
        if (query.getLocicalOperator() == QUERY_LOGIC.AND) {
          prevset = set;
        }
        if (first || query.getLocicalOperator() == QUERY_LOGIC.NEWSET) {
          first = false; // The first enabled query.
          result = result.concat(set);
          set = [];

          switch (query.getQueryType()) {
            case QUERY_TYPES.PATH: {
              if (query.getMatchType() == QUERY_MATCH_TYPE.EXACT) {
                const path = query.getValue();
                const treeItem = searchRoot.resolvePath(path);
                if (treeItem) {
                  set.push(treeItem);
                } else {
                  console.warn('Group could not resolve item:' + path);
                }
              } else if (query.getMatchType() == QUERY_MATCH_TYPE.REGEX) {
                const regex = query.getRegex();
                const searchRootPath = searchRoot.getPath();
                searchRoot.traverse(item => {
                  const itemPath = item.getPath().slice(searchRootPath.length);
                  applyTest(regex.test(String(itemPath)), item);
                }, false);
              }
              break;
            }
            case QUERY_TYPES.NAME: {
              const regex = query.getRegex();
              searchRoot.traverse(item => {
                applyTest(regex.test(item.getName()), item);
              }, false);
              break;
            }
            case QUERY_TYPES.PROPERTY: {
              const regex = query.getRegex();
              searchRoot.traverse(item => {
                let res = false;
                if (item.hasParameter(query.getPropertyName())) {
                  const prop = item.getParameter(query.getPropertyName());
                  if (
                    prop instanceof StringParameter &&
                    regex.test(prop.getValue())
                  )
                    res = true;
                }
                applyTest(res, item);
              }, false);
              break;
            }
            case QUERY_TYPES.LEVEL: {
              const regex = query.getRegex();
              const searchRootPath = searchRoot.getPath();
              searchRoot.traverse(item => {
                const itemPath = item.getPath().slice(searchRootPath.length);
                applyTest(itemPath.length > 4 && regex.test(itemPath[3]), item);
              }, false);
              break;
            }
            case QUERY_TYPES.LAYER: {
              const value = query.getValue();
              searchRoot.traverse(item => {
                applyTest(item.getLayers().indexOf(value) != -1, item);
              }, false);
              break;
            }
            case QUERY_TYPES.MATERIAL: {
              const regex = query.getRegex();
              searchRoot.traverse(item => {
                let res = false;
                if (item.hasParameter('material')) {
                  const material = item.getParameter('material').getValue();
                  if (regex.test(material.getName())) res = true;
                }
                applyTest(res, item);
              }, false);
              break;
            }
          }
        } else {
          switch (query.getQueryType()) {
            case QUERY_TYPES.PATH: {
              const regex = query.getRegex();
              const f = item =>
                negate
                  ? !regex.test(item.getPath())
                  : regex.test(item.getPath());

              if (query.getLocicalOperator() == QUERY_LOGIC.AND)
                set = set.filter(f);
              else if (query.getLocicalOperator() == QUERY_LOGIC.OR)
                set = set.concat(prevset.filter(f));
              break;
            }
            case QUERY_TYPES.NAME: {
              const regex = query.getRegex();
              const f = item =>
                negate
                  ? !regex.test(item.getName())
                  : regex.test(item.getName());

              if (query.getLocicalOperator() == QUERY_LOGIC.AND)
                set = set.filter(f);
              else if (query.getLocicalOperator() == QUERY_LOGIC.OR)
                set = set.concat(prevset.filter(f));
              break;
            }
            case QUERY_TYPES.PROPERTY: {
              const regex = query.getRegex();
              const f = item => {
                let res = false;
                if (item.hasParameter(query.getPropertyName())) {
                  const prop = item.getParameter(query.getPropertyName());
                  // Note: the property must be a string property.
                  if (
                    prop instanceof StringParameter &&
                    regex.test(prop.getValue())
                  )
                    res = true;
                }
                return negate ? !res : res;
              };
              if (query.getLocicalOperator() == QUERY_LOGIC.AND)
                set = set.filter(f);
              else if (query.getLocicalOperator() == QUERY_LOGIC.OR)
                set = set.concat(prevset.filter(f));
              break;
            }
            case QUERY_TYPES.LEVEL: {
              const searchRootPath = searchRoot.getPath();
              const regex = query.getRegex();
              const f = item => {
                let res = false;
                const itemPath = item.getPath().slice(searchRootPath.length);
                if (itemPath.length > 4 && regex.test(itemPath[3])) res = true;
                return negate ? !res : res;
              };
              if (query.getLocicalOperator() == QUERY_LOGIC.AND)
                set = set.filter(f);
              else if (query.getLocicalOperator() == QUERY_LOGIC.OR)
                set = set.concat(prevset.filter(f));
              break;
            }
            case QUERY_TYPES.LAYER: {
              const value = query.getValue();
              const f = item => {
                let res = false;
                if (item.getLayers().indexOf(value) != -1) res = true;
                return negate ? !res : res;
              };
              if (query.getLocicalOperator() == QUERY_LOGIC.AND)
                set = set.filter(f);
              else if (query.getLocicalOperator() == QUERY_LOGIC.OR)
                set = set.concat(prevset.filter(f));
              break;
            }
            case QUERY_TYPES.MATERIAL: {
              const regex = query.getRegex();
              const f = item => {
                let res = false;
                if (item.hasParameter('material')) {
                  const material = item.getParameter('material').getValue();
                  if (regex.test(material.getName())) res = true;
                }
                return negate ? !res : res;
              };
              if (query.getLocicalOperator() == QUERY_LOGIC.AND)
                set = set.filter(f);
              else if (query.getLocicalOperator() == QUERY_LOGIC.OR)
                set = set.concat(prevset.filter(f));
              break;
            }
          }
        }
      } catch (e) {
        // continue...
        console.warn(e.message);
      }
    });
    result = result.concat(set);
    // result.forEach((item) => {
    //   // console.log(item.getPath())
    //   this.addItem(item);
    // });
    this.setItems(new Set(result));
  }

  __bindItem(item, index) {
    const mouseDownIndex = item.mouseDown.connect(event => {
      this.mouseDown.emit(event);
      this.mouseDownOnItem.emit(event, item);
    });

    // ///////////////////////////////
    // Update the item cutaway
    const cutEnabled = this.getParameter('CutAwayEnabled').getValue();
    const cutAwayVector = this.getParameter('CutVector').getValue();
    const cutAwayDist = this.getParameter('CutDist').getValue();
    item.traverse(treeItem => {
      if (treeItem instanceof BaseGeomItem) {
        treeItem.setCutawayEnabled(cutEnabled);
        treeItem.setCutVector(cutAwayVector);
        treeItem.setCutDist(cutAwayDist);
      }
    }, true);

    if (!this.getVisible()) {
      // Decrement the visiblity counter which might cause
      // this item to become invisible. (or it might already be invisible.)
      item.propagateVisiblity(-1);
    }
    // Only used by the Selection Manager.
    // Maybe we should have a special group
    // for that.
    if (this.propagateSelectionToItems) {
      item.setSelected(this.getSelected());
    }
    if (this.propagateSelectionChangesFromItems) {
      const selectedChangedIndex = item.selectedChanged.connect(event => {
        this.setSelected(item.getSelected());
      });
    }

    const globalXfoChangedIndex = item.globalXfoChanged.connect(mode => {
      if (
        mode != ValueSetMode.OPERATOR_SETVALUE &&
        mode != ValueSetMode.OPERATOR_DIRTIED
      )
        this.__initialXfos[index] = item.getGlobalXfo();
    });
    this.__initialXfos[index] = item.getGlobalXfo();

    const bboxChangedIndex = item.boundingChanged.connect(
      this._setBoundingBoxDirty
    );

    this.__signalIndices[index] = {
      mouseDownIndex,
      globalXfoChangedIndex,
      bboxChangedIndex,
    };
  }

  __unbindItem(item, index) {
    let highlighted = false;
    if (this.getParameter('Highlighted').getValue()) {
      highlighted = true;
    } else if (this.getSelected()) {
      highlighted = true;
    }
    if (highlighted) {
      item.removeHighlight('groupItemHighlight' + this.getId(), true);
    }

    if (!this.getVisible()) {
      // Increment the visiblity counter which might cause
      // this item to become visible.
      // It will stay invisible its parent is invisible, or if
      // multiple groups connect to it and say it is invisible.
      item.propagateVisiblity(1);
    }

    // ///////////////////////////////
    // Update the item cutaway
    item.traverse(treeItem => {
      if (treeItem instanceof BaseGeomItem) {
        treeItem.setCutawayEnabled(false);
      }
    }, true);

    item.mouseDown.disconnectId(this.__signalIndices[index].mouseDownIndex);
    item.globalXfoChanged.disconnectId(
      this.__signalIndices[index].globalXfoChangedIndex
    );
    item.boundingChanged.disconnectId(
      this.__signalIndices[index].bboxChangedIndex
    );
    this.__signalIndices.splice(index, 1);
    this.__initialXfos.splice(index, 1);
  }

  addItem(item, emit) {
    if (!item) {
      console.warn('Error adding item to group. Item is null');
      return;
    }
    const index = this.__itemsParam.addItem(item);
    this.__bindItem(item, index);

    // Note: do we re-calc the initial xfo if it is set to 'first'?
    this.recalcInitialXfo(ValueSetMode.DATA_LOAD);
    this._setBoundingBoxDirty();
  }

  removeItem(item) {
    const index = this.__itemsParam.removeItem(item);
    this.__unbindItem(item, index);

    this.recalcInitialXfo(ValueSetMode.DATA_LOAD);
    this._setBoundingBoxDirty();
  }

  clearItems(emit = true) {
    // Note: Unbind reversed so that indices
    // do not get changed during the unbind.
    const items = Array.from(this.__itemsParam.getValue());
    for (let i = items.length - 1; i >= 0; i--) {
      this.__unbindItem(items[i], i);
    }
    this.__signalIndices = [];
    this.__initialXfos = [];
    this.__itemsParam.clearItems(emit);
  }

  getItems() {
    return this.__itemsParam.getValue();
  }

  setItems(items) {
    this.clearItems(false);
    this.__itemsParam.setItems(items);

    Array.from(items).forEach((item, index) => {
      this.__bindItem(item, index);
    });
    this.__updateHighlight();
    this.recalcInitialXfo(ValueSetMode.DATA_LOAD);
    this._setBoundingBoxDirty();
  }

  recalcInitialXfo(mode) {
    if (!this.propagateXfoToItems) return;
    const items = Array.from(this.__itemsParam.getValue());
    if (items.length == 0) return;
    this.__calculatingInvInitialXfo = true;
    const initialXfoMode = this.__initialXfoModeParam.getValue();
    let xfo;
    if (initialXfoMode == GROUP_INITIAL_XFO_MODES.first) {
      xfo = items[0].getGlobalXfo();
    } else if (initialXfoMode == GROUP_INITIAL_XFO_MODES.average) {
      xfo = new Xfo();
      xfo.ori.set(0, 0, 0, 0);
      for (const p of items) {
        const itemXfo = p.getGlobalXfo();
        xfo.tr.addInPlace(itemXfo.tr);
        xfo.ori.addInPlace(itemXfo.ori);
        // xfo.sc.addInPlace(itemXfo.sc)
      }
      xfo.tr.scaleInPlace(1 / items.length);
      xfo.ori.normalizeInPlace();
      // xfo.sc.scaleInPlace(1/this.__items.length);
    } else {
      throw 'Invalid mode.';
    }
    // console.log("recalcInitialXfo", xfo.tr.toString(), this.getName())
    this.__globalXfoParam.setValue(xfo, mode);
    this.__invInitialXfo = xfo.inverse();
    this.__calculatingInvInitialXfo = false;
  }

  _cleanBoundingBox(bbox) {
    const result = super._cleanBoundingBox(bbox);
    const items = Array.from(this.__itemsParam.getValue());
    items.forEach((item, index) => {
      if (item.getVisible() && !item.testFlag(ItemFlags.IGNORE_BBOX))
        bbox.addBox3(item.getBoundingBox());
    });
    return bbox;
  }

  // ///////////////////////
  // Events

  onMouseDown(event) {
    return false;
  }

  onMouseUp(event) {
    return false;
  }

  onMouseMove(event) {
    return false;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    const items = Array.from(this.__itemsParam.getValue());
    const treeItems = [];
    for (const p of items) treeItems.push(context.makeRelative(p.getPath()));
    j.treeItems = treeItems;
    return j;
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);

    // Note: JSON data is only used to store user edits, so
    // parameters loaed from JSON are considered user edited.
    this.setFlag(ItemFlags.USER_EDITED);

    if (!j.treeItems) {
      console.warn('Invalid Parameter JSON');
      return;
    }
    let count = j.treeItems.length;

    const addItem = path => {
      context.resolvePath(
        path,
        treeItem => {
          this.addItem(treeItem);
          count--;
          if (count == 0) this.recalcInitialXfo(ValueSetMode.DATA_LOAD);
        },
        reason => {
          console.warn(
            "Group: '" + this.getName() + "'. Unable to load item:" + path
          );
        }
      );
    };
    for (const path of j.treeItems) {
      addItem(path);
    }
  }

  static get INITIAL_XFO_MODES() {
    return GROUP_INITIAL_XFO_MODES;
  }
}

sgFactory.registerClass('Group', Group);

export { Group };
