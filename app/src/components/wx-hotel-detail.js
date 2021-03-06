var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXHotelDetail = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            sliderData:[],
            payload:[],
            baseUrl:'',
            totalCount:0,
            currentCard:0,
            scrollTop:0,
            isMenuRender:true
        };
    },
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    componentWillMount:function(){
        var self = this;

        var fetchData = function(url){
            return Api.httpGET(url,{});
        };

        fetchData(self.getPath().substr(1))
            .done(function(payload){
                //console.log(payload.data);
                (payload.code === 200) &&
                self.setState({
                    payload:payload.data[0]
                },function(){
                    window.historyStates.states.push({});
                    $('#slider_box').length>0 && $('#slider_box').Slider({displayBtn:true,time:5000,device:'mobile'});
                });
            });

        //fetchData('adv/wx_hotel_top')
        //    .done(function(payload){
        //        //console.log(payload.data);
        //        (payload.code === 200) &&
        //        self.setState({
        //            sliderData:payload.data
        //        },function(){
        //            $('#slider_box').length>0 && $('#slider_box').Slider({displayBtn:true,time:5000,device:'mobile'});
        //        });
        //    });
    },

    //_clickBack : function(){
    //    var last;
    //    var $glob_back = $('#glob_detail_back');
    //
    //    window.historyStates.isBack = true;
    //    window.historyStates.states.pop();
    //    last = window.historyStates.states.length - 1;
    //    window.historyStates.states[last].isMenuRender = true;
    //    $glob_back.off('click');
    //
    //    window.history.back();
    //},

    componentDidMount: function() {
        var self = this;
        var $suite_view = $('#hotel_detail_view');
        var $slider_suite = $('#slider_hotel_detail');
        var $nav_conts = $('#nav_box .cont');
        var $discription_box = $('#discription_box');
        var $nav_box = $('#nav_box');
        var $list_dishes = $('#list_dishes');
        var $glob_back = $('#glob_detail_back');

        var winW = $(window).width();

        $slider_suite.height(2*winW/3);
        $nav_conts.each(function(i){
            $(this).bind('click',function(){
                $nav_conts.removeClass('current');
                $(this).addClass('current');
                $('.cont',$discription_box).removeClass('current');
                $($('.cont',$discription_box)[i]).addClass('current');
            });
        });

        $suite_view.bind('scroll',function(){
            $(this).scrollTop() > 105 + $slider_suite.height() && $nav_box.css({position:'fixed'}) || $nav_box.css({position:'static'});
        });

        $('#list_dishes').on('click','li',function(){
            var self = $(this);

            if(self.hasClass('list-item-3-current-wxjs')){
                self.removeClass('list-item-3-current-wxjs');
                return;
            }

            $('li',$list_dishes).removeClass('list-item-3-current-wxjs');
            self.addClass('list-item-3-current-wxjs');
        });

        window.historyStates.states.length >= 1 && $glob_back.css({display:'block'});
        $glob_back.on('click',function(){
            console.log('back');
            //self._clickBack();
        });
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;
        //var topSliderData = self.state.sliderData;
        var detailImagesList = pageData.wxDetailImages != undefined ? JSON.parse(pageData.wxDetailImages) : [];
        var lableDetail = pageData.lableDetail != undefined ? JSON.parse(pageData.lableDetail) : [];
        var setMealDetail = pageData.setMealDetail != undefined ? JSON.parse(pageData.setMealDetail) : [];
        var banquetList = pageData.banquetHall || [];
        //console.log(banquetList);

        var labelArr = {
            'YH':'优惠',
            'LB':'礼包',
            'ZK':'折扣'
        };

        return (
            <div className="hotel-detail-view" id='hotel_detail_view'>
                <div className="hotel-detail-banner responsive-box" id="slider_box">
                    <div id="slider_hotel_detail" className="slider-box slider-box-1-js responsive-box">
                        <ul className="slider">
                            {
                                $.map(
                                    detailImagesList
                                    ,function(v,i){
                                        return (
                                            <li className="item transition-opacity-1" key={i}>
                                                <ImageListItem
                                                    frameWidth={winWidth}
                                                    url={v}
                                                    errorUrl={'http://placehold.it/375x250'}
                                                    mask={true}
                                                    />
                                            </li>
                                        )
                                    })
                            }
                        </ul>
                        <div className='point-box'>
                            {
                                $.map(
                                    detailImagesList
                                    ,function(v,i){
                                        return (
                                            <i key={i} className='point'></i>
                                        )
                                    })
                            }
                        </div>
                    </div>
                </div>
                <div className='title-box mgb10 clearfix'>
                    <h1 className='title'>{pageData.name}</h1>
                    <h2 className='subtitle'>{''}</h2>
                    <div className='addr-score-box'>
                        <span className='addr'>{pageData.address}</span>
                        <div className='score' style={{display:'none'}}>
                            <div className='star-box'></div>
                            <div className='person'><span>14231</span><span>人评价</span></div>
                            <i></i>
                        </div>
                    </div>
                </div>
                <div className='info-box mgb10'>
                    <h2 className='detail-title'>酒店介绍</h2>
                    <div className='info'>
                        <p>
                            <b>规格类型：</b><span>{pageData.typeName}</span>
                        </p>
                        <p>
                            <b>价格：</b><span>{pageData.lowestConsumption + '-' + pageData.highestConsumption +'／桌'}</span>
                        </p>
                        <p>
                            <b>场厅数量：</b><span>{(pageData.banquetHallList || []).length + '个专用宴会厅'}</span>
                        </p>
                        <p>
                            <b>最大容客数：</b><span>{pageData.maxTableNum + '桌'}</span>
                        </p>
                        <p>
                            <b>所在地址：</b><span>{pageData.address}</span>
                        </p>
                        {
                            $.map(lableDetail || []
                                ,function(v,i){
                                    return (<p>
                                        <b>{labelArr[v.code] + '：'}</b><span>{v.description}</span>
                                    </p>)
                                })
                        }
                        <p>
                            <b>酒店详情：</b><span>{pageData.introduction}</span>
                        </p>
                    </div>
                </div>
                <div className='dishes-info-box mgb10'>
                    <h2 className='detail-title'>婚宴套系菜单</h2>
                    <ul className='list-dishes' id='list_dishes'>
                        {
                            $.map(setMealDetail || []
                                ,function(v,i){
                                    return (
                                        <li className='list-item-3-wxjs' key={i}>
                                            <a className='relative-box'>
                                                <span>{v.name}</span><b>{'（' + v.price + '／桌）'}</b><span className="arrow-1-js"><i className="transition"></i></span>
                                            </a>
                                            <div className='dishes clearfix'>
                                                <p style={{display:v.dishesList.length > 0 && 'none'}}>该酒店未提供菜肴，请以店谈为准</p>
                                                <dl>
                                                    {
                                                        $.map(
                                                            v.dishesList || [],
                                                            function(vv,ii){
                                                                return(
                                                                    <dd key={ii}>{'. ' + vv.name}</dd>
                                                                )
                                                            }
                                                        )
                                                    }
                                                </dl>
                                            </div>
                                        </li>
                                    )
                                })
                        }
                    </ul>
                </div>
                <div className='banquet-info-box'>
                    <h2 className='detail-title'>宴会厅介绍</h2>
                    <ul className='list-banquet'>
                        {
                            $.map(banquetList
                                ,function(v,i){
                                    return (
                                        <li className='list-item-4-wxjs' key={i}>
                                            <div className='img-box'>
                                                <ImageListItem
                                                    frameWidth={winWidth}
                                                    url={v.coverUrlWx}
                                                    sid={v.id}
                                                    detailBaseUrl={'banquetHall/detail'}
                                                    errorUrl={'http://placehold.it/375x250'}
                                                    />
                                            </div>
                                            <h3>{v.banquetHallName}</h3>
                                            <div className='info-box clearfix'>
                                                <span className='table-num'>{'桌数：' + v.maxTableNum + '桌'}</span>
                                                <span className='comsuption'>{'低消：' + v.lowestConsumption + '元／桌'}</span>
                                            </div>
                                        </li>
                                    )
                                })
                        }
                    </ul>
                </div>
                <div className='btn-fixed-bottom-box' style={{display:'none'}}>
                    <div className='btn'><span>预约查看场地</span></div><div className='btn'><span>查看联系方式</span></div>
                </div>
            </div>

        );
    }

});

module.exports = WXHotelDetail;
