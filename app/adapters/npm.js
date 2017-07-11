import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  host: 'https://api.npms.io',
  namespace: 'v2',

  pathForType(){
    return 'search';
  }
});
