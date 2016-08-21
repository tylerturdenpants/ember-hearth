import Ember from 'ember';

const {inject:{service}} = Ember;

export default Ember.Controller.extend({
  ipc: service(),
  config: service(),

  nodePath: '',

  reset(){
    this.set('nodePath', this.get('config.fields.bins.node'));
  },

  actions: {
    reset(){
      this.reset();
    },
    changeNodePath(path){
      this.set('nodePath', path);
    },
    save(){
      const ipc = this.get('ipc');
      const config = this.get('config');

      config.set('fields.bins.node', this.get('nodePath'));

      ipc.trigger('hearth-update-config', this.get('config.fields'));
    }
  }
});
