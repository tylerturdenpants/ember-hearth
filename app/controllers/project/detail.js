import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { v4 } from 'uuid';

export default Controller.extend({
  ipc: service(),
  store: service(),
  commander: service(),

  project: alias('model'),

  actions: {
    removeProject(){
      this.get('ipc').trigger('hearth-remove-project', this.get('ipc').serialize('project', this.get('model')));
      this.transitionToRoute('application');
    },
    startServer(){
      let store = this.get('store');
      const command = store.createRecord('command', {
        id: v4(),
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
