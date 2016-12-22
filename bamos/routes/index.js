//
// init node application controllers file
//
var express = require('express')
  , request = require('request')
  , router = express.Router()
  , baseUrl = 'http://bamos-api.gdsln.com:33089/';
//
/* POST /oauth/token. */
//
router.post('/oauth/token', function (req, res, next) {
  //check 'bs64{login : password}'
  if (!req.body['Authorization']) {
    res.status(400).json({
      success: false,
      message: 'Wrong input data!'
    });
  }

  var path = req.body.path
    , _url = baseUrl + path
    , ContentType = req.body.ContentType
    , Authorization = req.body.Authorization
    , sendata = req.body.send;

  // POST request to bamos API
  request({
    url: _url,
    method: 'POST',
    timeout: 10000,
    headers: {
      "Content-Type": ContentType,
      "Authorization": Authorization
    },
    body: sendata
  }, function (error, response, body) {
    //response	
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!error && response.statusCode === 200) {
      var json_res = JSON.parse(body);
      var token = json_res.access_token;
      res.json({
        ok: 1,
        message: 'Early to rejoice - we do not know whether you are an administrator or not...',
        token: token
      });
    } else {
      res.status(400).json({
        ok: 0,
        message: 'Wrong input data'
      });
    }
  });
});
//
/* GET /admin */
//
router.post('/adm/or/no', function (req, res, next) {
  var Authorization = req.body.Authorization;
  // GET request to bamos API (/admin) to verify the administrator or no
  request({
    url: baseUrl + 'admin',
    method: 'GET',
    timeout: 10000,
    headers: {
      "Authorization": Authorization
    }
  }, function (error, response, body) {
    //response	
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!error && response.statusCode === 200) {
      res.json({
        ok: 1,
        message: 'You relly admin - welcome & enjoy your token. ;)',
        tokenFlag: true
      });
    } else {
      res.status(400).json({
        ok: 0,
        message: 'You not admin - go away!  ):',
        tokenFlag: false
      });
    }
  });
});
//
// POST /admin/* 
//
router.post('/admin/*', function (req, res, next) {
  //chech  
  if (!req.body['Authorization']) {
    res.status(400).json({
      success: false,
      message: 'You not autorisation!'
    });
  }

  var path = req.body.path
    , _url = req.body.related ? req.body.path : baseUrl + 'admin/' + path
    , Authorization = req.body.Authorization;

  // GET request to bamos API
  request({
    url: _url,
    method: 'GET',
    timeout: 10000,
    headers: {
      "Authorization": Authorization
    }
  }, function (error, response, body) {
    //response	
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!error && response.statusCode === 200) {
      if (req.body.related) {
        var propertyIndex = _url.lastIndexOf('/') + 1
          , propertyName = _url.slice(propertyIndex)
          , entity = {
            propertyName: propertyName,
            propertyData: JSON.parse(body)
          };
      } else {
        var entity = JSON.parse(body);
      }
      res.json({
        ok: 1,
        message: 'Keep your entitys!',
        entity: entity
      });
    } else {
      res.status(400).json({
        ok: 0,
        message: 'Wrong response data'
      });
    }
  });
});
//
// POST crud
//
router.post('/crud', function (req, res, next) {
  //check
  if (!req.body['Authorization']) {
    res.status(400).json({
      success: false,
      message: 'You not autorisation!'
    });
  }

  console.log('request body :  ', req.body);

  var requestMethod
    , _url = baseUrl + 'admin/' + req.body.path
    , Authorization = req.body.Authorization
    , operation = req.body.crudOperation
    , reformedEntity = JSON.stringify(req.body.reformedEntity);

  if (operation === 'create') {
    requestMethod = 'POST';
  } else if (operation === 'update') {
    requestMethod = 'PATCH';
  }

  // CRUD request to bamos API
  request({
    url: _url,
    method: requestMethod,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      "Authorization": Authorization
    },
    body: reformedEntity
  }, function (error, response, body) {
    console.log('response :  ', response);
    //response	
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!error && response.statusCode === 200) {
      var crudRespon = JSON.parse(body);
      res.json({
        ok: 1,
        message: 'Congratulations! Your ' + operation + 'be success.',
        responseCRUD: crudRespon
      });
    } else {
      res.status(400).json({
        ok: 0,
        message: 'CRUD operation impossible'
      });
    }
  });
});
//
// POST delete
//
router.post('/delete', function (req, res, next) {
  //check
  if (!req.body['Authorization']) {
    res.status(400).json({
      success: false,
      message: 'You not autorisation!'
    });
  }

  var _url = baseUrl + 'admin/' + req.body.url
    , Authorization = req.body.Authorization;

  // DELETE request to bamos API
  request({
    url: _url,
    method: 'DELETE',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      "Authorization": Authorization
    }
  }, function (error, response, body) {
    console.log('response :  ', body);
    //response	
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!error && response.statusCode === 200) {
      var crudRespon = JSON.parse(body);
      res.json({
        ok: 1,
        message: 'Congratulations! Your "DELETE" be success.',
        responseCRUD: crudRespon
      });
    } else {
      res.status(400).json({
        ok: 0,
        message: 'DELETE operation impossible'
      });
    }
  });
});
//
// logout 
// 
router.get('/logout', function (req, res, next) {
  console.log("logout");
  // logout GET request to bamos API
  request({
    url: baseUrl + 'user/logout',
    method: 'GET',
    timeout: 10000,
    headers: {
      "Authorization": 'Bearer ' + 'from req.body'
    },
  }, function (error, response, body) {
    //response	
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!error && response.statusCode === 200) {
      var json_res = JSON.parse(body);
      var logout = json_res;
      res.json({
        ok: 1,
        message: 'GoodBye...',
        logout: logout
      });
    } else {
      res.status(400).json({
        ok: 0,
        message: 'Server error!'
      });
    }
  });
});


// export module to node server
module.exports = router;