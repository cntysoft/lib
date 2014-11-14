/**
 * Cntysoft OpenEngine
 *
 * @author SOFTBOY <cntysoft@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 上传组件表格类定义
 */
Ext.define('Cntysoft.Component.Uploader.QueueView', {
   extend : 'Ext.grid.Panel',
   alias : 'widget.cmpuploaderqueueview',
   requires : [
      'Cntysoft.Kernel.StdPath',
      'Cntysoft.Component.Uploader.Core',
      'Cntysoft.Stdlib.Common',
      'SenchaExt.Tip.ErrorToolTip'
   ],
   mixins : {
      langTextProvider : 'Cntysoft.Mixin.LangTextProvider'
   },
   /**
    * @inheritdoc
    */
   LANG_NAMESPACE : 'Cntysoft.Component.Uploader.Lang',
   /**
    * swf上传核心
    *
    * @param {Cntysoft.Component.Uploader.Core} uploader
    */
   uploader : null,
   tooltip : null,
   /**
    * @protected {Object} LANG_TEXT
    */
   LANG_TEXT : null,
   /**
    * 上下文菜单对象
    *
    * @property {Ext.menu.Menu} contextMenu
    */
   contextMenu : null,
   /**
    * 构造函数
    *
    * @param {Object} config
    */
   constructor : function(config)
   {
      config = config || {};
      this.LANG_TEXT = this.GET_LANG_TEXT('QUEUE_VIEW');
      var COLS_TEXT = this.LANG_TEXT.COLS;
      Ext.apply(config, {
         header : false,
         columns : [
            {text : COLS_TEXT.NAME, dataIndex : 'name', flex : 1, resizable : false, sortable : false, menuDisabled : true},
            {text : COLS_TEXT.SIZE, dataIndex : 'size', resizable : false, sortable : false, menuDisabled : true, renderer : Ext.bind(this.sizeRenderer, this)},
            {text : COLS_TEXT.STATUS, dataIndex : 'status', resizable : false, sortable : false, menuDisabled : true, renderer : Ext.bind(this.statusRenderer, this)}
         ],
         emptyText : this.LANG_TEXT.EMPTY_TEXT,
         store : this.createUploaderQueueStore()
      });
      if(!(config.uploader instanceof Cntysoft.Component.Uploader.Core)){
         Ext.Error.raise({
            cls : Ext.getClassName(this),
            msg : 'config.uploader must be instance of Cntysoft.Component.Uploader.Core',
            method : 'constructor'
         });
      }
      this.callParent([config]);
      this.setupUploader();
   },
   initComponent : function()
   {
      this.addListener('afterrender', function(){

         var view = this.getView();
         this.tooltip = Ext.create('Ext.tip.ToolTip', {
            target : view.el,
            delegate : view.itemSelector,
            trackMouse : true,
            renderTo : Ext.getBody(),
            listeners : {
               beforeshow : function(tip){
                  var F_STATUS = Ext.getClass(this.uploader).FILE_STATUS;
                  var record = view.getRecord(tip.triggerElement);
                  if(record.get('status') == F_STATUS.ERROR){
                     console.log(record);
                     tip.update('<span style = "color:red">' + record.get('errorMsg') + '</span>');
                  }else{
                     return false;
                  }
               },
               scope : this
            }
         });
      }, this);
      this.addListener({
         itemcontextmenu : this.itemContextMenuHandler,
         scope : this
      });
      this.callParent();
   },
   /**
    * 显示可读的文件大小信息
    */
   sizeRenderer : function(value)
   {
      return Cntysoft.Stdlib.Common.byteFormat(value);
   },
   /**
    * 状态信息渲染器
    */
   statusRenderer : function(value)
   {
      var MAP = this.LANG_TEXT.STATUS_MAP;
      return MAP[value];
   },
   /**
    * 创建上传组件数据仓库
    *
    * @return {Ext.data.Store}
    */
   createUploaderQueueStore : function()
   {
      return new Ext.data.Store({
         autoLoad : true,
         fields : [
            {name : 'id', type : 'string', persist : false},
            {name : 'name', type : 'string', persist : false},
            {name : 'size', type : 'integer', persist : false},
            {name : 'status', type : 'string', persist : false},
            {name : 'errorMsg', type : 'string', persist : false}
         ]
      });
   },
   /**
    * @return {Ext.menu.Menu}
    */
   getContextMenu : function()
   {
      if(null == this.contextMenu){
         this.contextMenu = new Ext.menu.Menu({
            ignoreParentClicks : true,
            items : [{
               text : this.LANG_TEXT.MENU.REMOVE
            }],
            listeners : {
               click : this.menuItemClickHandler,
               scope : this
            }
         });
      }
      return this.contextMenu;
   },
   menuItemClickHandler : function(menu, item)
   {
      if(item){
         this.uploader.removeFile(menu.record.get('id'));
         this.store.remove(menu.record);
      }
   },
   itemContextMenuHandler : function(grid, record, htmlItem, index, event)
   {
      var menu = this.getContextMenu(record);
      menu.record = record;
      var pos = event.getXY();
      event.stopEvent();
      menu.showAt(pos[0], pos[1]);
   },
   /**
    * 设置swfuploader 绑定相关事件处理函数
    */
   setupUploader : function()
   {
      this.uploader.addListener({
         filequeued : this.fileQueuedHandler,
         uploadsuccess : this.uploadSuccessHandler,
         uploadstart : this.uploadStartHandler,
         uploaderror : this.uploadErrorHandler,
         cancelupload : this.cancelUploadHandler,
         uploadcomplete : this.uploadCompleteHandler,
         scope : this
      });
   },
   uploadErrorHandler : function(file, errorInfo)
   {

      var store = this.getStore();
      var r = store.findRecord('id', file.id);
      if(r){
         var E_MSG = this.LANG_TEXT.ERROR_MSG;
         var errorCode = errorInfo.errorCode;
         var msg = errorInfo.msg;;
         if(E_MSG.hasOwnProperty(errorCode)){
            msg = Ext.String.format(E_MSG[errorCode], file.name);
         }
         r.set('status', file.getStatus());
         //设置错误信息
         r.set('errorMsg', msg);
      }
   },
   uploadSuccessHandler : function(file)
   {
      var store = this.getStore();
      var r = store.findRecord('id', file.id);
      if(r){
         r.set('status', file.getStatus());
      }
   },
   cancelUploadHandler : function()
   {
      var S = Ext.getClass(this.uploader).FILE_STATUS;
      var status;
      this.store.each(function(record){
         status = record.get('status');
         if(status == S.INITED || status == S.QUEUED || status == S.PROGRESS){
            record.set('status', S.CANCELLED);
         }
      }, this);
      this.$_need_clear_queue_view = true;
   },
   uploadStartHandler : function(file)
   {
      var sel = this.getSelectionModel();
      var store = this.getStore();
      var r = store.findRecord('id', file.id);
      var S = Ext.getClass(this.uploader).FILE_STATUS;
      if(r){
         r.set('status', S.PROGRESS);
         sel.select(r);
      }
   },
   /**
    * 文件添加处理函数
    *
    * @param {Object} queueData
    */
   fileQueuedHandler : function(file, uploader)
   {
      var store = this.store;
      if(this.$_need_clear_queue_view){
         store.removeAll();
         this.$_need_clear_queue_view = false;
      }
      store.add({
         id : file.id,
         name : file.name,
         size : file.size,
         status : file.getStatus(),
         errorMsg : ''
      });
   },
   /**
    * 队列上传完成
    */
   uploadCompleteHandler : function()
   {
      this.$_need_clear_queue_view = true;
   },
   destroy : function()
   {
      if(this.contextMenu){
         this.contextMenu.destroy();
         delete this.contextMenu;
      }
      //自己添加的事件自己删除
      this.uploader.removeListener('filequeued', this.fileQueuedHandler, this);
      this.uploader.removeListener('uploadsuccess', this.uploadSuccessHandler, this);
      this.uploader.removeListener('uploadstart', this.uploadStartHandler, this);
      this.uploader.removeListener('clearqueue', this.clearQueueHandler, this);
      delete this.uploader;
      this.$_need_clear_queue_view = false;
      delete this.LANG_TEXT;
      if(this.tooltip){
         this.tooltip.destroy();
         delete this.tooltip;
      }
      this.callParent();
   }
});