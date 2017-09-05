/**
 * Created by Administrator on 2017/2/27.
 */
$(function(){
    $.get("/getAllTypes",null,function (data) {
        if(data.length>0){
            $.each(data,function(index,item){
                $("#tid").append($("<option value='"+item.tid+"'>"+item.tname+"</option>"));
            });
        }else{
            $("#tid").append($("<option>暂无数据</option>"));
        }
    });
});

//添加商品信息
function addGoods() {
    var tid=$("#tid").val();
    var pname=$("#pname").val();
    var price=$("#price").val();

    $.ajaxFileUpload({
        url:"/addGoods",
        fileElementId:"pic",
        data:{tid:tid,pname:pname,price:price},
        dataType:"json",
        success:function (data,status) {
            if(data.code==1){
                $("#pname").val("");
                $("#price").val("");
                $("#pic").file=null;
                alert("添加成功");
                location.reload();
            }
        },
        error:function(data,status,e){
            console.log(e);
        }
    })
}

//显示所有数据
function showGoodsInfo(){
    $.get("/showGoodsInfo",null,function (data) {
        if(data=="0"){
            alert("网络连接失败，请自行了断");
        }else{
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
                str+="<tr>" +
                    "<td>"+picstr+"</td>" +
                    "<td>"+item.gid+"</td>" +
                    "<td>"+item.gname+"</td>" +
                    "<td>"+item.price+"</td>" +
                    "<td>"+item.tname+"</td>" +
                    "</tr>";
                picstr="";
            });
            $("#showGoodsInfo").html(str);
        }
    })
}