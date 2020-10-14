# Getting started with the Zea Engine

ℹ️ Before we begin, please make sure you're already familiar with [Setting up your workspace](getting-started/development-setup.md).

The Zea Engine is useful for building interactive web applications with JavaScript.

In this tutorial, we will learn how to load the Zea Engine in the browser and set up your first scene: the grid below.

🎥 Try interacting with this demo:

<div class="glitch-embed-wrap" style="height: 420px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/zea-demo-grid?path=index.html&previewSize=100&attributionHidden=true"
    title="zea-demo-grid on Glitch"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>

## Introduction to npm and unpkg

Zea Inc. distributes its libraries via [npm](https://www.npmjs.com/), which is the world's largest JavaScript package manager.

To list the pages available from Zea Inc. follow this link: https://www.jsdelivr.com/?query=%40zeainc%2F

Libraries hosted on npm can be accessed using various techniques. Among the easiest ones is to use tools like [unpkg](https://unpkg.com/), which generates URLs for each file in each package on npm, making it possible to load into the browser directly without needing to download the entire package.

ℹ️ For example, this is the unpkg URL for the Zea Engine: https://unpkg.com/@zeainc/zea-engine

If you open that URL in your browser, you will see that it displays the compiled engine's file contents. You may also notice that the URL redirects to the full path and the latest version, and in that version, the UMD build of the engine.

## Accessing the latest UMD build

[UMD](https://github.com/umdjs/umd) is a technique for distributing JavaScript packages which are capable of working everywhere, be it in the client, on the server, or elsewhere.

Within [the Zea Engine's dist folder](https://unpkg.com/@zeainc/zea-engine/dist/), there are several build files: CommonJS, ESM, and UMD. If you're not sure about which one to use, go for the UMD build, due to it's flexibility.

In this tutorial, we will start by loading the Zea Engine directly off unpkg as a UMD module.

To load this file, you can specify the path within the package: https://unpkg.com/@zeainc/zea-engine/dist/index.umd.js

ℹ️ Note: we omitted the version number, which means we default to the latest version. Initially, that is fine, but eventually you will need to lock the packages to a specific version, in that way you will have full control over which version you wish to load.


## Basic Setup

First, let's create a basic file structure for our demo project by running these commands in your terminal:

```bash
mkdir zea-engine-demo
cd zea-engine-demo
touch index.html index.js
```

You should end up with something like this:

```bash
zea-engine-demo
├── index.html
└── index.js
```

Now, let's add some content to them (feel free to copy/paste):

📄 **index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Getting started using the Zea Engine</title>

    <!-- Styles to display the canvas as we need. -->
    <style>
      body {
        height: 100vh;
        margin: 0;
      }

      #renderer {
        width: 100%;
        height: 100%;
      }
    </style>

    <!-- Import the Zea Engine -->
    <script crossorigin src="https://unpkg.com/@zeainc/zea-engine@2"></script>

    <!-- Import the webpage's javascript file -->
    <script src="/script.js" type="module"></script>
  </head>
  <body>
    <!-- The canvas we use as renderer -->
    <canvas id="renderer" />
  </body>
</html>
```

📄 **index.js**
 
Since the Zea Engine is being loaded using [UMD](https://github.com/umdjs/umd), it will add the `zeaEngine` object to the global scope, which is accessible through `window.zeaEngine` or `globalThis.zeaEngine` ([check globalThis support here](https://caniuse.com/mdn-javascript_builtins_globalthis)).

```javascript
const { GLRenderer, Scene } = window.zeaEngine

// Retrieve the canvas from the DOM tree.
// The renderer will attach to it.
const $canvas = document.getElementById('renderer')

// Construct the Scene object that will own all the data.
const scene = new Scene()

// Create a grid with size 10.0 and with 10 subdivisions in each direction. 
scene.setupGrid(10.0, 10)

// Construct the renderer, providing the canvas retrieved earlier.
const renderer = new GLRenderer($canvas)

// Connect the Renderer to the Scene so that the Renderer starts to render the scene.
renderer.setScene(scene)
```

## Running a local server

The index.html file can not be loaded without a local server, since the index.js file would be blocked by [the CORS policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). To be able to load our page in the browser, we will use [es-dev-server](https://www.npmjs.com/package/es-dev-server), a web server for development without bundling.

Run this command in your terminal:

```bash
npx es-dev-server
```

You should get an output like this:

```bash
es-dev-server started on http://localhost:8000
  Serving files from '/Users/me/zea-engine-demo'.
  Using auto compatibility mode, transforming code on older browsers based on user agent.
```

📷  Loading the given URL in your browser should generate the following result:

![getting-started-grid](../_media/getting-started-grid.png ':class=screenshot')

## Remix your own Zea Engine app

Using what we just learned, you can now remix your own Zea Engine apps. Try, for example, changing the number of divisions within the grid:

https://glitch.com/edit/#!/zea-demo-grid

## Debugging Zea Engine apps

ℹ️ Please make sure you're already familiar with [debugging JavaScript in Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/javascript).

Now, let's debug a hypothetical situation. For some reason, your grid is not rendering, and all you get is a strange looking white plane, like this:

📷  A strange looking white plane, Aka, the 🐞:

![getting-started-strange-plane](../_media/getting-started-strange-plane.png ':class=screenshot')

### Step 1

Open the DevTools Sources panel and locate the index.js file:

![getting-started-sources-panel](../_media/getting-started-sources-panel.png ':class=screenshot')

### Step 2

Pause the code with a breakpoint:

![getting-started-breakpoint-start](../_media/getting-started-breakpoint-start.png ':class=screenshot')

### Step 3

Step through the code until the end of the file:

![getting-started-breakpoint-end](../_media/getting-started-breakpoint-end.png ':class=screenshot')

Aha! Looks like we're so thrilled about learning the Zea Engine ways, that we accidentally left an extra line at the end. It turns out the strange looking white plane is actually a very crammed grid, with 10000 subdivisions in each direction.

### Step 4

Remove or comment the problematic line. Your grid should render again:

![getting-started-commented-line](../_media/getting-started-commented-line.png ':class=screenshot')

![getting-started-working-grid](../_media/getting-started-working-grid.png ':class=screenshot')

# Conclusion

Now that you have a basic web application working, you can move onto adding geometries to to the scene.

 * [Getting Started with Zea CAD](https://zea.live/zea-cad/#/getting-started/get-started-with-zea-cad)
 * [Load a Point Cloud](http://zea.live/zea-pointclouds/#/tutorials/load-a-point-cloud)
