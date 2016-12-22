var port = window.location.port;
// Init application angular module
var app = angular.module('bamos', ['ngRoute', 'ngSanitize']);
//
//
// Views logic:
//
//
app.config(['$routeProvider', '$locationProvider',
  function ($routeProvider, $locationProvider) {
    $routeProvider
      // USER:
      .when('/User', {
        templateUrl: 'views/user.html',
        controller: 'bamosController'
      })
      .when('/userItem', {
        templateUrl: 'views/useritem.html',
        controller: 'bamosController'
      })
      .when('/userProfile', {
        templateUrl: 'views/usersub.html',
        controller: 'bamosController'
      })
      .when('/userFollow', {
        templateUrl: 'views/usersub.html',
        controller: 'bamosController'
      })
      .when('/userBlocks', {
        templateUrl: 'views/usersub.html',
        controller: 'bamosController'
      })
      .when('/userFavor', {
        templateUrl: 'views/usersub.html',
        controller: 'bamosController'
      })
      .when('/userLike', {
        templateUrl: 'views/usersub.html',
        controller: 'bamosController'
      })
      .when('/useraccount', {
        templateUrl: 'views/usersub.html',
        controller: 'bamosController'
      })
      // EVENT:
      .when('/Event', {
        templateUrl: 'views/event.html',
        controller: 'bamosController'
      })
      .when('/eventItem', {
        templateUrl: 'views/eventitem.html',
        controller: 'bamosController'
      })
      .when('/eventLike', {
        templateUrl: 'views/eventlike.html',
        controller: 'bamosController'
      })
      .when('/eventFavor', {
        templateUrl: 'views/eventfavor.html',
        controller: 'bamosController'
      })
      // CATEGORY:
      .when('/Category', {
        templateUrl: 'views/category.html',
        controller: 'bamosController'
      })
      .when('/category', {
        templateUrl: 'views/categoryItem.html',
        controller: 'bamosController'
      })
      // TOS:
      .when('/TOS', {
        templateUrl: 'views/tos.html',
        controller: 'bamosController'
      })
      // create new entity:
      .when('/create', {
        templateUrl: 'views/create.html',
        controller: 'bamosController'
      });
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }]);
//
// init application controller  
//
app.controller('bamosController', ['$rootScope', '$scope', '$http', '$route', '$routeParams', '$location', '$sce', bamosController]);
//
function bamosController($rootScope, $scope, $http, $route, $routeParams, $location, $sce) {
  // for show\hide signup form or admin panel 
  $scope.tokenFlag = false;
  $scope.isTokenFlag = function (flag) {
    if (flag === true) { return true; }
    if (flag === false) { return false; }
  };
  //
  //
  // signup base logic.
  //
  //
  var baseUrl = 'http://bamos-api.gdsln.com:33089/';
  $('#signUp').submit(function (e) {
    e.preventDefault();
    // specification: 'Authenticate client application'
    if (!$scope.tokenFlag) {
      // set request options
      var req = {
        method: 'POST',
        url: 'http://localhost:' + port + '/oauth/token',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          path: 'oauth/token',
          send: "grant_type=client_credentials",
          ContentType: 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + b64EncodeUnicode('' + $scope.email + ':' + $scope.password)
        }
      };
      // made request to node server
      $http(req).then(function (res) {
        $scope.token = res.data.token;
        var request = {
          method: 'POST',
          url: 'http://localhost:' + port + '/adm/or/no',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            Authorization: 'Bearer ' + $scope.token
          }
        };
        // subquery for valid
        $http(request).then(function (res) {
          $("#loginWrap  .panel-heading").text("YOU ARE WELCOME!");
          $scope.tokenFlag = res.data.tokenFlag;
        }, function (res) {
          $scope.tokenFlag = res.data.tokenFlag;
        });
        // subquery for valid       
      }, function (res) {
        console.log("Response error :  ", res);
        $("#loginWrap .panel-heading").text("WRONG INPUT DATA!");
      });
    }
  });
  //
  // encode {login:password} from string to bs64
  //
  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
  }
  //
  //
  // Take json list from API  with all entitys for output in UI
  //
  //
  $scope.takeJSONlistFromAPI = function (path, param) {
    // set request options
    var req = {
      method: 'POST',
      url: 'http://localhost:' + port + '/admin/',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        path: path,
        Authorization: 'Bearer ' + $scope.token
      }
    };
    // made request to node server
    $rootScope.CRUD_URLs = [];
    $http(req).then(function (res) {
      if (param === undefined) {
        $rootScope.Entitys = res.data.entity;
      } else if (!isNaN(param)) {
        var _entity = res.data.entity;
        $rootScope.entity = _entity;
        $rootScope.entity_relateds = [];
        // take all related address    
        angular.forEach(_entity._links, function (value, key) {
          var url = value.href;
          $rootScope.CRUD_URLs.push(url);
        });
        // only identity url's
        $rootScope.CRUD_URLs = unique($rootScope.CRUD_URLs);
        // take data from every related address    
        for (var u = 0; u < $rootScope.CRUD_URLs.length; u++) {
          var _url = $rootScope.CRUD_URLs[u];
          var propertyIndex = _url.lastIndexOf('/') + 1;
          $rootScope.propertyName = _url.slice(propertyIndex);
          // skip self url
          if (!isNaN(parseFloat($rootScope.propertyName))) { continue; }
          var request = {
            method: 'POST',
            url: 'http://localhost:' + port + '/admin/',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              related: true,
              path: _url,
              Authorization: 'Bearer ' + $scope.token
            }
          };
          $http(request).then(function (res) {
            $rootScope.entity_relateds.push(res.data.entity);
          }, function (res) {
            console.log("Response error :  ", res);
          });
        }
        console.log("$rootScope.entity_relateds :  ", $rootScope.entity_relateds);
      }
    }, function (res) {
      console.log("Response error :  ", res);
    });
  };
  //
  // Take entity object from API  with entity details for output in UI
  //
  $scope.takeEntity = function (event, path) {
    var self = event.target
      , id = parseFloat($(self).data('id'))
      , url = path + id;
    $rootScope.CRUD_URL = url;
    $scope.takeJSONlistFromAPI(url, id);
  };
  //
  //
  // entity CRUD operation:
  //
  //
  $scope.create = function () {
    $rootScope.htmlForCreate = $sce.trustAsHtml($('.content div[ng-view]').html());
    $location.path('/create');
    $rootScope.sendReformedEntityObjectToAPI('create');
  };
  $scope.delet = function () {
    // set request options
    var req = {
      method: 'POST',
      url: 'http://localhost:' + port + '/delete',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        url: $rootScope.CRUD_URL,
        Authorization: 'Bearer ' + $scope.token
      }
    };
    // made request to node server
    $http(req).then(function (res) {
      console.log(res);
    }, function (res) {
      console.log("Response error :  ", res);
    });
  };
  //
  // Send reformed entity object to API for save/update/delete:
  //
  $rootScope.sendReformedEntityObjectToAPI = function (event, operation, base) {
    if (base) {
      var reformedObject = $rootScope.entity;
    } else {
      var self = event.target
        , reformedObjectName = $(self).data('objectname')
        , reformedObject;
      for (var i = 0; i < $rootScope.entity_relateds.length; i++) {
        if ($rootScope.entity_relateds[i].propertyName == reformedObjectName) {
          reformedObject = $rootScope.entity_relateds[i].propertyData;
        }
      }
    }
    console.log('reformedObject :  ', reformedObject);
    // set request options
    var req = {
      method: 'POST',
      url: 'http://localhost:' + port + '/crud',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        crudOperation: operation,
        reformedEntity: reformedObject,
        path: $rootScope.CRUD_URL,
        Authorization: 'Bearer ' + $scope.token
      }
    };
    // made request to node server
    $http(req).then(function (res) {
      console.log(res);
    }, function (res) {
      console.log("Response error :  ", res);
    });
  };
  //
  //
  // Objects schemes for send to API after CRUD operations:
  //
  //   
}
// return not repeat values
function unique(arr) {
  var identity = {};
  for (var i = 0; i < arr.length; i++) {
    identity[arr[i]] = true;
  }
  return Object.keys(identity);
}