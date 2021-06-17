const asyncHooks = require("async_hooks");
const contexts = {};
asyncHooks
  .createHook({
    init(asyncId, type, triggerAsyncId, resource) {
      if (type === 'TIMERWRAP') return
      if (contexts[triggerAsyncId]) {
        contexts[asyncId] = contexts[triggerAsyncId];
      }
    },
    destroy(asyncId) {
      delete contexts[asyncId];
    }
  })
  .enable();

function setContext(value) {
  const asyncId = asyncHooks.executionAsyncId();
  contexts[asyncId] = value;
}

function getContext() {
  const asyncId = asyncHooks.executionAsyncId();
  // We try to get the context object linked to our current asyncId
  // if there is none, we return an empty object
  return contexts[asyncId] || null;
}

module.exports = {
  setContext,
  getContext
};
