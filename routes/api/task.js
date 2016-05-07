var express = require('express');
var router = express.Router();
var Task = require('../../models/task');

/**
 * @api {get} /api/task Get Top-Level Tasks
 * @apiName GetTasks
 * @apiGroup Task
 *
 * @apiSuccess {Object[]} tasks Array of top-level Tasks available
 */
router.get('/', function(req, res) {
  Task.find({parent: null},function(err, tasks){
    res.send({tasks: tasks});
    return;
  })
});

/**
 * @api {get} /api/task/:id Get Task by id
 * @apiName GetTask
 * @apiGroup Task
 *
 * @apiSuccess {Object} task Requested Task
 *
 * @apiError TaskNotFound Task does not exist
 */
router.get('/:id', function(req, res) {
  Task.findOne({_id: req.params.id},function(err,task){
    if (err || !task)
    {
      res.status(400).send({err: "TaskNotFound"});
      return;
    }
    res.send({task: task});
    return;
  })
})

/**
 * @api {get} /api/task/:id/subs Get SubTasks 
 * @apiName GetSubTasks
 * @apiGroup Task
 *
 * @apiSuccess {Object} tasks Requested SubTasks
 */
router.get('/:id/subs', function(req, res) {
  Task.find({parent: req.params.id},function(err,tasks){
    res.send({tasks: tasks});
    return;
  })
})

/**
 * @api {post} /api/task Create Task
 * @apiName CreateTask
 * @apiGroup Task
 *
 * @apiParam {String} name Task's name
 * @apiParam {String} [desc] Task's description
 * @apiParam {ObjectID} [parent] Parent's ID
 *
 * @apiSuccess {Object} task Newly created Task
 *
 * @apiError NameRequired Task's name is required
 * @apiError ParentNotFound Requested parent does not exist
 */
router.post('/', function(req, res) {
  if(!req.body.name)
  {
    res.status(400).send({err: "NameRequired"});
    return;
  }
  req.body.desc = (req.body.desc ? req.body.desc : "");
  if(req.body.parent)
  {
    Task.findOne({_id: req.body.parent},function(err,task){
      if (err || !task)
      {
        res.status(400).send({err: "ParentNotFound"});
        return;
      }
      var newTask = new Task({name: req.body.name, 
                              desc: req.body.desc,
                              parent: req.body.parent});
      newTask.save(function(err, newTask){
        res.send({task: newTask});
        return;
      })
    })
  }
  else
  {
    var newTask = new Task({name: req.body.name, 
                              desc: req.body.desc,
                              parent: null});
    newTask.save(function(err, newTask){
      res.send({task: newTask});
      return;
    })
  }
})

/**
 * @api {patch} /api/task/:id Modify Task
 * @apiName PatchTask
 * @apiGroup Task
 *
 * @apiParam {String} [desc] Task's description
 * @apiParam {Boolean} [ticked] If Task is ticked
 *
 * @apiSuccess {Object} task Modified Task
 *
 * @apiError TaskNotFound Task does not exist
 * @apiError BadParameters Unexpected parameters
 */
router.patch('/:id', function(req, res) {
  Task.findOne({_id: req.params.id},function(err,task){
    if (err || !task)
    {
      res.status(400).send({err: "TaskNotFound"});
      return;
    }
    for (var v in req.body)
    {
      if(v != "desc" && v != "ticked")
      {
        res.status(400).send({err: "BadParameters"})
        return;
      }
    }
    if(req.body.desc)
      task.desc = req.body.desc;
    if(req.body.ticked)
      task.ticked = req.body.ticked;
    task.save(function(err,task){
      if(err)
      {
        res.status(400).send(err);
      }
      res.send({task: task});
      return;
    })
  })
})

/**
 * @api {delete} /api/task/:id Delete Task and its SubTasks
 * @apiName DeleteTask
 * @apiGroup Task
 *
 * @apiSuccess {Boolean} ok Is Deleted OK
 *
 * @apiError TaskNotFound Task does not exist
 */
router.delete('/:id', function(req, res) {
  Task.findOne({_id: req.params.id},function(err,task){
    if (err || !task)
    {
      res.status(400).send({err: "TaskNotFound"});
      return;
    }
    removeSubTasks(task._id);
    task.remove(function(err, task) {
      res.send({ok: true});
      return;
    });
  })
})

var removeSubTasks = function(parentId)
{
  Task.find({parent: parentId}, function(err,tasks){
    for(var v in tasks){
      removeSubTasks(tasks[v]._id);
      tasks[v].remove();
    }
  })
}

module.exports = router;
