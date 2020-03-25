var app = new AjaxComponent({
  el: '#app',
  
  settings: {
    baseUrl: 'https://reqres.in/api/users',
    timeout: 5000
  },

  data: {},

  methods: {
    userFields() {
      return false;
    },
    users() {
      return this.Parent.data.data;
    }
  },

  events: {
    'click #btnLoadData': function(e) {
      this.Parent.request('GET', 'https://reqrs.in/api/users', {delay: 1});
    }
  }
});
