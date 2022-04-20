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


// --------------------- Essential Functions -----------------------------------

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

function findUserID(user_email){
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

function getUserInfo(user_id){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users WHERE user_id = ${user_id};`, function(err, result) {
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
        connection.query(`SELECT user_tag FROM users WHERE user_name = '${username}';`, function(err, result) {
            if(err) {
                reject(err);
                return;
            }
            var user_tags = [];
            for(var i = 0; i < result.length; i++)
                user_tags.push(Object.values(result[i])[0]);
            
            var generated_tag = Math.floor(Math.random() * (9999 - 1000) + 1000);
            while(user_tags.includes(generated_tag)){
                generated_tag = Math.floor(Math.random() * (9999 - 1000) + 1000);
            }
            resolve(generated_tag);
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
            bcrypt.hash(input, salt, function(err, result) {
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



// -----------------------------------------------------------------------
app.post('/loginUser', function(req,res) {
    var userData = req.body.userForm;
    var user_email = userData['email'];
    var user_password = userData['password'];

    getUserCreatedGroups(111)
    .then(data => console.log(data))
})


app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });