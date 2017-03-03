import Ember from 'ember';
import { v4 } from 'uuid';

const {inject:{service}, computed, get} = Ember;

export default Ember.Controller.extend({
  commander: service(),
  project: computed.alias('model'),

  assetSizes: computed('assetSizesCommand.succeeded', function(){
    if (this.get('assetSizesCommand.succeeded')) {
      const assetSizes = this.get('assetSizesCommand');
      const stdout = assetSizes.get('stdout').join('\n');
      const files = stdout
        .substring(stdout.indexOf('-'))
        .split('\n')
        .filter(string => string.length);

      return files.map(fileString => {
        const prefixFreeString = fileString.substring(fileString.indexOf('- ') + '- '.length);
        const name = prefixFreeString.substring(0, prefixFreeString.indexOf(':'));
        const size = prefixFreeString.substring(prefixFreeString.indexOf(': ') + ': '.length);

        return {name, size};
      });
    }
  }),

  assetSizesCommand: computed('project.commands.[]', function () {
    return this.get('project.commands')
      .filter(command => command.get('name') === 'asset-sizes')
      .get('lastObject');
  }),

  prodBuildCommand: computed('project.commands.[]', function () {
    return this.get('project.commands')
      .filter(command => command.get('name') === 'build' && command.get('args.firstObject') === '-prod')
      .get('lastObject');
  }),

  isLoadingAssetSizes: computed(
    'prodBuildCommand.running',
    'assetSizesCommand.running',
    function () {
      const prod = this.get('prodBuildCommand');
      const assets = this.get('assetSizesCommand');

      if (!prod) {
        return false;
      }

      return (get(prod, 'running')) ||
        (assets && get(assets, 'running'));
    }),

  actions: {
    refreshAssetsSizes(){
      const store = this.get('store');
      const commander = this.get('commander');
      const project = this.get('project');

      function startAssetSizesCommand(){
        commander.start(store.createRecord('command', {
          id: v4(),
          bin: 'ember',
          name: 'asset-sizes',
          args: [],
          project
        }));
      }

      // skip production build if there was one already
      if (this.get('prodBuildCommand')) {
        startAssetSizesCommand();
      } else {
        commander.start(store.createRecord('command', {
          id: v4(),
          bin: 'ember',
          name: 'build',
          args: ['-prod'],
          project,
          onSucceed: startAssetSizesCommand
        }));
      }
    }
  }
});
