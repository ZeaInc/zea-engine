# Multilingual Labels

## ℹ️ Before we begin

Take a look at the [labels overview](tutorials/labels).

## How to use multiple languages

Labels can be [loaded](tutorials/labels-library) from other files like [TSV](https://en.wikipedia.org/wiki/Tab-separated_values), JSON, or even spreadsheets.


💻 This code can be used to load a labels library

```javascript
import {
  Vec3,
  Xfo,
  TreeItem,
  BillboardItem,
  Label,
  labelManager,
  Scene,
  GLRenderer,
} from '../libs/zea-engine/dist/index.esm.js'

Label.setDomToImageDep(window.domtoimage)

const urlParams = new URLSearchParams(window.location.search)
const language = urlParams.get('language')
if (language) {
  labelManager.setLanguage(language)
}

labelManager.loadLibrary('LabelPack.tsv', 'data/LabelPack.tsv')
```
