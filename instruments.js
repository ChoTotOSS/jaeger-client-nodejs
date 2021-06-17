'use strict'
const log4js = require('log4js')
const helper = require('./helper')
const emitter = require('./emitter')

log4js.levels = process.env.LOG_LEVEL || 'info'
const logger = log4js.getLogger('jaeger-client-nodejs-instruments')
const modules = ["mongodb"]



const registration = ()=>{
    for (const module of modules) {
        try {
            require(`./instruments_modules/${module}`).start()
        } catch (error) {
            logger.info(`db module ${module} not found`)
        }
    }
}

const signUpEvent = span =>{
    for (const module of modules) {
        emitter.on(module,(...agrs)=>{
            const eventData = agrs[0]
            const {db_type,operation_name,data}=eventData
            const child_span = global.tracer.startSpan(operation_name,{
                childOf: span
            })
            child_span.setTag("db_type",db_type)
            helper.tagObject(child_span,data)
            child_span.log(data)
            child_span.finish()
        })
    }
}

module.exports = {
    registration,
    signUpEvent
}