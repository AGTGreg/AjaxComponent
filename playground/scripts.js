var app = new AjaxComponent({
  el: document.getElementById('app'),
  
  axiosConfig: {
    url: 'https://reqres.in/api/users'
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
          success(response) { 
            console.log(response);
            return {yo: "Response is mutated!"}; 
          },
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
