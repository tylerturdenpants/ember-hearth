import { moduleForModel, test } from 'ember-qunit';

moduleForModel('npm', 'Unit | Serializer | npm', {
  // Specify the other units that are required for this test.
  needs: ['serializer:npm']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
