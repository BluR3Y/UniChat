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
const { resolve } = require('path');
const { all } = require('express/lib/application');
const res = require('express/lib/response');
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
app.get('/tester', function(req, res){
  res.render('tester.html');
});

// app.get('/userCreated', function(req, res) {   -- How to render a pug template
//   user_email = req.query.email;
//   activationCode = req.query.activationCode;
//   res.render('userCreated', {email: user_email, activationCode: activationCode});
// })


function sendVerifyEmail(user_id, user_email) {
    return new Promise((resolve, reject) => {
        verifyEmailFile(user_id, user_email)
        .then(data => {
            var htmlSend = data;
    
            var mailOptions = {
                from : 'blureyapps@gmail.com',
                to : user_email,
                subject : 'Verify Email Address',
                html : htmlSend
            };
            transport.sendMail(mailOptions, function(err, info) {
                if(err) {
                    reject(err);
                    return;
                }
                console.log('Email sent: ' + info.response);
                resolve();
            })
        })
    })
}

function verifyEmailFile(user_id, user_email) {
    return new Promise((resolve, reject) => {
        hashInput(String(user_id))
        .then(hashedID => {
            var activationLink = `http://localhost/activate?email=${user_email}&activationCode=${hashedID}`;
            readFile(__dirname + '/static/mailing/sentMail.html','utf8', function(err, result) {
                if(err) {
                    reject(err);
                    return;
                }
                var template = Handlebars.compile(result);
                var context = {link : activationLink};
                var html = template(context);
                resolve(html);
            })
        })
    })
}


var profileStorage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, 'static/content/uploads/userProfiles');
    // callback(null, 'src/uploads/userProfiles');
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
    if(getUserImg(user_id) !== "defaultProfileImg.jpg"){
      var imgPath = __dirname + '/static/content/uploads/userProfiles/' +getUserImg(user_id);
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

// --------------------- Essential Functions -----------------------------------
// SELECT LAST_INSERT_ID(); -- This will get you back the PRIMARY KEY value of the last row that you inserted:


function getUserProfileImg(user_id) {
    var file = glob.sync(__dirname+`/static/content/uploads/userProfiles/user-${user_id}.*`);
    if(file.length) {
        return path.basename(file[0]);
    }else{
        return 'defaultProfileImg.jpg';
    }
}

function getGroupProfileImg(group_id) {
    var file = glob.sync(__dirname+`/static/content/uploadsgroupProfiles/group-${group_id}.*`);
    if(file.length) {
        return `groupProfiles/${path.basename(file[0])}`;
    }else{
      return 'defaultGroupImg.png';
    }
}

function getUserID(user_email){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT user_id FROM users WHERE user_email = '${user_email}';`, function(err, result) {
            if(err) {
                reject(err);
                console.log("marker");
                return;
            }
            if(result.length) {
                resolve(Object.values(result[0])[0]);
            }else{
                resolve(null);
            }
        })
    })
}

function verifyPassword(user_id, pword_attempt) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT user_password, login_attempts FROM users WHERE user_id = ${user_id}`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var userCredentials = Object.values(result[0]);
            if(userCredentials[1] < 3) {
                validateHash(pword_attempt,userCredentials[0])
                .then(validation => {
                    if(validation) {
                        connection.query(`UPDATE users SET login_attempts = 0 WHERE user_id = ${user_id};`, function(err) {
                            if(err) {
                                reject(err);
                                return;
                            }
                            resolve({status : "success"});
                        })
                    }else{
                        connection.query(`UPDATE users SET login_attempts = login_attempts + 1 WHERE user_id = ${user_id};`, function(err) {
                            if(err) {
                                reject(err);
                                return;
                            }
                            resolve({status : "failed", reason : "invalidPword"});
                        })
                    }
                })
            }else{
                resolve({status : "failed", reason : "maxAttempts"});
            }
        })
    })
}

function getUserInfo(user_id){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT user_name, user_tag FROM users WHERE user_id = ${user_id};`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            if(result.length) {
                resolve(Object.values(result[0]));
            }else{
                resolve(null);
            }
        })
    })
}

function availableUsername(user_name) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT COUNT(user_name) as amount FROM users WHERE user_name = '${user_name}';`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var amount = Object.values(result[0])[0];
            var limit = 100;
            resolve(amount < limit);
        })
    })
}

