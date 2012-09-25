var url = require('url');
var query = require('querystring');
var settings = require('./settings');

var cache = Object.create(null);

module.exports = {
  postPrepareRequest: function(request) {
    // sets host & path
    Object.keys(settings).forEach(function(key) {
      request[key] = settings[key];
    });

    // build request.path
    if (!request.path) {
      request.path = url.format({
        pathname: request.pathname,
        query: request.query
      });
    }

    var rx = /\{:(\w+)\}/g;
    request.path = request.path.replace(rx,
      function(match, value) {
        if (!request.urlParams) { return ''; }
        var result = request.urlParams[value];
        return typeof result !== 'undefined' ? result : '';
      });

    //request.body
    if (!request.headers || !request.headers['content-type']) { return; }

    switch (request.headers['content-type']) {
      case "application/x-www-form-urlencoded":
        request.body = query.stringify(request.body);
        break;
      case "application/json":
        request.body = JSON.stringify(request.body);
        break;
    }
  },
  preProcessResponse: function(response) {
    var contentType = response.headers['content-type'];
    if (contentType && contentType.indexOf('application/json') === 0) {
      response.body = JSON.parse(response.body);
    }
  },
  tests: [{
    name: 'inital is clear',
    definition: require('./definitions/getObject'),
    prepareRequest: function(request, assert, logger) {
      delete request.urlParams;
    },
    processResponse: function(response, assert, logger) {
      assert.equal(response.statusCode, 200);
    }
  }, {
    name: 'add object',
    definition: require('./definitions/createObject'),
    prepareRequest: function(request, assert, logger) {

    },
    processResponse: function(response, assert, logger) {
      assert.equal(response.statusCode, 201);

      cache.object = response.body;
    }
  }, {
    name: 'get object',
    definition: require('./definitions/getObject'),
    prepareRequest: function(request, assert, logger) {
      request.urlParams.id = cache.object.id;
    },
    processResponse: function(response, assert, logger) {
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, cache.object);
    }
  }, {
    name: 'delete object',
    definition: require('./definitions/deleteObject'),
    prepareRequest: function(request, assert, logger) {
      request.urlParams.id = cache.object.id;
    },
    processResponse: function(response, assert, logger) {
      assert.equal(response.statusCode, 200);
    }
  }]
};
