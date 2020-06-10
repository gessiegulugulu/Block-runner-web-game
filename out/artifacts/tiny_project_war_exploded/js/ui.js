"use strict"

window.onload = function () {
    var user_email=localStorage.getItem("user_email");
    if(localStorage.getItem("user_email")!=""){
        document.getElementById('login').innerHTML=user_email;
    }
    else{
        document.getElementById('login').innerHTML="登录";
    }

    // 商品分类展示tab动效
    var tab_menu = document.getElementById('product-tab-menu-list').getElementsByTagName('li');
    var tab_content=[];
    tab_content[0] = document.getElementById('tab1');
    tab_content[1] = document.getElementById('tab2');
    tab_content[2] = document.getElementById('tab3');
    for (var i = 0; i < 3; i++) {
        tab_menu[i].id = i;
        tab_menu[i].onmouseover = function () {
            for (var j = 0; j < 3; j++) {
                tab_menu[j].classList.remove('active');
                tab_content[j].classList.remove('active');
            }
            this.classList.add('active');
            tab_content[this.id].classList.add('active');
            // this.className='active';
            // tab_content[this.id].className='active';
        }
    }

}

function add_to_cart(item) {
    if(localStorage.getItem("user_email")==""){
        alert("请登录账户！");
    }
    else {
        // console.log("hi",item);
        var title = item.parentNode.getElementsByClassName('product-description')[0].innerText;
        console.log("hi from add_to_cart", item, title);
        var price_con = item.parentNode.getElementsByClassName('product-price')[0];
        var price = price_con.getElementsByClassName('price-new')[0].innerText;

        var img = item.parentNode.parentNode.childNodes[1];
        var thumbnail = img.src;
        var url = "test?thumbnail=" + thumbnail + "&title=" + title + "&price=" + price + "&quantity=1&subtotal=" + price;
        // alert(url);
        post(url);
        window.location.href = "cart.html";
    }

}

