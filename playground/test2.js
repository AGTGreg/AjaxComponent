
var app = new AjaxComponent({

  el: '#app',

  data: {
    todoList: [
      {id: 1, title: "Todo 1"},
      {id: 2, title: "Todo 2"},
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
