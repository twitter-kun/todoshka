/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ObjectId = Schema.Types.ObjectId;
/**
 * Project Schema
 */
var TaskSchema = new Schema({
  name : String,
  desc : { type: String, default: ""},
  parent : ObjectId,
  ticked : { type: Boolean, default: false},
});

/**
 * Project Methods
 */

module.exports = mongoose.model('Task', TaskSchema);
