import { dasherize } from '@ember/string';

function attrToArg(attr) {
  const hasRelationship = ['belongsTo', 'hasMany'].indexOf(attr.transform) !== -1;
  let arg = `${attr.name}:${dasherize(attr.transform)}`;

  if (hasRelationship) {
    arg += `:${attr.relationshipName}`;
  }

  return arg;
}

export {attrToArg};
