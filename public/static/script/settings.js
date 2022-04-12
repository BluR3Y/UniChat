window.onload = function(){
    var url = new URL(window.location.href);
    var updateStatus = url.searchParams.get('updateStatus');
    var uploadStatus = url.searchParams.get('uploadStatus');
    if(updateStatus !== null){
        if(updateStatus === "success"){
            showStatus('Account Successfully updated')
        }else{
            showStatus('An error occured while updating your account');
        }
    }else if(uploadStatus !== null){
        if(uploadStatus === "success"){
            showStatus('Profile picture successfully updated');
        }else{
            showStatus('An error occured while uploading your profile picture');
        }
    }
}

var profileImgForm = document.getElementsByClassName('uploadImgForm')[0];
var usernameForm = document.getElementById('usernameForm');
var passwordForm = document.getElementById('passwordForm');
var emailForm = document.getElementById('emailForm');
var verifyForm = document.getElementById('ownershipForm');
var tagForm = document.getElementById('tagForm');

function logout(){
    localStorage.clear();
    window.location.href = "/";
}

function submitImgUpload(){
    var profileImg = profileImgForm.elements['fileToUpload'].files[0];
    var formData = new FormData();
    var xhr = new XMLHttpRequest();

    formData.append("user_id", localStorage.getItem('user_id'));
    formData.append("uploadSize", profileImg.size);
    formData.append("fileToUpload", profileImg, profileImg.name);

    xhr.open("POST", "/uploadProfileImg", true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                var response = JSON.parse(xhr.responseText);
                if(response.status === "success"){
                    localStorage.setItem('user_img', response.userImg);
                    window.location.href = "/settings?uploadStatus=success";
                }else{
                    window.location.href = "/settings?uploadStatus=failed&reason="+response.reason;
                }
            }else{
                console.log(xhr.statusText);
            }
        }
    };
    xhr.send(formData);
}

usernameForm.addEventListener('submit', function(e){
    e.preventDefault();
    var newUsername = usernameForm.elements['newUsername'].value;
    var verifyPword = usernameForm.elements['verifyPword'].value;
    if(validUsernameCharacters(newUsername)){
        if(newUsername.length > 2 && newUsername.length < 31){
            var formData = new FormData();
            var xhr = new XMLHttpRequest();

            formData.append("user_id", localStorage.getItem('user_id'));
            formData.append("newUsername", newUsername);
            formData.append("verifyPword", verifyPword);
            clearUsernameInput();

            xhr.open("POST","/updateUsername", true);
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        var response = JSON.parse(xhr.responseText);
                        if(response.status === "success"){
                            localStorage.setItem('user_name', newUsername);
                            window.location.href = "/settings?updateStatus=success";
                        }else{
                            var updateError = response.reason;
                            if(updateError==="invalidPword"){
                                usernameForm.elements['verifyPword'].classList.add('invalidVerifyPword');
                                usernameForm.getElementsByClassName('formError')[1].textContent = "Invalid Password";
                                usernameForm.getElementsByClassName('formError')[1].style.opacity = '1';
                            }else if(updateError === "takenUsername"){
                                usernameForm.elements['newUsername'].classList.add('invalidUpdateInput');
                                usernameForm.getElementsByClassName('formError')[0].textContent = "Too many users currently have that username";
                                usernameForm.getElementsByClassName('formError')[0].style.opacity = '1';
                            }else if(updateError === "invalidNameTagCombo"){
                                usernameForm.elements['newUsername'].classList.add('invalidUpdateInput');
                                usernameForm.getElementsByClassName('formError')[0].textContent = "A user currently exists with that username and tag";
                                usernameForm.getElementsByClassName('formError')[0].style.opacity = '1';
                            }
                        }
                    }else{
                        console.log(xhr.statusText);
                    }
                }
            }
            xhr.send(formData);
        }else{
            clearUsernameInput();
            usernameForm.elements['newUsername'].classList.add('invalidUpdateInput');
            usernameForm.getElementsByClassName('formError')[0].textContent = "Username length must be between 3 and 30 characters";
            usernameForm.getElementsByClassName('formError')[0].style.opacity = '1';
        }
    }else{
        clearUsernameInput();
        usernameForm.elements['newUsername'].classList.add('invalidUpdateInput');
        usernameForm.getElementsByClassName('formError')[0].textContent = "Username contains invalid characters";
        usernameForm.getElementsByClassName('formError')[0].style.opacity = '1';
    }
})

