import Ember from 'ember';

const {inject:{service}} = Ember;

export default Ember.Service.extend({
  ipc: service(),

  ready: false,

  fields: {},

  init(){
    this._super(...arguments);
    const ipc = this.get('ipc');
    ipc.on('hearth-config', (ev, fields) => {
      this.set('fields', fields);
      this.set('ready', true);
    });
    ipc.trigger('hearth-emit-config');
  }
});
