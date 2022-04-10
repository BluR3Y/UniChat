const functions = require("firebase-functions");
const express = require('express');
const app = express();
const path = require('path');       //to access files, used in getUserImg() - npm install --save path 
const glob = require('glob');       //to search for files, used in getUserImg() - npm i glob
const http = require('http');
const fs = require('fs');
const server = http.createServer(app);
const { Server } = require("socket.io");    //socket.io servers clients automatically for us - npm install socket.io
const io = new Server(server);
const mysql = require('mysql');     //to access mysql database - npm i mysql
const bcrypt = require('bcrypt');   //to hash passwords and security answers - npm i bcrypt
const saltRounds = 10;              //used when hashing values
const multer = require('multer');   //used for uploading files to server - npm i multer
const { json } = require('body-parser');
const nodemailer = require('nodemailer'); //will allow me to send emails - npm i nodemailer
const { promisify } = require('util');    //
const readFile = promisify(fs.readFile);  //used to readfiles 
const Handlebars = require('handlebars'); //used to change values of a read file - npm install handlebars
const { sync } = require('glob');
const { connect } = require("http2");
const template = Handlebars.compile('link: {{link}}');
const PORT = process.env.PORT || 3000;

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Flores@7659",
  database: "unichat"
});
var transport = nodemailer.createTransport({
service: 'gmail',
auth: {
  user: 'blureyapps@gmail.com',
  pass: 'BassDropp@1423'
}
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.engine('html', require('ejs').renderFile);  //Important for page Renders
app.set('view engine', 'pug');    //For rendering templates - npm install pug
app.set('views', './views');
app.use(express.static("static"))
app.use(express.json());

// app.get('/', function(req, res) {
//   res.render('temp', {title: 'Hey', message: 'Hello World!'});
// });
app.get('/', function(req, res) {
  res.render('index.html');
})
app.get('/login', function(req, res) {
  res.render('login.html');
});
app.get('/signup', function(req, res) {
  res.render('signup.html');
});
app.get('/userCreated', function(req, res) {
  res.render('userCreated.html');
})
app.get('/feed', function(req, res) {
  res.render('home.html');
});
app.get('/settings', function(req, res) {
  res.render('settings.html');
});

// app.get('/userCreated', function(req, res) {   -- How to render a pug template
//   user_email = req.query.email;
//   activationCode = req.query.activationCode;
//   res.render('userCreated', {email: user_email, activationCode: activationCode});
// })


function sendVerifyEmail(user_id, user_email){

  verifyEmailFile(user_id,user_email, (data)=>{
    var htmlSend = data;

    var mailOptions = {
      from: 'blureyapps@gmail.com',
      to: user_email,
      subject: 'Verify Email address',
      html: htmlSend
    };
      transport.sendMail(mailOptions, function(err, info){
      if(err) throw err;
      console.log('Email sent: ' + info.response);
    });
  });

}

function verifyEmailFile(user_id,user_email, callback){
  hashInput(String(user_id), (hashedID)=>{
    var activationLink = `http://localhost/activate?email=`+user_email+'&activationCode='+hashedID;
    readFile(__dirname + '/static/mailing/sentMail.html','utf8', function(err,result){
      if (err) throw err;
      var template = Handlebars.compile(result);
      var context = {link: activationLink};
      var html = template(context);
      callback(html);
    });
  });
}


var profileStorage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, 'src/uploads/userProfiles');
  },
  filename: function(req, file, callback){
    var fileName = "user-"+req.body.user_id;
    var imgType = file.mimetype;
    if(imgType === "image/gif"){
      callback(null, fileName+".gif");
    }else if(imgType === "image/jpeg"){
      callback(null, fileName+".jpeg");
    }else if(imgType === "image/jpg"){
      callback(null, fileName+".jpg");
    }else if(imgType === "image/png"){
      callback(null, fileName+".png");
    }
  }
})
var profileFilter = function(req, file, callback){
  var fileSize = req.body.uploadSize;
  var user_id = req.body.user_id;
  var validSize = 500000;
  if(fileSize <= validSize){
    if(getUserImg(user_id) !== "defaults/defaultProfileImg.jpg"){
      var imgPath = __dirname + '/src/uploads/userProfiles/' +getUserImg(user_id);
      fs.unlink(imgPath, function(err){
        if(err) throw err;
        callback(null, true);
      });
    }else{
      callback(null, true);
    }
  }else{
    callback(null, false);
  }
}
var profileUpload = multer({storage: profileStorage, fileFilter: profileFilter}).single('fileToUpload');
var postData = multer();

