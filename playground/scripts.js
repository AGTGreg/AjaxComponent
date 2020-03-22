
var timer = function(name) {
  var start = new Date();
  return {
      stop: function() {
          var end  = new Date();
          var time = end.getTime() - start.getTime();
          console.log('Timer:', name, 'finished in', time, 'ms');
      }
  }
};

var comp = new AjaxComponent({
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
      comp.update({delay: 1});
    }
  }
});


// ToDoApp =============================================================================================================
var todoApp = new AjaxComponent({
  el: '#todoApp',

  data: {
    todos: []
  },

  methods: {
    todos() {
      return this.Parent.data.todos;
    },
    
    placeholder() {
      return "Write something";
    },

    toggleToDo(id) {
      this.Parent.data.todos.forEach(todo => {
        if (todo.id === id) {
          todo.done = !todo.done;
        }
        console.log(todo);
      });
    },

    isDone() {
      return true;
    }
  },

  events: {
    'keypress #todoInput': function(e) {
      if (e.which == 13) {
        const nextId = todoApp.data.todos.length + 1;
        if (e.srcElement.value.length > 0) {
          todoApp.data.todos.push(
            { id: nextId, title: e.srcElement.value, done: true }
          );
          var t = timer('Render');
          todoApp.render(() => {
            document.querySelector('#todoInput').focus();
          });
          t.stop();
        }
      }
    },

    'click .checkDone': function(e) {
      const currentId = Number(e.srcElement.parentElement.getAttribute('data-key'));
      this.Parent.methods.toggleToDo(currentId);
    }

  }
});
