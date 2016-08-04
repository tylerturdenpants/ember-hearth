import Ember from 'ember';

const {computed} = Ember;

export default Ember.Component.extend({
  classNames: ['log-line'],

  showOut: false,

  hasOut: computed('command.stdout.length', 'command.stderr.length', function(){
    return (this.get('command.stdout.length') + this.get('command.stderr.length')) > 0;
  }),

  actions: {
    toggleShowOut(){
      this.toggleProperty('showOut');
    }
  }
});
