import Ember from 'ember';
let electron = requireNode('electron');

const {inject:{service}} = Ember;

export default Ember.Service.extend({
  store: service(),

  on(name, callback){
    electron.ipcRenderer.on(name, callback);
    return callback;
  },

  off(name, listener) {
    electron.ipcRenderer.removeListener(name, listener);
  },

  trigger(name, data) {
    electron.ipcRenderer.send(name, data);
  },

  deserializedCallback(modelName, callback){
    return (ev, data, ...rest) => {
      return callback(ev, this.get('store').push(data), ...rest);
    };
  },

  serialize(modelName, record){
    return record.serialize({includeId: true});
  }
});