passwordForm.addEventListener('submit', function(e){
    e.preventDefault();
    var newPword = passwordForm.elements['newPword'].value;
    var verifyPword = passwordForm.elements['verifyPword'].value;
    if(newPword.length>2 && newPword.length<31){
        var formData = new FormData();
        var xhr = new XMLHttpRequest();

        formData.append("user_id",localStorage.getItem('user_id'));
        formData.append('newPword',newPword);
        formData.append('verifyPword',verifyPword);
        clearPasswordInput();

        xhr.open("POST","/updatePassword", true);
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                if(xhr.status === 200){
                    var response = JSON.parse(xhr.responseText);
                    if(response.status === "success"){
                        window.location.href = "/settings?updateStatus=success";
                    }else{
                        var updateError = response.reason;
                        if(updateError === "invalidPword"){
                            passwordForm.elements['verifyPword'].classList.add('invalidVerifyPword');
                            passwordForm.getElementsByClassName('formError')[1].textContent = "Invalid Password";
                            passwordForm.getElementsByClassName('formError')[1].style.opacity = '1';
                        }
                    }
                }else{
                    console.log(xhr.statusText);
                }
            }
        }
        xhr.send(formData);
    }else{
        clearPasswordInput();
        passwordForm.elements['newPword'].classList.add('invalidUpdateInput');
        passwordForm.getElementsByClassName('formError')[0].textContent = "Password length must be between 3 and 30 characters";
        passwordForm.getElementsByClassName('formError')[0].style.opacity = '1';
    }
})

emailForm.addEventListener('submit', function(e){
    e.preventDefault();
    var newEmail = emailForm.elements['newEmail'].value;
    var verifyPword = emailForm.elements['verifyPword'].value;
    if(validEmail(newEmail)){
        var formData = new FormData();
        var xhr = new XMLHttpRequest();

        formData.append("user_id",localStorage.getItem('user_id'));
        formData.append("newEmail", newEmail);
        formData.append("verifyPword", verifyPword);
        clearEmailInput();

        xhr.open("POST","/updateEmail", true);
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                if(xhr.status === 200){
                    var response = JSON.parse(xhr.responseText);
                    if(response.status === "success"){
                        localStorage.setItem('user_email',newEmail);
                        window.location.href = "/settings?updateStatus=success";
                    }else{
                        var updateError = response.reason;
                        if(updateError === "invalidPword"){
                            emailForm.elements['verifyPword'].classList.add('invalidVerifyPword');
                            emailForm.getElementsByClassName('formError')[1].textContent = "Invalid Password";
                            emailForm.getElementsByClassName('formError')[1].style.opacity = '1';
                        }else if(updateError === "takenEmail"){
                            emailForm.elements['newEmail'].classList.add('invalidUpdateInput');
                            emailForm.getElementsByClassName('formError')[0].textContent = "A user currently exists with this email address";
                            emailForm.getElementsByClassName('formError')[0].style.opacity = '1';
                        }
                    }
                }else{
                    console.log(xhr.statusText);
                }
            }
        }
        xhr.send(formData);
    }else{
        clearEmailInput();
        emailForm.elements['newEmail'].classList.add('invalidUpdateInput');
        emailForm.getElementsByClassName('formError')[0].textContent = "Invalid Email Address";
        emailForm.getElementsByClassName('formError')[0].style.opacity = '1';
    }
})

