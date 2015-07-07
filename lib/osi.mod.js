//
// OSI
//
// Observer Services Injection
// http://www.es6fiddle.net/ibtbbllg/
//
// Copyright(c) 2015 Gabriel Balasz <gabi@bitvice.ro>
// MIT Licensed
//

'use strict';

var OSI = module.exports;



// Stores the list of registered services
var wmCache = new WeakMap();

// Stores the list of classes that waits for services to be registered
var wmDependencies = new WeakMap();

var mServices = new Map();

//
// Generate a object containing the provided service name, to use in weak maps
//
function serviceObject (serviceName) {
    if (!mServices.has(serviceName)) {
        mServices.set(serviceName, {service: serviceName});
    }
    return mServices.get(serviceName);
}



//
// Register a class to be notified when a specific service will be available
// TODO: Establish when to use fnReject
//
OSI.requestService = function (serviceName, fnResolve, fnReject) {

    var objService = serviceObject(serviceName);

    if (wmCache.has(objService)) {
        fnResolve(wmCache.get(serviceName));
        return;
    }

    if (!wmDependencies.has(objService)) {
        wmDependencies.set(objService, new Set());
    }

    wmDependencies.get(objService) . 
        add({resolve:fnResolve, reject: fnReject});
};

//
// Receive a service and notify the consumers about it's existence
//
OSI.registerService = function (serviceName, serviceClass) {
    var objService = serviceObject(serviceName);
    var istService;

    if (typeof(serviceClass) != 'undefined') {
        istService = new serviceClass();
        istService.setName(serviceName);
    }

    wmCache.set(objService, istService);

    if (wmDependencies.has(objService)) {
        wmDependencies.get(objService) . 
            forEach (function (consumer) {
                consumer.resolve(istService);
            });
    }
};

//
// Retrieves the service instance for a spcific service name, it it exists
//
OSI.service = function (serviceName) {
    return wmCache.get(serviceObject(serviceName));
};