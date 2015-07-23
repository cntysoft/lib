/*
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
Ext.define('Cntysoft.Component.ImagePreview.View', {
   extend : 'Ext.tip.ToolTip',
   requires : [
      'Cntysoft.Component.ImagePreview.Lang.zh_CN'
   ],
   mixins : {
      langTextProvider : 'Cntysoft.Mixin.LangTextProvider'
   },
   /**
    * @inheritdoc
    */
   LANG_NAMESPACE : 'Cntysoft.Component.ImagePreview.Lang',
   /**
    * 已经加载的图片的id池，判断某个图片是否加载
    *
    * @property {Ext.util.HashMap} imagePool
    */
   imagePool : null,

   LANG_TEXT : null,
   trackMouse : false,
   constructor : function(config)
   {
      this.mixins.langTextProvider.constructor.call(this);
      this.LANG_TEXT = this.GET_ROOT_LANG_TEXT();
      this.imagePool = new Ext.util.HashMap();
      this.applyConstraintConfig(config);
      this.callParent([config]);
   },
   applyConstraintConfig : function(config)
   {
      Ext.apply(config,{
         autoHide : false,
         loadingMsgEl : null,
         maxWidth : 500,
         maxHeight : 1000
      });
   },
   initComponent : function()
   {
      this.addListener({
         hide : this.tipHideHandler,
         scope : this
      });
      this.callParent();
   },
   /**
    * 加载图片文件
    */
   loadImage : function(url, x, y)
   {
      if(this.rendered){
         /**
          * 有些图片的名称都是数字，会出错误
          */
         var id = url.replace(/[^A-Za-z0-9]/ig, '')+this.el.id;
         if(this.imagePool.containsKey(id)){
            if(this.imagePool.get(id)){
               //已经加载好， 可以进行显示了
               this.showImage(id, x, y);
               return;
            } else{
               this.showLoadingMsg();
               return;
            }
         }
         this.showLoadingMsg();
         var image = new Ext.dom.Element(Ext.DomHelper.createDom({
            tag : 'img',
            id : id,
            src : url,
            style : 'display:none;float:left'
         }));
         this.imagePool.add(id, false);
         image.addListener('load', function(e, html){
            this.imagePool.replace(id, Ext.get(html));
            var width = html.width;
            var height = html.height;
            if(width > this.maxWidth){
               //计算比例
               html.width = this.maxWidth;
               html.height = this.maxWidth * (height / width);
            }
            this.showImage(id, x, y);
         }, this);
         this.el.first().appendChild(image);
      } else{
         this.addListener('afterrender', function(){
            this.loadImage(url);
         }, this, {
            single : true
         });
         this.showAt([x, y]);
      }
   },
   /**
    * 显示指定ID的图片
    *
    * @param {String} id
    */
   showImage : function(id, x, y)
   {
      this.loadingMsgEl.setStyle('display', 'none');
      this.imagePool.each(function(key, value){
         if(Ext.isObject(value)){
            if(id == key){
               value.setStyle('display', 'block');
               //每次都读DOM是不是不太好
               //为什么4.2要加上这12像素呢？难道是dom结构变化了？
               this.setSize(value.dom.width, value.dom.height + 12);
            } else{
               value.setStyle('display', 'none');
            }
         }
      }, this);
      this.showAt([x, y]);
   },
   /**
    * 显示加载提示信息
    */
   showLoadingMsg : function()
   {
      this.loadingMsgEl.setStyle('display', 'block');
      this.show();
   },
   tipHideHandler : function()
   {
      this.imagePool.each(function(key, value){
         if(Ext.isObject(value)){
            value.setStyle('display', 'none');
         }
      }, this);
      this.loadingMsgEl.setStyle('display', 'block');
      this.setSize(100, 30);
   },
   //private
   afterRender : function()
   {
      this.callParent();
      //增加一个语句提示的el
      var el = this.el;
      this.loadingMsgEl = Ext.get(Ext.DomHelper.createDom({
         tag : 'span',
         html : this.LANG_TEXT.LOADING,
         style : 'display:hidden'
      }));
      //蛋疼
      el.first().first().setDisplayed('none');
      el.first().appendChild(this.loadingMsgEl);
   },
   destroy : function()
   {
      delete this.loadingMsgEl;
      delete this.LANG_TEXT;
      this.imagePool.each(function(key, value){
         if(Ext.isObject(value)){
            value.remove();
         }
      }, this);
      this.imagePool.clear();
      this.imagePool = null;
      delete this.imagePool;
      this.callParent();
   }
});