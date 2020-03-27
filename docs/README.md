# Introduction

AjaxComponent is a tiny javascript library for building interfaces for the web.

It is designed to be easy to use and to play nice with other server side template engines, such as Django templates
and Jinja2.


## Installation

Download and include with a script tag in your document's head:

```html
<script src="/ajax-component.min.js"></script>
```

or you can use the **CDN version**:
```html
<script src="https://cdn.jsdelivr.net/ajax-component.min.js"></script>
```


## Getting started

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
Lets test this! Open up your browser's console and type: `app.setData({message: "Hi"})`. Now you should see
that our element is automatically updated to display the new message.

?> Whenever you need to update your data, you should use the `setData()` method instead of changing your data
directly. This way your app will re-render every time your data changes and your Interface will always be
updated automatically. If, for any reason you want to change your data without updating your interface then
you can change your data directly and call the `render()` method whenever you want to update your interface.

We can also use placeholders in our element's attributes:

```html
<div id="app" title="{data.message}">
  {data.message}
</div>
```


## Methods

In the example above we get the message directly from our data. But what if we wanted to edit that message before we 
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
      return this.Parent.data.message.toUpperCase();
    }
  }

})
```

Now all that needs to be done is to call it with a placeholder. Note that we need to write only the method's name:

```html
<div id="app">
  {message}
</div>
```

> HELLO WORLD!

The `methods` object is the right place to put all of our application's logic. From processing data to 
anything you would write a function for.

Of course methods get updated along with our data. Go ahead and open your browser's console again and type
`app.setData({message: "this is uppercase"})`. You'll see that our message is displayed in uppercase
because it went through our method before showing up in our element.

?> Also note how we access our `data`. We use `this.Parent` to access our app from 
inside `methods`.


## Conditional rendering

It is very easy to control the structure of our app with **if** and **for** directives. We add these 
directives as attributes to the elements we want to control.

### c-if

```html
<div id="app">
  <span c-if="data.seen">Now you see me</span>
</div>
```

```js
var app = new AjaxComponent({
  ...
  data: {
    seen: true
  },
  ...
})
```
When `seen` is `true` our element is visible. If we set it to `false` our element is gone.

`c-if` directives can also work with 
[Comparison operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators) 
and evaluate **numbers** and **booleans**. For instance we could do this and it would work as expected:
```html
<div id="app">
  <span c-if="data.seen == true">Now you see me</span>
</div>
```

### c-ifnot

This the opposite of `c-if`. Think of it as writing if ... else. But in our case this is more verbose so it is 
easier to explain our logic inside our element. Heres a quick example:
```html
<div id="app">
  <span c-if="data.seen == true">Now you see me</span>
  <span c-ifnot="data.seen == true">Seen is false</span>
</div>
```

