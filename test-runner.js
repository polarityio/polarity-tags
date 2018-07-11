'use strict';

//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const integration = require('./integration');


// Populate with any options required by the integration method you are testing
const entityValue = '<entityValue>';
const options = {
    polarityHost: '<hostname>',
    polarityUsername: '<username>',
    polarityPassword: '<password>'
};

function log(...args){
    args.forEach(arg => {
        console.info(JSON.stringify(arg, null, 4));
    })
}

const logger = {
    info: log,
    debug: log,
    error: log,
    trace: log
};

integration.startup(logger);

integration.onDetails({
    entity:{
        value: entityValue
    },
    data: {
        summary: [],
        details: {}
    }
}, options, (err, result) => {
    if(err){
        console.info(JSON.stringify(err, null, 4));
    }else{
        console.info(JSON.stringify(result, null, 4));
    }

});
