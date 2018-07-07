import Route from '@ember/routing/route';

export default Route.extend({
  model(){
    return this.modelFor('project.detail');
  },
  setupController(ctrl, model){
    ctrl.set('model', model);
    ctrl.reset();
  }
});
