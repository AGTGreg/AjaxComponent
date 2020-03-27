var AjaxComponent = function(config) {

  // Initialize all the properties from the config or exit if no config is provided.
  if (config !== undefined) {
    
    if (! config.el) throw "==> el is not set or not present in DOM. Set el to a valid DOM element on init.";
    
    this.el = document.querySelector(config.el);
    this.originalDOM = this.el.cloneNode(true);

    this.state = {
      loading: false,
      error: false,
      success: false
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

    this.axiosConfig = {};
    if (config.axiosConfig instanceof Object) Object.assign(this.axiosConfig, config.axiosConfig)

  } else {
    return false;
  }

  // Sets or Updates the data and then call render()
  this.setData = function(newData, replaceData = false) {
    if (replaceData) {
      this.data = data;
    } else {
      Object.assign(this.data, newData);
    }
    this.render();
  }
  
  // Built-in methods
  this.resetState = function() {
    this.state.loading = false;
    this.state.error = false;
    this.state.success = false;
  }


  this.request = function(config, callbacks) {
    const comp = this;
    if (comp.state.loading) return;

    comp.resetState();
    comp.state.loading = true;
    let responseData;
    comp.render(function() {

      axios.request(config)
      .then(function(response) {
        comp.state.success = true;
        responseData = response.data;
        if (callbacks && callbacks['success'] instanceof Function) callbacks['success'](response);
      })
      .catch(function(error) {
        comp.state.error = true;
        responseData = error;
        if (callbacks && callbacks['error'] instanceof Function) callbacks['error'](error);
      })
      .then(function() {
        comp.state.loading = false;
        comp.setData(responseData);
        if (callbacks && callbacks['done'] instanceof Function) callbacks['done']();
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
    Gets a property's value.

    :keys = An array of keys to search for
    :pointers = An object with keys that point to a specific value

    First search in pointers if pointers is defined. Then search in
    methods and lastly search in the component itself.
    */
    const getProp = function(keys, pointers) {
      const firstKey = keys[0];
      let root = comp;
      let prop;

      if (pointers && firstKey in pointers) {
        keys.shift();
        root = pointers[firstKey];

      } else if (firstKey in comp.methods) {
        keys.shift();
        prop = comp.methods[firstKey]();
      }

      if (keys.length > 0) {
        for (let i=0; i<keys.length; i++) {
          prop = root[keys[i]];
          if (prop === undefined) {
            break;
          } else {
            root = prop;
          }
        }
      }

      return prop;
    }

    const directives = {
      'c-if': function(node, pointers) {
        let attr = node.getAttribute('c-if');
        // In case this directive was called form a c-ifnot.
        if (attr === null) attr = node.getAttribute('c-ifnot');
        
        let result = getProp(attr.split('.'), pointers);

        if (result === undefined) {
          // Check if the attribute contains a logical operator. Split the condition at the
          // operator to get the value of the object at left side and evaluate.
          const operators = [' == ', ' === ', ' !== ', ' != ', ' > ', ' < ', ' >= ', ' <= '];
          const validTypes = ['boolean', 'number'];
          for (let i=0; i<operators.length; i++) {
            if (attr.includes(operators[i])) {
              let condition = attr;
              const cParts = condition.split(operators[i]);
              const condLeft = getProp(cParts[0].split('.'), pointers);
              const condRight = cParts[1];

              if (validTypes.includes(String(typeof(condLeft))) === false) {
                console.error(
                  cParts[0] + " cannot be evaluated because it is not a boolean or a number.");
                return false;
              } else {
                condition = condition.replace(cParts[0], condLeft);
                result = eval(condition);
              }
            }
          }
        }

        if (result === undefined || result === false) {
          return false;
        
        } else {
          node.removeAttribute('c-if');
          return true;
        }
      },

      // Calls c-if directive and reverses the result.
      'c-ifnot': function(node, pointers) {
        result = !directives['c-if'](node, pointers);
        if (result === true) node.removeAttribute('c-ifnot');
        return result;
      },

      'c-for': function(node, pointers) {
        const attr = node.getAttribute('c-for');

        stParts = attr.split(' in ');
        pointer = stParts[0];
        objectKeys = stParts[1].split('.');
        if (pointers === undefined) pointers = {};

        let iterable = getProp(objectKeys, pointers);

        if (iterable) {
          node.removeAttribute('c-for');
          const parentNode = node.parentNode;

          for (let i=0; i<iterable.length; i++) {
            const item = iterable[i];
            // Add a pointer for the current item.
            pointers[pointer] = item;
            
            const newNode = node.cloneNode(true);
            processNode(newNode, pointers);
            updateAttributePlaceholders(newNode, pointers);
            updateTextNodePlaceholders(newNode, pointers);

            // Reset the pointer.
            stParts = attr.split(' in ');
            pointer = stParts[0];
            parentNode.appendChild(newNode);
          };
          node.remove();
          return true;

        } else {
          return false;
        }
        
      }

    }


    // Returns the value of a placeholder.
    const getPlaceholderVal = function(placeholder, pointers) {
      if ( /{([^}]+)}/.test(placeholder) === false ) return; 
      const placeholderName = placeholder.replace(/{|}/g , '');
      let propKeys = placeholderName.split('.');
      return getProp(propKeys, pointers);
    }; 


    // Replaces all placeholders in all attributes in a node.
    const updateAttributePlaceholders = function(node, pointers) {
      const attrs = node.attributes;
      for (let i=0; i<attrs.length; i++) {
        if ( /{([^}]+)}/.test(attrs[i].value) ) {
          const props = attrs[i].value.match(/{([^}]+)}/g);

          for (let p=0; p<props.length; p++) {
            const re = new RegExp(props[p], 'g');
            attrs[i].value = attrs[i].value.replace(re, getPlaceholderVal(props[p], pointers));
          }
        }
      }
    };

    // Updates all the text nodes that contain placeholders {}
    const updateTextNodePlaceholders = function(nodeTree, pointers) {
      // Create a new treeWalker with all visible text nodes that contain placeholders;
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
          nodeVal = nodeVal.replace(props[i], getPlaceholderVal(props[i], pointers));
        }
        textWalker.currentNode.nodeValue = nodeVal;
      }
    };

    // Processes nodes recursivelly in reverse. Evaluates the nodes based on their attributes.
    // Removes and skips the nodes that evaluate to false.
    const processNode = function(node, pointers) {

      const attrs = node.attributes;
      for (let i=0; i<attrs.length; i++) {
        if (attrs[i].name in directives) {
          const attr = attrs[i].name;
          const result = directives[attr](node, pointers);
          if (result === false) {
            node.remove();
            return;
          }
        }
      }

      // If a node stays in our tree (did not evaluate to false) then update all of its attributes.
      updateAttributePlaceholders(node, pointers);

      if (node.hasChildNodes()) {
        for (let c=node.childElementCount - 1; c >= 0; c--) {
          if (node.children[c]) {
            processNode(node.children[c], pointers);
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