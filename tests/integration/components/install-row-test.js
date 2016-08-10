import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('install-row', 'Integration | Component | install row', {
  integration: true
});

test('it renders', function(assert) {
  this.set('project', {
    'package': {
      devDependencies: {
        foo: '1.0.0'
      }
    }
  });
  this.set('package', {
    name: 'foo'
  });
  this.render(hbs`{{install-row project=project package=package}}`);

  assert.equal(this.$('a').text().trim(), this.get('package.name'));
});
