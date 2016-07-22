const Serializer = require('./serializer');
const Promise = require('bluebird');

class Messenger {
  constructor(ipc) {
    this.ipc = ipc;
    this.serializer = new Serializer();
  }

  onDeserialized(topic, modelName, cb) {
    this.ipc.on(topic, (ev, data) => {
      console.log(data);
      (!data ? Promise.resolve(undefined) : this.serializer.deserialize(modelName, data))
        .then(deserialized => cb(new Message(ev, deserialized, modelName)))
        .catch(e => console.log('deserialization error', e));
    });
  }

  on(topic, cb) {
    this.ipc.on(topic, (ev, ...data) =>
      cb(new Message(ev, ...data)));
  }

  reply(message, topic, data, extra) {
    return Promise.resolve(message.ev.sender.send(topic, data, extra));
  }

  replySerialized(message, topic, modelName, data, extra = undefined) {
    return this.serializer.serialize(modelName, data)
      .then(serialized => message.ev.sender.send(topic, serialized, extra))
      .catch(e => console.log('serialization error', e));
  }

}
class Message {
  constructor(ev, data, modelName) {
    this.ev = ev;
    this.data = data;
    this.modelName = modelName;
  }
}

module.exports = Messenger;
