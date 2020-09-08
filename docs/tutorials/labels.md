# Using Labels

## What is a label

A label is a piece of information about an item on the screen. They allow you to point to relevant parts of the scene.

### Some features of labels:

* Labels can display a wide variety of content, such as: Text, images, emojis, and other symbols.
* They can be [styled](tutorials/labels-styling) using [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS).
* Labels support custom fonts.
* You can use any valid [HTML semantic element](https://developer.mozilla.org/en-US/docs/Glossary/Semantics#Semantics_in_HTML), such as: Titles, lists, paragraphs, etc.
* They can be [multilingual](tutorials/labels-multilingual).
* Labels can be [loaded](tutorials/labels-library) from other files like [TSV](https://en.wikipedia.org/wiki/Tab-separated_values), JSON, or even spreadsheets.


📷 Below: A yellow label pointing to a component (Pressure Chamber).

![yellow-label-example.png](./img/yellow-label-example.png)

🎥


```javascript
const domElement = document.getElementById("viewport");

const scene = new Scene();
scene.setupGrid(20, 10);

const asset = new TreeItem('labels');

let index = 0;
const addLabel = (lineEndPos, pos, color, name)=> {
  const label = new Label(name, 'Labels');
  label.getParameter('fontSize').setValue(48);
  label.getParameter('fontColor').setValue(color);
  label.getParameter('backgroundColor').setValue(new Color(0.3, 0.3, 0.3));
  
  const billboard = new BillboardItem('billboard'+index, label);
  const xfo = new Xfo(pos);
  billboard.setLocalXfo(xfo);
  billboard.getParameter('PixelsPerMeter').setValue(100);
  billboard.getParameter('AlignedToCamera').setValue(true);
  billboard.getParameter('Alpha').setValue(1);
  // billboard.getParameter('lineEnd').addElement(lineEndPos);
  // billboard.getChildByName('line0').getMaterial().getParameter('Color').setValue(new Color(.7, .7, .7));
  asset.addChild(billboard);

  index++;
}
addLabel(new Vec3(1, 0, 0), new Vec3(1, 1, 1), new Color(0, 1, 0), "Hello");
addLabel(new Vec3(-1, 0, 0), new Vec3(-1, -1, 1), new Color(1, 1, 0), "Long");
addLabel(new Vec3(0, 0, 0), new Vec3(0, 0.05, 0.08), new Color(1, 1, 0), "MyCustomLabel");

scene.getRoot().addChild(asset);

const renderer = new GLRenderer(domElement);
renderer.getViewport().getCamera().setPositionAndTarget(new Vec3(5, 6, 3), new Vec3(0, 0, 0));
renderer.setScene(scene);
renderer.resumeDrawing();
```



> See the live example

[Labels](./Labels.html ':include :type=iframe width=100% height=800px')

<div class="download-section">
  <a class="download-btn" title="Download"
    onClick="downloadTutorial('labels.zip', ['./tutorials/Labels.html'])" download>
    Download
  </a>
</div>
<br>

