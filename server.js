/*Created by Administrator on 2017/2/26.*/

//注销：req.uer.uname=undefined或空也可以
var express=require("express");
//加载cookie
var cookieParser=require("cookie-parser");
//下载插件，并加载插件
var session=require("express-session");  //session模块
var mysql=require("mysql");
var bodyParser=require("body-parser");
var multer=require("multer");   //文件上传
var fs=require("fs");          //文件上传系统模块

//创建web程序入口

var app=express();
app.use(cookieParser());

//配置
app.use(bodyParser.urlencoded({extended:true}));    //配置bodyParser

var upload=multer({dest:"./pic"});   //指定上传文件的路径


//第二步，配置session
app.use(session({
    secret:"keyboard cat",  //私密id，一个session
    resave:true,
    saveUninitialized:true,
    cookie:{secure:false},    //https协议 https比http更加安全
    cookie:{maxAge:1000*60}
}));
var pool=mysql.createPool({    //数据连接池
    host:"127.0.0.1",
    port:3306,
    database:"goods",
    user:"root",
    password:"aaaa"
});


//后台界面的安全验证
app.all("/back/*",function (req,res,next) {
    if(req.session.user==undefined){
        //说明没有登录过
        res.send("<script>alert('请先登录');location.href='/index.html'</script>");
    }else{
        next();
    }
})


//判断用户是否登录
app.get("/userIsLogin",function(req,res){
    if(req.session.user==undefined){
        //说明没有登录过
        res.send("0");
    }else{
        res.send(req.session.user.aname);
    }

})

//判断注册的时候用户名是否已经被注册
app.post("/checkUserName",function(req,res){
    var uname=req.body.uname;
    pool.getConnection(function(err,conn){
        conn.query("select * from adminInfo where aname=?",[uname],function(err,result){
            //西放连接池
            if(err){
                console.log(err);
                res.send("0");
            }else if(result.length<=0){
                //查不到信息，意味着可以注册
                res.send("1");
            }else if(result.length>0){
                //意味着有值，不能注册
                res.send("2");
            }
        })
    })
});

//用户开始注册
app.post("/userRegister",function(req,res){
    var uname=req.body.uname;
    var pwd=req.body.pwd;
    pool.getConnection(function(err,conn){
        conn.query("insert into adminInfo values(null,?,?)",[uname,pwd],function(err,result){
           // console.log(result);
            if(err){
                console.log(err);
                res.send("0");
            }else{
                res.send("1");  //注册成功
            }
        });
    });
});


//用户开始登陆
app.post("/userLogin",function(req,res){
    var uname=req.body.uname;
    var pwd=req.body.pwd;
    pool.getConnection(function(err,conn){
        conn.query("select * from adminInfo where aname=? and pwd=?",[uname,pwd],function(err,result){
            conn.release();
           // console.log(result);
            if(err){
                console.log(err);
                res.send("0");
            }else if(result.length<=0){
                res.send("1");  //用户名或密码错误
            }else{
                //存session
                req.session.user=result[0];
                res.send("2");  //登陆成功
            }
        });
    });
});


/***********************开始进行后台业务逻辑**************************/
//首先获取所有的商品类别
app.get("/getAllTypes",function (req,res) {
    pool.getConnection(function(err,conn){
        conn.query("select * from goodsType where status=1",[],function(err,result){
            if(err){
                console.log(err);
                res.send("0");
            }else{
                res.send(result);
            }
        });
    });
});

//添加商品类别
app.post("/addGoodsType",function(req,res){
    var tname=req.body.tname;
    pool.getConnection(function (err,conn) {
        conn.query("select * from goodsType where tname=?",[tname],function(err,result){
            if(result.length<=0){
                conn.query("insert into goodsType values(null,?,1)",[tname],function (err,resu) {
                    conn.release();
                    if(err){
                        res.send("1");
                    }else{
                        res.send("2");
                    }
                });
            }else if(result.length>0){
                if(result[0].status==0){
                    //说明原先有， 但是删除了，再次添加就还原
                    conn.query("update goodsType set status=1 where tname=?;",[tname],function (err,result) {
                        if(err){
                            console.log(err);
                            res,send("1");
                        }else{
                            res.send("2")
                        }
                    });
                }else{
                    res.send("1");
                }
            }
        })
    })
})


//删除商品类别
app.post("/delGoodsType",function(req,res){
    var tid=req.body.tid;
    pool.getConnection(function(err,conn){
        conn.query("update goodsType set status=0 where tid=?;",[tid],function(err,result){
            if(err){
                console.log(err);
                res.send("0");
            }else{
                res.send("1");
            }
        });
    });
});

//添加商品信息
app.post("/addGoods",upload.array("pic"),function(req,res){
    var pname=req.body.pname;
    var price=req.body.price;
    var tid=req.body.tid;
    var msg={};
    pool.getConnection(function(err,conn){
        if(req.files!=undefined){
            var file;
            var fileName;
            var filePath="";
            for(var i in req.files){
                file=req.files[i];
                fileName=new Date().getTime()+"_"+file.originalname;
                fs.renameSync(file.path,__dirname+"/pic/"+fileName);
                if(filePath!=""){
                    filePath+=",";
                }
                filePath+="/pic/"+fileName;
            }
        }
        conn.query("insert into goodsInfo values(null,?,?,?,?)",[pname,price,filePath,tid],function (err,result) {
            conn.release();
            if(err){
                console.log(err);
                msg.code=0;
                msg.msg="数据库错误";
                res.send(msg);
            }else{
                msg.code=1;
                msg.msg="添加成功";
                res.send(msg);
            }
        })
    })
})

//显示所有数据
app.get("/showGoodsInfo",function(req,res){
    pool.getConnection(function (err,conn) {
        conn.query("select g.*,t.tname from goodsInfo g,goodsType t where g.tid=t.tid",
            function(err,result){
            conn.release();
                if(err){
                    console.log(err);
                    res.send("0");
                }else{
                    res.send(result);
                }
        });
    })
});

//根据分页查询商品信息
app.post("/getGoodsInfoByPage",function (req,res) {
    var pageNo=Number(req.body.pageNo);
    var pageSize=Number(req.body.pageSize);
    if(pageNo<=0){
        pageNo=1;
    }

    pool.getConnection(function (err,conn) {
        conn.query("select g.*,t.tname from goodsInfo g,goodsType t where g.tid=t.tid limit ?,?"
            ,[(pageNo-1)*pageSize,pageSize],function (err,result) {
                conn.release();
                if(err){
                    console.log(err);
                    res.send("0");
                }else{
                    res.send(result);
                }
            });
    })
});

//注销
app.get("/outLogin",function (req,res) {
    delete req.session.user;
    res.send("0");

});

//使用静态资源插件
app.use(express.static("../page"));   //这个page下面的所有的文件全部都使用静态资源管理


app.listen(80,function(err){
    if(err){
        console.log(err);
    }else{
        console.log("服务器启动成功");
    }

})