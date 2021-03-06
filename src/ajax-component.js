var AjaxComponent = function(config) {


  // Sets or Updates the data and then calls render()
  this.setData = function(newData, replaceData = false) {
    if (replaceData) {
      this.data = newData;
    } else {
      Object.assign(this.data, newData);
    }
    this.render();
  }
  

  // Resets to the default state. Handy before making a request.
  this.resetState = function() {
    this.state.loading = false;
    this.state.error = false;
    this.state.success = false;
  }


  // Makes a request with axios. Config and callbacks are both objects. Callbacks may contain: 
  // success(response), error(error) and done() callbacks.
  this.request = function(config, callbacks, replaceData) {
    const comp = this;
    if (comp.state.loading) return;

    let cConfig = comp.axiosConfig;
    if (config) { Object.assign(cConfig, config) }

    comp.resetState();
    comp.state.loading = true;
    let responseData;

    comp.render(function() {

      axios.request(cConfig)
      .then(function(response) {
        comp.state.success = true;
        if (callbacks && callbacks['success'] instanceof Function) {
          const callReturn = callbacks['success'](response);
          if (callReturn instanceof Object) responseData = callReturn;
        }
        if (responseData === undefined) responseData = response.data;
      })
      .catch(function(error) {
        comp.state.error = true;
        responseData = error;
        if (callbacks && callbacks['error'] instanceof Function) callbacks['error'](error);
      })
      .then(function() {
        comp.state.loading = false;
        comp.setData(responseData, replaceData);
        if (callbacks && callbacks['done'] instanceof Function) callbacks['done']();
      });

    });
  }


  // Render ============================================================================================================
  // This is the heart of AppBlock. This is where all placeholders and directives get evaluated based on the
  // data and content gets updated.
  this.render = function(callback) {
    const comp = this;

    if (comp.methods.beforeRender instanceof Function) comp.methods.beforeRender();

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

    // Placeholders ----------------------------------------------------------------------------------------------------
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

    // Directives ------------------------------------------------------------------------------------------------------
    // If and For directives
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

    let tmpDOM = comp.template.cloneNode(true);    
    processNode(tmpDOM);
    updateTextNodePlaceholders(tmpDOM);
    this.el.innerHTML = tmpDOM.innerHTML;
    if (comp.methods.afterRender instanceof Function) comp.methods.afterRender();
    if (callback instanceof Function) callback();
  }


  // Initialization ====================================================================================================
  this.Init = function() {
    const comp = this;

    // Initialize all the properties from the config or exit if no config is provided.
    if (config !== undefined) {
      
      if (config.el === undefined) {
        throw "==> el is not set or not present in DOM. Set el to a valid DOM element on init.";
      }
      
      comp.el = config.el;

      if (config.template) {
        comp.template = config.template; 
      } else {
        comp.template = comp.el.cloneNode(true);
        comp.el.innerHTML = "";
      }

      comp.state = {
        loading: false,
        error: false,
        success: false
      };

      comp.data = {};
      if (config.data instanceof Object) comp.data = config.data;

      comp.methods = {
        Parent: comp,
        isLoading() {
          return this.Parent.state.loading;
        },
        isSuccessful() {
          return this.Parent.state.success;
        },
        hasError() {
          return this.Parent.state.error;
        },
        beforeRender() {

        },
        afterRender() {

        }
      };
      if (config.methods instanceof Object) Object.assign(comp.methods, config.methods);

      comp.events = {};
      if (config.events instanceof Object) {
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
      comp.events['Parent'] = comp;

      comp.axiosConfig = { 
        headers: {'X-Requested-With': 'XMLHttpRequest'} 
      };
      if (config.axiosConfig instanceof Object) Object.assign(comp.axiosConfig, config.axiosConfig)

    } else {
      return false;
    }

    comp.render();
    return comp;
  }

  return this.Init();
}