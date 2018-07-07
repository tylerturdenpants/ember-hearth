import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
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
