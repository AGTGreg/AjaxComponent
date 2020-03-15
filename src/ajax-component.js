function AjaxComponent(DOMElement) {

  if (DOMElement.length > 0) {
    this.DOMElement = DOMElement;
  }

  this.settings = {
    baseUrl: null,
    urlParams: null,
    timeout: 5000,
    cacheResults: true,
    timeouteMessage: "The request has timed out",
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

  this.update = function(params) {
   this.makeRequest('GET', params); 
  }

  this.makeRequest = function(method, params) {
    const comp = this;
    if (comp.isLoading === false) {
      if (params) this.updateParams(params);

      if (comp.renderLoading instanceof Function) {
        comp.reset();
        comp.state.loading = true;
        comp.renderLoading(function() {

          $.ajax({
            url: comp.settings.baseUrl, data: comp.settings.urlParams,
            method: method, dataType: 'json',
            cache: comp.settings.cacheResults, timeout: comp.timeout,
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
                  comp.state.message = this.settings.timeouteMessage;
                } else if (message) {
                  comp.state.message = message;
                } else {
                  comp.state.message = this.settings.errorMessage;
                }
              }
              comp.renderError();
            },
            complete: function() {
              comp.state.loading = false;
              comp.renderDefault();
            }
          });

        });
      } else {
        throw "renderLoading must be a function that accepts a callback.";
      }
      
    } else {
      throw comp.settings.notReadyMessage;
    }
    
  }
}