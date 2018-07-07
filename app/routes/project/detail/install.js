import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { assign } from '@ember/polyfills';

export default Route.extend({
  queryParams: {
    packageQuery: {
      refreshModel: true
    },
    packageSource: {
      refreshModel: true
    }
  },

  projectDependencies(project){
    const devDependencies = (project.get('package.devDependencies') || {});
    const dependencies = (project.get('package.dependencies') || {});

    return assign({}, devDependencies, dependencies);
  },

  loadNpmPackages(packageQuery) {
    let packages;
    if (packageQuery.length === 0) {
      const dependencies = this.projectDependencies(this.modelFor('project.detail'));
      packages = RSVP.resolve(Object.keys(dependencies).map(dependency => EmberObject.create({
        name: dependency,
        description: '',
        link: `https://www.npmjs.com/package/${dependency}`,
        final: 0
      })));
    } else {
      packages = this.get('store').query('npm', {q: packageQuery, from: 0, size: 10});
    }
    return packages;
  },

  loadAddonPackages(packageQuery) {
    const stored = this.get('store').peekAll('addon');
    const findPromise = stored.get('length') ? RSVP.resolve(stored) : this.get('store').findAll('addon');
    const dependencies = this.projectDependencies(this.modelFor('project.detail'));
    const filterAddons = packageQuery.length ?
      pkg => pkg.get('name').indexOf(packageQuery) !== -1 :
      pkg => dependencies.hasOwnProperty(pkg.get('name'));

    return findPromise
      .then(packages => packages.filter(filterAddons));
  },

  model({packageSource, packageQuery}){
    let packages = [];
    switch (packageSource) {
    case 'npm':
      packages = this.loadNpmPackages(packageQuery);
      break;
    case 'addon':
      packages = this.loadAddonPackages(packageQuery);
      break;
    }
    return packages;
  }
});
