import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('install-addon-row', 'Integration | Component | install addon row', {
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
  this.render(hbs`{{install-addon-row project=project package=package}}`);

  assert.equal(this.$('a').text().trim(), this.get('package.name'));
});

test('it has disabled positive button if installed', function(assert) {
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
  this.render(hbs`{{install-addon-row project=project package=package}}`);

  assert.ok(this.$('.positive.button:disabled').length);
  assert.equal(this.$('.button').text().trim(), 'Installed');
});

test('it has install button if not installed', function(assert) {
  this.set('project', {
    'package': {
      devDependencies: {
        foo: '1.0.0'
      }
    }
  });
  this.set('package', {
    name: 'bar'
  });
  this.render(hbs`{{install-addon-row project=project package=package}}`);

  assert.equal(this.$('.button').text().trim(), 'Install');
});
