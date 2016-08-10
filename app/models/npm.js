import DS from 'ember-data';
import Ember from 'ember';

const {attr} = DS;
const {computed} = Ember;

export default DS.Model.extend({
  name: attr('string'),
  description: attr('string'),
  final: attr('number'),

  link: attr('string'),
  score: computed('final', function(){
    return (this.get('final') * 100).toFixed(0)
  })
});