app.post('/loginUser', function(req,res){
  var userData = req.body.userForm;
  var user_email = userData['email'];
  var user_password = userData['password'];

  connection.connect(()=>{
    if(connection.state !== "disconnected"){
      getUserId(user_email, function(id){
        if(id !== null){
          getUserInfo(id, function(info){
            var userInfo = info;
            if(userInfo[5] < 3){
              validateHash(user_password,userInfo[4], function(validate){
                if(validate){
                  connection.query(`UPDATE users SET login_attempts = 0 WHERE user_email='${user_email}';`, function(err){
                    if(err) throw err;
                  })
                  var userImg = getUserImg(userInfo[0]);
                  res.json({status: "success", user_id: userInfo[0], user_name: userInfo[1], user_email: userInfo[3], user_tag: userInfo[2], user_img: userImg});
                }else{
                  connection.query(`UPDATE users SET login_attempts = login_attempts + 1 WHERE user_email='${user_email}';`, function(err){
                    if(err) throw err;
                  });
                  res.json({status: "failed", reason: "invalidPword"});
                }
              })
            }else{
              res.json({status: "failed", reason: "maxAttempts"});
            }
          })
        }else{
          res.json({status: "failed", reason: "userDNE"});
        }
      })
    }else{
      res.json({status: "failed", reason: "dbConnection"});
    }
  })
});

app.post('/signupUser', function(req,res){
  var userData = req.body.userForm;
  var user_name = userData['username'];
  var user_email = userData['email'];
  var user_password = userData['password'];

  connection.connect(()=>{
    if(connection.state !== "disconnected"){
      availableUsername(user_name, (username_validation)=>{
        if(username_validation){
          availableEmail(user_email, (email_validation)=>{
            if(email_validation){
              generateTag(user_name, (tag)=>{
                var user_tag = tag;
                hashInput(user_password, (hash_pword)=>{
                  var hashedPword = hash_pword;
                  createUser(user_name,user_tag,user_email,hashedPword, (user_id)=>{
                    if(user_id){
                      sendVerifyEmail(user_id[0],user_email);
                      hashInput(user_email, (resendLink) => {
                        res.json({status: "success",resendEmail: user_email, resendLink: resendLink});
                      })
                    }else{
                      res.json({status: "failed", reason: "creatingUser"});
                    }
                  });
                })
              })
            }else{
              res.json({status: "failed", reason: "takenEmail"});
            }
          });
        }else{
          res.json({status: "failed", reason: "takenUsername"});
        }
      });
    }else{
      res.json({status: "failed", reason: "dbConnection"});
    }
  })
});

app.post('/resendActivation', function(req, res) {
  var userData = req.body.resendForm;
  var resendEmail = userData['resendEmail'];
  var resendLink = userData['resendLink'];

  validateHash(resendEmail, resendLink, function(validate) {
    if(validate) {
      connection.query(`SELECT user_id FROM users WHERE user_email='${resendEmail}'`, function(err, result) {
        if(err) throw err;
        var user_id = Object.values(result[0])[0];
        sendVerifyEmail(user_id, resendEmail);
        res.json({status: 'success'});
      }) 
    }else{
      res.json({status: 'failed', reason: 'invalidResend'});
    }
  })
})

app.post('/createUserGroup', function(req,res){
  var userData = req.body.userForm;
  var user_id = userData['user_id'];
  var group_name = userData['group_name'];

  connection.query(`INSERT INTO user_groups (group_creator, group_name) VALUES(${user_id}, '${group_name}');`, function(err){
    if(err){
      res.json({status: "failed", reason: err});
    }else{
      connection.query("SELECT LAST_INSERT_ID();", function(err, result){
        if(err){
          res.json({status: "failed", reason: err});
        }else{
         let groupId = Object.values(result[0])[0];
         res.json({status: "success", group_id: groupId});
        }
      });
    }
  })
});


// SELECT LAST_INSERT_ID(); -- This will get you back the PRIMARY KEY value of the last row that you inserted:
  
