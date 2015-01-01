/*
 * Cntysoft Cloud Software Team
 * 
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 模板选择器窗口
 */
Ext.define('Cntysoft.Component.TplSelect.Win', {
   extend: 'Ext.window.Window',
   requires: [
      'Cntysoft.Component.FsView.GridView',
      'Cntysoft.Component.TplSelect.Lang.zh_CN'

   ],
   mixins : {
      langTextProvider : 'Cntysoft.Mixin.LangTextProvider'
   },
   fsView: null,
   /**
    * @inheritdoc
    */
   LANG_NAMESPACE : 'Cntysoft.Component.TplSelect.Lang',
   /**
    * @event tplfileselected
    *
    * 模板选择完成
    *
    * @param {String} filename
    */
   constructor : function(config)
   {
      config = config || {};
      this.applyConstraintConfig(config);
      this.callParent([config]);
   },

   applyConstraintConfig : function(config)
   {
      Ext.apply(config, {
         title : this.GET_LANG_TEXT('TITLE'),
         maximizable : false,
         resizable : false,
         modal : true,
         height : 350,
         minHeight : 350,
         width : 1100,
         minWidth : 1100,
         bodyStyle : 'background:#ffffff',
         valueTarget : null,
         closeAction : 'hide',
         bodyPadding : 1,
         layout : 'fit',
         constrain : true,
         constrainTo : Ext.getBody()
      });
   },

   initComponent : function()
   {
      var me = this;
      if(Ext.isString(this.startPaths)){
         this.startPaths = [this.startPaths];
      }
      Ext.apply(this, {
         items : {
            xtype : 'cmpgridfsview',
            startPaths : this.startPaths,
            allowMutiSelect : false,
            listeners : {
               afterrender : function(view)
               {
                  this.fsViewRef = view;
               },
               beforeitemcontextmenu : function(){
                  return false;
               },
               beforeselect : this.beforeSelectHandler,
               scope : this
            },
            /**
             * 覆盖默认修改的行为
             */
            itemDblClickHandler : function(view, record)
            {
               var type = record.get('type');
               var isStart = record.get('isStartup');
               var path;
               //判断是否选中
               if(type == 'dir'){
                  //判断是否是目录
                  if(isStart){
                     //开始的时候路径在record里面获取
                     path = record.get('startupPath');
                  } else{
                     path = this.path + '/' + record.get('rawName');
                  }
                  this.cd(path);
               } else{
                  var type = record.get('type');
                  if(('html' == type || 'phtml' == type) && me.hasListeners.tplfileselected){
                     me.fireEvent('tplfileselected', record.get('path') + '/' + record.get('rawName'));
                  }
                  me.close();
               }
            }
         },
         buttons : this.getBtnConfig()
      });
      this.addListener({
         close : this.closeHandler,
         scope : this
      });
      this.callParent();
   },
   /**
    * 主要防止选择中的不是模板文件，模板文件后缀一般由系统决定
    */
   beforeSelectHandler : function(fsView, record, event)
   {
      var type = record.get('type');
      if('html' != type && 'phtml' != type){
         return false;
      }
      return true;
   },
   closeHandler : function()
   {
      this.fsViewRef.cd2InitDir();
   },

   selectTplHandler : function()
   {
      var records = this.fsViewRef.getSelectedItems();
      var record;
      if(0 == records.length) {
         Cntysoft.showErrorWindow(this.GET_LANG_TEXT('SELECT_EMPTY_TPL'));
         return;
      }
      record = records.shift();
      if(this.hasListeners.tplfileselected){
         this.fireEvent('tplfileselected', record.get('path') + '/' + record.get('rawName'))
      }
      this.close();
   },

   getBtnConfig : function()
   {
      var BTN_TEXT = Cntysoft.GET_LANG_TEXT('UI.BTN');
      return [{
         text : BTN_TEXT.OK,
         listeners : {
            click : this.selectTplHandler,
            scope : this
         }
      }, {
         text : BTN_TEXT.CANCEL,
         listeners : {
            click : function()
            {
               this.close();
            },
            scope : this
         }
      }
      ];
   },

   destroy : function()
   {
      delete this.valueTarget;
      delete this.fsViewRef;
      this.callParent();
   }
});