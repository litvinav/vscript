# VSCRIPT

A JavaScript library for building server side rendered (SSR) user interfaces. This library aims to be fast, minimal and language agnostic unlocking Island Architecture (Partial Hydration) with minimal JavaScript and code duplication.

It is best paired with a templating engine on the backend like [text/template](https://pkg.go.dev/text/template) for Go or [Tera](https://tera.netlify.app/docs/) for Rust. VSCRIPT will not protect you from XSS and expects HTML to be loaded from trusted sources without or sanitized user inputs.

VSCRIPT currently has 2 modules:
- injection: thin JavaScript layer in order to inject server side rendered code into the page.
- routing: client side routing of your server side rendered code. Fully client side on cache hit, if setup correctly.

You probably want to minimize and compress the modules used with your code.

## Minimal example

The following shows a minimal VSCRIPT usage to demonstrate its purpose.

Download the injection.js module: `wget https://raw.githubusercontent.com/litvinav/VSCRIPT/main/injection.js`

Create the following two files. First `index.html`:
```html
<html>
  <head>
    <script src="/injection.js"></script>
  <head>
  <body>
    <button onclick="inject(event)" v-url="/partial.html">show</button>
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
└── injection.js
```

Now launch a server with `python3 -m http.server 9999` and visit: http://localhost:9999/

# How to use

## Injection

Add one of the following functions to your input or mouse events in order to load server side rendered HTML.

### inject

|HTML tag|fallback|description|
|---|---|---------|
|v-url| current window location | This is where your HTML is loaded from. You can leave this attribute out and call the same URL. VSCRIPT will send a "V-Request: true" header for you in order to differentiate between a user visiting the page or a VSCRIPT injection. |
|v-target| source of the event | This is ether a HTML element identified by the targeted id or the source of the event. The target will be replaced by the response.  |
|v-query| none | Allows you to set the URL query params on injection. For example "item=1" will push this into the url location without reloading the page for e.g. to be bookmarked. |
|v-callback| none | Executes an existsing JavaScript function to be executed after the injection. Useful to hydrate the UI with clients data. |

### eject

|HTML tag|fallback|description|
|---|---|---|
|v-target| source of the event | Ejects the content of the targeted element or the source as fallback and keeps only the HTML element and its id. |
|v-query| none | If provided will remove a query element from the window location. Can be used to revert a query param set by injection. |

## Routing

The routing layer will inject SSR chunks into the body element instead opening links in the current browser page.
It is expected that you handle the `V-Request` header on the server side and only render the body on `V-Request: true`.
If a request is send to the server without the `V-Request: true` header, the request was not initiated by VSCRIPT and the browser expects the full page.

Also you should respond with a adequate caching header, depending on the duration of the client session browsing your website or web app. On cache hit VSCRIPT will inject the content of the previous response, skipping concurrent request to the same URL. 

```html
<html>
  <head>
    <script src="/routing.js"></script>
  <head>
  <body>
    <!-- auto onclick override at page load and browsing -->
    <a href="/other-page.html">link</a>
  </body>
</html>
```
