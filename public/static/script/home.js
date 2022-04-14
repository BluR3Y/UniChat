function showSideNav(){
    let sideNav = document.getElementsByClassName("sideNav")[0];
    let hiddenName = document.getElementById("hiddenUserName");
    let userProfileImg = document.getElementsByClassName("userImgCont")[0].querySelector("img");

    if(sideNav.classList.contains("showSideNav")){
        sideNav.classList.remove("showSideNav");

        userProfileImg.style.top = "2px";
        hiddenName.style.display = "block";
        hiddenName.style.animation = "0.5s hiddenName_SlideIn";

    }else{
        sideNav.classList.add("showSideNav");
        userProfileImg.style.top = "9px";
        hiddenName.style.animation = "0.5s hiddenName_SlideOut";
        setTimeout(() => {
            hiddenName.style.display = "none";
        }, 450);
    }
}

function createGroupItem(groupName,groupMembers,groupOnline,groupImg){
    let groupCont = document.getElementsByClassName("userGroups")[0];

    let groupItem = document.createElement("div");
    groupItem.setAttribute("class","userGroupItem");
    groupItem.setAttribute("onmouseenter","groupHiddenInfoShow(this.getBoundingClientRect())");
    groupItem.setAttribute("onmouseleave","groupHiddenInfoHide()");

    let groupImgCont = document.createElement("div");
    groupImgCont.setAttribute("class","groupImgCont");
    let groupImgObj = document.createElement("img");
    groupImgObj.setAttribute("src",`${groupImg}`);
    groupImgCont.appendChild(groupImgObj);
    groupItem.appendChild(groupImgCont);

    let groupInfo = document.createElement("div");
    groupInfo.setAttribute("class","groupInfo");
    let groupNameObj = document.createElement("h1");
    groupNameObj.setAttribute("class","groupName");
    let groupNameText = document.createTextNode(groupName);
    groupNameObj.appendChild(groupNameText);
    groupInfo.appendChild(groupNameObj);

    let groupStats = document.createElement("div");
    groupStats.setAttribute("class","groupStats");
    let members = document.createElement("h1");
    members.setAttribute("class","groupMembers");
    let membersText = document.createTextNode("Members: ");
    let membersAmount = document.createElement("span");
    let membersAmountText = document.createTextNode(`${groupMembers}`);
    membersAmount.appendChild(membersAmountText);
    members.appendChild(membersText);
    members.appendChild(membersAmount);
    groupStats.appendChild(members);

    let membersOnline = document.createElement("h1");
    membersOnline.setAttribute("class","groupOnlineMembers");
    let onlineText = document.createTextNode("Online: ");
    let onlineAmount = document.createElement("span");
    let onlineAmountText = document.createTextNode(`${groupOnline}`);
    onlineAmount.appendChild(onlineAmountText);
    membersOnline.appendChild(onlineText);
    membersOnline.appendChild(onlineAmount);
    groupStats.appendChild(membersOnline);
    groupInfo.appendChild(groupStats);
    groupItem.appendChild(groupInfo);

    groupCont.appendChild(groupItem);
}

function groupHiddenInfoShow(elementInfo){
    let sideNav = document.getElementsByClassName("sideNav")[0];
    if(!sideNav.classList.contains("showSideNav")){
        let hiddenCont = document.getElementsByClassName("groupHiddenCont")[0];
        hiddenCont.style.top = `${elementInfo.top - 120}px`;
        hiddenCont.style.display = "flex";
    }
}
function groupHiddenInfoHide(){
    let sideNav = document.getElementsByClassName("sideNav")[0];

    if(!sideNav.classList.contains("showSideNav")){
        let hiddenCont = document.getElementsByClassName("groupHiddenCont")[0];
        hiddenCont.style.display = "none";
    }
}