function availableEmail(user_email) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT COUNT(user_name) as amount FROM users WHERE user_email = '${user_email}';`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var amount = Object.values(result[0])[0];
            resolve(!amount);
        })
    })
}

function generateTag(username) {
    return new Promise((resolve, reject) => {
        (async function() {
            var generated_tag;
            do {
                generated_tag = Math.floor(Math.random() * (9999 - 1000) + 1000);
            }while(!(await validUsernameTagCombo(username, generated_tag)));
            return generated_tag;
        })().then(tag => {
            console.log(tag);
            resolve(tag);
        })
    })
}

function validUsernameTagCombo(username, tag){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT COUNT(user_name) as amount FROM users WHERE user_name='${username}' AND user_tag=${tag};`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            resolve(!Object.values(result[0])[0]);
        })
    })
}

function hashInput(input) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) {
                reject(err);
                return;
            }
            bcrypt.hash(input, salt, function(err, hash) {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(hash);
            })
        })
    })
}

function validateHash(input, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(input, hash, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            resolve(result);
        })
    })
}

function createUser(user_name, user_tag, user_email, user_password) {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO users (user_name,user_tag,user_password,user_email)VALUES('${user_name}',${user_tag},'${user_password}','${user_email}');`, function(err) {
            if(err) {
                reject(err);
                return;
            }
            connection.query(`SELECT LAST_INSERT_ID();`, function(err, result) {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(Object.values(result[0])[0]);
            })
        })
    })
}

// ---------------------- Group Related Functions -------------------------

function createGroup(user_id, group_name, group_desc) {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO unichat.groups (group_name, group_description) VALUES ('${group_name}', '${group_desc}');`, function(err) {
            if(err) {
                reject(err);
                return;
            }
            connection.query(`SELECT LAST_INSERT_ID();`, function(err, result) {
                if(err) {
                    reject(err);
                    return;
                }
                var groupID = Object.values(result[0])[0];
                connection.query(`INSERT INTO group_members (member_id, group_id) VALUES (${user_id}, ${groupID});`, function(err) {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve();
                })
            })
        })
    })
}

function getGroupInfo(group_id) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM unichat.groups WHERE group_id = ${group_id};`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var groupInfo = Object.values(result[0]);
            groupInfo.push(getGroupProfileImg(group_id));
            resolve(groupInfo);
        })
    })
}

function getUserCreatedGroups(user_id){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT group_id FROM group_members WHERE member_id = ${user_id} AND member_role = 1;`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var groups = [];
            for(var i = 0; i < result.length; i++){
                groups.push(Object.values(result[i])[0]);
            }
            resolve(groups);
        })
    })
}

function getUserFavoriteGroups(user_id) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT group_id FROM group_members WHERE member_id = ${user_id} AND favorite_group = 1;`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var groups = [];
            for(var i = 0; i < result.length; i++){
                groups.push(Object.values(result[i])[0]);
            }
            resolve(groups);
        })
    })
}

function getAllUserGroups(user_id){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT group_id FROM group_members WHERE member_id = ${user_id};`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var groups = [];
            for(var i = 0; i < result.length; i++){
                groups.push(Object.values(result[i])[0]);
            }
            resolve(groups);
        })
    })
}

