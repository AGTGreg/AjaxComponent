
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
  }
});


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
    }
  },

  events: {
    'keypress #todoInput': function(e) {
      if (e.which == 13) {
        const nextId = todoApp.data.todos.length + 1;
        if (e.srcElement.value.length > 0) {
          todoApp.data.todos.push(
            { id: nextId, title: e.srcElement.value, done: false }
          );
          var t = timer('Render');
          todoApp.render(() => {
            console.log(e.srcElement);
          });
          t.stop();
        }
      }

    }
  }
});


$(document).ready(function() {
  // $('#app').on('click', '#btnLoadData', function() {
  //   comp.update({delay: 2});
  // });
  // $('#app').on('click', '#btnError', function() {
  //   comp.state.error = true;
  //   comp.render();
  // });


  // $('#todoApp').on('keypress', '#todoInput', function(e) {
  //   if (e.which == 13) {
  //     const nextId = todoApp.data.todos.length + 1;
  //     if ($(e.target).val().length > 0) {
  //       todoApp.data.todos.push(
  //         { id: nextId, title: $(e.target).val(), done: false }
  //       );
  //       var t = timer('Render');
  //       todoApp.render(() => $('#todoApp #todoInput').focus());
  //       t.stop();
  //     }
  //   }
  // });
  // $('#todoApp').on('change', '.check-done', function(e) {
  //   const $this = $(e.target);
  // });

  
  // for (let i=0; i<1000; i++) {
  //   const nextId = todoApp.data.todos.length + 1;
  //   todoApp.data.todos.push(
  //     { id: nextId, title: "Do something", done: false }
  //   );
  // }
  // var t = timer('Render');
  // todoApp.render();
  // t.stop();

});