function createFriendItem(friendName,friendTag, friendImg, dateConnected){
    let friendList = document.getElementsByClassName("userFriendsCont")[0];

    let friendItem = document.createElement("div");
    friendItem.setAttribute("class","userFriendItem");

    let friendImgCont = document.createElement("div");
    friendImgCont.setAttribute("class","friendImgCont");
    let friendImgObj = document.createElement("img");
    friendImgObj.setAttribute("src",`./content/uploads/userProfiles/${friendImg}`);
    friendImgCont.appendChild(friendImgObj);
    friendItem.appendChild(friendImgCont);

    let friendNameCont = document.createElement("div");
    friendNameCont.setAttribute("class","friendNameCont");
    let friendNameObj = document.createElement("h1");
    let friendNameText = document.createTextNode(friendName);
    friendNameObj.appendChild(friendNameText);
    friendNameCont.appendChild(friendNameObj);
    friendItem.appendChild(friendNameCont);

    friendList.appendChild(friendItem);
}

function answerFriendRequest(el, userResponse){
    var parent = el.parentNode;
    var invitation_id = parent.querySelector('input').value;

    var userFormData = {
        'user_id' : localStorage.getItem("user_id"),
        'invitation_id' : invitation_id,
        'user_response' : userResponse
    }
    var url = '/answerFriendRequest'
    fetch(url, {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
        },
        body : JSON.stringify({'userForm': userFormData})
    })
    .then((response) => response.json())
    .then((data) => {
        if(data['status'] === "failed"){

        }else{
            var statusMsg = (function() {
                var senderInfo = parent.parentNode.getElementsByClassName("pendingFriendInfo")[0];
                var senderName = senderInfo.querySelector('h1').innerHTML;
                if(parseInt(userResponse)){
                    return `You are now friends with ${senderName}`;
                }else{
                    return `You've rejected a friend request from ${senderName}`;
                }
            })();
            displayPrompt(statusMsg);
            parent.parentNode.parentNode.parentNode.remove();
        }
    })
}

function createPendingFriendItem(invitationID, pendingFriendName, pendingFriendTag, pendingFriendImg){
    let friendList = document.getElementsByClassName("userFriendsCont")[0];

    let pendingFriendItem = document.createElement("div");
    pendingFriendItem.setAttribute("class","pendingFriendItem");

    let pendingFriendPfp = document.createElement("img");
    pendingFriendPfp.setAttribute("src",`./content/uploads/userProfiles/${pendingFriendImg}`);
    pendingFriendItem.appendChild(pendingFriendPfp);

    let pendingFriendCont = document.createElement("div");
    pendingFriendCont.setAttribute("class","pendingFriendCont");

    let pendingFriendInfo = document.createElement("div");
    pendingFriendInfo.setAttribute("class", "pendingFriendInfo");

    let friendNameObj = document.createElement("h1");
    friendNameObj.innerHTML = pendingFriendName;
    let friendTagObj = document.createElement("h2");
    while(pendingFriendTag.length < 4){
        pendingFriendTag = '0' + pendingFriendTag;
    }
    friendTagObj.innerHTML = `#${pendingFriendTag}`;
    pendingFriendInfo.appendChild(friendNameObj);
    pendingFriendInfo.appendChild(friendTagObj);
    pendingFriendCont.appendChild(pendingFriendInfo);

    let pendingOptions = document.createElement("div");
    pendingOptions.setAttribute("class", "pendingFriendOptions");

    let acceptBtn = document.createElement("button");
    acceptBtn.setAttribute("class", "acceptFriendBtn");
    acceptBtn.setAttribute("onclick", "answerFriendRequest(this,1)");
    let acceptBtnIcon = document.createElement("i");
    acceptBtnIcon.setAttribute("class", "fa-solid fa-check");
    acceptBtn.appendChild(acceptBtnIcon);
    pendingOptions.appendChild(acceptBtn);

    let rejectBtn = document.createElement("button");
    rejectBtn.setAttribute("class", "rejectFriendBtn");
    rejectBtn.setAttribute("onclick","answerFriendRequest(this,0)");
    let rejectBtnIcon = document.createElement("i");
    rejectBtnIcon.setAttribute("class", "fa-solid fa-xmark");
    rejectBtn.appendChild(rejectBtnIcon);
    pendingOptions.appendChild(rejectBtn);
    pendingFriendCont.appendChild(pendingOptions);

    let idObj = document.createElement("input");
    idObj.setAttribute("type","hidden");
    idObj.value = invitationID;
    pendingOptions.appendChild(idObj);

    pendingFriendItem.appendChild(pendingFriendCont);
    friendList.appendChild(pendingFriendItem);
}

