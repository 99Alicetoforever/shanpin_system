/**
 * Created by Administrator on 2017/2/26.
 */
//每次进来之前，都应该判断用户到底有没有登录过，如有，则显示可以进入管理界面
var flagzc=false;
$(function(){
  userIsLogin();   //判断用户是否登录
   /* if(flag!=0){
        //已经登录了，那么就显示所有的信息
        getGoodsInfoByPage(1,7)
    }*/
    getGoodsInfoByPage(1,7);

});

//分页查询
function getGoodsInfoByPage(pageNo,pageSize) {
    //console.log("进来了吗");
    $.post("/getGoodsInfoByPage",{pageNo:pageNo,pageSize:pageSize},function(data){
        if(data=="0"){
            alert("网络连接失败，请稍后重试");
        }else{
            console.log(data);
            var str="";
            var pic;
            var pics;
            var picstr="";
            $.each(data,function(index,item) {
                //判断是单张图片，还是多张图片
                pics=item.pic;
                if(pics.indexOf(",")!=-1){
                    pic=pics.split(",");
                    for(var i=0;i<pic.length;i++){
                        picstr+="<img src='.."+pic[i]+"' width='100px' height='100px' />";
                    }
                }else{
                    picstr+="<img src='.."+pics+"' width='100px' height='100px' />";
                }
                str+="<li><dl>" +
                    "<dt>"+picstr+"</dt>" +
                    "<dd class='goods_price'>商品价格："+item.price+"</dd>" +
                    "<dd class='goods_price'>商品名称："+item.gname+"</dd>" +
                    "<dd class='goods_price'>商品类型:"+item.tname+"</dd>" +
                    "</dl></li>";
                picstr="";
            });
            console.log(str);
            $("#goodsInfo").html(str);
        }
    });
}


function userIsLogin(){
    //发请求给服务器，访问session里面的值，如有，则返回
    $.get("/userIsLogin",null,function(data){
        var str='';
        if(data!="0"){
            //登录过，header里面的东西就要切换
            str+='尊敬的会员:<a href="">['+data+']</a>&nbsp;您好！&nbsp;&nbsp;&nbsp;'+
                    '<a href="javascript:userOutLogin()">[注销]</a>&nbsp;&nbsp;'+
                    '<a href="back/goods.html">[后台管理]</a>';
        }else{
            str+='<a href="javascript:showLogin()">[请先登录]</a>'+
                    '<a href="javascript:showRegister()">[立即注册]</a>';
        }
        $("header").html(str);

    });
   // return data;
}

//验证用户名是否重名
function checkInfos(obj,tabname,colName){
    //取这个input标签的值
    var uname=obj.value;
    if(uname!=""&& uname!=null){
        //发请求
        $.post("/checkUserName",{uname:uname},function(data){
            if(data=="0"){
                //意味着未知错误
                $("#zcunamep").html("网络连接失败，请稍后重试");
                flagzc=false;
            }else if(data=="1"){
                //可以
                $("#zcunamep").html("用户名验证成功").css("color","green");
                flagzc=true;
            }else if(data=="2"){
                $("#zcunamep").html("该用户名已经被注册，，，").css("color","red");
                flagzc=false;
            }
        });
    }
}

//用户注册
function userzc(){
    var uname=$("#zcuname").val();
    var pwd=$("#zcpwd").val();
    var repwd=$("#zcpwdagain").val();

    if(flagzc && pwd==repwd){
        //发请求
        $.post("./userRegister",{uname:uname,pwd:pwd},function(data){
            if(data=="0"){
                alert("网络连接失败");
            }else if(data=="1"){
                hidenzcpage();
                showLogin();
            }
        });
    }else{
        alert("信息有唔，请重新输入");
    }
}


//用户登录
function userlogin(){
    var uname=$("#uname").val();
    var pwd=$("#pwd").val();
       $.post("./userLogin",{uname:uname,pwd:pwd},function(data){
            if(data=="0"){
                alert("网络连接失败,请自行了断");
            }else if(data=="1"){
               alert("用户名或密码错误");
            }else if(data=="2"){
                hidenloginpage();
                var str='';
                str+='尊敬的会员:<a href="">['+uname+']</a>&nbsp;您好！&nbsp;&nbsp;&nbsp;'+
                    '<a href="javascript:userOutLogin()">[注销]</a>&nbsp;&nbsp;'+
                    '<a href="back/goods.html">[后台管理]</a>';
                $("header").html(str);
                //查数据，显示到界面里面
                //showInfo();
                location.reload();
            }
        });

}

//退出登录
function userOutLogin() {

        $.ajax({
          url:"./outLogin",
             success:function (resu) {
                if(!resu.code){
                    window.location.reload();
                }
            }
        });

}





//打开登录窗口
function showLogin(){
    $("#uname").val("");
    $("#pwd").val("");
    $("#loginpages").mywin({left:"center",top:"center"});
    $("#zcpages").hide();
    $(".bg").fadeIn("200","linear");
}

//关闭层
function hidenloginpage(){
    $("#loginpages").hide();
    $(".bg").fadeOut();
}

//打开注册窗口
function showRegister(){
    $("#zcuname").val("");
    $("#zcpwd").val("");
    $("#zcpwdagain").val("");
    $("#zcpages").mywin({left:"center",top:"center"});
    $("#loginpages").hide();
    $(".bg").fadeIn("200","linear");
    $("#registertishi").html("");
}

//关闭注册窗口
function hidenzcpage(){
    $("#zcpages").hide();
    $(".bg").fadeOut();
}