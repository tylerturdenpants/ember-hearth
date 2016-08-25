import { moduleFor, test } from 'ember-qunit';

moduleFor('service:config', 'Unit | Service | config', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

const noop = () => {};

// Replace this with your real tests.
test('it triggers heart-emit-config on init', function(assert) {
  const done = assert.async();
  this.subject({
    ipc: {
      on: noop,
      trigger(topic){
        assert.equal(topic, 'hearth-emit-config');
        done();
      }
    }
  });
});

test('it sets config fields on triggering hearth-config', function(assert) {
  let handler = noop;
  const config = this.subject({
    ipc: {
      on: (topic, _handler) => {
        handler = _handler;
      },
      trigger: noop
    }
  });

  handler({}, {foo: 'bar'});
  assert.equal(config.get('fields.foo'), 'bar');
});
