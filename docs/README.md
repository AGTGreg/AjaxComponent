# Introduction

AjaxComponent is a tiny javascript library for building interfaces for the web.

It is designed to be easy to use and to play nice with other server side template engines, such as Django templates
and Jinja2.


# Installation

Download and include with a script tag in your document's head:

```html
<script src="/ajax-component.min.js"></script>
```

or you can use the **CDN version**:
```html
<script src="https://cdn.jsdelivr.net/ajax-component.min.js"></script>
```

# Getting started

In order to create an app, the first thing you need to do, is to create an element with an appropriate id.

To make things more interesting lets also add a placeholder that will output some data. Placeholders are enclosed
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

We have created our very first app! Inside our app we use placeholders enclosed in `{}` to display data. 

We can also use placeholders in our element's attributes:

```html
<div id="app" title="{data.message}">
  {data.message}
</div>
```

## Meet methods

In the example above we get the message directly from our data. But what if we wanted to edit message before we 
show it to the world? Lets say we want to convert it to uppercase letters.

Lets add a method that returns whatever is in our data.message but in UpperCase. All methods in AjaxComponent
exist inside the methods object:

```js
var app = new AjaxComponent({
  
  el: '#app',

  data: {
    message: 'Hello world!'
  },
  
  methods: {
    message() {
      return this.Parent.data.message.toUpperCase()()
    }
  }

})
```

Now all that needs to be done is to call it from our HTML:

```html
<div id="app">
  {message}
</div>
```

> HELLO WORLD!

The `methods` object is the right place to put all of your business logic. From processing data to anything you would
write a function for.

Also note how we access our `data`. We use `this.Parent` to access our app and anything it might include from 
inside `methods`.