function scrollFriendList(scrollDirection){
    let friendList = document.getElementsByClassName("userFriendsCont")[0];
    friendList.scrollLeft -= (scrollDirection);
}

function updateFriendFilter(el){
    var allFilters = document.getElementsByClassName("friendFilterItem");
    var currentFilter = (()=>{
        for(var i=0; i < allFilters.length; i++){
            if(allFilters[i].classList.contains("selectedFriendFilter")){
                return allFilters[i];
            }
        }
        return -1;
    })();
    if(currentFilter !== el){
        currentFilter.classList.remove("selectedFriendFilter");
        el.classList.add("selectedFriendFilter");
        getUserFriends();
    }
}

function getUserFriends(){
    var friendFilters = document.getElementsByClassName("friendFilterItem");
    var friendList = document.getElementsByClassName("userFriendsCont")[0];
    var selectedFriendFilter = (function(){
        if(friendFilters[0].classList.contains('selectedFriendFilter')){
            return "all";
        }else if(friendFilters[1].classList.contains('selectedFriendFilter')){
            return "online";
        }else if(friendFilters[2].classList.contains('selectedFriendFilter')){
            return "pending";
        }else{
            return -1;
        }
    })();

    while(friendList.childElementCount){
        friendList.removeChild(friendList.firstChild)
    }

    var userData = {
        'user_id' : localStorage.getItem('user_id'),
        'filter_type' : selectedFriendFilter,
    }
    var url = '/getUserFriends';
    fetch(url, {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
        },
        body : JSON.stringify({'userForm' : userData})
    })
    .then((response) => response.json())
    .then((data) => {
       
        if(selectedFriendFilter !== "pending"){
            // data format: 'user_name', 'user_tag', 'user_img', 'date_connected'
            data['friends'].forEach(friend => {
                createFriendItem(friend[0],friend[1],friend[2],friend[3]);
            })
        }else{
             // data format: 'invitation_id', 'user_name', 'user_tag', 'user_img'
            data['friends'].forEach(pendingFriend => {
                createPendingFriendItem(pendingFriend[0], pendingFriend[1], pendingFriend[2], pendingFriend[3]);
            })
        }
    })
}

function getFriendInvitations(){
    var userFormData = {
        'user_id' : localStorage.getItem("user_id")
    }
    var url = '/getUserInvitations'
    fetch(url, {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
        },
        body : JSON.stringify({'userForm': userFormData})
    })
    .then((response) => response.json())
    .then((data) => {
        var friendRequests = data['requests'];
        if(friendRequests.length){
            friendRequests.forEach(request => {
                createPendingFriendItem(request[0],request[1], request[2],request[3]);
            })
        }else{

        }
    })
}

function dimPage(){
    let pageDimmer = document.getElementsByClassName("pageDimmer")[0];

    if(pageDimmer.style.display === "block"){
        pageDimmer.style.display = "none";
    }else{
        pageDimmer.style.display = "block";
    }
}

function displayAddFriendForm(){
    var friendForm = document.getElementsByClassName("addFriendForm")[0];

    if(friendForm.style.display === "flex"){
        friendForm.style.display = "none";
        clearAddFriendForm();
    }else{
        friendForm.style.display = "flex";
    }
    dimPage();
}

