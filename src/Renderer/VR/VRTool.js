class VRTool {
  constructor() {
    this.__active = false;
  }

  activateTool() {
    this.__active = true;
  }

  deactivateTool() {
    this.__active = false;
  }

  evalTool() {}
}

export { VRTool };
