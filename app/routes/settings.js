import Route from '@ember/routing/route';
import { run } from '@ember/runloop';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';
const POLL_TIMEOUT = 2.5 * 1000;

export default Route.extend({
  config: service(),
  _readyPoll: undefined,

  waitForSettingsLoaded(){
    return new RSVP.Promise(resolve => this.pollSettingsReady(resolve))
  },

  pollSettingsReady(resolve){
    if (this.get('config.ready')) {
      resolve();
    } else {
      this.set('_readyPoll', run.later(this, this.pollSettingsReady, resolve, POLL_TIMEOUT));
    }
  },

  model(){
    return this.waitForSettingsLoaded();
  },

  setupController(ctrl){
    this._super(...arguments);
    ctrl.reset();
  },

  deactivate(){
    if (this.get('_readyPoll')) {
      run.cancel(this.get('_readyPoll'));
    }
    this._super(...arguments);
  }
});
