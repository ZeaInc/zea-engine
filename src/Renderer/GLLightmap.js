import '../SceneTree/GeomItem.js';

/** Class representing a GL lightmap. */
class GLLightmap {
  /**
   * Create a GL lightmap.
   * @param {any} gl - The gl value.
   * @param {any} lightmap - The lightmap value.
   */
  constructor(gl, lightmap) {
    this.__gl = gl;
    this.__lightmap = lightmap;

    const canvasElem = document.createElement('canvas');
    const ctx = canvasElem.getContext('2d', { alpha: true });
    ctx.canvas.width = this.__lightmap.getSize().x;
    ctx.canvas.height = this.__lightmap.getSize().y;
    // ctx.drawImage(this._image, 0, 0, this._image.width, this._image.height, 0, 0, size, size);

    this.__data = ctx.canvas;
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   */
  bind(renderstate) {
    const gl = this.__gl;
    const unifs = renderstate.unifs;
    // let unit = renderstate.boundTextures++;
    // let texId = gl.TEXTURE0 + unit;
    // gl.activeTexture(texId);
    // gl.bindTexture(gl.TEXTURE_2D, this.__glTex);
    // gl.uniform1i(unifs.lightmap.location, unit);
    gl.uniform2fv(
      unifs.lightmapSize.location,
      this.__lightmap.getSize().asArray()
    );

    gl.uniform1i(
      unifs.debugLightmapTexelSize.location,
      renderstate.debugLightmapTexelSize
    );
  }
}

export { GLLightmap };