function getUserImg(user_id){
  var file = glob.sync(__dirname+`/src/uploads/userProfiles/user-${user_id}.*`);
  if(file.length > 0){
    return `userProfiles/${path.basename(file[0])}`;
  }else{
    return 'defaults/defaultProfileImg.jpg';
  }
}

function getGroupImg(group_id){
  var file = glob.sync(__dirname+`/src/uploads/groupProfiles/group-${group_id}.*`);
  if(file.length > 0){
    return `groupProfiles/${path.basename(file[0])}`;
  }else{
    return 'defaults/defaultGroupImg.png';
  }
}

function getNumGroupMembers(group_id,callback){
  connection.query(`SELECT COUNT(member_id) AS Amount FROM group_members WHERE group_id = ${group_id};`, function(err,result){
    if (err) throw err;
    callback(Object.values(result[0]));
  })
}

function getUserId(user_email, callback){
  connection.query(`SELECT user_id FROM users WHERE user_email='${user_email}';`, function(err,result){
    if(err) throw err;
    if(result.length > 0){
      var user_id = Object.values(result[0]);
      callback(user_id);
    }else{
      callback(null);
    }
  });
}

function getUserInfo(user_id, callback){
  connection.query(`SELECT * FROM users WHERE user_id='${user_id}';`, function(err, result){
  if(err) throw err;
    if(result.length > 0){
      var userInfo = Object.values(result[0]);
      callback(userInfo);
    }else{
      callback(null);
    }
  });
}

function availableUsername(user_name, callback){
  connection.query(`SELECT COUNT(user_name) as amount FROM users WHERE user_name='${user_name}';`, function(err, result){
    if(err) throw err;
    var amount = Object.values(result[0])[0];
    if(amount < 3500){
      callback(true);
    }else{
      callback(false);
    }
  });
}
  
function availableEmail(email,callback){
  connection.query(`SELECT COUNT(user_name) as amount FROM users WHERE user_email='${email}';`, function(err, result){
    if(err) throw err;
    var amount = Object.values(result[0])[0];
    if(amount < 1){
      callback(true);
    }else{
      callback(false);
    }
  });
}

function generateTag(username, callback){
    var testTag = Math.floor(Math.random()*(9999-1000) + 1000);
    validUsernameTagCombo(username,testTag, function(validation){
      if(validation){
        callback(testTag);
      }else{
        generateTag(username, function(data){
          callback(data);
        })
      }
    })
}

function validUsernameTagCombo(username,tag, callback){
  connection.query(`SELECT COUNT(user_name) as amount FROM users WHERE user_name='${username}' AND user_tag=${tag};`, function(err,result){
    if(err) throw err;
    var amount = Object.values(result[0])[0];
    if(amount>0){
      callback(false);
    }else{
      callback(true);
    }
  });
}
  
function hashInput(input, callback){
  bcrypt.genSalt(saltRounds, function(err, salt){
    bcrypt.hash(input, salt, function(err, hash){
      callback(hash);
    });
  });
}
  
function validateHash(input,hash, callback){
  bcrypt.compare(input,hash, function(err,result){
    callback(result);
  });
}
  
function createUser(user_name,user_tag,user_email,user_password, callback){
  connection.query(`INSERT INTO users (user_name,user_tag,user_password,user_email)VALUES('${user_name}',${user_tag},'${user_password}','${user_email}');`, function(err){
    if(err) throw err;
  });
  connection.query(`SELECT user_id FROM users as userInfo WHERE user_email='${user_email}' AND user_password='${user_password}';`, function(err,result){
    if (err) throw err;
    var user_id = Object.values(result[0]);
    callback(user_id);
  });
}

function getGroupInfo(group_id){
  return new Promise((resolve,reject)=>{
    setTimeout(() => {
      (async function(){
        var Info = await new Promise((resolve,reject) => connection.query(`SELECT * FROM user_groups WHERE group_id = ${group_id};`, (err, result) =>{
          if(err) reject(err);
          resolve(Object.values(result[0]));
        }));
        var Img = getGroupImg(group_id);
        Info.push(Img);
        return Info;
      })().then(Info =>{
        resolve(Info);
      }); 
    });
    setTimeout(() => {
      reject("Request has been rejected");
    }, 2000);
  })
}