function clearAddFriendForm(){
    var friendForm = document.getElementsByClassName("addFriendForm")[0];
    var friend_name_input = document.getElementsByName("inviteeName")[0];
    var friend_tag_input = document.getElementsByName("inviteeTag")[0];

    friend_name_input.value = "";
    friend_tag_input.value = "";

    removeFriendErrorMsg();
}
function removeFriendErrorMsg(){
    var friendForm = document.getElementsByClassName("addFriendForm")[0];

    if(friendForm.classList.contains("displayFriendError")){
        var errorMsg = friendForm.getElementsByClassName("errorMsg")[0];
        friendForm.classList.remove("displayFriendError");
        errorMsg.innerHTML = "";
    }
}

document.getElementsByClassName("addFriendForm")[0].addEventListener("submit", function(event){
    event.preventDefault();
    var friendForm = document.getElementsByClassName("addFriendForm")[0];
    var inviteeName = document.getElementsByName("inviteeName")[0];
    var inviteeTag = document.getElementsByName("inviteeTag")[0];
    
    if(validUsernameCharacters(inviteeName.value)){
        if(inviteeName.value !== localStorage.getItem("user_name") || parseInt(inviteeTag.value) !== parseInt(localStorage.getItem("user_tag"))){
            var userFormData = {
                'user_id' : localStorage.getItem("user_id"),
                'invitee_name' : inviteeName.value,
                'invitee_tag' : inviteeTag.value
            }
        
            var url = '/sendFriendInvitation'
            fetch(url, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify({'userForm': userFormData})
            })
            .then((response) => response.json())
            .then((data) => {
                if(data['status'] === "failed"){
                    var errorMsg = friendForm.getElementsByClassName("errorMsg")[0];
                    errorMsg.innerHTML = (()=>{
                        if(data['reason'] === "dbConnection"){
                            return "Trouble Connecting to Database";
                        }else if(data['reason'] === "userDNE"){
                            return "User with those credentials doesn't exist";
                        }else if(data['reason'] === "invitationExists"){
                            return "An invitation to this user has already been sent";
                        }else if(data['reason'] === "connectionExists"){
                            return "User is already an existing friend";
                        }else{
                            return "An error has occured, please try again later";
                        }
                    })();
                    friendForm.classList.add("displayFriendError");
                }else{
                    displayPrompt(`Invitation sent to ${inviteeName.value}`);
                    displayAddFriendForm();
                }
            })
        }else{
            var errorMsg = friendForm.getElementsByClassName("errorMsg")[0];
            errorMsg.innerHTML = "You can't be friends with yourself";
            friendForm.classList.add("displayFriendError");
        }
    }else{
        var errorMsg = friendForm.getElementsByClassName("errorMsg")[0];
        errorMsg.innerHTML = "Username contains invalid characters";
        friendForm.classList.add("displayFriendError");
    }
})

function displayPrompt(msg){
    var promptObj = document.getElementsByClassName("promptCont")[0];
    var msgObj = promptObj.querySelector("h1");
    msgObj.innerHTML = msg;
    promptObj.style.display = "block";
    promptObj.style.animation = "4s promptAni linear";
    setTimeout(() => {
        promptObj.style.display = "none";
    }, 3900);
}

function displayAddGroupForm(){
    var groupForm = document.getElementsByClassName("addGroupForm")[0];
    let formCont = document.getElementsByClassName("addGroupForm")[0];
    let groupSelectionPage = formCont.getElementsByClassName("groupSelectionPage")[0];
    let createGroupPage = formCont.getElementsByClassName("createGroupPage")[0];
    let joinGroupPage = formCont.getElementsByClassName("joinGroupPage")[0];

    if(groupForm.style.display === "flex"){
        groupForm.style.display = "none";
        
        if(createGroupPage.classList.contains("viewingPage")){
            displayCreateGroupPage();
        }else if(joinGroupPage.classList.contains("viewingPage")){
            displayJoinGroupPage();
        }
    }else{
        groupForm.style.display = "flex";
    }
    dimPage();
}

