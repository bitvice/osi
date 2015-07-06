//
// OSI
//
// Observer Services Injection
//
// Copyright(c) 2015 Gabriel Balasz <gabi@bitvice.ro>
// MIT Licensed
//

'use strict';

// var consumer = require('./lib/service-consumer');

var osi = module.exports;

osi.AConsumer = require('./lib/abstracts/consumer.abstract');
osi.AService  = require('./lib/abstracts/service.abstract');

// TODO: Can we use promises ? Think so :)

var _ = require('lodash');

var exports = module.exports;

// Stores the list of registered services
var servicesCache = {};

// Stores the list of classes that waits for services to be registered
var dependencies = {};

//
// Register a class (who) to be notified when a specific service (what) will be available
//
osi.requestService = function (who, what) {
    if (!_.isUndefined(servicesCache[what])) {
        who.injectService(servicesCache[what]);
        return;
    }

    if (!_.has(dependencies, what)) {
        dependencies[what] = [];
    }

    dependencies[what].push(who);
};

//
// Receive a service and notify the consumers about it's existence
//
osi.registerService = function (serviceName, serviceClass) {
    var serviceInstance = new serviceClass();
    serviceInstance.setName(serviceName);

    servicesCache[serviceName] = serviceInstance;

    if (_.has(dependencies, serviceName)) {
        _.each(dependencies[serviceName], function (consumer) {
            consumer.injectService(serviceInstance);
        });
    }
};

//
// Retrieves the service instance for a spcific service name, it it exists
//
osi.service = function (serviceName) {
    return servicesCache[serviceName];
};
