/*
 * Cntysoft OpenEngine
 * 
 * @author SOFTBOY <cntysoft@163.com>
 * @author changwang <chenyongwang1104@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 图片对其方式
 */
Ext.define('Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Comp.ImageAlign',{
   extend : 'Ext.form.FieldContainer',
   layout : 'hbox',
   main : null,
   statics : {
       FLOAT_MAP : {
           NoneFocus : 'none',
           LeftFocus : 'left',
           RightFocus : 'right'
       }
   },
   /**
    * 图片的浮动值
    * 
    * @property {String} floatValue
    */
   floatValue : null,
   
   constructor : function(config)
   {
       this.callParent([config]);
   },
   initComponent : function()
   {
       var basePath = this.main.basePath;
       var types = Cntysoft.GET_COMP_LANG_TEXT('VENDER_EXT.CK.PLUGINS.IMAGE.COMP.IMAGE_ALIGN');
       
       var items = [];
       for(var type in types){
           items.push({
               xtype : 'component',
               key : type,
               autoEl : {
                   tag : 'img',
                    src : basePath + '/' + type + '.jpg',
                    width : 32,
                    height : 40,
                    title : types[type],
                    cls : 'ck-cnt-plugin-image-img-align',
                    key : type
               },
               margin : '0 5 0 0',
               listeners : {
                   afterrender : function(comp)
                   {
                       comp.el.addListener({
                           click : this.itemClickHandler,
                           scope : this
                       });
                   },
                   destroy : function(comp)
                   {
                       comp.el.removeListener('click', this.itemClickHandler, this);
                   },
                   scope : this
               }
           });
       }
       Ext.apply(this,{
          items : items 
       });
       this.addListener({
           afterrender : function()
           {
                this.selectType('NoneFocus');
           },
           scope : this
       });
       this.callParent();
   },
   /**
    * 选择图片浮动方式
    * 
    * @param {String} type
    */
   selectType : function(type)
   {
       var MAP = this.self.FLOAT_MAP;
       this.floatValue = MAP[type];
       this.items.each(function(item){
           if(item.key == type){
               item.addCls('ck-cnt-plugin-image-img-focus');
               item.removeCls('ck-cnt-plugin-image-img-blur');
           }else{
               item.addCls('ck-cnt-plugin-image-img-blur');
               item.removeCls('ck-cnt-plugin-image-img-focus');
           }
       }, this);
   },
   getValue : function()
   {
       return this.floatValue;
   },
   setValue : function(floatType)
   {
       var MAP = this.self.FLOAT_MAP;
       for(var type in MAP){
           if(floatType == MAP[type]){
               this.selectType(type);
               break;
           }
       }
   },
   itemClickHandler : function(event, img)
   {
       this.selectType(Ext.fly(img).getAttribute('key'));
   },
   reset : function()
   {
       this.selectType('NoneFocus');
   },
   destroy : function()
   {
       delete this.main;
       this.callParent();
   }
});