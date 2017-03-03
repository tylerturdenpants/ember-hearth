import Ember from 'ember';
import InstallRow from './install-row';
import layout from '../templates/components/install-row';
import { v4 } from 'uuid';

const {inject:{service}} = Ember;

export default InstallRow.extend({
  layout,

  canUninstall: true,

  commander: service(),
  store: service(),

  actions: {
    install() {
      const commander = this.get('commander');
      const store = this.get('store');

      const command = store.createRecord('command', {
        id: v4(),
        bin: 'npm',
        name: 'install',
        args: [this.get('package.name'), '--save-dev'],
        project: this.get('project'),
        onSucceed: () => {
          let servingCommand = this.get('project.serveCommand');

          if (servingCommand && servingCommand.get('running')) {
            commander.restart(servingCommand);
          }

          this.get('done')(command);
        }
      });

      this.set('command', command);
      this.get('install')(command);
    },
    uninstall(){
      const commander = this.get('commander');
      const store = this.get('store');

      const command = store.createRecord('command', {
        id: v4(),
        bin: 'npm',
        name: 'uninstall',
        args: [this.get('package.name'), '--save-dev'],
        project: this.get('project'),
        onSucceed: () => {
          let servingCommand = this.get('project.serveCommand');

          if (servingCommand && servingCommand.get('running')) {
            commander.restart(servingCommand);
          }

          this.get('done')(command);
        }
      });

      this.set('command', command);
      this.get('install')(command);
    }
  }
});
