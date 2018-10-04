

const getUrlVars = () => {
  const url = window.location.href,
    args = {};

  const parts = url.split('?');
  const hashes = parts.length > 1 ? parts[1].split('&') : [];
  for (let i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    args[hash[0]] = hash[1];
  }
  return args;
}

function httpGetAsync(url, callback) {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", url, true); // true for asynchronous 
  xmlHttp.send(null);
}

function resolveURL(filePath, resources) {
  const parts = filePath.split('/');
  const filename = parts.pop();
  return Object.values(resources).find((resource)=>{
    return resource.name == filename
  })
}

function loadScript(url, callback) {
  const script = document.createElement("script");
  script.onload = function() {
    callback();
  };
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  document.getElementsByTagName('head').item(0).appendChild(script);
}


window.main = function(domElement, resources, args) {

  if(!args)
    args = getUrlVars();

  if(args.file) {
    const file = args.file;
    const ext = file.split('.').pop().toLowerCase();
    switch (ext) {
      case "png":
      case "jpg":
        const image = document.createElement("img");
        image.src = resolveURL(file, resources).url;
        image.setAttribute("style", "height:100%;width:100%");
        domElement.appendChild(image);
        if(args.visualivePlatform){
          window.overlay = new AnnotationOverlay(domElement, args.visualivePlatform);
        }
        break;
      case "js":
        httpGetAsync(resolveURL(file, resources).url, (text) => {
          const t = document.createTextNode(text);
          domElement.appendChild(t);
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.3.1/ace.js', function() {
            const editor = ace.edit(domElement, {
              mode: "ace/mode/javascript",
              selectionStyle: "text"
            });
            editor.setTheme("ace/theme/monokai");
            editor.setReadOnly(true); // false to make it editable
          });
        });
        break;
      case 'vlexe':
        document.title = file;
        loadScript(resolveURL(file, resources).url, function() {
          const scene = new Visualive.Scene(resources);
          const renderer = new Visualive.GLVisualiveRenderer(domElement);
          renderer.setScene(scene);
          renderer.resumeDrawing();

          vlmain(scene, renderer, args);
        });
        break;
      default:
        domElement.style.display = "block";
        domElement.style.height = "100%";
        domElement.style.width = "100%";
        domElement.style.textAlign = "center";
        domElement.style.verticalAlign = "middle";
        const h = document.createElement("H1")
        const t = document.createTextNode("No view function provided for:" + file);
        domElement.appendChild(h);
        h.appendChild(t);
    }
  }
  else {
    loadScript(resolveURL("HelloWorld.vlexe", resources).url, function() {
      vlmain(domElement, resources, args)
    });
  }
}