tagForm.addEventListener('submit', function(e){
    e.preventDefault();
    var newTag = tagForm.elements['newTag'].value;
    var verifyPword = tagForm.elements['verifyPword'].value;
    if(newTag.length === 4){
        var formData = new FormData();
        var xhr = new XMLHttpRequest();
        
        formData.append('user_id',localStorage.getItem('user_id'));
        formData.append('newTag',newTag);
        formData.append('verifyPword', verifyPword);

        xhr.open("POST","/updateTag",true);
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                if(xhr.status === 200){
                    clearTagInput();
                    var response = JSON.parse(xhr.responseText);
                    if(response.status === "success"){
                        localStorage.setItem('user_tag', newTag);
                        window.location.href = "/settings?updateStatus=success";
                    }else{
                        var updateError = response.reason;
                        if(updateError === "invalidPword"){
                            tagForm.elements['verifyPword'].classList.add('invalidVerifyPword');
                            tagForm.getElementsByClassName('formError')[1].textContent = "Invalid Password";
                            tagForm.getElementsByClassName('formError')[1].style.opacity = '1';
                        }else if(updateError === "invalidNameTagCombo"){
                            tagForm.elements['newTag'].classList.add('invalidUpdateInput');
                            tagForm.getElementsByClassName('formError')[0].textContent = "A user currently exists with that username and tag";
                            tagForm.getElementsByClassName('formError')[0].style.opacity = '1';
                        }
                    }
                }else{
                    console.log(xhr.statusText);
                }
            }
        }
        xhr.send(formData);
    }else{
        clearTagInput();
        tagForm.elements['newTag'].classList.add('invalidUpdateInput');
        tagForm.getElementsByClassName('formError')[0].textContent = "Tag must contain 4 digits";
        tagForm.getElementsByClassName('formError')[0].style.opacity = '1';
    }
    
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

