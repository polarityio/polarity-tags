const async = require('async');

class Polarity {
  constructor(request, log) {
    this.request = request;
    this.log = log;
    this.cookieJar = null;
    this.isConnected = false;
    this.host = null;
  }
  isDisconnected() {
    return !(this.isConnected && this.cookieJar !== null);
  }
  disconnect(cb) {
    if (this.isDisconnected()) {
      return cb('Polarity must be connected before trying to disconnect');
    }

    let requestOptions = {
      uri: this.host,
      method: 'POST',
      json: true,
      jar: this.cookieJar
    };

    this.request(requestOptions, (err, body, response) => {
      if (err || response.statusCode !== 200) {
        return cb(err);
      }

      this.isConnected = false;
      this.cookieJar = null;
      this.host = null;

      cb(null);
    });
  }
  connect(host, username, password, cb) {
    let self = this;

    let cookieJar = this.request.jar();
    let requestOptions = {
      uri: host + '/v1/authenticate',
      method: 'POST',
      json: true,
      jar: cookieJar,
      body: {
        identification: username,
        password: password
      }
    };

    this.request(requestOptions, function(err, response, body) {
      if (err) {
        return cb({
          detail: 'HTTP Request Error while Authenticating to Polarity',
          err: err
        });
      }

      if (response.statusCode === 200) {
        // Authentication successful so just return true
        self.isConnected = true;
        self.cookieJar = cookieJar;
        self.host = host;
        cb(null);
      } else {
        cb({
          detail: 'Could not authenticate to Polarity',
          status: response.statusCode,
          body: body
        });
      }
    });
  }

  /**
   * Get Tags for the given `entityValue` from the given `channels`
   * @param entityValue {String}
   * @param channels {Array} An array of numeric ids or an empty array if you want tags from all channels to be returned
   * @param cb {Function} callback
   * @return {Array} An array of tags
   */
  getTagsByEntityValue(entityValue, channels, cb) {
    let self = this;

    if (this.isDisconnected()) {
      return cb('Polarity must be connected before trying to getTagsByEntityValue()');
    }

    async.waterfall(
      [
        function getEntityId(next) {
          self.getEntityId(entityValue, channels, next);
        },
        function getTags(entityId, next) {
          self.getTagsByEntityId(entityId, next);
        }
      ],
      cb
    );
  }
  getTagsByEntityId(entityId, cb) {
    if (this.isDisconnected()) {
      return cb('Polarity must be connected before trying to getTags()');
    }

    let tags = [];

    if (entityId === null) {
      return cb(null, []);
    }

    let requestOptions = {
      uri: this.host + '/v2/entities/' + entityId,
      method: 'GET',
      json: true,
      jar: this.cookieJar
    };

    this.request(requestOptions, function(err, response, body) {
      if (err) {
        return cb({
          detail: 'HTTP Request Error while attempting to retrieve tags from Polarity',
          err: err
        });
      }

      if (response.statusCode !== 200) {
        return cb({
          detail: 'Error while trying to retrieve tags',
          statusCode: response.statusCode,
          body: body
        });
      }

      body.included.forEach((item) => {
        if (item.type === 'tags') {
          tags.push(item.attributes['tag-name']);
        }
      });

      cb(err, tags);
    });
  }

  /**
   *
   * @param entityValue
   * @param channels
   * @param cb
   * @returns {*}
   */
  getEntityId(entityValue, channels, cb) {
    if (this.isDisconnected()) {
      return cb('Polarity must be connected before trying to getEntityId()');
    }

    let requestOptions = {
      uri: this.host + '/v2/searchable-items',
      method: 'GET',
      qs: {
        'filter[entity.entity-name-lower]': entityValue.toLowerCase(),
        'option[searchEntities]': true,
        'option[searchTags]': false,
        'option[searchComments]': false
      },
      json: true,
      jar: this.cookieJar
    };

    if (channels.length > 0) {
      requestOptions.qs['filter[tag-entity-pair.channel-id'] = channels.join(',');
    }

    this.request(requestOptions, function(err, response, body) {
      let match = body.data.find((item) => {
        return item.attributes['searchable-item-name'].toLowerCase() === entityValue;
      });

      if (match) {
        cb(err, match.attributes['entity-id']);
      } else {
        cb(err, null);
      }
    });
  }
}

module.exports = Polarity;