function displayCreateGroupPage(){
    var selectionPage = document.getElementsByClassName("groupSelectionPage")[0];
    var createGroupPage = document.getElementsByClassName("createGroupPage")[0];

    if(selectionPage.classList.contains("viewingPage")){
        selectionPage.style.left = "580px";
        createGroupPage.style.left = "0px";
        selectionPage.classList.remove("viewingPage");
        createGroupPage.classList.add("viewingPage");
    }else{
        selectionPage.style.left = "0px";
        createGroupPage.style.left = "-580px";
        createGroupPage.classList.remove("viewingPage");
        selectionPage.classList.add("viewingPage");
        clearCreateGroupForm();
    }
}

function displayJoinGroupPage(){
    var selectionPage = document.getElementsByClassName("groupSelectionPage")[0];
    var joinGroupPage = document.getElementsByClassName("joinGroupPage")[0];

    if(selectionPage.classList.contains("viewingPage")){
        selectionPage.style.left = "-580px";
        joinGroupPage.style.left = "0";
        selectionPage.classList.remove("viewingPage");
        joinGroupPage.classList.add("viewingPage");
    }else{
        selectionPage.style.left = "0";
        joinGroupPage.style.left = "580px";
        joinGroupPage.classList.remove("viewingPage");
        selectionPage.classList.add("viewingPage");
        clearJoinGroupForm();
    }
}

function displayJoiningGroupInfo(groupImg, groupName, groupNumMembers, groupDesc){
    let joiningGroupCont = document.getElementsByClassName("joinGroupInfo")[0];
    let groupImgCont = joiningGroupCont.getElementsByClassName("joiningGroupImgCont")[0];
    let groupInfoCont = joiningGroupCont.getElementsByClassName("joiningGroupInfoCont")[0];
    let groupInfo_name = groupInfoCont.getElementsByClassName("joiningGroup_name")[0];
    let groupInfo_numMembers = groupInfoCont.getElementsByClassName("joiningGroup_numMembers")[0];
    let groupInfo_desc = groupInfoCont.getElementsByClassName("joiningGroup_desc")[0];

    let imgObj = document.createElement("img");
    imgObj.setAttribute("src", groupImg);
    groupImgCont.appendChild(imgObj);

    let nameObj = groupInfo_name.querySelector("h1");
    nameObj.style.width = "fit-content";
    nameObj.style.backgroundColor = "transparent";
    nameObj.innerHTML = groupName;

    let numMemberObj = groupInfo_numMembers.querySelector("h1");
    numMemberObj.style.width = "fit-content";
    numMemberObj.style.backgroundColor = "transparent";
    numMemberObj.innerHTML = "Members: ";
    groupInfo_numMembers.querySelector("span").innerHTML = groupNumMembers;

    let descObj = groupInfo_desc.querySelector("h1");
    descObj.style.backgroundColor = "transparent";
    descObj.innerHTML = groupDesc;
}

// function clearAddGroupForm(){
    // let formCont = document.getElementsByClassName("addGroupForm")[0];
    // let groupSelectionPage = formCont.getElementsByClassName("groupSelectionPage")[0];
    // let createGroupPage = formCont.getElementsByClassName("createGroupPage")[0];
    // let joinGroupPage = formCont.getElementsByClassName("joinGroupPage")[0];

//     if(createGroupPage.classList.contains("viewingPage")){     // showing create form

