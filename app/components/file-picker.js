import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
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
