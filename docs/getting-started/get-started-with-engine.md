# Getting Started using the engine

Zea Engine is used to build interactive web applications using JavaScript. In this tutorial we will learn how to load the engine in the browser and set up a very basic scene.


[GetStarted0](./zea-engine-demo-0/index.html ':include :type=iframe width=100% height=800px')

<div class="download-section">
  <a class="download-btn" title="Download"
    onClick="downloadTutorial('getting-started-0.zip', ['./getting-started/zea-engine-demo-0/index.html'])" download>
    Download
  </a>
</div>
<br>

## Introduction to NPM and Unpkg

Zea distributes its libraries via NPM. NPM is the world’s largest package manager and distributes files for the majority of JavaScript libraries.

> To see the list of pages available from Zea Inc. access the NPM page for zea:
https://www.npmjs.com/settings/zeainc/packages

### Unpkg.com
Libraries hosted on NPM can be accessed using a variety of techniques, and this tutorial will several several of them. One of the easiest ways to access packages from NPM, is to use tools like Unpkg. Unpkg generates URLs for each file in each package on NPM, making it possible to load into the browser directly without needing to download the entire package.

> For example, the unpkg url for the engine on NPM is the following: https://unpkg.com/@zeainc/zea-engine

If you open that URL in the browser, you will see it display the file contents of the compiled engine. You may also notice that the URL was redirected to contain the full path to latest version, and in that version, the CommonJS build of the engine.

> https://unpkg.com/@zeainc/zea-engine@1.1.0/dist/index.cjs.js

#### Accessing the latest ES6 Module

In this tutorial we will start off by loading the engine directly off unpkg as an ES6 Module. Within the engine dist folder, there are 2 build files. A CommonJS build, and an esm build. Developers should use the esm build.

To load this file, you can specify the path within the package.

https://unpkg.com/@zeainc/zea-engine/dist/index.esm.js

> Note: we omitted the version number, which means we default to the latest version. Initially that is fine, but for more control over which version you wish to load, you will need to download the packages to your system. This is covered later in the tutorial.



## Basic Setup
First let's create a directory for our demo project:

```sh
> mkdir zea-engine-demo
> cd zea-engine-demo
```

*Throughout the Guides we will use diff blocks to show you what changes we're making to directories, files, and code.*
*Now we'll create the following html file and its contents:*

**project**


```diff
 zea-engine-demo
 + |- index.html
```


**Index.html**
 
```html
<!doctype html>
<html>
  <head>
    <title>Getting Started using Zea Engine</title>
  </head>
 <body>
    <div id="app"></div>
  </body>
  <script type="module">
 
import { 
  Scene,
  GLRenderer 
} from "https://unpkg.com/@zeainc/zea-engine/dist/index.esm.js"
 
  </script>
</html>
 
```

Zea Engine leverages the new ‘modules’ feature to load JavaScript code as es6 modules. For more information on the new Modules feature in JavaScript, we encourage you to read the documentation found her: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
And the many other resources available online.

The module script allows us to directly import classes defined in the engine into the scope of the running script.
explicitly requires  Scene and GLRenderer to be present, and loads it directly from zea-engine (no global scope pollution). 
. This avoids polluting the global namespace with objects, while also allowing other re-usable modules to also import the engine and extend its classes. 

 
```javascript
// Retrieves the div from the DOM tree that the renderer will attach the canvas element to.
const domElement = document.getElementById("app");

// Constructs the Scene object that will own all the data.
const scene = new Scene();

// A helper function creates a grid with size 10.0 and with 10 subdivisions in each direction. 
scene.setupGrid(10.0, 10);

// Constructs the renderer, providing the DOM element retrieved earlier.
const renderer = new GLRenderer(domElement);

// Connecting the Renderer to the scene so that the renderer starts to render the scene.
renderer.setScene(scene);
```


![getting-started-0](../_media/getting-started-0.png)

<div class="download-section">
  <a class="download-btn" title="Download"
    onClick="downloadTutorial('getting-started-0.zip', ['./getting-started/zea-engine-demo-0/index.html'])" download>
    Download
  </a>
</div>
<br>

# Setting up a src directory

