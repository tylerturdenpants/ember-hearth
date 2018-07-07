import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { assert } from '@ember/debug';

function buildResolveFn(resolveMapName) {
  return function (ev, cmd) {
    let resolveMap = this.get(resolveMapName);
    if (resolveMap[cmd.id]) {
      resolveMap[cmd.id](...arguments);
      delete resolveMap[cmd.id];
    }
  };
}

export default Service.extend({
  ipc: service(),
  store: service(),

  _stopResolveMap: {},
  _startResolveMap: {},

  init(){
    this._super(...arguments);

    const ipc = this.get('ipc');

    // all the _call*ResolveFn are basically to resolve an earlier created promise after a server event is emitted
    this.set('_cmdCloseCallback', ipc.deserializedCallback('command', buildResolveFn('_stopResolveMap').bind(this)));
    this.set('_cmdStartCallback', ipc.deserializedCallback('command', buildResolveFn('_startResolveMap').bind(this)));

    ipc.on('cmd-close', this.get('_cmdCloseCallback'));
    ipc.on('cmd-start', this.get('_cmdStartCallback'));
  },

  destroy(){
    this._super(...arguments);

    const ipc = this.get('ipc');

    ipc.off('cmd-close', this.get('_cmdCloseCallback'));
    ipc.off('cmd-start', this.get('_cmdStartCallback'));
  },

  storeResolveForCommand(resolver, command, resolve) {
    assert(`Must not contain a resolve fn for command ${command.get('id')}`, !this.get(resolver).hasOwnProperty(command.get('id')));
    this.get(resolver)[command.get('id')] = resolve;
  },

  start(command) {
    return new RSVP.Promise((resolve) => {
      this.storeResolveForCommand('_startResolveMap', command, resolve);
      this.get('ipc').trigger('hearth-run-cmd', this.get('ipc').serialize('command', command));
    });
  },

  stop(command) {
    return new RSVP.Promise((resolve) => {
      this.storeResolveForCommand('_stopResolveMap', command, resolve);
      this.get('ipc').trigger('hearth-kill-cmd', this.get('ipc').serialize('command', command));
    });
  },

  restart(command){
    return this.stop(command).then(() => {
      command.reset();
      this.start(command);
    });
  }
});
