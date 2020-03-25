var app = new AjaxComponent({
  el: '#app',
  
  settings: {
    baseUrl: 'https://reqres.in/api/users',
    timeout: 5000
  },

  data: {
    message: ""
  },

  methods: {
    users() {
      return this.Parent.data.data;
    }
  },

  events: {
    'click #btnLoadData': function(e) {
      this.Parent.request({method: 'get', url: 'https://reqres.in/api/users/', params: {delay: 1}},
        {
          success(response) { console.log(response); },
          error(error) { app.data.message = error.message; },
          done() { console.log('==> Done'); }
        }
      );
    },

    'click #btnError': function(e) {
      this.Parent.request({method: 'get', url: 'https://reqres.in/api/users/23'},
        {
          error(error) { app.data.message = error.message; }
        }
      )
    },

    'click #btnPost': function(e) {
      const data = {"name": "morpheus", "job": "leader"};
      this.Parent.request({method: 'post', url: 'https://reqres.in/api/users', data: data},
        {
          success(response) { console.log(response); },
          error(error) { console.log(error); },
          done() { console.log('==> Done' ); }
        }
      )
    }

  }
});
