const JSONAPI = require('jsonapi-serializer');
const Promise = require('bluebird');
const assert = require('assert');

var ProjectSerializer = new JSONAPI.Serializer('project', {
  keyForAttribute: 'camelCase',
  pluralizeType: false,
  attributes: [
    'name', 'path', 'cli', 'transforms', 'package'
  ]
});
var CommandSerializer = new JSONAPI.Serializer('command', {
  keyForAttribute: 'camelCase',
  pluralizeType: false,
  attributes: [
    'bin', 'name', 'args', 'options', 'inTerm', 'project', 'running', 'succeeded', 'failed', 'stdout', 'stderr'
  ]
});

class Serializer {
  constructor() {
    this.deserializer = new JSONAPI.Deserializer({
      keyForAttribute: 'camelCase',
      projects: {
        valueForRelationship: (rel) => rel
      },
      commands: {
        valueForRelationship: (rel) => rel
      }
    });
    this.serializers = {
      project: ProjectSerializer,
      command: CommandSerializer
    };
  }

  deserialize(modelName, payload) {
    return this.deserializer.deserialize(payload);
  }

  serialize(modelName, payload) {
    assert.ok(this.serializers.hasOwnProperty(modelName), `has serializer for ${modelName}`);
    return Promise.resolve(this.serializers[modelName].serialize(payload));
  }
}

module.exports = Serializer;
