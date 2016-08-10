import DS from 'ember-data';
import Ember from 'ember';

const {attr} = DS;
const {computed} = Ember;

export default DS.Model.extend({
  description: attr('string'),
  name: attr('string'),
  score: attr('number'),

  link: computed('name', function () {
    return `https://www.npmjs.com/package/${this.get('name')}`;
  })
});
