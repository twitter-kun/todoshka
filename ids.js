var config = require('./config.js');
var ids = {};
var Hashids = require("hashids"),
  hashids = new Hashids(config.hashidsSalt);

ids.generateNew = function(ip) {
  
}

module.export = ids;