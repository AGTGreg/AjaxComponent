var myAjaxComponent = new AjaxComponent(document.getElementById('myAjaxComponent'));

$(document).ready(function() {

  myAjaxComponent.settings.baseUrl = 'https://reqres.in/api/users';
  myAjaxComponent.settings.timeout = 1000;

  myAjaxComponent.elements = {
    content: $(myAjaxComponent.DOMElement).find('.content'),
    updateBtn: $(myAjaxComponent.DOMElement).find('.updateBtn'),
  };

  myAjaxComponent.elements.updateBtn.on('click', function() {
    myAjaxComponent.update('', function() {
      myAjaxComponent.elements.content.text(JSON.stringify(myAjaxComponent.data));
    });
  });

});