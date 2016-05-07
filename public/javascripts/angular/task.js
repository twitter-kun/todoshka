var ngapp = angular.module('task', []);

ngapp.controller('TaskController', ['$scope', '$window', '$http', function($scope, $window, $http){
  var parent = null;
  $scope.currentTask = null;
  $http.get('/api/task')
    .success(function (data) {
      $scope.tasks = data.tasks;
    })
    .error(function (data) {
      $scope.lastError = data;
      $('#errorModal').modal('show');
    })

  $scope.chooseTask = function(n){
    $scope.currentTask = $scope.tasks[n];
    $scope.activeTask = n;
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
      $http.post('/api/task',{name: $scope.newName, desc: $scope.newDesc})
        .success(function(data)
        {
          $scope.tasks.push(data.task);
        })
        .error(function(data)
        {
          $scope.lastError = data;
          $('#errorModal').modal('show');
        })
    }
    else
    {
      $http.patch('/api/task/'+$scope.tasks[$scope.activeTask]._id,{desc: $scope.newDesc})
        .success(function(data)
        {
          $scope.tasks[$scope.activeTask] = data.task;
          $scope.currentTask = data.task;
        })
        .error(function(data)
        {
          $scope.lastError = data;
          $('#errorModal').modal('show');
        })
    }
  }

}]);