'use strict'

const emitter = require('../emitter')
const requestIdMap = {}

const onStart = (event) => {
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
    const {
        databaseName,
        commandName,
        command,
        requestId
    } = event;
    const {
        filter = {},
        projection = {},
        limit,
        query = {}
    } = command
    const collection = command[commandName]
    const operation_name = `${databaseName}.${collection}.${commandName}`
    // set operation name
    requestIdMap[requestId] = `${databaseName}.${collection}.${commandName}`
    if (!operation_name.includes('Index')) {
        emitter.emit('mongodb', {
            db_type: 'mongodb',
            operation_name,
            data: {
                filter,
                projection,
                limit,
                query,
            }
        })
    }
}

const onEnd = (event) => {
    const {
        requestId,
        reply = {},
        duration = 0
    } = event;
    const {
        cursor = {},
        value = {}
    } = reply
    const operation_name = requestIdMap[requestId] + `_response`
    const firstBatch = cursor ?.firstBatch || []
    if (!operation_name.includes('Index')) {
        emitter.emit('mongodb', {
            db_type: 'mongodb',
            operation_name,
            data: {
                command_duration_ms: duration,
                write_operation_response: value,
                read_operation_response: firstBatch
            }
        })
    }
    delete requestIdMap[requestId]
}

const start = () => {
    const path = process.cwd()
    const listener = require(path + '/node_modules/mongodb').instrument()
    listener.on("started", onStart)
    listener.on("succeeded", onEnd)
}

module.exports = {
    start
}