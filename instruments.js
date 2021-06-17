'use strict'
const log4js = require('log4js')
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

module.exports = {
    registration
}