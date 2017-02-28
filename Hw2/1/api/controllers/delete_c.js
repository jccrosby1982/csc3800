'use strict';

var util = require('util');

module.exports = {
  delete: deleteMsg
};

function deleteMsg(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var name;
  if (req.swagger.params.name.value){
    name = "this is the parameter that you passed in: " + req.swagger.params.name.value;
  }
  else {
      name = "and no parameters were passed in"
  }

  var hello = util.format('You made a DELETE request,', name);

  // this sends back a JSON response which is a single string
  res.json(hello);
}
