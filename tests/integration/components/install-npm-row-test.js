import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('install-npm-row', 'Integration | Component | install npm row', {
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
  this.render(hbs`{{install-npm-row package=package project=project}}`);

  assert.equal(this.$('a').text().trim(), this.get('package.name'));
});

test('it has uninstall button if installed', function(assert) {
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
  this.render(hbs`{{install-npm-row package=package project=project}}`);

  assert.equal(this.$('.button').text().trim(), 'Uninstall');
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
  this.render(hbs`{{install-npm-row package=package project=project}}`);

  assert.equal(this.$('.button').text().trim(), 'Install');
});
