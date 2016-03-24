import DS from 'ember-data';

function norm(payload) {
  let result = {
    type: "bower-package",
    id: id || payload.pkgMeta.name,
    attributes: {
      name: payload.pkgMeta.name,
      source: payload.endpoint.source
    }
  };

  return {
    data: result
  };
}

export default DS.JSONAPISerializer.extend({
  normalizeFindAllResponse(store, primaryModelClass, payload, id, requestType) {
    return this._super(
      store,
      primaryModelClass,
      payload.dependencies.map(norm),
      id,
      requestType)
  }

  // serialize()
});


/*
{ endpoint:
 { name: 'ember-hearth',
   source: '/Users/locks/src/ember-hearth',
   target: '*' },
canonicalDir: '/Users/locks/src/ember-hearth',
pkgMeta:
 { name: 'ember-hearth',
   dependencies:
    { ember: '~2.3.1',
      'ember-cli-shims': '0.1.0',
      'ember-cli-test-loader': '0.2.2',
      'ember-qunit-notifications': '0.1.0',
      semantic: '^2.1.8',
      'node-uuid': '^1.4.7',
      'animation-frame': '~0.2.4' },
   devDependencies: {} },
dependencies:
 { 'animation-frame':
    { endpoint: [Object],
      canonicalDir: '/Users/locks/src/ember-hearth/bower_components/animation-frame',
      pkgMeta: [Object],
      dependencies: {},
      nrDependants: 1,
      versions: [Object],
      update: [Object] },
   ember:
    { endpoint: [Object],
      canonicalDir: '/Users/locks/src/ember-hearth/bower_components/ember',
      pkgMeta: [Object],
      dependencies: [Object],
      nrDependants: 1,
      versions: [Object],
      update: [Object] },
   'ember-cli-shims':
    { endpoint: [Object],
      canonicalDir: '/Users/locks/src/ember-hearth/bower_components/ember-cli-shims',
      pkgMeta: [Object],
      dependencies: [Object],
      nrDependants: 1,
      versions: [Object],
      update: [Object] },
   'ember-cli-test-loader':
    { endpoint: [Object],
      canonicalDir: '/Users/locks/src/ember-hearth/bower_components/ember-cli-test-loader',
      pkgMeta: [Object],
      dependencies: {},
      nrDependants: 1,
      versions: [Object],
      update: [Object] },
   'ember-qunit-notifications':
    { endpoint: [Object],
      canonicalDir: '/Users/locks/src/ember-hearth/bower_components/ember-qunit-notifications',
      pkgMeta: [Object],
      dependencies: [Object],
      nrDependants: 1,
      versions: [Object],
      update: [Object] },
   'node-uuid':
    { endpoint: [Object],
      canonicalDir: '/Users/locks/src/ember-hearth/bower_components/node-uuid',
      pkgMeta: [Object],
      dependencies: {},
      nrDependants: 1,
      versions: [Object],
      update: [Object] },
   semantic:
    { endpoint: [Object],
      canonicalDir: '/Users/locks/src/ember-hearth/bower_components/semantic',
      pkgMeta: [Object],
      dependencies: [Object],
      nrDependants: 1,
      versions: [Object],
      update: [Object] } },
nrDependants: 0,
versions: [] }
 */