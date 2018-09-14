const addGUI = function(div, options) {
    const moveGUIDiv = document.createElement("div");
    moveGUIDiv.id = 'moveGUI';
    div.appendChild(moveGUIDiv);
    options = options ? options : {};
    options.autoPlace = false;
    const gui = new dat.GUI(options);
    
    moveGUIDiv.style.position = 'absolute';
    moveGUIDiv.style.top = '0px';
    moveGUIDiv.style.right = '30px';
    moveGUIDiv.style.zIndex = 100;
    moveGUIDiv.appendChild(gui.domElement);
    return gui;
}

const addCanvas = function(width, height) {
    const resizeDiv = document.createElement("div");
    resizeDiv.id = 'visualive';
    if (width == undefined) {
        resizeDiv.style.width = '100%';
        resizeDiv.style.height = '100%';
        resizeDiv.style.position = 'fixed';
        resizeDiv.style.top = 0;
        resizeDiv.style.left = 0;
        // resizeDiv.style.overflow = 'hidden';
    } else {
        resizeDiv.style.position = 'relative';
        resizeDiv.style.width = width + 'px';
        resizeDiv.style.height = height + 'px';
    }
    document.body.appendChild(resizeDiv);
    if (width !== undefined) {
        document.body.appendChild(document.createElement("br"));
    }
    return resizeDiv;
}

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

const createLink = (name, parent)=>{
    const a = document.createElement('a');
    const linkText = document.createTextNode(name);
    a.appendChild(linkText);
    a.title = name;
    a.href = window.location.href + "?test=" + name;
    parent.appendChild(a);
    parent.appendChild(document.createElement('br'));
}

