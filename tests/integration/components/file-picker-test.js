import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('file-picker', 'Integration | Component | file picker', {
  integration: true
});

test('it renders', function(assert) {
  const done = assert.async();
  const testPath = 'some-path';

  const electron = {
    remote: {
      dialog: {
        showOpenDialog(options){
          assert.ok(options.properties.indexOf('openFile') !== -1, 'calls showOpenDialog with openFile');
          return [testPath];
        }
      }
    }
  };
  this.set('electron', electron);
  this.on('changedPath', function(path){
    assert.equal(path, testPath);
    done();
  });
  this.render(hbs`{{file-picker electron=electron changedPath=(action 'changedPath')}}`);

  this.$('.ui.button').click();
});
