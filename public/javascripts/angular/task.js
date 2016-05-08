var ngapp = angular.module('task', []);

ngapp.controller('TaskController', ['$scope', '$window', '$http', function($scope, $window, $http){
  $scope.parentTask = null;
  $scope.currentTask = null;
  $scope.sequence = "";

  $http.get('/api/task')
    .success(function (data) {
      $scope.tasks = data.tasks;
    })
    .error(function (data) {
      $scope.lastError = data.err;
      $('#errorModal').modal('show');
    })

  $scope.chooseTask = function(n){
    $scope.currentTask = $scope.tasks[n];
    $scope.activeTask = n;
  }

  $scope.goBack = function(){
    if($scope.parentTask == null) return;
    $http.get('/api/task/'+$scope.parentTask)
      .success(function(data){
        var array = $scope.sequence.split(" > ");
        array.pop();
        $scope.sequence = array.join(" > ");
        $scope.goToSubs(data.task.parent);
        $scope.parentTask = data.task.parent;
      })
      .error(function(data){
        $scope.lastError = data.err;
        $('#errorModal').modal('show');
      })
  }

  $scope.goToSubs = function(id,name){
    $http.get(id != null ? '/api/task/'+id+'/subs' : '/api/task')
      .success(function(data){
        if(name)
        {
          $scope.sequence += " > " + name;
          $scope.parentTask = id;
        }
        $scope.tasks = data.tasks;
        $scope.activeTask = null;
        $scope.currentTask = null;
      })
      .error(function(data){
        $scope.lastError = data.err;
        $('#errorModal').modal('show');
      })
  }

  //Add/Edit tasks
  $scope.isNew = false;
  $scope.typeLabel = "Edit";

  $scope.prepareAdd = function(){
    $scope.isNew = true;
    $scope.typeLabel = "Add";
    $scope.currentTask = null;
    $scope.activeTask = null;
  }

  $scope.prepareEdit = function(){
    if(!$scope.currentTask)
    {
      $scope.prepareAdd();
      return;
    }
    $scope.isNew = false;
    $scope.typeLabel = "Edit";
    $scope.newName = $scope.currentTask.name;
    $scope.newDesc = $scope.currentTask.desc;
  }

  $scope.saveTask = function(){
    if($scope.isNew)
    {
      $http.post('/api/task',{name: $scope.newName, desc: $scope.newDesc, parent: $scope.parentTask})
        .success(function(data)
        {
          $scope.tasks.push(data.task);
        })
        .error(function(data)
        {
          $scope.lastError = data.err;
          $('#errorModal').modal('show');
        })
    }
    else
    {
      $http.patch('/api/task/'+$scope.currentTask._id,{desc: $scope.newDesc})
        .success(function(data)
        {
          $scope.tasks[$scope.activeTask] = data.task;
          $scope.currentTask = data.task;
        })
        .error(function(data)
        {
          $scope.lastError = data.err;
          $('#errorModal').modal('show');
        })
    }
  }

  $scope.deleteCurrent = function()
  {
    if($scope.currentTask)
    {
      $http.delete('/api/task/'+$scope.currentTask._id)
        .success(function(data)
        {
          $scope.tasks.splice($scope.activeTask,1);
          $scope.currentTask = null;
          $scope.activeTask = null;
        })
        .error(function(data){
          $scope.lastError = data.err;
          $('#errorModal').modal('show');
        })
    }
  }

  $scope.patchTaskTick = function(task)
  {
    if(task)
    {
      $http.patch('/api/task/'+task._id,{ticked: task.ticked})
        .success(function(data)
        {
          $scope.tasks[$scope.activeTask] = data.task;
          $scope.currentTask = data.task;
        })
        .error(function(data)
        {
          $scope.lastError = data.err;
          $('#errorModal').modal('show');
        })
    }
  }

}]);