import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  ipc: service(),
  electron: service(),

  ready: false,
  model: [],

  init(){
    this._super(...arguments);

    const store = this.get('store');
    const ipc = this.get('ipc');

    ipc.on('project-list', ipc.deserializedCallback('project', (ev, projects) => {
      // create lookup table for current project list
      let projectIds = projects.reduce((all, project) => {
        all[project.id] = true;
        return all;
      }, {});

      // unload all records that aren't in project list
      this.get('store').peekAll('project')
        .filter(project => !projectIds[project.get('id')])
        .forEach(project => store.unloadRecord(project));

      this.set('ready', true);
    }));

    ipc.on('cmd-start', ipc.deserializedCallback('command', (ev, command) => {
      command.set('running', true);
    }));
    ipc.on('cmd-stdout', ipc.deserializedCallback('command', (ev, command, data) => {
      command.get('stdout').pushObject(data);
    }));
    ipc.on('cmd-stderr', ipc.deserializedCallback('command', (ev, command, data) => {
      command.get('stderr').pushObject(data);
    }));
    ipc.on('open-project', ipc.deserializedCallback('project', (ev, project) => {
      this.transitionToRoute('project.detail', project);
    }));
    ipc.on('open-route', (ev, route, models = []) => {
      this.transitionToRoute(route, ...models);
    });
    ipc.on('cmd-close', ipc.deserializedCallback('command', (ev, command, code) => {
      command.set('running', false);
      if (code === 0) {
        command.set('succeeded', true);
        command.onSucceed();
      } else {
        command.set('failed', true);
        command.onFail();
      }
    }));

    ipc.on('project-not-ember-app', (ev, path) => {
      alert(`Project at "${path}" is not an ember app`);
    });

    ipc.trigger('hearth-ready');
  },

  actions: {
    addProject(){
      const dialog = this.get('electron.remote.dialog');
      const dirs = dialog.showOpenDialog({properties: ['openDirectory']});

      if (dirs.length) {
        this.get('ipc').trigger('hearth-add-project', dirs[0]);
      }
    }
  }
});
