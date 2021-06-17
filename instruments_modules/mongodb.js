'use strict'
const { stringify } = require("flatted/cjs");
const opentracing = require("opentracing");
const context = require('../context')
const helper = require('../helper')

const requestIdMap = {}

const onStart = (event)=>{
    const {
        databaseName,
        commandName,
        command,
        requestId
    }= event;
    const {
        filter={},
        projection={},
        limit,
        query={}
    } = command
    const collection = command[commandName]
    const operation_name = `${databaseName}.${collection}.${commandName}_${requestId}_request`
    // set operation name
    requestIdMap[requestId]=`${databaseName}.${collection}.${commandName}`
    const span = opentracing.globalTracer().startSpan(operation_name,{
        childOf: context.getContext()
    })
    span.setTag("action",commandName)
    if (!helper.isEmptyObject(filter)){
        helper.tagObject(span,filter)
    }
    if (!helper.isEmptyObject(query)){
        helper.tagObject(span,query)
    }
    span.setTag("limit",limit)
    span.log({
        filter,
        query,
        projection,
        limit
    })

    span.finish()
    // {
    //     address: '10.60.3.8:27017',
    //     connectionId: 2,
    //     requestId: 5,
    //     databaseName: 'user_profiler',
    //     commandName: 'createIndexes',
    //     command: {
    //       createIndexes: 'reasons',
    //       indexes: [ [Object] ],
    //       lsid: { id: [Binary] },
    //       '$db': 'user_profiler'
    //     }
    //   }
}

const onEnd = (event)=>{
    const {
        requestId
    }= event;
    const {
        cursor={},
        value={}
    } = reply
    const operation_name = requestIdMap[requestId]+`_${request_id}_response`
    const span = opentracing.globalTracer().startSpan(operation_name,{
        childOf: context.getContext()
    })
    const firstBatch = cursor?.firstBatch || []
    span.log({
        value: stringify(value),
        firstBatch: stringify(firstBatch)
    })
    span.finish()
    // {
    //     address: '10.60.3.8:27017',
    //     connectionId: 2,
    //     requestId: 3,
    //     commandName: 'find',
    //     duration: 16,
    //     reply: {
    //       cursor: { firstBatch: [Array], id: 0, ns: 'user_profiler.reasons' },
    //       ok: 1
    //     }
    //   }

    // {
    //     address: '10.60.3.8:27017',
    //     connectionId: 1,
    //     requestId: 6,
    //     commandName: 'findAndModify',
    //     duration: 11,
    //     reply: {
    //       lastErrorObject: { n: 1, updatedExisting: true },
    //       value: {
    //         _id: 60caf63a9d634c2eb2a8b2ed,
    //         is_deleted: false,
    //         name: 'abccc',
    //         created_at: 2021-06-17T07:14:02.702Z,
    //         updated_at: 2021-06-17T07:27:40.084Z,
    //         __v: 0
    //       },
    //       ok: 1
    //     }
    //   }

}

const start = ()=>{
    const path = process.cwd()
    const listener = require(path+'/node_modules/mongodb').instrument()
    listener.on("started", onStart)
    listener.on("succeeded", onEnd)
    // listener.on("failed", onEnd)
}

module.exports = {
    start
}