```diff
 zea-engine-demo
  |- package.json
  |- index.html
+ |- /src
+   |- index.js
```

**src/index.js**

```javascript
import { 
  Scene,
  GLRenderer 
} from "../node_modules/@zeainc/zea-engine/dist/index.esm.js"
 
const domElement = document.getElementById("app");
 
const scene = new Scene();
scene.setupGrid(10.0, 10);
 
const renderer = new GLRenderer(domElement);
renderer.setScene(scene);
renderer.resumeDrawing();
```

> "../node_modules/@zeainc/zea-engine/dist/index.esm.js"

the module path now needs to resolve up one folder before traversing down into the node_modules folder.
 
**index.html**
```diff
<!doctype html>
<html>
  <head>
 
    <title>Getting Started using Zea Engine</title>
    <script src="https://unpkg.com/@zeainc/zea-engine/dist/zea-engine.js"></script>
  </head>
  <body>
    <div id="app"></div>
+    <script type="module" src="src/index.js"></script>
-  <script type="module">
-
- import { 
-   Scene,
-   GLRenderer 
- } from "./node_modules/@zeainc/zea-engine/dist/index.esm.js"

- const domElement = document.getElementById("app");

- const scene = new Scene();
- scene.setupGrid(10.0, 10);

- const renderer = new GLRenderer(domElement);
- renderer.setScene(scene);
- renderer.resumeDrawing();
-
-  </script>
</html>
```

**Running a server**
The html file can no longer be run without a local server running. This is because ES6 modules are subject to same-origin policy. You need to run your script from a local server, open directly the file with a browser will not work.


**Install the server Globally via npm**
npm install --global http-server
Now you can run the server in the folder of the demo.

```bash
> http-server
Starting up http-server, serving ./
Available on:
  http://192.168.2.24:8080
  http://127.0.0.1:8080
```

Loading the given URL in the browser should now generate the following result.


![getting-started-1](../_media/getting-started-1.png)

<div class="download-section">
  <a class="download-btn" title="Download"
    onClick="downloadTutorial('getting-started-1.zip', ['./getting-started/zea-engine-demo-1/index.html', './getting-started/zea-engine-demo-1/src/index.js'])" download>
    Download
  </a>
</div>
<br>

# Installing Engine Locally
As a project grows, it becomes preferable to use NPM to manage downloading packages for us. To start using npm, initialize the package.json file and add the engine as one of the dependencies.

```
npm init -y
npm install @zeainc/zea-engine
```

We also need to adjust our package.json file in order to make sure we mark our package as private, as well as removing the main entry. This is to prevent an accidental publish of your code.
If you want to learn more about the inner workings of package.json, then we recommend reading the npm documentation.

**package.json**
```diff
 {
    "name": "zea-engine-demo",
    "version": "1.0.0",
    "description": "",
    "private": true,
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "dependencies": {
      "zea-engine": "^1.3.0",
    },
  }
```
Now we can modify the html file to load directly out of the local node modules folder.
 
**index.js**
```diff
import { 
  Scene,
  GLRenderer 
-} from "https://unpkg.com/@zeainc/zea-engine/dist/index.esm.js"
+} from "../node-modules@zeainc/zea-engine@/dist/index.esm.js"
```
Now instead of loading zea-engine off the unpkg servers, we’ll load it out of our own local system. This gives us more control over which version we use, and means all data is now served off our own system.

<div class="download-section">
  <span>Download the source here: &nbsp;</span>
  <a class="download-btn" title="Download" style="margin: 0"
    onClick="downloadTutorial('getting-started-2.zip', ['./getting-started/zea-engine-demo-2/index.html', './getting-started/zea-engine-demo-2/src/index.js', './getting-started/zea-engine-demo-2/package.json'])" download>
    Download
  </a>
</div>
<br>

*Note: After downloading and extracting the 'getting-started-2.zip' archive, you will need to run 'npm install' in the folder to cause npm to download the engine package specified in the package.json file.*

# Using Webpack to bundle the engine
webpack is used to compile JavaScript modules and is a popular tool in web development. T For more information on getting started using webpack then we recommend reading follow the following tutorial: https://webpack.js.org/guides/getting-started/ 

