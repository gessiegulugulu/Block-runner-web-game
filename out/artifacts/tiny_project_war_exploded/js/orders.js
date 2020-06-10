window.onload=function () {
    var user_email=localStorage.getItem("user_email");
    if(localStorage.getItem("user_email")!=""){
        document.getElementById('login').innerHTML=user_email;
    }
    else{
        document.getElementById('login').innerHTML="登录";
    }

    //结算加入order
    var order_table_list=document.getElementsByClassName("orders-content-product-table")[0].getElementsByTagName('td');
    //订单序号
    var order_num=parseInt(order_table_list[0].innerText)+1;
    //订单时间
    var mydate = new Date();
    var order_time=mydate.toLocaleString();
    //订单信息
    var order_detail=localStorage.getItem("order_detail");
    //订单金额
    var order_subtotal=localStorage.getItem("order_subtotal");
    console.log(order_detail,order_subtotal);

    var order_add=document.getElementsByClassName("orders-content-product-table")[0].getElementsByTagName('tbody')[0];
    var newItem=document.createElement("tr");
    var td1=document.createElement("td");
    var td2=document.createElement("td");
    var td3=document.createElement("td");
    var td4=document.createElement("td");
    td1.innerHTML=order_num;
    td2.innerHTML=order_time;
    td3.innerHTML=order_detail;
    td4.innerHTML="$"+order_subtotal;
    newItem.appendChild(td1);
    newItem.appendChild(td2);
    newItem.appendChild(td3);
    newItem.appendChild(td4);
    order_add.insertBefore(newItem,order_add.childNodes[0]);



}