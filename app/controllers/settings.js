import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  ipc: service(),
  config: service(),

  nodePath: '',

  installCommand: undefined,

  init(){
    this._super(...arguments);
    this.get('ipc').on('hearth-installer-node-install-started', this.onInstallStarted.bind(this));
    this.get('ipc').on('hearth-installer-node-install-progress', this.onInstallProgress.bind(this));
    this.get('ipc').on('hearth-installer-node-install-finished', this.onInstallFinished.bind(this));
    this.get('ipc').on('hearth-installer-node-install-failed', this.onInstallFailed.bind(this));
  },

  onInstallStarted(){
    this.set('installCommand.running', true);
  },
  onInstallProgress(ev, data){
    this.get('installCommand.stdout').pushObject(data);
  },
  onInstallFinished(ev, {path}){
    this.set('installCommand.running', false);
    this.set('installCommand.succeeded', true);
    this.set('config.fields.bins.node', `${path}/bin/node`);
    this.set('nodePath', this.get('config.fields.bins.node'));
    this.get('ipc').trigger('hearth-update-config', this.get('config.fields'));
  },
  onInstallFailed(){
    this.set('installCommand.running', false);
    this.set('installCommand.failed', true);
  },

  reset(){
    this.set('nodePath', this.get('config.fields.bins.node'));
  },

  actions: {
    installCustomNode(){
      this.set('installCommand', {
        bin: 'hearth',
        name: 'install',
        args: ['node'],
        running: false,
        succeeded: false,
        failed: false,
        stdout: []
      });
      this.get('ipc').trigger('hearth-installer-node-install');
    },
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
