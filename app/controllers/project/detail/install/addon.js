import Ember from 'ember';

const {computed, inject} = Ember;

export default Ember.Controller.extend({
  ipc: inject.service(),
  commander: inject.service(),
  ajax: inject.service(),
  project: inject.controller('project.detail'),

  pageSize: 20,
  page: 0,
  minQueryLength: 3,

  filterQuery: '',

  shouldFilterAllAddons: computed('filterQuery', 'minQueryLength', function () {
    return this.get('filterQuery').trim().length >= this.get('minQueryLength');
  }),

  filteredAddons: computed(
    'shouldFilterAllAddons',
    'filterQuery',
    'model.addons',
    function () {
      const query = this.get('filterQuery').trim();
      return this.get('model.addons').filter(addon => addon.name.indexOf(query) !== -1);
    }),

  installedAddons: computed(
    'model.addons',
    'project.model.package.devDependencies',
    'project.model.package.dependencies',
    function () {
      const devDeps = this.get('project.model.package.devDependencies') || {};
      const deps = this.get('project.model.package.dependencies') || {};

      return this.get('model.addons').filter((addon) => {
        return devDeps.hasOwnProperty(addon.name) || deps.hasOwnProperty(addon.name);
      });
    }),

  addons: computed('shouldFilterAllAddons', function () {
    return this.get('shouldFilterAllAddons') ?
      this.get('filteredAddons') :
      this.get('installedAddons');
  }),

  pagedAddons: computed('addons.[]', 'page', 'pageSize', function () {
    const page = this.get('page');
    const size = this.get('pageSize');

    return this.get('addons').slice(0, page * size + size);
  }),

  triggerProjectReload(ev, command){
    if (command.get('succeeded') &&
      ['install', 'uninstall'].indexOf(command.get('name')) !== -1 &&
      command.get('bin') === 'ember') {
      this.get('ipc').trigger('hearth-ready');
    }
  },

  init(){
    this._super(...arguments);
    const ipc = this.get('ipc');
    this.set('_cmdCloseListeners', ipc.deserializedCallback('command', this.triggerProjectReload.bind(this)));
    ipc.on('cmd-close', this.get('_cmdCloseListeners'));
  },

  destroy(){
    this.get('ipc').off('cmd-close', this.get('_cmdCloseListeners'));
    this._super(...arguments);
  },

  actions: {
    nextPage(){
      console.log('nextPage');
      this.incrementProperty('page');
    },
    install(addon) {
      const store = this.get('store');
      const commander = this.get('commander');

      let command = store.createRecord('command', {
        id: uuid.v4(),
        bin: 'ember',
        name: 'install',
        args: [addon.name],
        project: this.get('project.model'),
        inTerm: true,
        onSucceed(){
          let servingCommand = this.get('project.commands')
            .filter(c => c.get('bin') === 'ember' && c.get('name') === 'install')
            .get('lastObject');

          if (servingCommand && servingCommand.get('running')) {
            commander.restart(servingCommand);
          }
        }
      });

      Ember.set(addon, 'command', command);
      commander.start(command);
    }
  }
})
;
