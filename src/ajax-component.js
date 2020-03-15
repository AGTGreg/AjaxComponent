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
    this.state.message = null,
    this.data = {}
  }

  this.setLoading = function(loadingState) {
    
  }

  this.updateParams = function(params) {
    return Object.assign(this.settings.urlParams, params);
  }
  
  // This must be a function with a callback
  this.renderLoading = null;
  
  this.renderDefault = null;
  
  this.renderError = null;

  this.updateDOM = function(callback) {

    // this.DOMElement.childNodes.forEach(el => {
    //   if (el.)
    // });
    
    // document.querySelectorAll('[data-if="isLoading"]').forEach(el => {
    //   el.style.display = 'none';
    // });
    
    // if (this.isLoading()) {
      
    // } else {
    //   document.querySelectorAll('[data-if="isLoading"]').style.display = 'none';
    // }

    // if (this.isSuccessful()) {
    //   document.querySelectorAll('[data-if="isSuccessful"]').style.display = 'block';
    // } else {
    //   document.querySelectorAll('[data-if="isSuccessful"]').style.display = 'none';
    // }

    // if (this.hasError()) {
    //   document.querySelectorAll('[data-if="hasError"]').style.display = 'block';
    // } else {
    //   document.querySelectorAll('[data-if="hasError"]').style.display = 'none';
    // }

    if (callback instanceof Function) callback();
  }

  this.update = function(params) {
   this.makeRequest('GET', params); 
  }

  this.makeRequest = function(method, params) {
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
            comp.renderError();
          },
          complete: function() {
            comp.state.loading = false;
            comp.updateDOM(callback)
            // if (comp.hasError() === false) comp.renderDefault();
          }
        });

      });
      
    } else {
      throw comp.settings.notReadyMessage;
    }
    
  }

}