function getUserCreatedGroups(user_id){
  return new Promise(resolve=>{
    connection.query(`SELECT group_id FROM user_groups WHERE group_creator = ${user_id};`, function(err,userGroups){
      if(err) throw err;
      var groupIDs = [];
      for(var i=0; i < userGroups.length; i++){
        groupIDs.push(Object.values(userGroups[i])[0]);
      }
      resolve(groupIDs);
    });
  })
}

function getUserFavoriteGroups(user_id){
  return new Promise(resolve=>{
    connection.query(`SELECT group_id FROM group_members WHERE user_id = ${user_id} AND favorite_group = 1;`, function(err,userGroups){
      if(err) throw err;
      var groupIDs = [];
      for(var i=0; i < userGroups.length; i++){
        groupIDs.push(Object.values(userGroups[i])[0]);
      }
      resolve(groupIDs);
    })
  })
}

function getUserMemberGroups(user_id){
  return new Promise(resolve=>{
    connection.query(`SELECT group_id FROM group_members WHERE user_id=${user_id};`, function(err, userGroups){
      if(err) throw err;
      var groupIDs = [];
      for(var i=0; i < userGroups.length; i++){
        groupIDs.push(Object.values(userGroups[i])[0]);
      }
      resolve(groupIDs);
    })
  })
}

function getAllUserGroups(user_id){
  return new Promise((resolve,reject)=>{
    setTimeout(() => {
      var groupIDs = [];
      getUserCreatedGroups(user_id).then(userCreated =>{
        userCreated.forEach(created =>{
          if(!groupIDs.includes(created)){
            groupIDs.push(created);
          }
        });
        getUserMemberGroups(user_id).then(userMember =>{
          userMember.forEach(member=>{
            if(!groupIDs.includes(member)){
              groupIDs.push(member);
            }
          });
          getUserFavoriteGroups(user_id).then(userFavorite =>{
            userFavorite.forEach(favorite =>{
              if(!groupIDs.includes(favorite)){
                groupIDs.push(favorite);
              }
            });
            resolve(groupIDs);
          })
        })
      })
    });
    setTimeout(() => {
      reject("request has been rejected!");
    }, 3000);
  })
}

function getAllUserFriends(user_id){
  return new Promise(resolve => {
    connection.query(`SELECT acceptee_id, date_friended FROM user_friends WHERE user_id = ${user_id};`, function(err, userFriends){
      if(err) throw err;
      var friendIDs = [];
      userFriends.forEach(friend =>{
        friendIDs.push(Object.values(friend));
      })
      resolve(friendIDs);
    })
  });
}

function getFriendInfo(user_id){
  return new Promise((resolve,reject) =>{
    setTimeout(() => {
      (async  function(){
        var Info = await new Promise((resolve,reject) => connection.query(`SELECT user_name, user_tag FROM users WHERE user_id = ${user_id};`, (err, result) =>{
          if(err) reject(err);
          resolve(Object.values(result[0]));
        }));
        var Img = getUserImg(user_id);
        Info.push(Img);
        return Info;
      })().then(Info => {
        resolve(Info);
      });
    });
    setTimeout(() => {
      reject('Request has been rejected');
    }, 2000);
  });
}

io.on('connection', (socket) => {
  // socket.on('loginUser', (user_info) => {
  //   verifyLogin(Object.values(user_info));
  // });
  // socket.on('signupUser', (signupInfo) =>{
  //   signupUser(Object.values(signupInfo));
  // });
  // socket.on('group message', (message_data) => {
  //   message_data.messengerImg = getUserImg(message_data.user_id);
  //   io.emit('group message', message_data);
  // });

  // socket.join('testRoom');
  // socket.on("testingRooms", (msg)=>{
  //   console.log("msg recieved: "+msg);
  //   io.to('testRoom').emit('newMsg',msg);
  // });

  socket.on("joinGroup", function(group){
    socket.join(group);
  });

  socket.on('groupMsg',(group, msg)=>{
    io.to(group).emit('groupMsg',msg);
  });

  socket.on("leaveGroup", function(group){
    socket.leave(group);
  });

});

