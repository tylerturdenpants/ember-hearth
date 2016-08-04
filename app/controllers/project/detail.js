import Ember from 'ember';

const {inject, computed} = Ember;

export default Ember.Controller.extend({
  ipc: inject.service(),
  store: inject.service(),
  commander: inject.service(),

  project: computed.alias('model'),

  actions: {
    removeProject(){
      this.get('ipc').trigger('hearth-remove-project', this.get('ipc').serialize('project', this.get('model')));
      this.transitionToRoute('application');
    },
    startServer(){
      let store = this.get('store');
      const command = store.createRecord('command', {
        id: uuid.v4(),
        bin: 'ember',
        name: 's',
        args: [],

        project: this.get('model')
      });

      this.get('commander').start(command);
    },
    stopServer(){
      this.get('commander').stop(this.get('model.serveCommand'));
    }
  }
});
