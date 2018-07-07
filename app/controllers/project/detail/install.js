import { alias, sort } from '@ember/object/computed';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { v4 } from 'uuid';

export default Controller.extend({
  queryParams: ['packageSource', 'packageQuery'],

  ipc: service(),
  commander: service(),
  detail: controller('project/detail'),

  project: alias('detail.project'),

  availableSources: [
    // disable bower because we have no commands for it right now
    // 'bower',
    'addon',
    'npm'
  ],
  packageSource: 'addon',
  packageQuery: '',

  rowComponentName: computed('packageSource', function () {
    return `install-${this.get('packageSource')}-row`;
  }),

  pageSize: 20,
  page: 0,
  minQueryLength: 3,

  sortedModel: sort('model.[]', function(a, b) {
    return b.get('score') - a.get('score');
  }),

  pagedModel: computed('sortedModel.[]', 'page', 'pageSize', function () {
    const page = this.get('page');
    const size = this.get('pageSize');

    return this.get('sortedModel').slice(0, page * size + size);
  }),

  setQuery(query){
    this.set('packageQuery', query);
  },

  actions: {
    updateQuery(query){
      run.debounce(this, this.setQuery, query, 500);
    },
    nextPage(){
      this.incrementProperty('page');
    },

    commandFinished(){
      const project = this.get('project');
      this.get('ipc').trigger('hearth-update-project', this.get('ipc').serialize('project', project));
      this.get('commander').start(this.get('store').createRecord('command', {
        bin: 'ember',
        id: v4(),
        name: 'help',
        args: ['--json'],
        project
      }))
    },
    runCommand(command){
      return this.get('commander').start(command);
    }
  }

});
