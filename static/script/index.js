

window.addEventListener('load', function() {
    if(localStorage.getItem('user_id') !== null){
        document.getElementsByClassName('userVisit')[0].style.display = "block";
    }else{
        document.getElementsByClassName('guestVisit')[0].style.display = "block";
    }
})