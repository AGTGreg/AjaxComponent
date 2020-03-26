# Introduction

AjaxComponent is build to be easy to use and install


# Installation

Download and include with a script tag in your document's head:

```html
<script src="/ajax-component.min.js"></script>
```

or alternatively you can use the **CDN version**:
```html
<script src="https://cdn.jsdelivr.net/ajax-component.min.js"></script>
```

# Getting started

In order to create an app, the first thing you need to do, is to create an element with an appropriate id.

To make things more interesting lets add a placeholder that will output some data. Placeholders are enclosed
in curly braces `{}`:

```html
<div id="app">
  {data.message}
</div>
```

Next, create a new AjaxComponent instance and pass the id of your element in the `el` parameter. You may also
want to add some data:
 
```js
var app = new AjaxComponent({
  el: '#app',
  data: {
    message: 'Hello world!'
  }
})
```

> Hello world!

You've created your very first app!

There's a lot more staff you can do with it.