app.get('/activate', function(req, res) {
  var user_email = req.query.email;
  var activationCode = req.query.activationCode;

  connection.connect(() => {
    if(connection.state !== "disconnected") {
      if(user_email !== undefined && activationCode !== undefined) {
        getUserId(user_email, (id_result) => {
          if(id_result) {
            var user_id = id_result[0];
            getUserInfo(user_id, (userInfo) => {
              var activationStatus = userInfo[5];
              if(activationStatus === 0) {
                validateHash(String(user_id), activationCode, (validation) => {
                  if(validation) {
                    connection.query(`UPDATE users SET user_active = 1 WHERE user_id = ${user_id};`, function(err) {
                      if(err) throw err;
                      res.render('templates/userActivation', {status: 'success'});
                    })
                  }else{
                    res.render('templates/userActivation', {status: 'failed', reason: "The activation code is invalid"});
                  }
                })
              }else{
                res.render('templates/userActivation', {status: 'failed', reason: "Your account has already been activated."});
              }
            })
          }else{
            res.render('templates/userActivation', {status: 'failed', reason: "Provided Email is not associated with any user"});
          }
        })
      }else{
        res.render('templates/userActivation', {status: 'failed', reason: "Missing Fields In Activation Link"});
      }
    }else{
      res.render('templates/userActivation', {status: 'failed', reason: "Failed to connect to Database. Please try again later."});
    }
  })
});

// app.get('/activate', function(req,res){
//   var user_email = req.query.email;
//   var activationCode = req.query.activationCode;
//   connection.connect(()=>{
//     if(connection.state !== "disconnected"){
//       if(typeof(user_email) !== "undefined" && typeof(activationCode) !== "undefined"){
//         getUserId(user_email, (userID)=>{
//           var user_id = userID;
//           getUserInfo(user_id, (userInfo)=>{
//             var accountStatus = userInfo[6];
//             if(accountStatus === 0){
//               validateHash(String(user_id),String(activationCode),(validation)=>{
//                 if(validation){
//                   connection.query(`UPDATE users SET user_active = 1 WHERE user_id=${user_id};`, function(err){
//                     if(err) throw err;
//                     res.redirect('/SignUpPage/userActivation.html?status=1');
//                   });
//                 }else{
//                   res.redirect('/SignUpPage/userActivation.html?status=2');
//                 }
//               });
//             }else{
//               res.redirect('/SignUpPage/userActivation.html?status=3');
//             }
//           });
//         })
//       }else{
//         res.redirect('/SignUpPage/userActivation.html?status=4');
//       }
//     }else{
//       res.redirect('/SignUpPage/userActivation.html?status=5')
//     }
//   })
// });

app.post('/getUserGroups', postData.none(), function(req,res){
  var user_id = req.body.user_id;
  var filter = parseInt(req.body.filter);

  if(filter === 0){
    getAllUserGroups(user_id).then(allGroups =>{
      if(allGroups.length != 0){
        (async function(){
          var groupsInfo = [];
          for(var i=0; i < allGroups.length; i++){
            var groupInfo = await getGroupInfo(allGroups[i]);
            groupsInfo.push(groupInfo);
          }
          return groupsInfo;
        })().then(Info =>{
          res.json({groups:Info});
        })
      }else{
        res.json({groups:null});
      }
    })
  }else if(filter === 1){
    getUserFavoriteGroups(user_id).then(favoriteGroups =>{
      if(favoriteGroups.length != 0){
        (async function(){
          var groupsInfo = [];
          for(var i=0; i < favoriteGroups.length; i++){
            var groupInfo = await getGroupInfo(favoriteGroups[i]);
            groupsInfo.push(groupInfo);
          }
          return groupsInfo;
        })().then(Info =>{
          res.json({groups:Info});
        })
      }else{
        res.json({groups:null});
      }
    })
  }else if(filter === 2){
    getUserCreatedGroups(user_id).then(createdGroups =>{
      if(createdGroups.length != 0){
        (async function(){
          var groupsInfo = [];
          for(var i=0; i < createdGroups.length; i++){
            var groupInfo = await getGroupInfo(createdGroups[i]);
            groupsInfo.push(groupInfo);
          }
          return groupsInfo;
        })().then(Info =>{
          res.json({groups:Info});
        })
      }else{
        res.json({groups:Info});
      }
    })
  }
});

