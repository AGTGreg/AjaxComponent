
var app = new AjaxComponent({

  el: '#app',

  data: {
    todoList: [
      {id: 1, title: "Todo 1"},
      {id: 2, title: "Todo 2", 
        todos: [
          {id: 4, title: "sub Todo 1"},
          {id: 5, title: "sub Todo 2", todos: [
            {id: 7, title: "sub Todo child 1"},
            {id: 8, title: "sub Todo child 2"},
            {id: 9, title: "sub Todo child 3"}
          ]},
          {id: 6, title: "sub Todo 3"}
        ]
      },
      {id: 3, title: "Todo 3"}
    ],

    aBool: true
  },

  methods: {
    conditionA() { return true; },
    conditionAb() { return true; },
    conditionNumber() { return 1; }
  }

});
