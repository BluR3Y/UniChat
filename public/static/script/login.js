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

document.getElementsByClassName('loginForm')[0].addEventListener('submit', (el) => {
    el.preventDefault();

    var inputConts = document.getElementsByClassName("inputContainer");
    var email = inputConts[0].querySelector('input').value;
    var pword = inputConts[1].querySelector('input').value;

    if(!validateEmail(email)) {
        var emailCont = inputConts[0];
        var messageCont = emailCont.querySelector('h1');
        var errorMsg = emailCont.querySelector('span');

        emailCont.style.border = "2px solid red";
        messageCont.style.display = "block";
        errorMsg.innerHTML = "Invalid Email Address";
        return;
    }
    if(pword.length < 5) {
        var pwordCont = inputConts[1];
        var messageCont = pwordCont.querySelector('h1');
        var errorMsg = pwordCont.querySelector('span');

        pwordCont.style.border = "2px solid red";
        messageCont.style.display = "block";
        errorMsg.innerHTML = "Password Too Short";
        return;
    }

    var userFormData = {
        'email': email,
        'password':pword,
    }

    var url = '/loginUser'
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify({'userForm':userFormData})
    })
    .then((response) => response.json())
    .then((data) => {

        if(data['status'] === "failed") {
            if(data['reason'] === "userDNE") {
                var usernameCont = inputConts[0];
                var messageCont = usernameCont.querySelector('h1');
                var errorMsg = usernameCont.querySelector('span');
        
                usernameCont.style.border = "2px solid red";
                messageCont.style.display = "block";
                errorMsg.innerHTML = "User Does Not Exist";
                return;
            }else if(data['reason'] === "invalidPword") {
                var usernameCont = inputConts[1];
                var messageCont = usernameCont.querySelector('h1');
                var errorMsg = usernameCont.querySelector('span');
        
                usernameCont.style.border = "2px solid red";
                messageCont.style.display = "block";
                errorMsg.innerHTML = "Invalid Password";
                return;
            }else if(data['reason'] === "maxAttempts") {
                let otherError = document.getElementById('otherError');
                otherError.innerHTML = "Too Many Failed Attempts";
                otherError.style.display = "block";
            }else if(data['reason'] === "dbConnection") {
                let otherError = document.getElementById('otherError');
                otherError.innerHTML = "Problem Connecting to Database. Please Try Again Later";
                otherError.style.display = "block";
            }else{
                let otherError = document.getElementById('otherError');
                otherError.innerHTML = "An Error Had Occured. Please Try Again Later";
                otherError.style.display = "block";
            }
        }else{
            userStorage = window.localStorage;
            localStorage.setItem('user_id',data['user_id']);
            localStorage.setItem('user_name',data['user_name']);
            window.location.href = "/Feed";
        }
    })
})

const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};