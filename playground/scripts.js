var myAjaxComponent = new AjaxComponent(document.getElementById('myAjaxComponent'));

$(document).ready(function() {

  myAjaxComponent.settings.baseUrl = 'https://reqres.in/api/users';
  myAjaxComponent.settings.timeout = 1000;

  myAjaxComponent.elements = {
    updateBtn: $(myAjaxComponent.DOMElement).find('.updateBtn'),
  };

  myAjaxComponent.elements.updateBtn.on('click', function() {
    myAjaxComponent.update();
  });

});