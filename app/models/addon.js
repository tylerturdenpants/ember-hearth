import { computed } from '@ember/object';
import DS from 'ember-data';

const {attr} = DS;

export default DS.Model.extend({
  description: attr('string'),
  name: attr('string'),
  score: attr('number'),

  link: computed('name', function () {
    return `https://www.npmjs.com/package/${this.get('name')}`;
  })
});
