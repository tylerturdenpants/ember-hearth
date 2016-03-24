import Ember from 'ember';
import DS from 'ember-data';
const bower = requireNode('bower');

const { RSVP } = Ember;

export default DS.RESTAdapter.extend({
  findAll(store, type, id, snapshot) {
    return new RSVP.Promise((resolve, reject) => {
      bower.commands.list().on('end', results => {
        Ember.run(null, resolve, results);
      });
    });
  }
  // createRecord()
  // updateRecord()
  // deleteRecord()
  // findAll()
  // query()
});

/*

bower.commands
{ cache:
   { clean: { [Function: runApi] line: [Function: runFromArgv] },
     list: { [Function: runApi] line: [Function: runFromArgv] } },
  help: { [Function: runApi] line: [Function: runFromArgv] },
  home: { [Function: runApi] line: [Function: runFromArgv] },
  info: { [Function: runApi] line: [Function: runFromArgv] },
  init: { [Function: runApi] line: [Function: runFromArgv] },
  install: { [Function: runApi] line: [Function: runFromArgv] },
  link: { [Function: runApi] line: [Function: runFromArgv] },
  list: { [Function: runApi] line: [Function: runFromArgv] },
  login: { [Function: runApi] line: [Function: runFromArgv] },
  lookup: { [Function: runApi] line: [Function: runFromArgv] },
  prune: { [Function: runApi] line: [Function: runFromArgv] },
  register: { [Function: runApi] line: [Function: runFromArgv] },
  search: { [Function: runApi] line: [Function: runFromArgv] },
  update: { [Function: runApi] line: [Function: runFromArgv] },
  uninstall: { [Function: runApi] line: [Function: runFromArgv] },
  unregister: { [Function: runApi] line: [Function: runFromArgv] },
  version: { [Function: runApi] line: [Function: runFromArgv] } }

 */
