import Ember from 'ember';

const {RSVP} = Ember;

export default Ember.Route.extend({
  queryParams: {
    packageQuery: {
      refreshModel: true
    },
    packageSource: {
      refreshModel: true
    }
  },

  loadPackages(packageSource, packageQuery) {
    if (packageSource === 'addon') {
      const stored = this.get('store').peekAll(packageSource);
      const findPromise = stored.get('length') ? Promise.resolve(stored) : this.get('store').findAll(packageSource);

      return findPromise.then(packages => {
        return packages.filter(pkg => pkg.get('name').indexOf(packageQuery) !== -1);
      });
    } else {
      if (packageQuery.length === 0) {
        return RSVP.resolve([]);
      }
      return this.get('store').query(packageSource, {term: packageQuery, from: 0, size: 10});
    }
  },

  model({packageSource, packageQuery}){
    return this.loadPackages(packageSource, packageQuery);
  }
});