function sendFriendInvitation(user_id, invitee_name, invitee_tag) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT user_id FROM users WHERE user_name = '${invitee_name}' AND user_tag = '${invitee_tag}';`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            if(result.length){
                var invitee_id = Object.values(result[0])[0];
                connection.query(`SELECT invitation_id FROM friend_invitations WHERE inviter_id = ${user_id} AND invitee_id = ${invitee_id};`, function(err, result) {
                    if(err) {
                        reject(err);
                        return;
                    }else if(!result.length){
                        connection.query(`SELECT connection_id FROM friends WHERE (inviter_id = ${user_id} AND invitee_id = ${invitee_id}) OR (inviter_id = ${invitee_id} AND invitee_id = ${user_id});`, function(err, result) {
                            if(err) {
                                reject(err);
                                return;
                            }else if(!result.length){
                                connection.query(`INSERT INTO friend_invitations (inviter_id, invitee_id) VALUES (${user_id},${invitee_id});`, function(err) {
                                    if(err) {
                                        reject(err);
                                        return;
                                    }
                                    connection.query("SELECT LAST_INSERT_ID()", function(err, result) {
                                        if(err) {
                                            reject(err);
                                            return;
                                        }
                                        resolve({status:'success',invitation_id:Object.values(result[0])});
                                    })
                                })
                            }else{
                                resolve({status:'failed',reason:'connectionExists'});
                            }
                        })
                    }else{
                        resolve({status:'failed',reason:'invitationExists'});
                    }
                    
                })
            }else{
                resolve({status:'failed', reason:'userDNE'});
            }
        })
    })
}

// ------------------------------- Friends Related Functions -------------------------------------

function getAllUserFriends(user_id) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT invitee_id, date_connected FROM friends WHERE inviter_id = ${user_id};`, function(err, invited) {
            if(err) {
                reject(err);
                return;
            }
            connection.query(`SELECT inviter_id, date_connected FROM friends WHERE invitee_id = ${user_id};`, function(err, accepted) {
                if(err) {
                    reject(err);
                    return;
                }
                var allFriends = [];
                invited.forEach(friend => {
                    allFriends.push(Object.values(friend));
                })
                accepted.forEach(friend => {
                    allFriends.push(Object.values(friend));
                })
                resolve(allFriends);
            })
        })
    })
}

function getAllUserFriendRequests(user_id){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT invitation_id, inviter_id FROM friend_invitations WHERE invitee_id = ${user_id};`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var invitations = [];
            result.forEach(invitation => {
                invitations.push(Object.values(invitation));
            })
            resolve(invitations);
        })
    })
}

function getFriendInfo(user_id) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT user_name, user_tag FROM users WHERE user_id = ${user_id};`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var friendInfo = Object.values(result[0]);
            friendInfo.push(getUserProfileImg(user_id));
            resolve(friendInfo);
        })
    })
}

// ------------------------------------------ Application POST/GET Requests ---------------------------------------------
app.post('/loginUser', function(req,res) {
    var userData = req.body.userForm;
    var user_email = userData['email'];
    var user_password = userData['password'];

    connection.connect(() => {
        if(connection.state != "disconnected") {
            getUserID(user_email)
            .then(user_id => {
                if(user_id){
                    verifyPassword(user_id, user_password)
                    .then(validation => {
                        if(validation['status'] === "success") {
                            getUserInfo(user_id)
                            .then(user_info => {
                                res.json({status : "success", user_id : user_id, user_name : user_info[0], user_tag : user_info[1], user_img : user_info[2]});
                            })
                        }else{
                            res.json(validation);
                        }
                    })
                }else{
                 res.json({status : "failed", reason : "userDNE"});   
                }
            })
        }else{
            res.json({status : "failed", reason : "dbConnection"});
        }
    })
})

app.post('/signupUser', function(req, res) {
    var userData = req.body.userForm;
    var user_name = userData['username'];
    var user_email = userData['email'];
    var user_password = userData['password'];

    connection.connect(() => {
        if(connection.state != "disconnected") {
            availableUsername(user_name)
            .then(username_validation => {
                if(username_validation) {
                    availableEmail(user_email)
                    .then(email_validation => {
                        if(email_validation) {
                            generateTag(user_name)
                            .then(user_tag => {
                                hashInput(user_password)
                                .then(hash_pword => {
                                    createUser(user_name, user_tag, user_email, hash_pword)
                                    .then(user_id => {
                                        if(user_id) {
                                            sendVerifyEmail(user_id[0], user_email);
                                            hashInput(user_email)
                                            .then(resendLink => {
                                                res.json({status : "success", resendEmail : user_email, resendLink : resendLink});
                                            })
                                        }else{
                                            res.json({status : "failed", reason : "creatingUser"});
                                        }
                                    })
                                })
                            })
                        }else{
                            res.json({status : "failed", reason : "takenEmail"});
                        }
                    })
                }else{
                    res.json({status : "failed", reason: "taken"})
                }
            })
        }else{
            res.json({status : "failed", reason: "dbConnection"});
        }
    })
})

app.post('/resendActivation', function(req, res) {
    var userData = req.body.resendForm;
    var resendEmail = userData['resendEmail'];
    var resendLink = userData['resendLink'];

    validateHash(resendEmail, resendLink)
    .then(validation => {
        if(validation) {
            connection.query(`SELECT user_id FROM users WHERE user_email = '${resendEmail}';`, function(err, result) {
                if(err) {throw err;}
                var user_id = Object.values(result[0])[0];
                sendVerifyEmail(user_id, resendEmail)
                .then(() => {
                    res.json({status : "success"});
                })
            })
        }else{
            res.json({status : "failed", reason : "invalidResend"});
        }
    })
})

