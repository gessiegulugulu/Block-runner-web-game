window.onload=function () {
    localStorage.clear();
    console.log(localStorage);
}

function formSubmit() {
    var form=document.getElementById("login-form");
    var input=form.getElementsByTagName('input');
    var email=input[0].value;
    var password=input[1].value;
    var url="login?email="+email+"&password="+password;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        // readyState == 4说明请求已完成
        if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
            // 从服务器获得数据
            // fn.call(this, xhr.responseText);
            var data=xhr.responseText;
            console.log(data);
            if(data=="Error password!"||data=="Unregistered user!"){
                alert(data);
            }
            else{
                localStorage.setItem("user_email", data);
                window.location.href="index.html";
            }

        }
    };
    xhr.send();
}

function registerSubmit(){
    var form=document.getElementById("register-form");
    var input=form.getElementsByTagName('input');
    var name=input[0].value;
    var email=input[1].value;
    var password=input[2].value;
    var check_password=input[3].value;
    if(password==check_password){
        var url="register?name="+name+"&email="+email+"&password="+password;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            // readyState == 4说明请求已完成
            if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                // 从服务器获得数据
                // fn.call(this, xhr.responseText);
                var data=xhr.responseText;
                alert(data);
                // window.location.href="index.html";
            }
        };
        xhr.send();

    }
    else{
        alert("The entered passwords do not match");
    }

}