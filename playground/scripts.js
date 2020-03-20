
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
    },
    placeholder() {
      return "Write something";
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
      const nextId = todoApp.data.todos.length + 1;
      if ($(e.target).val().length > 0) {
        todoApp.data.todos.push(
          { id: nextId, title: $(e.target).val(), done: false }
        );
        todoApp.render(() => $('#todoApp #todoInput').focus());
      }
    }
  });
  $('#todoApp').on('change', '.check-done', function(e) {
    const $this = $(e.target);
  });

  for (let i=0; i<100; i++) {
    const nextId = todoApp.data.todos.length + 1;
    todoApp.data.todos.push(
      { id: nextId, title: "Do something", done: false }
    );
    todoApp.render();
  }

});