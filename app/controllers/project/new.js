import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  ipc: service(),
  electron: service(),

  path: '',
  addon: false,
  installing: false,
  stdout: '',
  stderr: '',
  lastStdout: '',

  init(){
    this._super(...arguments);

    const ipc = this.get('ipc');

    this.set('_projectInitStartListener', () => {
      this.set('installing', true);
    });
    this.set('_projectInitEndListener', ipc.deserializedCallback('project', (message, project) => {
      this.set('installing', false);
      this.transitionToRoute('project.detail', project);
    }));
    this.set('_projectInitStdout', (ev, data) => {
      this.set('stdout', this.get('stdout') + data);
      this.set('lastStdout', data);
    });
    this.set('_projectInitStderr', (ev, data) => {
      this.set('err', this.get('stdout') + data);
    });

    ipc.on('project-init-start', this.get('_projectInitStartListener'));
    ipc.on('project-init-end', this.get('_projectInitEndListener'));
    ipc.on('project-init-stdout', this.get('_projectInitStdout'));
    ipc.on('project-init-stderr', this.get('_projectInitStderr'));
  },

  destroy(){
    this._super(...arguments);
    const ipc = this.get('ipc');

    ipc.off('project-init-start', this.get('_projectInitStartListener'));
    ipc.off('project-init-end', this.get('_projectInitEndListener'));
    ipc.off('project-init-stdout', this.get('_projectInitStdout'));
    ipc.off('project-init-stderr', this.get('_projectInitStderr'));
  },

  actions: {
    changedPath(path) {
      this.set('path', path);
    },
    initProject(){
      const path = this.get('path');

      if (path) {
        this.get('ipc').trigger('hearth-init-project', {
          path: path,
          addon: false
        });
      }
    }
  }
});
