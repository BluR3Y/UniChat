function highlightCont(el) {
    var parentEl = el.parentElement;
    var messageCont = parentEl.querySelector('h1');
    var errorMsg = parentEl.querySelector('span');

    parentEl.style.border = "2px solid blue";
    if(messageCont.style.display === "block"){
        messageCont.style.display = "none";
        errorMsg.innerHTML = "";
    }
}
function defaultCont(el) {
    parentEl = el.parentElement;
    parentEl.style.border = "2px solid rgb(37, 68, 134)";
}

document.getElementsByClassName('signupForm')[0].addEventListener('submit', (el) => {
    el.preventDefault();

    var inputConts = document.getElementsByClassName("inputContainer");
    var username = inputConts[0].querySelector('input').value;
    var email = inputConts[1].querySelector('input').value;
    var pword = inputConts[2].querySelector('input').value;

    if(!validUsernameCharacters(username)) {
        var usernameCont = inputConts[0];
        var messageCont = usernameCont.querySelector('h1');
        var errorMsg = usernameCont.querySelector('span');

        usernameCont.style.border = "2px solid red";
        messageCont.style.display = "block";
        errorMsg.innerHTML = "Invalid Characters";
        return;
    }else if(username.length < 3) {
        var usernameCont = inputConts[0];
        var messageCont = usernameCont.querySelector('h1');
        var errorMsg = usernameCont.querySelector('span');

        usernameCont.style.border = "2px solid red";
        messageCont.style.display = "block";
        errorMsg.innerHTML = "Username Too Short";
        return;
    }
    if(!validateEmail(email)) {
        var emailCont = inputConts[1];
        var messageCont = emailCont.querySelector('h1');
        var errorMsg = emailCont.querySelector('span');

        emailCont.style.border = "2px solid red";
        messageCont.style.display = "block";
        errorMsg.innerHTML = "Invalid Email Address";
        return;
    }
    if(pword.length < 5) {
        var usernameCont = inputConts[2];
        var messageCont = usernameCont.querySelector('h1');
        var errorMsg = usernameCont.querySelector('span');

        usernameCont.style.border = "2px solid red";
        messageCont.style.display = "block";
        errorMsg.innerHTML = "Password Too Short";
        return;
    }

    var userFormData = {
        'username': username,
        'email': email,
        'password':pword,
    }

    fetch('/signupUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'userForm': userFormData})
    })
    .then((response) => response.json())
    .then((data) => {
        if(data['status'] === "failed"){
            if(data['reason'] === "creatingUser") {
                let otherError = document.getElementById('otherError');
                otherError.innerHTML = "Problem Creating Account. Please Try Again Later";
                otherError.style.display = "block";
            }else if(data['reason'] === "takenEmail") {
                let emailCont = inputConts[1];
                let messageCont = emailCont.querySelector('h1');
                let errorMsg = emailCont.querySelector('span');

                emailCont.style.border = "2px solid red";
                messageCont.style.display = "block";
                errorMsg.innerHTML = "Email Address Taken";
            }else if(data['reason'] === "takenUsername") {
                let usernameCont = inputConts[0];
                let messageCont = usernameCont.querySelector('h1');
                let errorMsg = emailCont.querySelector('span');

                usernameCont.style.border = "2px solid red";
                messageCont.style.display = "block";
                errorMsg.innerHTML = "Too many users with that name";
            }else if(data['reason'] === "dbConnection") {
                let otherError = document.getElementById('otherError');
                otherError.innerHTML = "Problem Connecting to Database";
                otherError.style.display = "block";
            }else{
                let otherError = document.getElementById('otherError');
                otherError.innerHTML = "An Error Had Occured. Please Try Again Later";
                otherError.style.display = "block";
            }
        }else{
            // window.location.href = `/userCreated?email=${data['email']}&activationCode=${data['activationCode']}`;
            userStorage = window.localStorage;
            localStorage.setItem('resendLink', data['resendLink']);
            localStorage.setItem('resendEmail', data['resendEmail']);
            window.location.href = '/userCreated';
        }
    })
})

function validUsernameCharacters(username){
    var isvalid = true;
    for(var i=0; i < username.length;i++){
      if(!(/[0-9a-zA-Z]/).test(username[i])){
         isvalid = false;
      }
    }
    return isvalid;
}

const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};