//     }else if(joinGroupPage.classList.contains("viewingPage")){  //showing join form
        // let joiningGroupCont = document.getElementsByClassName("joinGroupInfo")[0];
        // let groupImgCont = joiningGroupCont.getElementsByClassName("joiningGroupImgCont")[0];
        // let groupInfoCont = joiningGroupCont.getElementsByClassName("joiningGroupInfoCont")[0];
        // let groupInfo_name = groupInfoCont.getElementsByClassName("joiningGroup_name")[0];
        // let groupInfo_numMembers = groupInfoCont.getElementsByClassName("joiningGroup_numMembers")[0];
        // let groupInfo_desc = groupInfoCont.getElementsByClassName("joiningGroup_desc")[0];

        // let imgObj = groupImgCont.querySelector("img");
        // imgObj.remove();

        // let nameObj = groupInfo_name.querySelector("h1");
        // nameObj.innerHTML = "";
        // nameObj.style.width = "250px";
        // nameObj.style.backgroundColor = "rgb(4, 43, 114)";

        // let numMemberObj = groupInfo_numMembers.querySelector("h1");
        // numMemberObj.style.width = "100px";
        // numMemberObj.style.backgroundColor = "rgb(4, 43, 114)";
        // numMemberObj.innerHTML = "";
        // groupInfo_numMembers.querySelector("span").innerHTML = "";
    
        // let descObj = groupInfo_desc.querySelector("h1");
        // descObj.style.backgroundColor = "rgb(4, 43, 114)";
        // descObj.innerHTML = "";
//     }
// }

function clearJoinGroupForm(){
    let joiningGroupCont = document.getElementsByClassName("joinGroupInfo")[0];
    let groupImgCont = joiningGroupCont.getElementsByClassName("joiningGroupImgCont")[0];
    let groupInfoCont = joiningGroupCont.getElementsByClassName("joiningGroupInfoCont")[0];
    let groupInfo_name = groupInfoCont.getElementsByClassName("joiningGroup_name")[0];
    let groupInfo_numMembers = groupInfoCont.getElementsByClassName("joiningGroup_numMembers")[0];
    let groupInfo_desc = groupInfoCont.getElementsByClassName("joiningGroup_desc")[0];
    let joinGroupInputCont = document.getElementsByClassName("joinGroupInput")[0];

    let imgObj = groupImgCont.querySelector("img");
    if(imgObj !== null){
        imgObj.remove();

        let nameObj = groupInfo_name.querySelector("h1");
        nameObj.innerHTML = "";
        nameObj.style.width = "250px";
        nameObj.style.backgroundColor = "rgb(4, 43, 114)";
    
        let numMemberObj = groupInfo_numMembers.querySelector("h1");
        numMemberObj.style.width = "100px";
        numMemberObj.style.backgroundColor = "rgb(4, 43, 114)";
        numMemberObj.innerHTML = "";
        groupInfo_numMembers.querySelector("span").innerHTML = "";
    
        let descObj = groupInfo_desc.querySelector("h1");
        descObj.style.backgroundColor = "rgb(4, 43, 114)";
        descObj.innerHTML = "";
    }

    let joinGroupInput = joinGroupInputCont.querySelector("input");
    joinGroupInput.value = "";
}

function clearCreateGroupForm(){

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
function validUsernameCharacters(username){
    var isvalid = true;
    for(var i=0; i < username.length;i++){
      if(!(/[0-9a-zA-Z]/).test(username[i])){
         isvalid = false;
      }
    }
    return isvalid;
}

window.addEventListener("load", function(){
    getUserFriends();
})

// for(var i=0; i < 15; i++){
//     createGroupItem(`Test Group #${i}`,100,50,"https://iso.500px.com/wp-content/uploads/2016/03/stock-photo-142984111.jpg");
// }

// for(var i=0; i < 25; i++){
//     createFriendItem(`Name #${i}`,"https://media.istockphoto.com/photos/silhouette-of-man-in-dark-place-anonymous-backlit-contour-a-picture-id1139459625?b=1&k=20&m=1139459625&s=170667a&w=0&h=zVpBlAmdwUDWIVf0Zxtb3idMCitol4nzII2qde8Ybag=");
// }