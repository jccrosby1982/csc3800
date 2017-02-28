'use strict';

var util = require('util');

module.exports = {
  post: postMsg
};

function postMsg(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var name = req.swagger.params.postprm.value.message || 'N/A';
  var hello = util.format('You made a POST request, this is your parameter:', name);

  // this sends back a JSON response which is a single string
  res.json(hello);
}
