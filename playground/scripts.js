
var myAjaxComponent = new AjaxComponent({
  el: document.getElementById('myAjaxComponent'),
  
  settings: {
    baseUrl: 'https://reqres.in/api/users',
    timeout: 1000
  },
  
  data: {
    todos: [
      {id: 1, title: "This is a todo"}
    ]
  },

  methods: {
    todos() {
      if ('todos' in this.Parent.data) {
        return this.Parent.data.todos;
      } else {
        return false;
      }
    }
  }
});

$(document).ready(function() {

  myAjaxComponent.elements = {
    content: $(myAjaxComponent.el).find('.content'),
    updateBtn: $(myAjaxComponent.el).find('.updateBtn'),
  };

  myAjaxComponent.elements.updateBtn.on('click', function() {
    myAjaxComponent.update({page: 1}, function() {
      myAjaxComponent.elements.content.text(JSON.stringify(myAjaxComponent.data));
    });
  });

});