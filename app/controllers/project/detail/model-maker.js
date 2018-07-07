/* global require */
import { alias } from '@ember/object/computed';

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { camelize } from '@ember/string';

const path = require('path');

export default Controller.extend({
  commander: service(),
  project: alias('model'),

  models: [{
    name: '',
    attrs: [
      {name: '', transform: ''}
    ]
  }],

  transforms: computed('model.transforms.[]', function () {
    // default transforms https://guides.emberjs.com/v2.5.0/models/defining-models/#toc_transforms
    let transforms = ['', 'string', 'number', 'boolean', 'date', 'belongsTo', 'hasMany'];

    return transforms.concat(this.get('model.transforms').map(transformPath =>
      camelize(path.basename(transformPath, '.js'))));
  })
});
