import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  // empty because sam is providing <tr>
  tagName: '',

  ipc: service(),
  electron: service(),
  commander: service(),

  command: undefined,
  canUninstall: false,

  hasInstalled: computed(
    'project.package.devDependencies',
    'project.package.dependencies',
    'package.name', function () {
      const name = this.get('package.name');
      const devDependencies = this.get('project.package.devDependencies');
      const dependencies = this.get('project.package.dependencies');

      return (devDependencies && devDependencies.hasOwnProperty(name)) ||
        (dependencies && dependencies.hasOwnProperty(name));
    }),

  actions: {
    openExternal(url){
      this.get('electron.shell').openExternal(url);
    },
    uninstall(){

    },
    install() {

    }
  }
});
