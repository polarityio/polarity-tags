'use strict';

const request = require('request');
const async = require('async');
const Polarity = require('./polarity');
const config = require('./config/config');
const fs = require('fs');

let Logger;
let requestWithDefaults;

function startup(logger) {
  Logger = logger;
  let requestOptions = {};

  if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
    requestOptions.cert = fs.readFileSync(config.request.cert);
  }

  if (typeof config.request.key === 'string' && config.request.key.length > 0) {
    requestOptions.key = fs.readFileSync(config.request.key);
  }

  if (typeof config.request.passphrase === 'string' && config.request.passphrase.length > 0) {
    requestOptions.passphrase = config.request.passphrase;
  }

  if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
    requestOptions.ca = fs.readFileSync(config.request.ca);
  }

  if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
    requestOptions.proxy = config.request.proxy;
  }

  if (typeof config.request.rejectUnauthorized === 'boolean') {
    requestOptions.rejectUnauthorized = config.request.rejectUnauthorized;
  }

  requestWithDefaults = request.defaults(requestOptions);
}

function doLookup(entities, options, cb) {
  let results = [];

  Logger.info({ options: options }, 'Options');

  entities.forEach((entity) => {
    results.push({
      entity: entity,
      data: {
        summary: ['Polarity'],
        details: {
          options: options,
          entity: entity
        }
      }
    });
  });

  cb(null, results);
}

function onDetails(lookupObject, options, cb) {
  let polarity = new Polarity(requestWithDefaults, Logger);

  async.waterfall(
    [
      function connect(next) {
        polarity.connect(
          options.polarityHost,
          options.polarityUsername,
          options.polarityPassword,
          next
        );
      },
      function getTags(next) {
        polarity.getTagsByEntityValue(lookupObject.entity.value, [], next);
      },
      function disconnect(tags, next) {
        polarity.disconnect((err) => {
          next(err, tags);
        });
      }
    ],
    (err, tags) => {
      if (err) {
        Logger.error(err);
        return cb(err);
      }

      tags.forEach((tag) => {
        lookupObject.data.summary.push(tag);
      });

      cb(null, lookupObject.data);
    }
  );
}

module.exports = {
  doLookup: doLookup,
  startup: startup,
  onDetails: onDetails
};
