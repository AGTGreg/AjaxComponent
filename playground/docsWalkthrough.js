var app = new AjaxComponent({
  el: '#app',
  data: {
    message: 'Hello world!',
    seen: true
  },
  methods: {
    message() {
      return this.Parent.data.message.toUpperCase();
    }
  }
})