// Function to download data to a file
function saveAs(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4();// + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


const nameToId = {}

const addResourceURL = (resources, path, url)=>{
    const parts = path.split('/');
    if(!url) {

        let rootURL = window.location.href.split('#')[0];
        rootURL = rootURL.split('?')[0];
        if(rootURL.endsWith('.html') || rootURL.endsWith('.html')){
            rootURL = rootURL.substring(0, rootURL.lastIndexOf('/')) + '/';
        }
        const base = rootURL;
        if(parts[0] == '.')
            parts.shift();
        else if(parts[0] == '..'){
            // item = item.substring(3);
            const baseparts = base.split('/');
            baseparts.pop();
            baseparts.pop();
            base = baseparts.join('/') + '/';
        }
        url = base+path
    }
    const filename = parts.pop();

    let parentId
    for(let i=0; i<parts.length; i++){
        const part = parts[i];
        if(!resources[nameToId[part]]) {
            const folderId = Visualive.hashStr(part);
            const folder =  { 
                name: part,
                type: 'folder'
            }
            resources[folderId] = folder;
            nameToId[part] = folderId;
            if(parentId) {
                resources[folderId].parent = parentId
            }
            parentId = folderId;
        }
        else {
            parentId = nameToId[part];
        }
    }


    const resource = { name: filename, url: (url ? url : base+path) }
    if(parentId)
        resource.parent = parentId

    const fileId = Visualive.hashStr(filename);
    resources[fileId] = resource;
}

let generateResourcesDict = (list=[], assetDescs=[], imageDescs=[])=>{
    let rootURL = window.location.href.split('#')[0];
    rootURL = rootURL.split('?')[0];
    if(rootURL.endsWith('.html') || rootURL.endsWith('.html')){
        rootURL = rootURL.substring(0, rootURL.lastIndexOf('/')) + '/';
    }



    let resources = {};
    addResourceURL(resources, 'VisualiveEngine/Vive.vla', 'http://localhost:3150/VisualiveEngineClient/Resources/Vive.vla')
    addResourceURL(resources, 'VisualiveEngine/Dome.vla', 'http://localhost:3150/VisualiveEngineClient/Resources/Dome.vla')
    addResourceURL(resources, 'VisualiveEngine/LogoSmall.png', 'http://localhost:3150/VisualiveEngineClient/Resources/LogoSmall.png')
    addResourceURL(resources, 'VisualiveEngine/FlakesNormalMap.png', 'http://localhost:3150/VisualiveEngineClient/Resources/FlakesNormalMap.png')
    

    for(let item of list){
        addResourceURL(resources, item);
    }
    for(let assetDesc of assetDescs){
        addResourceURL(resources, assetDesc[0] + ".vla");
        for(let i=0; i<assetDesc[1]; i++)
            addResourceURL(resources, assetDesc[0] + i + ".vlageoms", );
        if(assetDesc.length == 3) {
            for(let i=0; i<3; i++){
                // PAth for the env and the lightmaps for the env
                addResourceURL(resources, assetDesc[2] + i + ".vlh");
                let envMapName = assetDesc[2].split('/');
                if(envMapName.length > 1)
                    envMapName.shift();
                envMapName = envMapName[0];
                addResourceURL(resources, assetDesc[0] + "_" + envMapName + "_Lightmap" + i + ".vlh");
            }
        }
    }
    for(let imageDesc of imageDescs){
        for(let i=0; i<3; i++){
            let suffixSt = imageDesc.lastIndexOf('.')
            addResourceURL(resources, imageDesc.substring(0, suffixSt) + i + imageDesc.substring(suffixSt));
        }
    }
    return resources;
}

let resolveFilePath = (filePath, resources) => {
    const parts = filePath.split('/');
    const filename = parts.pop();

    // if(parts[0] == '.')
    //     parts.shift();

    // for(let part of parts){
    //     Object.values(resources).find((resource)=>{
    //         return resource.name == part
    //     })
    //     if(part in curr)
    //         curr = curr[part];
    //     else{
    //         let dir = {};
    //         curr[part] = dir;
    //         curr = dir;
    //     }
    // }
    return Object.values(resources).find((resource)=>{
        return resource.name == filename
    })
}


const materialLibraryHelpers = (function(){

    const materialPresets = {
        Steel:{
            // baseColor:  new Color(0.15,0.15,0.15),
            Metallic: 0.55,
            Roughness: 0.25,
            Reflectance: 0.7
        },
        StainlessSteel:{
            Metallic: 0.55,
            Roughness: 0.25,
            Reflectance: 0.7
        },
        Aluminum:{
            Metallic: 0.55,
            Roughness: 0.15,
            Reflectance: 0.85
        },
        PaintedMetal: {
            Metallic: 0.05,
            Roughness: 0.25,
            Reflectance: 0.05
        },
        Plastic: {
            Metallic: 0.0,
            Roughness: 0.25,
            Reflectance: 0.03
        },
        Rubber: {
            Metallic: 0.0,
            Roughness: 0.75,
            Reflectance: 0.01
        }
    };

    const __modifyMaterial = (material, paramValues, shaderName) => {
        if (shaderName)
            material.setShaderName(shaderName);
        for (let paramName in paramValues) {
            let param = material.getParameter(paramName);
            if (param) {
                if(paramValues[paramName] instanceof Visualive.Parameter) {
                    material.addParameterInstance(paramValues[paramName]);
                }
                else {
                    param.setValue(paramValues[paramName]);
                }
            } else {
                material.addParameter(paramName, paramValues[paramName]);
            }
        }
    }

    const __materialTypeMapping = {};

    return {

        setMaterialTypeMapping:function(materialTypeMapping) {
            for(let key in materialTypeMapping)
                __materialTypeMapping[key] = materialTypeMapping[key];
        },

        assignMaterialPresetValues:function(matLib, materialNames, presetName, shaderName = undefined) {
            const matLiblNames = matLib.getMaterialNames();
            for (let materialName of materialNames) {
                if(materialName == "*") {
                    for(let name of matLiblNames) {
                        const material = matLib.getMaterial(name, false);
                        if(material)
                            __modifyMaterial(material, materialPresets[presetName], shaderName);
                    }
                    continue;
                }
                let material = matLib.getMaterial(materialName);
                if (!material) {
                    console.warn("Material not found:" + materialName);
                    continue;
                }
                __modifyMaterial(material, materialPresets[presetName], shaderName);
            }
        },

        modifyMaterials:function(matLib, materialNames, paramValues, shaderName = undefined) {
            const matLiblNames = matLib.getMaterialNames();

            for (let materialName of materialNames) {
                if(materialName == "*") {
                    for(let name of matLiblNames) {
                        const material = matLib.getMaterial(name, false);
                        if(material)
                            __modifyMaterial(material, paramValues, shaderName);
                    }
                    continue;
                }
                let material = matLib.getMaterial(materialName);
                if (!material) {
                    console.warn("Material not found:" + materialName);
                    continue;
                }
                __modifyMaterial(material, paramValues, shaderName);
            }
        }
    }
})()
