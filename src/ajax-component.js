function AjaxComponent(DOMElement) {

  this.DOMElement = DOMElement;
  this.originalDOM = DOMElement.cloneNode(true);

  this.settings = {
    baseUrl: null,
    urlParams: {},
    timeout: 5000,
    cacheResults: true,
    timeoutMessage: "The request has timed out",
    errorMessage: "Something went wrong",
    notReadyMessage: "Component is still loading.",
  };

  this.data = {};
  this.elements = {};
  this.methods = {};

  this.state = {
    loading: false,
    error: false,
    success: false,
    message: '',
  };

  // Getters
  this.isLoading = function() {
    return this.state.loading;
  }
  this.isSuccessful = function() {
    return this.state.success;
  }
  this.hasError = function() {
    return this.state.error;
  }
  this.message = function() {
    return this.state.message;
  }

  // Built-in methods
  this.reset = function() {
    this.state.loading = false,
    this.state.error = false,
    this.state.success = false,
    this.state.message = null
  }

  this.updateParams = function(params) {
    return Object.assign(this.settings.urlParams, params);
  }

  this.update = function(params, callback) {
    this.makeRequest('GET', params, callback); 
  }

  this.makeRequest = function(method, params, callback) {
    const comp = this;
    if (comp.isLoading()) return;

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

    const evalMethods = {
      'c-if': function(method) {
        const buildinMethods = ['isLoading', 'isSuccessful', 'hasError']
        if (buildinMethods.includes(method)) {
          return comp[method]();
        } else if (method in comp.methods) {
          return comp.methods[method]()
        }
        return false;
      },

      'c-for': function(statement) {
        // Get the return item name and the iterable
        stParts = statement.split(' in ');

        // Split in case iterObjectkeys is like data.something and go deeper into the data one key at a time like so:
        // comp.data => comp.data[key] => comp.data[key][key2] => ...
        // Return the data or stop and return false as soon as a key does not exist.
        iterObjectkeys = stParts[1].split('.');
        const getKeyInData = function(data, key) {
          if (data[key] !== undefined) return data[key];
          return false;
        }
        let iterable = comp.data;
        for (let i=0; i<iterObjectkeys.length; i++) {
          iterable = getKeyInData(iterable, iterObjectkeys[i]);
        }
        if (iterable === false) return false;
        return {'itemName': stParts[0], 'iterable': iterable};
      }
    }

    const updatePlaceholders = function(text) {
      console.log('==> Updating placeholders.');
    }

    // Processes nodes recursivelly in reverse. Evaluates the nodes based on their attributes.
    // Removes and skips the nodes who evaluate to false.
    const processNode = function(node) {
      const attrs = node.getAttributeNames();
      
      for (let i=0; i<attrs.length; i++) {
        if (attrs[i] in evalMethods) {
          const attr = attrs[i];
          const result = evalMethods[attr](node.getAttribute(attr));
          console.log('==> ' + attr + ' ' + node.getAttribute(attr) + ' is ' + result);
          if (result === false) {
            node.remove();
            return;
          } else {
            node.removeAttribute(attr)
            break;
          }
        }
      }

      if (node.hasChildNodes()) {
        for (let c=node.childElementCount - 1; c >= 0; c--) {
          if (node.children[c]) {
            processNode(node.children[c]);
          } else {
            break;
          }
        }
      }

    }

    let tmpDOM = comp.originalDOM.cloneNode(true);
    processNode(tmpDOM);
    console.log(tmpDOM);
    this.DOMElement.innerHTML = tmpDOM.innerHTML;
    if (callback instanceof Function) callback();
  }

  this.init = function() {
    this.DOMElement.innerHTML = "";
    this.state.success = true;
    this.render();
  }
  this.init();

}