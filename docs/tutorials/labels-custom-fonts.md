# Custom Fonts in Labels

## ℹ️ Before we begin

Take a look at the [styling labels](tutorials/labels-styling) guide.

## How to use custom fonts

Since labels are styled using [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), you can load any custom font using a [@font-face CSS at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face), the Zea Engine will detect them and will use them as needed.

💻 These rules can be used to style a label in white background and black text, using the "Verisurf" custom font:

```html
<style type="text/css">
  @font-face {
    font-family: "Verisurf";
    src: url("https://cdn.glitch.com/24a5b846-4e93-4c2a-9fe0-1ea7ce095af4%2FVerisurf.ttf?v=1599227943361");
  }

  .my-label--formal {
    background-color: white;
    border: 0.5rem solid black;
    border-radius: 1rem;
    color: black;
    font-family: Verisurf;
    font-size: 3rem;
    padding: 1rem;
  }
</style>
```

📷 Two labels using custom fonts:

![yellow-label-example.png](./img/label-styled-example.png)

🎥 Live example of two labels using custom fonts:

[GetStarted0](https://glitch.com/embed/#!/embed/zea-engine-labels?path=src/main.js&previewSize=100&attributionHidden=true ':include :type=iframe width=100% height=800px')
