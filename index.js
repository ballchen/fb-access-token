var request = require('request')
var cheerio = require('cheerio')
var j = request.jar();
request = request.defaults({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0',
    'Cookie': '_js_reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F;',
    'referer': 'https://www.messenger.com/'
  },
  jar: j
})

var access_token = function (username, password, appId) {
  this.username = username
  this.password = password
  this.appId = appId
}

access_token.prototype.login = function (callback) {

  var that = this;
  // login to facebook
   
  request.get('https://www.facebook.com/login.php', function(err, httpResponse, body){
    $ = cheerio.load(body);
    var login_form = new Object();
    $('form#login_form input').each(function(i, elem) {
      login_form[$(this).attr('name')] = $(this).attr('value')
    })

    login_form.pass = that.password
    login_form.email = that.username
    
    request({
      method: 'POST',
      url: 'https://www.facebook.com/login.php',
      form: login_form
    }, function (err, res, body) {
      if (err) {
        return callback(err)
      }

      callback(null)
    })
  })
  
}

access_token.prototype.getToken = function (callback) {
  // use graph api explorer to get access token
  console.log('https://developers.facebook.com/tools/explorer/' + this.appId + '/permissions?version=v2.1&__a=1&__dyn=5U463-i3S2e4oK4pomXWo5O12wAxu&__req=2&__rev=1470714');
  request.get({
    url: 'https://developers.facebook.com/tools/explorer/' + this.appId + '/permissions?version=v2.1&__a=1&__dyn=5U463-i3S2e4oK4pomXWo5O12wAxu&__req=2&__rev=1470714'
  }, function (err, res, body) {
    if (err) {
      return callback(err)
    }

    if (res.statusCode !== 200) {
      return callback(new Error('Status code is ' + res.statusCode + ', ' + body))
    }

    try {
      // console.log(body);
      body = JSON.parse(body.replace('for (;;);', ''))
    } catch (e) {
      return callback(new Error('JSON parse error:' + e))
    }

    // get token in complicated structure
    var token
    try {
      token = body.jsmods.instances[2][2][2]
    } catch (e) {
      return callback(new Error('No access token'))
    }

    // return access token
    callback(null, token)
  })
}

access_token.prototype.loginGetToken = function (callback) {
  var that = this
  that.login(function (err) {
    if (err) {
      return callback(err)
    }

    that.getToken(function (err, token) {
      if (err) {
        return callback(err)
      }

      callback(null, token)
    })
  })
}

module.exports = access_token
