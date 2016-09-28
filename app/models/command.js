import DS from 'ember-data';
import Ember from 'ember';

const {attr, belongsTo} = DS;
const {K, computed} = Ember;

export default DS.Model.extend({
  bin: attr('string'),
  name: attr('string'),
  args: attr(),
  options: attr(),
  inTerm: attr('boolean'),

  project: belongsTo('project', {async: true}),
  running: false,
  succeeded: false,
  failed: false,

  isHelp: computed('name', 'args.[]', function(){
    return this.get('name') === 'help' &&
      this.get('args.firstObject') === '--json';
  }),

  stdout: [],
  stderr: [],

  onSucceed: K,
  onFail: K,

  init(){
    this._super(...arguments);
    this.set('stdout', []);
    this.set('stderr', []);
  },

  reset(){
    this.setProperties({
      running: false,
      succeeded: false,
      failed: false,
      stdout: [],
      stderr: []
    });
  }
});
