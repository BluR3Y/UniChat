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

function createFriendItem(friendName,friendImg){
    let friendList = document.getElementsByClassName("userFriendsCont")[0];

    let friendItem = document.createElement("div");
    friendItem.setAttribute("class","userFriendItem");

    let friendImgCont = document.createElement("div");
    friendImgCont.setAttribute("class","friendImgCont");
    let friendImgObj = document.createElement("img");
    friendImgObj.setAttribute("src",`${friendImg}`);
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

function scrollFriendList(scrollDirection){
    let friendList = document.getElementsByClassName("userFriendsCont")[0];
    friendList.scrollLeft -= (scrollDirection);
}

// function disableGroupPointer(){
//     var groupList = document.getElementsByClassName('userGroups')[0];
//     groupList.style.pointerEvents = "none";
//     setTimeout(() => {
//         groupList.style.pointerEvents = "auto";
//     }, 500);
// }

for(var i=0; i < 15; i++){
    createGroupItem(`Test Group #${i}`,100,50,"https://iso.500px.com/wp-content/uploads/2016/03/stock-photo-142984111.jpg");
}

for(var i=0; i < 25; i++){
    createFriendItem(`Name #${i}`,"https://media.istockphoto.com/photos/silhouette-of-man-in-dark-place-anonymous-backlit-contour-a-picture-id1139459625?b=1&k=20&m=1139459625&s=170667a&w=0&h=zVpBlAmdwUDWIVf0Zxtb3idMCitol4nzII2qde8Ybag=");
}