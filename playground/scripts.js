
var comp = new AjaxComponent({
  el: document.getElementById('app'),
  
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
  }
});


var todoApp = new AjaxComponent({
  el: document.getElementById('todoApp'),

  data: {
    todos: []
  },

  methods: {
    todos() {
      return this.Parent.data.todos;
    }
  }
});


$(document).ready(function() {
  $('#app').on('click', '#btnLoadData', function() {
    comp.update({delay: 2});
  });
  $('#app').on('click', '#btnError', function() {
    comp.state.error = true;
    comp.render();
  });

  $('#todoApp').on('keypress', '#todoInput', function(e) {
    if (e.which == 13) {
      if ($(e.target).val().length > 0) {
        todoApp.data.todos.push(
          { title: $(e.target).val() }
        );
        todoApp.render(() => $('#todoApp #todoInput').focus());
      }
    }
  });

});