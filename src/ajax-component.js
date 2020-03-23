var AjaxComponent = function(config) {

  // Initialize all the properties from the config or exit if no config is provided.
  if (config !== undefined) {
    
    if (! config.el) throw "==> el is not set or not present in DOM. Set el to a valid DOM element on init.";
    
    this.el = document.querySelector(config.el);
    this.originalDOM = this.el.cloneNode(true);
    
    this.settings = {
      baseUrl: null,
      urlParams: {},
      timeout: 5000,
      cacheResults: true,
      timeoutMessage: "The request has timed out",
      errorMessage: "Something went wrong",
      notReadyMessage: "Component is still loading.",
    };
    if (config.settings instanceof Object) Object.assign(this.settings, config.settings);

    this.state = {
      loading: false,
      error: false,
      success: false,
      message: '',
    };

    this.data = {};
    if (config.data instanceof Object) this.data = config.data;

    this.elements = {};
    if (config.elements instanceof Object) this.elements = config.elements;

    this.methods = {
      Parent: this,
      isLoading() {
        return this.Parent.state.loading;
      },
      isSuccessful() {
        return this.Parent.state.success;
      },
      hasError() {
        return this.Parent.state.error;
      },
      message() {
        return this.Parent.state.message;
      }
    };
    if (config.methods instanceof Object) Object.assign(this.methods, config.methods);

    this.events = {};
    if (config.events instanceof Object) {
      const comp = this;
      Object.assign(comp.events, config.events)
      // Add event listeners to :el for each event
      for (const ev in comp.events) {
        // Events are in this form (event element) so split at space to get the eventName and the element to attach the
        // event on.
        const eParts = ev.split(' ');
        const eventName = eParts[0];
        const eventElement = eParts[1];
        
        comp.el.addEventListener(eventName, function(e) {
          comp.el.querySelectorAll(eventElement).forEach(el => {
            if (e.srcElement === el) comp.events[ev](e);
          });
        });
      }
    }
    this.events['Parent'] = this;

  } else {
    return false;
  }
  
  // Built-in methods
  this.reset = function() {
    this.state.loading = false;
    this.state.error = false;
    this.state.success = false;
    this.state.message = null;
  }

  this.updateParams = function(params) {
    return Object.assign(this.settings.urlParams, params);
  }

  this.update = function(params, callback) {
    this.makeRequest('GET', params, callback); 
  }

  this.makeRequest = function(method, params, callback) {
    const comp = this;
    if (comp.state.loading) return;

    if (params) this.updateParams(params);

    comp.reset();
    comp.state.loading = true;

    comp.render(function() {

      $.ajax({
        url: comp.settings.baseUrl, data: comp.settings.urlParams,
        method: method, dataType: 'json',
        cache: comp.settings.cacheResults, timeout: comp.settings.timeout,
        success: function(response) {
          comp.state.success = true;
          comp.data = response;
        },
        error: function(jqXHR, status, message) {
          comp.state.error = true;
          if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
            comp.state.message = jqXHR.responseJSON.message;
          } else {
            if (status === 'timeout') {
              comp.state.message = comp.settings.timeoutMessage;
            } else if (message) {
              comp.state.message = message;
            } else {
              comp.state.message = comp.settings.errorMessage;
            }
          }
        },
        complete: function() {
          comp.state.loading = false;
          comp.render(callback)
        }
      });

    });
    
  }

  this.parseQueryString = function(query) {
    // Code written by Komrod on https://gist.github.com/kares/956897
    const re = /([^&=]+)=?([^&]*)/g;
    const decode = function (str) {
      return decodeURIComponent(str.replace(/\+/g, ' '));
    };
    // recursive function to construct the result object
    function createElement(params, key, value) {
      key = key + '';
      // if the key is a property
      if (key.indexOf('.') !== -1) {
          // extract the first part with the name of the object
          var list = key.split('.');
          // the rest of the key
          var new_key = key.split(/\.(.+)?/)[1];
          // create the object if it doesnt exist
          if (!params[list[0]]) params[list[0]] = {};
          // if the key is not empty, create it in the object
          if (new_key !== '') {
              createElement(params[list[0]], new_key, value);
          } else console.warn('parseParams :: empty property in key "' + key + '"');
      } else
      // if the key is an array    
      if (key.indexOf('[') !== -1) {
          // extract the array name
          var list = key.split('[');
          key = list[0];
          // extract the index of the array
          var list = list[1].split(']');
          var index = list[0]
          // if index is empty, just push the value at the end of the array
          if (index == '') {
              if (!params) params = {};
              if (!params[key] || !$.isArray(params[key])) params[key] = [];
              params[key].push(value);
          } else
          // add the value at the index (must be an integer)
          {
              if (!params) params = {};
              if (!params[key] || !$.isArray(params[key])) params[key] = [];
              params[key][parseInt(index)] = value;
          }
      } else
      // just normal key
      {
          if (!params) params = {};
          params[key] = value;
      }
    }
    // be sure the query is a string
    query = query + '';
    if (query === '') query = window.location + '';
    var params = {}, e;
    if (query) {
        // remove # from end of query
        if (query.indexOf('#') !== -1) {
            query = query.substr(0, query.indexOf('#'));
        }
        // empty parameters
        if (query == '') return {};
        // execute a createElement on every key and value
        while (e = re.exec(query)) {
            var key = decode(e[1]);
            var value = decode(e[2]);
            createElement(params, key, value);
        }
    }
    return params;
  }

  this.render = function(callback) {
    const comp = this;

    /*
    Get the data or method specified in :root.
    If the keys were fount in methods, return the method immediately.
    If no method was found, then search in data one key at a time like so:
    comp.data => comp.data[key] => comp.data[key][key2] => ...
    Return the result or stop and return false as soon as a key does not exist.
    */
    const searchComponent = function(root, keys) {
      if (keys in comp.methods) return comp.methods[keys]();
      for (let i=0; i<keys.length; i++) {
        root = root[keys[i]];
        if (root == undefined) break;
      }
      return root;
    }

    const evalMethods = {
      'c-if': function(node) {
        const attr = node.getAttribute('c-if');

        let condition = searchComponent(comp, attr.split('.'));
        console.log(attr + ' is ' + condition);

        if (condition === undefined || condition === false) {
          node.remove();
          return false;
        }

        node.removeAttribute('c-if');
        return true;
      },


      'c-for': function(node) {
        const attr = node.getAttribute('c-for');

        // Get the alias and the iterable in (alias in iterable)
        stParts = attr.split(' in ');
        const alias = stParts[0];
        objectKeys = stParts[1].split('.');
        let iterable = searchComponent(comp, objectKeys);

        if (iterable) {

          node.removeAttribute('c-for');
          iterable.forEach(item => {
            newNode = node.cloneNode(true);
            // Update the attributes
            updateAttributePlaceholders(newNode, item, alias);
            // Update the text nodes
            updateTextNodePlaceholders(newNode, item, alias);
            processNode(newNode, item, alias);

            node.parentNode.insertBefore(newNode, node);
          });

          node.remove();
          return true;

        } else {

          node.remove();
          return false;

        }
      }
    }

    // Iterates the node tree and replaces the {} with data values.
    // :rootDataObject is the root object that the searchComponent will start from in order to get the data. The
    // default is comp.
    // :alias points to a specific place in the component, ie (data.items). If it is provided, it will be removed 
    // from the keys in propNames. This is handy in case this method is called from a c-for loop:
    // for item in itemsList: {item.id}
    // The propName is item.id and the alias is the item. So in this case item.id will become id.
    const getPropValue = function(prop, rootDataObject, alias) {
      if ( /{([^}]+)}/.test(prop) === false ) return; 
      const propName = prop.replace(/{|}/g , '');
      let propKeys = propName.split('.');
      if (rootDataObject === undefined) rootDataObject = comp
      if (alias === propKeys[0]) propKeys.shift();
      return searchComponent(rootDataObject, propKeys);
    }; 

    // Replaces all placeholders in all attributes in a node.
    const updateAttributePlaceholders = function(node, rootDataObject, alias) {
      const attrs = node.attributes;
      for (let i=0; i<attrs.length; i++) {
        if ( /{([^}]+)}/.test(attrs[i].value) ) {
          const props = attrs[i].value.match(/{([^}]+)}/g);
          console.log(props);

          for (let p=0; p<props.length; p++) {
            const re = new RegExp(props[p], 'g');
            attrs[i].value = attrs[i].value.replace(re, getPropValue(props[p], rootDataObject, alias));
          }
        }
      }
    };

    // Updates all the text nodes that contain placeholders {}
    const updateTextNodePlaceholders = function(nodeTree, rootDataObject, alias) {
      // Text Nodes
      // Create a new treeWalker with all visible text nodes that contain {};
      const textWalker = document.createTreeWalker(
        nodeTree, NodeFilter.SHOW_TEXT, {
          acceptNode: function(node) {
            if ( /{([^}]+)}/.test(node.data) ) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        }
      );

      while (textWalker.nextNode()) {
        let nodeVal = textWalker.currentNode.nodeValue;
        // Iterate over the props (if any) and replace it with the appropriate value.
        const props = nodeVal.match(/{([^}]+)}/g);
        for (let i=0; i<props.length; i++) {
          nodeVal = nodeVal.replace(props[i], getPropValue(props[i], rootDataObject, alias));
        }
        textWalker.currentNode.nodeValue = nodeVal;
      }
    };

    // Processes nodes recursivelly in reverse. Evaluates the nodes based on their attributes.
    // Removes and skips the nodes who evaluate to false.
    const processNode = function(node, rootDataObject, alias) {
      
      const attrs = node.attributes;
      for (let i=0; i<attrs.length; i++) {
        if (attrs[i].name in evalMethods) {
          const attr = attrs[i].name;
          const result = evalMethods[attr](node);
          if (result === false) return;
        }
      }

      updateAttributePlaceholders(node, rootDataObject, alias);

      if (node.hasChildNodes()) {
        for (let c=node.childElementCount - 1; c >= 0; c--) {
          if (node.children[c]) {
            processNode(node.children[c], rootDataObject, alias);
          } else {
            break;
          }
        }
      }

    }

    let tmpDOM = comp.originalDOM.cloneNode(true);
    
    processNode(tmpDOM);
    updateTextNodePlaceholders(tmpDOM);
    this.el.innerHTML = tmpDOM.innerHTML;
    if (callback instanceof Function) callback();
  }

  this.Init = function() {
    this.render();
    delete this.init;
    return this;
  }

  this.Init();

  return this;

}