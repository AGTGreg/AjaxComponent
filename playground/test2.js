
var app = new AjaxComponent({

  el: '#app',

  data: {
    todoList: [
      {id: 1, title: "Todo 1"},
      {id: 2, title: "Todo 2", todos: [
        {id: 1, title: "sub Todo 1"},
        {id: 2, title: "sub Todo 2"},
        {id: 3, title: "sub Todo 3"}
      ]},
      {id: 3, title: "Todo 3"}
    ],

    aBool: true
  },

  methods: {
    conditionA() { return true; },
    conditionAb() { return true; },

    conditionB() { return true; },
  }

});