app.get('/activate', function(req, res) {
    var user_email = req.query.email;
    var activationCode = req.query.activationCode;

    connection.connect(() => {
        if(connection.state != "disconnected") {
            if(user_email !== undefined && activationCode !== undefined) {
                getUserID(user_email)
                .then(user_id => {
                    if(user_id) {
                        connection.query(`SELECT user_active FROM users WHERE user_id = ${user_id};`, function(err, result) {
                            if(err) {throw err;}
                            else if(!Object.values(result[0])[0]){
                                validateHash(String(user_id), activationCode)
                                .then(validation => {
                                    if(validation) {
                                        connection.query(`UPDATE users SET user_active = 1 WHERE user_id = ${user_id};`, function(err) {
                                            if(err) {throw err;}
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
})

// -------------------------- Friends POST/GET Requests -------------------------------------

app.post('/sendFriendInvitation', function(req, res) {
    var userData = req.body.userForm;
    var user_id = userData['user_id'];
    var invitee_name = userData['invitee_name'];
    var invitee_tag = userData['invitee_tag'];

    connection.connect(() => {
        if(connection.state !== "disconnected") {
            sendFriendInvitation(user_id, invitee_name, invitee_tag)
            .then(invitationStatus => {
                res.json(invitationStatus);
            })
            .catch(() => {
                res.json({status : "failed", reason : "error"});
            })
        }else{
            res.json({status : "failed", reason : "dbConnection"});
        }
    })
})

app.post('/answerFriendRequest', function(req, res) {
    var userData = req.body.userForm;
    var user_id = userData['user_id'];
    var invitation_id = userData['invitation_id'];
    var user_response = userData['user_response'];

    connection.connect(() => {
        if(connection.state != "disconnected") {
            (function() {
                return new Promise((resolve, reject) => {
                    if(user_response) {
                        connection.query(`SELECT inviter_id FROM friend_invitations WHERE invitation_id = ${invitation_id};`, function(err, result) {
                            if(err) {
                                reject(err);
                                return;
                            }
                            var sender_id = Object.values(result[0])[0];
                            connection.query(`INSERT INTO friends (inviter_id, invitee_id) VALUES (${sender_id},${user_id})`, function(err) {
                                if(err) {
                                    reject(err);
                                    return;
                                }
                            })
                        })
                    }
                    connection.query(`DELETE FROM friend_invitations WHERE invitation_id = ${invitation_id};`, function(err) {
                        if(err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    })
                })
            })()
            .then(() => {
                res.json({status : "success"});
            })
            .catch(() => {
                res.json({status : "failed", reason : "error"});
            })
        }else{
            res.json({status : "failed", reason : "dbConnection"});
        }
    })
})

app.post('/getUserFriends', function(req, res) {
    var userData = req.body.userForm;
    var user_id = userData['user_id'];
    var filter_type = userData['filter_type'];

    if(filter_type === "all") {
        getAllUserFriends(user_id)
        .then(allUserFriends => {
            (async function() {
                var allFriendsInfo = [];
                for(var i = 0; i < allUserFriends.length; i++){
                    allFriendsInfo.push(await getFriendInfo(allUserFriends[i][0]));
                }
                return allFriendsInfo;
            })().then(user_friends => {
                res.json({friends : user_friends});
            })
        })
    }else if(filter_type === "online") {

    }else if(filter_type === "pending") {
        getAllUserFriendRequests(user_id)
        .then(allFriendRequests => {
            (async function() {
                var allRequestInfo = [];
                for(var i = 0; i < allFriendRequests.length; i++) {
                    var requestInfo = await getFriendInfo(allFriendRequests[i][1]);
                    requestInfo.unshift(allFriendRequests[i][0]);
                    allRequestInfo.push(requestInfo);
                }
                return allRequestInfo;
            })().then(requests => {
                res.json({friendRequests : requests});
            })
        })
    }
})

// -------------------------- Group POST/GET Requests ---------------------------------------

app.post('/createGroup', function(req, res) {
    var userData = req.body.userForm;
    var user_id = userData['user_id'];
    var group_name = userData['group_name'];
    var group_desc = userData['group_desc'];

    connection.connect(() => {
        if(connection.state !== "disconnected") {
            createGroup(user_id, group_name, group_desc)
            .then(() => {
                res.json({status : "success"});
            })
        }else{
            res.json({status : "failed", reason : "dbConnection"});
        }
    })
})

// ------------------------ User Account POST/GET Requests -------------------------------------

app.post('/updateUsername', function(req, res) {
    var user_id = req.body.user_id;
    var givenPword = req.body.verifyPword;
    var newUsername = req.body.newUsername;

    connection.connect(() => {
        if(connection.state !== "disconnected") {
            getUserInfo(user_id)
            .then(user_info => {
                verifyPassword(user_id, givenPword)
                .then(pword_validation => {
                    if(pword_validation) {
                        availableUsername(newUsername)
                        .then(username_validation => {
                            if(username_validation) {
                                validUsernameTagCombo(newUsername, user_info[1])
                                .then(combo_validation => {
                                    if(combo_validation) {
                                        connection.query(`UPDATE users SET user_name = '${newUsername}' WHERE user_id = ${userInfo[0]};`, function(err) {
                                            if(err) {
                                                res.json({status : "failed", reason : "error"});
                                            }
                                            res.json({status : "success"});
                                        })
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
        }else{
            res.json({status : "failed", reason : "dbConnection"});
        }
    })
})

app.post('/updatePassword', function(req, res) {
    var user_id = req.body.user_id;
    var newPword = req.body.newPword;
    var verifyPword = req.body.verifyPword;

    connection.connect(() => {
        if(connection.state !== "disconnected") {
            verifyPassword(user_id, verifyPword)
            .then(pword_validation => {
                if(pword_validation) {
                    hashInput(newPword)
                    .then(hashedPword => {
                        connection.query(`UPDATE users SET user_password = '${hashedPword}' WHERE user_id = ${user_id};`, function(err) {
                            if(err) {
                                res.json({status : "failed", reason : "error"});
                            }
                            res.json({status : "success"});
                        })
                    })
                }else{
                    res.json({status: "failed", reason: "invalidPword"});
                }
            })
        }else{
            res.json({status: "failed", reason: "dbConnection"});
        }
    })
})

app.post('/updateEmail', function(req, res) {
    var user_id = req.body.user_id;
    var newEmail = req.body.newEmail;
    var verifyPword = req.body.verifyPword;

    connection.connect(() => {
        if(connection.state !== "disconnected") {
            verifyPassword(user_id, verifyPword).then(pword_validation => {
                if(pword_validation) {
                    availableEmail(newEmail).then(email_availability => {
                        if(email_availability) {
                            connection.query(`UPDATE users SET user_email = '${newEmail}' WHERE user_id = ${user_id};`, function(err) {
                                if(err) {
                                    res.json({status : "failed", reason : "error"});
                                }
                                res.json({status : "success"});
                            })
                        }else{
                            res.json({status: "failed", reason: "takenEmail"});
                        }
                    })
                }else{
                    res.json({status: "failed", reason: "invalidPword"});
                }
            })
        }else{
            res.json({status : "failed", reason : "dbConnection"});
        }
    })
})

app.post('/updateTag', function(req, res) {
    var user_id = req.body.user_id;
    var newTag = req.body.newTag;
    var verifyPword = req.body.verifyPword;

    connection.connect(() => {
        if(connection.state !== "disconnected") {
            verifyPassword(user_id, verifyPword).then(pword_validation => {
                if(pword_validation) {
                    getUserInfo(user_id).then(user_info => {
                        validUsernameTagCombo(user_info[0], newTag).then(combo_validation => {
                            if(combo_validation) {
                                connection.query(`UPDATE users SET user_tag = ${newTag} WHERE user_id = ${user_id};`, function(err) {
                                    if(err) {
                                        res.json({status : "failed", reason : "error"});
                                    }
                                    res.json({status : "success"});
                                })
                            }else{
                                res.json({status: "failed", reason: "invalidNameTagCombo"});
                            }
                        })
                    })
                }else{
                    res.json({status: "failed", reason: "invalidPword"});
                }
            })
        }else{
            res.json({status : "failed", reason : "dbConnection"});
        }
    })
})


app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });