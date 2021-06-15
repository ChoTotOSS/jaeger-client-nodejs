# Internal Client for Jaeger using nodejs

- Ref: `https://github.com/jaegertracing/jaeger-client-node`

[![Node.js Package](https://github.com/ChoTotOSS/jaeger-client-nodejs/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/ChoTotOSS/jaeger-client-nodejs/actions/workflows/npm-publish.yml)
[![Node.js CI](https://github.com/ChoTotOSS/jaeger-client-nodejs/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/ChoTotOSS/jaeger-client-nodejs/actions/workflows/node.js.yml)

## How to use

### 1. Create jeager.js file on your project (libs directory recommended)

```javascript
const { initTracer } = require('jaeger-client');

const config = {
  serviceName: 'your-service-name': String,
  reporter: {
    name: 'your-service-name-reporter' : String,
    logSpans: true,
    agentHost: 'your-reporter-host': String,
    agentPort: 'your-report-port': Number
  },
  sampler: {
    type: 'const',
    param: 1.0
  }
};

const options = {
  tags: {
    'service': 'your-service-tag': String,
    'version': 'your-service-version': String,
  }
}
module.exports = initTracer(config,options);
```

example:

```javascript
import { initTracer } from "jaeger-client";

const config = {
  serviceName: "pricer",
  reporter: {
    name: "pricer-reporter",
    logSpans: true,
    agentHost: process.env.JAEGER_AGENT_HOST || "localhost",
    agentPort: process.env.JAEGER_AGENT_PORT || 6832
  },
  sampler: {
    type: "const",
    param: 1.0
  }
};
const options = {
  tags: {
    service: "pricer",
    version: process.env.npm_package_version || "1.0.0"
  }
};

export default initTracer(config, options);
```

### 2. Create Middleware file (middlewares directory recommended)

```javascript
const jaeger = require("path-to-lib/jaeger.js");
const JaegerMiddleware = require("@chototoss/jaeger-client-nodejs");
const jaegerMiddleware = new JaegerMiddleware(jaeger);
module.exports = jaegerMiddleware;
```

After created, your structure should look like

```bash
├── libs
│   └── jaeger.js
├── middlewares
│   └── jaeger-middleware.js
├── package.json
├── routes
│   └── index.js
├── server.js
└── workers
    └── main-worker.js
```

### 3. Use for API

`app.js`

```javascript
const jaegerMiddleware = require("path-to-middleware/jaeger-middleware.js");
app.use(jaegerMiddleware.handleLogBeforeResponse);
app.use(
  `your_route_prefix`,
  jaegerMiddleware.createSpanAfterReceivedRequest,
  your_router
);
```

alternative ways to use

```javascript
const jaegerMiddleware = require("path-to-middleware/jaeger-middleware.js");
app.use(
  `your_end_point`,
  jaegerMiddleware.handleLogBeforeResponse,
  jaegerMiddleware.createSpanAfterReceivedRequest,
  your_end_point_handler
);
```

### 4. Use for worker

`main-worker.js`

```javascript
const jaegerMiddleware = require("path-to-middleware/jaeger-middleware.js");
const span = jaegerMiddleware.initSpanForWorker("worker-name",data,data.headers);
span.log(something)
span.finish()
```

## Q&A

- Please contact Son Nguyen - sonnguyen@chotot.vn
