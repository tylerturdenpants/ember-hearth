import Ember from 'ember';
let bower = requireNode('bower');

const { RSVP } = Ember;

export default Ember.Route.extend({
  model() {
    return this.store.findAll('bower-package');
  }
});
