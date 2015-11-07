'use strict';

var Boom = require('boom');
var m = require('../controllers/latest.js');

/**
 * @api {get} /latest GET
 * @apiGroup Latest
 * @apiDescription Provides the latest value of each available parameter for every location in the system.
 *
 * @apiParam {string} [country] Limit results by a certain country.
 * @apiParam {string} [location] Limit results by a certain location.
 * @apiParam {string} [parameter] Limit to only a certain parameter (valid values are pm25, pm10, so2, no2, o3, co and bc).
 * @apiParam {boolean} [has_geo=true] Only return items with geographic coordinates, this option can only be `true`.
 * @apiParam {number} [value_from] Show results above value threshold, useful in combination with `parameter`.
 * @apiParam {number} [value_to] Show results below value threshold, useful in combination with `parameter`.
 *
 * @apiSuccess {string}   location      Location description for measurement
 * @apiSuccess {string}   country       2 digit country code containing measurement
 * @apiSuccess {string}   city          City containing measurement
 * @apiSuccess {array}    measurements  An array of the latest measurements for each parameter for this location.
 * @apiSuccessExample
 *       HTTP/1.1 200 OK
 *       "results": [
 *        {
 *          "location": "Punjabi Bagh",
 *          "city": "Delhi",
 *          "country": "IN",
 *          "measurements": [
 *            {
 *              "parameter": "so2",
 *              "value": "7.8",
 *              "lastUpdated": "2015-07-24T11:30:00.000Z",
 *               "unit": "µg/m3"
 *             },
 *             {
 *               "parameter": "co",
 *               "value": 1.3,
 *               "lastUpdated": "2015-08-18T23:30:00.000Z",
 *               "unit": "mg/m3"
 *             },
 *             {
 *               "parameter": "pm25",
 *               "value": 79,
 *               "lastUpdated": "2015-10-02T21:45:00.000Z",
 *               "unit": "µg/m3"
 *             }
 *           ]
 *             ...
 *         }
 *      ]
 *
 * @apiError statusCode     The error code
 * @apiError error          Error name
 * @apiError message        Error message
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *      "statusCode": 400,
 *      "error": "Bad Request",
 *      "message": "Oops!"
 *     }
 */
module.exports = [
  {
    method: ['GET'],
    path: '/v1/latest',
    handler: function (request, reply) {
      var params = {};

      // For GET
      if (request.query) {
        params = request.query;
      }

      // Don't use a limit for this endpoint
      request.limit = undefined;

      // Handle it
      var redis = request.server.plugins['hapi-redis'].client;
      m.query(params, redis, function (err, records, count) {
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }

        request.count = count;
        return reply(records);
      });
    }
  }
];