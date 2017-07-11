import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  host: 'https://emberobserver.com',
  namespace: 'api/v2',

  pathForType(){
    return 'autocomplete_data';
  }
});
