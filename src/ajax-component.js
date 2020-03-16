function AjaxComponent(DOMElement) {

  if (DOMElement) {
    this.DOMElement = DOMElement;
  }

  this.settings = {
    baseUrl: null,
    urlParams: null,
    timeout: 5000,
    cacheResults: true,
    timeoutMessage: "The request has timed out",
    errorMessage: "Something went wrong",
    notReadyMessage: "AjaxComponent is still loading.",
  };

  this.data = {};
  this.elements = {};

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

  // Methods
  this.reset = function() {
    this.state.loading = false,
    this.state.error = false,
    this.state.success = false,
    this.state.message = null
  }

  this.updateParams = function(params) {
    return Object.assign(this.settings.urlParams, params);
  }
  
  // This must be a function with a callback
  this.renderLoading = null;
  
  this.renderDefault = null;
  
  this.renderError = null;

  this.updateDOM = function(callback) {
    const comp = this;
    // c-if ------------------------------------------------------------------------------------------------------------
    comp.DOMElement.querySelectorAll('[c-if]').forEach(el => {
      
        let attr = el.getAttribute('c-if');
        
        if (attr === 'isLoading') {
          if (comp.isLoading()) {
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }

        } else if (attr === 'hasError') {
          if (comp.hasError()) {
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        } else if (attr === 'isSuccessful' || attr === 'isReady') {
          if (comp.isSuccessful()) {
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        }

    });

    if (callback instanceof Function) callback();
  }

  this.update = function(params, callback) {
    this.makeRequest('GET', params, callback); 
  }

  this.makeRequest = function(method, params, callback) {
    const comp = this;
    if (comp.isLoading() === false) {
      if (params) this.updateParams(params);

      comp.reset();
      comp.state.loading = true;
      comp.updateDOM(function() {

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
            comp.updateDOM(callback)
          }
        });

      });
      
    } else {
      throw comp.settings.notReadyMessage;
    }
    
  }

  this.init = function() {
    this.state.success = true;
    this.updateDOM();
  }
  this.init();

}