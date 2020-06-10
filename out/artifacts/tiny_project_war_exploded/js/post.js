// 测试post
function post(url) {
    var Ajax = {
        get: function (url) {
            // XMLHttpRequest对象用于在后台与服务器交换数据
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                // readyState == 4说明请求已完成
                if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                    // 从服务器获得数据
                    // fn.call(this, xhr.responseText);
                    console.log(xhr.responseText);
                    return xhr.responseText;
                }
            };
            xhr.send();
        },
        // datat应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
        post: function (url, data) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            // 添加http头，发送信息至服务器时内容编码类型
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                    // fn.call(this, xhr.responseText);
                }
            };
            xhr.send(data);
        }
    }
    // Ajax.post("test","problem=Sale&testMethod=BoundaryTest");
    // Ajax.get("test?title=1&price=2&quantity=1&subtotal=1");
    Ajax.get(url);
};
