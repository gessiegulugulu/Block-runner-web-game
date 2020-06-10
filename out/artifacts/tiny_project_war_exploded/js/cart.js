window.onload = function () {
    //从后端更新购物车数据
    console.log("hi from cart");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "cart", true);
    xhr.onreadystatechange = function () {
        // readyState == 4说明请求已完成
        if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
            // 从服务器获得数据
            // fn.call(this, xhr.responseText);
            var data=xhr.responseText;
            data=data.substring(1);
            data=data.substring(0,data.length-1);

            var json_array=new Array();
            json_array=data.split("}");
            json_array[0]=json_array[0]+"}";
            for (var i=1;i<json_array.length-1;i++){
                json_array[i]=json_array[i].substring(1)+"}";
            }

            var cart_tbody=document.getElementsByClassName("cart-table")[0].getElementsByTagName("tbody")[0];
            cart_tbody.innerHTML = "";
            var totoal_price=0;
            var inner_content="";
            for(var i=0;i<json_array.length-1;i++){
                var json_object=stringToJson(json_array[i]);
                var pro_thumbnail=json_object.thumbnail;
                var pro_title=json_object.title;
                var pro_price=json_object.price;
                var pro_quantity=json_object.quantity;
                var pro_subtotal=json_object.subtotal;
                totoal_price+=parseFloat(pro_subtotal.substring(1));
                inner_content+="<tr><td class=\"pro-thumbnail\"><img class=\"img-fluid\" src=\""+pro_thumbnail+
                    "\" alt=\"\"/></td><td class=\"pro-title\">"+pro_title+
                    "</td><td class=\"pro-price\"><span>"+pro_price+
                    "</span></td><td class=\"pro-quantity\"><div class=\"pro-qty\"><span class=\"dec qtybtn\">-</span><input type=\"text\" value=\""+pro_quantity+
                    "\"><span class=\"inc qtybtn\">+</span></div></td><td class=\"pro-subtotal\"><span>"+pro_subtotal+
                    "</span></td><td class=\"pro-remove\"><img class=\"pro-remove-icon\" src=\"resource/icon/delete.png\" alt=\"\"></td></tr>";
            }
            cart_tbody.innerHTML = inner_content;
            console.log(json_array);

            var checkout_subtotal=document.getElementsByClassName('pro-checkout-subtotal')[0].getElementsByTagName('span')[0];
            checkout_subtotal.innerHTML="$"+totoal_price.toFixed(2);
        }
    };
    xhr.send();



    var user_email=localStorage.getItem("user_email");
    if(localStorage.getItem("user_email")!=""){
        document.getElementById('login').innerHTML=user_email;
    }
    else{
        document.getElementById('login').innerHTML="登录";
    }

    //购物车加减
    var pro_quantity_btn=document.getElementsByClassName('qtybtn');

    for(var i=0;i<pro_quantity_btn.length;i++){
        pro_quantity_btn[i].onclick=function () {
            var oldValue=parseInt(this.parentNode.getElementsByTagName('input')[0].value);
            var newVal=0;
            if(this.classList.contains('inc')){
                newVal=oldValue+1;
            }
            else{
                if (oldValue > 0) {
                    newVal = oldValue - 1;
                } else {
                    newVal = 0;
                }
            }
            var pro_price_string=this.parentNode.parentNode.parentNode.getElementsByTagName('td')[2].getElementsByTagName('span')[0].innerText;
            var pro_subtotal_old=parseFloat(pro_price_string.substring(1));
            var pro_price_sub=(pro_subtotal_old*newVal);
            var pro_subtotal="$"+pro_price_sub.toFixed(2);
            this.parentNode.parentNode.parentNode.getElementsByTagName('td')[4].getElementsByTagName('span')[0].innerHTML=pro_subtotal;
            this.parentNode.getElementsByTagName('input')[0].value=newVal;
            console.log("购物车加减");

            //更新总值
            var checkout_subtotal=document.getElementsByClassName('pro-checkout-subtotal')[0].getElementsByTagName('span')[0];
            var checkout_subtotal_old=parseFloat(checkout_subtotal.innerText.substring(1));
            var checkout_subtotal_new=checkout_subtotal_old+(newVal-oldValue)*pro_subtotal_old;
            var checkout_subtotal_show="$"+checkout_subtotal_new.toFixed(2);
            checkout_subtotal.innerHTML=checkout_subtotal_show;
        }
    }

    //购物车删除
    var pro_remove=document.getElementsByClassName('pro-remove');
    for (var i=0;i<pro_remove.length;i++){
        pro_remove[i].onclick=function () {
            var parent=this.parentNode.parentNode;
            parent.removeChild(this.parentNode);

            //更新总值
            var checkout_subtotal=document.getElementsByClassName('pro-checkout-subtotal')[0].getElementsByTagName('span')[0];
            var checkout_subtotal_old=parseFloat(checkout_subtotal.innerText.substring(1));
            var remove_subtotal_string=this.parentNode.getElementsByTagName('td')[4].getElementsByTagName('span')[0].innerText;
            var remove_subtotal=parseFloat(remove_subtotal_string.substring(1));
            var checkout_subtotal_new=checkout_subtotal_old-remove_subtotal;
            var checkout_subtotal_show="$"+checkout_subtotal_new.toFixed(2);
            checkout_subtotal.innerHTML=checkout_subtotal_show;
        }
    }

}

//结算
function checkout() {
    var checkout_subtotal=document.getElementsByClassName('pro-checkout-subtotal')[0].getElementsByTagName('span')[0];
    var checkout_subtotal_old=parseFloat(checkout_subtotal.innerText.substring(1));
    var message="确定结算? 共计$"+checkout_subtotal_old;
    var user_confirm=confirm(message);


    if(user_confirm==true)
    {
        //订单信息
        var order_detail="";
        var order_product_class=document.getElementsByClassName("pro-title");
        var order_product_list=[];
        for (var i=1;i<order_product_class.length-1;i++){
            order_product_list[i-1]=order_product_class[i].innerText;
        }

        var order_product_num_class=document.getElementsByClassName('pro-qty');
        var order_product_num=[];
        for (var i=0;i<order_product_num_class.length;i++){
            order_product_num[i]=order_product_num_class[i].getElementsByTagName('input')[0].value;
            order_detail+=order_product_list[i]+" × "+order_product_num[i]+" ; ";
        }
        order_detail=order_detail.substring(0,order_detail.length-3);
        console.log("message",order_detail);
        localStorage.setItem("order_detail",order_detail);
        localStorage.setItem("order_subtotal",checkout_subtotal_old);

        window.location.href="orders.html";
    }
    else if(user_confirm==false){}

}

function stringToJson(stringValue)
{
    eval("var theJsonValue = "+stringValue);
    return theJsonValue;
}