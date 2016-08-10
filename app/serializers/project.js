import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    commands: { serialize: true }
  }
});
