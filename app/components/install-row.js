import Ember from 'ember';

const {computed, inject:{service}} = Ember;

export default Ember.Component.extend({
  // empty because sam is providing <tr>
  tagName: '',

  ipc: service(),
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
    uninstall(){

    },
    install() {

    }
  }
});
