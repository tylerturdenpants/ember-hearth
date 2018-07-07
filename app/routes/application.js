import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  electron: service(),

  model(){
    return this.store.peekAll('project');
  },

  actions: {
    showItemInFolder(path) {
      this.get('electron.shell').showItemInFolder(path);
    },
    openItem(path) {
      this.get('electron.shell').openItem(path);
    },
    openExternal(url){
      this.get('electron.shell').openExternal(url);
    }
  }
});