function validEmail(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validTag(event,el){
    const validCharacters = [0,1,2,3,4,5,6,7,8,9];
    event.preventDefault();
    if(validCharacters.includes(parseInt(event.key))){
       if(el.value.length < 4){
        el.value += event.key;
       }
    }
}

function dimPage(){
    document.getElementsByClassName('dimmer')[0].style.display = "block";
}

function undimPage(){
    document.getElementsByClassName('dimmer')[0].style.display = "none";
}

function uploadImgForm(){
    
    profileImgForm.style.display = "block";
    dimPage();
}
function cancelImgUpload(){
    profileImgForm.style.display = "none";
    undimPage();
    if(document.getElementsByClassName('submitImg')[0].disabled === false){
        document.getElementsByClassName('submitImg')[0].disabled = true;
    }
    if(document.getElementById('previewSelected').src !== null){
        document.getElementById('previewSelected').removeAttribute('src');
        document.getElementById('previewSelected').style.display = "none";
    }

    if(document.getElementsByClassName('drop_zone')[0].classList.contains('valid')){
        document.getElementsByClassName('drop_zone')[0].classList.remove('valid');
    }else if(document.getElementsByClassName('drop_zone')[0].classList.contains('invalid')){
        document.getElementsByClassName('drop_zone')[0].classList.remove('invalid');
    }

    if(document.getElementById('imgError').querySelector('h1').textContent !== null){
        document.getElementById('imgError').querySelector('h1').textContent = null;
    }

    document.getElementsByClassName('uploadImgForm')[0].reset();
}

function updateUsername(){
    usernameForm.style.display = "block";
    dimPage();
}
function closeUsername(){
    usernameForm.style.display = "none";
    document.getElementsByClassName('updateInput')[0].value = "";
    clearUsernameInput();
    undimPage();
}

function updatePword(){
    passwordForm.style.display = "block";
    dimPage();
}
function closePword(){
    passwordForm.style.display = "none";
    clearPasswordInput();
   undimPage();
}

function updateEmail(){
    emailForm.style.display = "block";
    dimPage();
}
function closeEmail(){
    emailForm.style.display = "none";
    document.getElementsByClassName('updateInput')[2].value = "";
    clearEmailInput();
   undimPage();
}

function updateTag(){
    tagForm.style.display = "block";
    dimPage();
}
function closeTag(){
    tagForm.style.display = "none";
    document.getElementsByClassName('updateInput')[3].value = "";
    clearTagInput();
   undimPage();
}

function clearUsernameInput(){
    document.getElementsByClassName('verifyPword')[0].value = "";
    if(usernameForm.elements['newUsername'].classList.contains('invalidUpdateInput')){
        usernameForm.elements['newUsername'].classList.remove('invalidUpdateInput');
        usernameForm.getElementsByClassName('formError')[0].textContent = "";
        usernameForm.getElementsByClassName('formError')[0].style.opacity = '0';
    }
    if(usernameForm.elements['verifyPword'].classList.contains('invalidVerifyPword')){
        usernameForm.elements['verifyPword'].classList.remove('invalidVerifyPword');
        usernameForm.getElementsByClassName('formError')[1].textContent = "";
        usernameForm.getElementsByClassName('formError')[1].style.opacity = '0';
    }
}

function clearPasswordInput(){
    passwordForm.elements['newPword'].value = '';
    passwordForm.elements['verifyPword'].value = '';
    if(passwordForm.elements['newPword'].classList.contains('invalidUpdateInput')){
        passwordForm.elements['newPword'].classList.remove('invalidUpdateInput');
        passwordForm.getElementsByClassName('formError')[0].textContent = "";
        passwordForm.getElementsByClassName('formError')[0].style.opacity = '0';
    }
    if(passwordForm.elements['verifyPword'].classList.contains('invalidVerifyPword')){
        passwordForm.elements['verifyPword'].classList.remove('invalidVerifyPword');
        passwordForm.getElementsByClassName('formError')[1].textContent = "";
        passwordForm.getElementsByClassName('formError')[1].style.opacity = '0';
    }
}

function clearEmailInput(){
    emailForm.elements['verifyPword'].value = '';
    if(emailForm.elements['newEmail'].classList.contains('invalidUpdateInput')){
        emailForm.elements['newEmail'].classList.remove('invalidUpdateInput');
        emailForm.getElementsByClassName('formError')[0].textContent = "";
        emailForm.getElementsByClassName('formError')[0].style.opacity = '0';
    }
    if(emailForm.elements['verifyPword'].classList.contains('invalidVerifyPword')){
        emailForm.elements['verifyPword'].classList.remove('invalidVerifyPword');
        emailForm.getElementsByClassName('formError')[1].textContent = "";
        emailForm.getElementsByClassName('formError')[1].style.opacity = '0';
    }
}

function clearTagInput(){
    tagForm.elements['verifyPword'].value = '';
    if(tagForm.elements['newTag'].classList.contains('invalidUpdateInput')){
        tagForm.elements['newTag'].classList.remove('invalidUpdateInput');
        tagForm.getElementsByClassName('formError')[0].textContent = "";
        tagForm.getElementsByClassName('formError')[0].style.opacity = '0';
    }
    if(tagForm.elements['verifyPword'].classList.contains('invalidVerifyPword')){
        tagForm.elements['verifyPword'].classList.remove('invalidVerifyPword');
        tagForm.getElementsByClassName('formError')[1].textContent = "";
        tagForm.getElementsByClassName('formError')[1].style.opacity = '0';
    }
}

function dragOverHandler(event){
    const validFileSize = 500000;
    const validFileTypes = ['image/gif','image/jpeg','image/png','image/jpg'];
    var draggedFile = event.dataTransfer.items;

    if(draggedFile.length === 1){
        if(validFileTypes.includes(draggedFile[0]['type'])){
            validDrop();
        }else{
            invalidDrop('File type not supported');
        }
    }else{
        invalidDrop('Multiple Files Selected');
    }
    event.preventDefault();
}

function dropHandler(event) {
    var imgSelected = event.dataTransfer.files[0];
    var preview =  document.getElementById('previewSelected');
    var reader = new FileReader();

    document.getElementById('selectedImg').files = event.dataTransfer.files;

    reader.addEventListener("load", function(){
        preview.src = reader.result;
    }, false);

    if(imgSelected){
        reader.readAsDataURL(imgSelected);
        preview.style.display = "block";
    }

    validateDropImg(imgSelected);

    event.preventDefault();
  }

var timeoutHandle = setTimeout(100);
function validDrop(){
    setImgStatus_Valid();
    clearTimeout(timeoutHandle);
    timeoutHandle =setTimeout(function(){
        unsetImgStatus_Valid();
    },100);
}
function invalidDrop(errorText){
    setImgStatus_Invalid(errorText);
    clearTimeout(timeoutHandle);
    timeoutHandle =setTimeout(function(){
        unsetImgStatus_Invalid();
    },100);
}

function validateDropImg(img){
    const validSize = 500000;
    var imgSize = img.size;
    clearTimeout(timeoutHandle);
    if(imgSize <= validSize){
        setImgStatus_Valid();
        document.getElementsByClassName('submitImg')[0].disabled = false;
    }else{
        setImgStatus_Invalid('Image too large');
    }
}
function validateSelectedImg(input){
    const validSize = 500000;
    var imgSize = input.files[0].size;
    var preview = document.getElementById('previewSelected');
    var reader = new FileReader();
    reader.onload = function(){
        preview.src = reader.result;
        preview.style.display = "block";
    }
    reader.readAsDataURL(input.files[0]);

    clearTimeout(timeoutHandle);
    if(imgSize <= validSize){
        setImgStatus_Valid();
        document.getElementsByClassName('submitImg')[0].disabled = false;
    }else{
        setImgStatus_Invalid('Image too large');
    }
}

function setImgStatus_Valid(){
    var zone = document.getElementsByClassName('drop_zone')[0];
    if(zone.classList.contains('invalid')){
        zone.classList.remove('invalid');
    }
    if(!zone.classList.contains('valid')){
        zone.classList.add('valid');
    }
    zone.setAttribute('ondrop','dropHandler(event)');
}
function unsetImgStatus_Valid(){
    var zone = document.getElementsByClassName('drop_zone')[0];
    zone.classList.remove('valid');
    zone.removeAttribute('ondrop','dropHandler(event)');
}
function setImgStatus_Invalid(errorText){
    var zone = document.getElementsByClassName('drop_zone')[0];
    var errObj = document.getElementById('imgError');
    if(zone.classList.contains('valid')){
        zone.classList.remove('valid');
    }
    if(!zone.classList.contains('invalid')){
        zone.classList.add('invalid');
    }
    errObj.querySelector('h1').textContent = errorText;
    errObj.style.opacity = '1';
}
function unsetImgStatus_Invalid(){
    var zone = document.getElementsByClassName('drop_zone')[0];
    var errObj = document.getElementById('imgError');
    zone.classList.remove('invalid');
    errObj.querySelector('h1').textContent = '';
    errObj.style.opacity = '0';
}

function setUsername_Invalid(){
    var usernameInput = usernameForm.getElementsByClassName('usernameInput')[0];
    var passwordInput = usernameForm.getElementsByClassName('passwordInput')[0];


}

function showStatus(status){
    var statusDiv = document.getElementById('updateStatus');
    var statusH1 = statusDiv.querySelector('h1');
    statusH1.textContent = status;
    $(statusDiv).fadeIn();
    $(statusDiv).fadeOut(3000, ()=>{
        statusH1.textContent = "";
    });
}