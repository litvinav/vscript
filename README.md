# VSCRIPT

A JavaScript library for building server side rendered (SSR) user interfaces. This library aims to be fast, minimal and language agnostic unlocking Island Architecture (Partial Hydration) with minimal code duplication.

It is best paired with a templating engine on the backend like [text/template](https://pkg.go.dev/text/template) for Go or [Tera](https://tera.netlify.app/docs/) for Rust. Vscript will not protect you from XSS and expects HTML to be loaded from trusted sources without or sanitized user inputs.

## Minimal example

The following shows a minimal vscript usage to demonstrate its purpose.

Download the vscript.js file: `wget https://raw.githubusercontent.com/litvinav/vscript/main/vscript.js`

Create the following two files. First `index.html`:
```html
<html>
  <head>
    <script src="/vscript.js"></script>
  <head>
  <body>
    <button onclick="return inject(event)" v-url="/partial.html">show</button>
  </body>
</html>
```

Second `partial.html`:
```html
<h1>Hello world</h1>
```

The content of your folder should look like this:
```
.
├── index.html
├── partial.html
└── vscript.js
```

Now launch a server with `python3 -m http.server 9999` and visit: http://localhost:9999/

## How to use

Add one of the following functions to your input or mouse events in order to load server side rendered HTML.

### inject

|HTML tag|fallback|description|
|---|---|---------|
|v-url| current window location | This is where your HTML is loaded from. You can leave this attribute out and call the same URL. Vscript will send a "V-Request: true" header for you in order to differentiate between a user visiting the page or a vscript injection. |
|v-target| source of the event | This is ether a HTML element identified by the targeted id or the source of the event. The target will be replaced by the response.  |
|v-query| none | Allows you to set the URL query params on injection. For example "item=1" will push this into the url location without reloading the page for e.g. to be bookmarked. |
|v-callback| none | Executes an existsing JavaScript function to be executed after the injection. Useful to hydrate the UI with clients data. |

### eject

|HTML tag|fallback|description|
|---|---|---|
|v-target| source of the event | Ejects the content of the targeted element or the source as fallback and keeps only the HTML element and its id. |
|v-query| none | If provided will remove a query element from the window location. Can be used to revert a query param set by injection. |
