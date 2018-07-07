import Service from '@ember/service';
let electron = requireNode('electron');

let fields = Object.keys(electron).reduce((all, key) => {
  all[key] = electron[key];
  return all;
}, {});

export default Service.extend(fields);
