import Ember from 'ember';

const {inject:{service}} = Ember;

export default Ember.Component.extend({
  electron: service(),
  path: '',

  actions: {
    clearPath(){
      this.set('path', '');
      this.get('changedPath')(this.get('path'));
    },
    setPath(){
      const dialog = this.get('electron.remote.dialog');
      const dirs = dialog.showOpenDialog({properties: ['openFile']});

      if (dirs.length) {
        this.set('path', dirs[0]);
        this.get('changedPath')(this.get('path'));
      }
    }
  }
});
