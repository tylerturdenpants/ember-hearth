import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('settings');
  this.route('project', function() {
    this.route('detail', {path: '/:project_id'}, function() {
      this.route('statistics');
      this.route('commands');
      this.route('log');
      this.route('settings');
      this.route('model-maker');
      this.route('install');
    });
    this.route('new');
  });
  this.route("404", { path: "*path"});
});

export default Router;
