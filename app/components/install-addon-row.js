import { inject as service } from '@ember/service';
import InstallRow from './install-row';
import layout from '../templates/components/install-row';
import { v4 } from 'uuid';

export default InstallRow.extend({
  layout,
  canUninstall: false,

  commander: service(),
  store: service(),

  actions: {
    install() {
      const commander = this.get('commander');
      const store = this.get('store');

      const command = store.createRecord('command', {
        id: v4(),
        bin: 'ember',
        name: 'install',
        args: [this.get('package.name')],
        project: this.get('project'),
        inTerm: true,
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
