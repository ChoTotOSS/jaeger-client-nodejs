'use strict';

const sensitive_keys = ['password', 'passwd', 'pwd', 'secret', 'token',
  'card', 'authorization','pw', 'pass']

const tagPrimitive = (span, key, value) => {
  span.setTag(key, value);
};

const tagObject = (span, obj) => {
  for (let key in obj) {
    if (!obj[key]) continue;
    // skip sensitive key
    if (sensitive_keys.indexOf(key)>-1) continue;
    if (isArray(obj[key])) {
      tagArray(span, obj, key);
      continue;
    }
    if (isPrimitive(obj[key])) {
      tagPrimitive(span, key, obj[key]);
      continue;
    }
    tagObject(span, obj[key]);
  }
};

const tagArray = (span, arr, key) => {
  for (let index = 0; index < arr.length; index++) {
    const item = arr[index];
    if (isPrimitive(item)) {
      tagPrimitive(span, `${key}${index}`, item);
      continue;
    }
    tagObject(span, item);
  }
};

const isPrimitive = input => {
  return input !== Object(input);
};

const isArray = input => {
  return Array.isArray(input);
};

const isExcludedPath = (method,requestPath, options) => {
  const { excludedPath = [] } = options;
  if (requestPath.includes('health') || requestPath.includes('public')) return true;
  for (let index = 0; index < excludedPath.length; index++) {
    const path = excludedPath[index];
    if(requestPath.includes(path.url) && path.method.toLowerCase()===method.toLowerCase()) return true;
  }
  return false;
};

const isEmptyObject = (input)=>{
  if (!input) input = {}
  return Object.keys(input).length === 0 && input.constructor === Object
}

module.exports = {
  tagObject,
  isExcludedPath,
  isEmptyObject
};