**Install the webpack-cli (the tool used to run webpack on the command line):**

```sh
> npm install webpack webpack-cli --save-dev
```

First we'll tweak our directory structure slightly, separating the "source" code (/src) from our "distribution" code (/dist). The "source" code is the code that we'll write and edit. The "distribution" code is the minimized and optimized output of our build process that will eventually be loaded in the browser. Tweak the directory structure as follows:
project


**zea-engine-demo**

```diff
  |- package.json
+ |- /dist
+   |- index.html
- |- index.html
  |- /src
    |- index.js
```

**src/index.js**
```diff
import { 
  Scene,
  GLRenderer 
- } from "./node_modules/@zeainc/zea-engine/dist/index.esm.js"
+ } from "@zeainc/zea-engine"

const domElement = document.getElementById("app");
 
const scene = new Scene();
scene.setupGrid(10.0, 10);
 
const renderer = new GLRenderer(domElement);
renderer.setScene(scene);
renderer.resumeDrawing();
```

Now that webpack will bundle the scripts, the import statement needs to be modified.
The Webpack bundling tool knows that installed modules are found in the node_modules folder, so we can remove that from the beginning of the path. Webpack then opens the package.json file and reads where to find the actual script file in the dist folder,  so we can now remove that part too.
Now, since we'll be bundling our scripts, modify the other script tag to load the bundle, instead of the raw /src file:

**dist/index.html**
```diff
 <!doctype html>
  <html>
   <head>
    <title>Getting Started using Zea Engine</title>
   </head>
   <body>
    <div id="app"></div>
-    <script src="./src/index.js"></script>
+    <script src="main.js"></script>
   </body>
  </html>
```

By stating what dependencies a module needs, webpack can use this information to build a dependency graph. It then uses the graph to generate an optimized bundle where scripts will be executed in the correct order.
With that said, let's run npx webpack, which will take our script at src/index.js as the entry point, and will generate dist/main.js as the output:

```sh
> npx webpack
Hash: 566904c80f5d19766290
Version: webpack 4.43.0
Time: 4401ms
Built at: 2020-07-15 10:36:11 a.m.
  Asset     Size  Chunks                    Chunk Names
main.js  852 KiB       0  [emitted]  [big]  main
Entrypoint main [big] = main.js
[1] ./src/index.js 277 bytes {0} [built]
[3] (webpack)/buildin/harmony-module.js 573 bytes {0} [built]
[5] (webpack)/buildin/global.js 472 bytes {0} [built]
    + 6 hidden modules

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
This can impact web performance.
Assets:
  main.js (852 KiB)

WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (244 KiB). This can impact web performance.
Entrypoints:
  main (852 KiB)
      main.js


WARNING in webpack performance recommendations:
You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your application.
For more info visit https://webpack.js.org/guides/code-splitting/
```
 
Your output may vary a bit, but if the build is successful then you are good to go. Also, don't worry about the warning, we'll tackle that later.
Open index.html in your browser and, if everything went right, you should see the following:

> Note: webpack has transpiled the es6 modules into standard javascript, which does not have the Same Origin policy enforced on es6 modules. 
> This means you can > load the HTML file directly without running the server. However, if you still have the server running, you can also use the served url.
> http://127.0.0.1:8080/dist/

If you are getting a syntax error in the middle of minified JavaScript when opening index.html in the browser, set development mode and run npx webpack again. This is related to running npx webpack on latest Node.js (v12.5+) instead of LTS version.

![getting-started-3](../_media/getting-started-3.png)

<div class="download-section">
  <a class="download-btn" title="Download"
    onClick="downloadTutorial('getting-started-3.zip', ['./getting-started/zea-engine-demo-3/package.json', './getting-started/zea-engine-demo-3/dist/index.html', './getting-started/zea-engine-demo-3/src/index.js', './getting-started/zea-engine-demo-3/webpack.config.js'])" download>
    Download
  </a>
</div>
<br>

> Note: After downloading and extracting the 'getting-started-3.zip' archive, you will need to run the following commands in the folder
> 1. 'npm install'
> 2. 'npx webpack'


# Conclusion

Now that you have a basic build together you should move on to the next guide creating Procedural Geometries.
