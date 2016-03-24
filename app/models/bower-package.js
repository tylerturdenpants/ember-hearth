import DS from 'ember-data';

const { attr, hasMany } = DS;

export default DS.Model.extend({
  name: attr(),
  source: attr(),
  pkgMeta: attr(),
  bowerPackages: hasMany('bower-package')
});
