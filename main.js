
  function httpGetAsync(url, callback) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
  }

  function resolveURL(file, resources) {
    let parts = file.split('/');
    if (parts[0] == '.' || parts[0] == '')
      parts.shift();
    let curr = resources;
    for (let part of parts) {
      if (part in curr)
        curr = curr[part];
      else {
        // console.warn("Unable to resolve File:" + file);
        return null;
      }
    }
    return curr;
  }

  function resolveURL(filePath, resources) {
    const parts = filePath.split('/');
    const filename = parts.pop();
    return Object.values(resources).find((resource)=>{
      return resource.name == filename
    })
  }

  function loadScript(url, callback) {
    let script = document.createElement("script");
    script.onload = function() {
      callback();
    };
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', url);
    document.getElementsByTagName('head').item(0).appendChild(script);
  }


window.main = function(domElement, resources, args, visualivePlatform) {


  if(args.file) {
    let file = args.file;
    let ext = file.split('.').pop().toLowerCase();
    switch (ext) {
      case "png":
      case "jpg":
        let image = document.createElement("img");
        image.src = resolveURL(file, resources).url;
        image.setAttribute("style", "height:100%;width:100%");
        domElement.appendChild(image);
        if(args.visualivePlatform){
          window.overlay = new AnnotationOverlay(domElement, args.visualivePlatform);
        }
        break;
      case "js":
        httpGetAsync(resolveURL(file, resources).url, (text) => {
          let t = document.createTextNode(text);
          domElement.appendChild(t);
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.3.1/ace.js', function() {
            let editor = ace.edit(domElement, {
              mode: "ace/mode/javascript",
              selectionStyle: "text"
            });
            editor.setTheme("ace/theme/monokai");
            editor.setReadOnly(true); // false to make it editable
          });
        });
        break;
      case 'vlexe':
        loadScript(resolveURL(file, resources).url, function() {
          vlmain(domElement, resources, args)
        });
        break;
      default:
        domElement.style.display = "block";
        domElement.style.height = "100%";
        domElement.style.width = "100%";
        domElement.style.textAlign = "center";
        domElement.style.verticalAlign = "middle";
        let h = document.createElement("H1")
        let t = document.createTextNode("No view function provided for:" + file);
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
