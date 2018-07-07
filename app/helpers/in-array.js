import { helper } from '@ember/component/helper';

export function inArray([array, string]/*, hash*/) {
  return array && array.indexOf(string) !== -1;
}

export default helper(inArray);