app.post('/getUserFriends', postData.none(), function(req,res){
  var user_id = req.body.user_id;
  var filter = req.body.filter;

  if(filter == 0){
    getAllUserFriends(user_id).then(allFriends =>{
      if(allFriends.length != 0){
        (async function(){
          var friendsInfo = [];
          for(var i=0; i < allFriends.length; i++){
            var friendInfo = [allFriends[i][0]];
            var Info = await getFriendInfo(allFriends[i][0]);
            Info.forEach(info =>{friendInfo.push(info)});
            friendInfo.push(allFriends[i][1]);
            friendsInfo.push(friendInfo);
          }
          return friendsInfo;
        })().then(Info => {
          res.json({friends:Info});
        })
      }else{
        res.json({friends:null});
      }
    })
  }else if(filter == 1){

  }else if(filter == 2){

  }

});

app.post('/uploadProfileImg', function(req,res){
  profileUpload(req,res,function(err){
    if(err) {
      var errorCode = err.code;
      if(errorCode === "LIMIT_FILE_SIZE"){
        res.json({status: "failed", reason: "largeFile"});
      }else{
        res.json({status: "failed", reason: "unknown"});
      }
    }else{
      var newImgSrc = getUserImg(req.body.user_id);
      res.json({status: "success", userImg: newImgSrc});
    }
  })
})

app.post('/updateUsername', postData.none(), function(req, res){
  var user_id = req.body.user_id;
  var givenPword = req.body.verifyPword;
  var newUsername = req.body.newUsername;
  getUserInfo(user_id, function(data){
    var userInfo = data;
    validateHash(givenPword,userInfo[4], function(validate){
      if(validate){
        availableUsername(newUsername, (available)=>{
          if(available){
            validUsernameTagCombo(newUsername,userInfo[2], function(validation){
              if(validation){
                connection.query(`UPDATE users SET user_name = '${newUsername}' WHERE user_id = ${userInfo[0]};`, function(err){
                  if(err) throw err;
                  res.json({status: "success"});
                });
              }else{
                res.json({status: "failed", reason: "invalidNameTagCombo"});
              }
            })
          }else{
            res.json({status: "failed", reason: "takenUsername"});
          }
        })
      }else{
        res.json({status: "failed", reason: "invalidPword"});
      }
    })
  })
})

app.post('/updatePassword', postData.none(), function(req,res){
  var user_id = req.body.user_id;
  var newPword = req.body.newPword;
  var verifyPword = req.body.verifyPword;
  getUserInfo(user_id, (userInfo)=>{
    validateHash(verifyPword,userInfo[4], (validate)=>{
      if(validate){
        hashInput(newPword, (hashedPword)=>{
          connection.query(`UPDATE users SET user_password = '${hashedPword}' WHERE user_id = ${user_id};`, function(err){
            if(err) throw err;
            res.json({status: "success"});
          })
        })
      }else{
        res.json({status: "failed", reason: "invalidPword"});
      }
    })
  })
})

app.post('/updateEmail', postData.none(), function(req,res){
  var user_id = req.body.user_id;
  var newEmail = req.body.newEmail;
  var verifyPword = req.body.verifyPword;
  getUserInfo(user_id, (userInfo)=>{
    validateHash(verifyPword,userInfo[4], (validate)=>{
      if(validate){
        availableEmail(newEmail, (available)=>{
          if(available){
            connection.query(`UPDATE users SET user_email = '${newEmail}' WHERE user_id = ${user_id};`, function(err){
              if(err) throw err;
              res.json({status: "success"});
            })
          }else{
            res.json({status: "failed", reason: "takenEmail"});
          }
        })
      }else{
        res.json({status: "failed", reason: "invalidPword"});
      }
    })
  })
})

app.post('/updateTag', postData.none(), function(req,res){
  var user_id = req.body.user_id;
  var newTag = req.body.newTag;
  var verifyPword = req.body.verifyPword;
  getUserInfo(user_id, (userInfo)=>{
    validateHash(verifyPword,userInfo[4], (validate)=>{
      if(validate){
        validUsernameTagCombo(userInfo[1],newTag, (validCombo)=>{
          if(validCombo){
            connection.query(`UPDATE users SET user_tag = ${newTag} WHERE user_id = ${user_id};`, function(err){
              if(err) throw err;
              res.json({status: "success"});
            })
          }else{
            res.json({status: "failed", reason: "invalidNameTagCombo"});
          }
        })
      }else{
        res.json({status: "failed", reason: "invalidPword"});
      }
    })
  })
})

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});