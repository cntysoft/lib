/**
 * Cntysoft OpenEngine
 *
 * @author SOFTBOY <cntysoft@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 上传组件窗口, 为WEBOS系统提供多文件上传服务
 */
Ext.define('Cntysoft.Component.QiniuUploader.Window', {
   extend : 'Ext.window.Window',
   alias : 'widget.cmpqiniuuploader',
   requires : [
      'Cntysoft.Kernel.StdPath',
      'Cntysoft.Stdlib.Common',
      'Cntysoft.Component.QiniuUploader.Core',
      'Cntysoft.Component.QiniuUploader.QueueView'
   ],
   mixins : {
      langTextProvider : 'Cntysoft.Mixin.LangTextProvider'
   },
   /**
    * @inheritdoc
    */
   LANG_NAMESPACE : 'Cntysoft.Component.Uploader.Lang',
   /**
    * uploader上传对象引用
    *
    * @protected
    * @property {Cntysoft.Component.uploader.Core} uploader
    */
   uploader : null,
   /**
    * 工具栏开始按钮对象引用
    *
    * @protected
    * @property {Ext.button.Button} startBtn
    */
   startBtn : null,
   /**
    * 工具栏取消按钮对象引用
    *
    * @protected
    * @property {Ext.button.Button} cancelBtn
    */
   cancelBtn : null,
   /**
    * 工具栏清除按钮对象引用
    *
    * @protected
    * @property {Ext.button.Button} cancelBtn
    */
   clearBtn : null,
   /**
    * 底部上传进度条对象
    *
    * @protected
    * @property {Ext.ProgressBar} progressBar
    */
   progressBar : null,
   /**
    * swfuploader上传核心支持配置信息， 详情可以查看 {@link Cntysoft.Component.Uploader.Core}
    *
    * @cfg {Object} uploaderConfig
    */
   uploaderConfig : {},
   /**
    * 构造函数， 必须传入初始的上传路径
    *
    * @param {Object} config
    */
   LANG_TEXT : null,
   /**
    * @property {Cntysoft.Component.Uploader.QueueView} queueView
    */
   queueView : null,
   constructor : function(config)
   {
      this.LANG_TEXT = this.GET_LANG_TEXT('WINDOW');

      if(!Ext.isDefined(config.initUploadPath) || '' == Ext.String.trim(config.initUploadPath)){
         Cntysoft.raiseError(Ext.getClassName(this), 'constructor', 'init upload path must be set');
      }
      if(!config.uploaderConfig){
         config.uploaderConfig = {};
      }
      Ext.apply(config.uploaderConfig,{
         uploadPath : config.initUploadPath
      });
      this.applyConstraintConfig(config);
      this.callParent([config]);

   },
   applyConstraintConfig : function(config)
   {
      Ext.apply(config, {
         width : 600,
         height : 300,
         resizable : false,
         title : this.LANG_TEXT.TITLE,
         constrainHeader : true,
         bodyStyle : {
            backgroundColor : '#ffffff'
         },
         layout : 'fit',
         closeAction : 'hide',
         modal : true
      });
   },
   /**
    * @event uploadcomplete
    * 这个事件在所有文件都上传完成之后派发， 不管是否有错误
    *
    * @param {Cntysoft.Component.Uploader} window
    */
   /**
    * @event fileuploadsuccess
    * 这个事件单个文件上传成功之后派发
    * 当启动文件引用追踪之后除了返回文件名称之外还有文件引用id
    *
    * @param {Object} data 上传成功返回的数据
    * @param {Cntysoft.Component.Uploader} window
    */
   /**
    * @event fileuploaderror
    * 这个事件在单个文件上传失败的时候派发
    *
    * @param {Object} file File对象
    * @param {String} reason 出错的code
    * @param {Cntysoft.Component.Uploader.Core} uploader
    */
   initComponent : function()
   {
      Ext.apply(this, {
         tbar : this.getTopBarConfig(),
         items : {
            xtype : 'cmpuploaderqueueview',
            style : 'border:1px solid #cccccc;border-right:none;border-left:none',
            uploader : this.getUploaderObject(),
            listeners : {
               afterrender : function(comp)
               {
                  this.queueView = comp;
                  comp.store.addListener({
                     remove : function(store)
                     {
                        if(store.getCount() ==  0){
                           this.startBtn.setDisabled(true);
                           this.clearBtn.setDisabled(true);
                        }
                     },
                     scope : this
                  });
               },
               scope : this
            }
         },
         dockedItems : this.getBottomBarConfig()
      });
      this.addListener('close', this.closeHandler,this);
      this.callParent();
   },
   /**
    * 改变上传路径, 这个路径设置是有要求的, 要通过 {@link Cntysoft.Component.SwfUploader.Core#checkUploadPath} 检查
    * 所有设置的目录都要以 {@link Cntysoft.Component.SwfUploader.Core#ALLOWED_PATH} 里面的路径为起点
    *
    * @param {String} path
    */
   changUploadPath : function(path)
   {
      var uploader = this.getUploaderObject();
      uploader.setUploadPath(path);
   },
   /**
    * 获取上传组建对象引用
    *
    * @return {Cntysoft.Component.Uploader.Core}
    */
   getUploaderObject : function()
   {
      if(this.uploader == null){
         this.uploader = new Cntysoft.Component.Uploader.Core(this.uploaderConfig);
         this.uploader.addListener({
            startupload : this.uploadStartHandler,
            filequeued : this.fileDialogCompleteHandler,
            uploadfinished : this.uploadFinishedHandler,
            uploadprogress : this.uploadProcessHandler,
            uploadsuccess : this.fileUploadSuccessHandler,
            uploaderror : this.fileUploadErrorHandler,
            filequeuederror : function(errorMsg){
               Cntysoft.showErrorWindow(errorMsg);
            },
            scope : this
         });
      }
      return this.uploader;
   },

   /**
    * 清除之后
    */
   closeHandler : function()
   {
      this.uploader.cancelUpload();
      this.clearHandler();
      this.startBtn.setDisabled(true);
   },
   /**
    * 清除队列回调函数
    *
    * @private
    */
   clearHandler : function()
   {
      var store = this.queueView.getStore();
      store.removeAll();
      this.uploader.cancelUpload();
      this.clearBtn.setDisabled(true);
   },
   /**
    * @private
    */
   uploadStartHandler : function()
   {
      var bar = this.progressBar;
      bar.updateText('0 % uploaded');
      if(bar.isHidden()){
         bar.show();
      }
   },
   /**
    * 上传进度处理函数
    *
    * @protected
    */
   uploadProcessHandler : function(file, percent)
   {
      var bar = this.progressBar;
      var value = percent;
      var percent = Math.ceil(percent * 100);
      bar.updateProgress(value, percent + ' % uploaded');
   },
   /**
    * 文件入队列事件处理
    */
   fileDialogCompleteHandler : function(file, uploader)
   {
      var files = uploader.getFiles();
      if(files.length > 0){
         this.startBtn.setDisabled(false);
         this.clearBtn.setDisabled(true);
      }
   },
   batchStartHandler : function()
   {
      if(this.uploader){
         this.uploader.setDisabled(true);
         this.uploader.startUpload();
         this.startBtn.setDisabled(true);
         this.cancelBtn.setDisabled(false);
      }
   },
   /**
    * 队列处理完成回调函数
    *
    * @private
    */
   uploadFinishedHandler : function(queueData)
   {
      this.cancelBtn.setDisabled(true);
      this.clearBtn.setDisabled(false);
      this.uploader.setDisabled(false);
      this.progressBar.updateText('0%');
      this.progressBar.reset();
      this.progressBar.hide();
      if(this.hasListeners.uploadcomplete){
         this.fireEvent('uploadcomplete', this);
      }
   },
   /**
    * 取消上传队列
    */
   batchCancelHandler : function()
   {
      if(this.uploader){
         this.uploader.cancelUpload();//不派发单独的取消事件
         this.cancelBtn.setDisabled();
         this.clearBtn.setDisabled(false);
      }
   },
   /**
    * 单个文件上传成功
    */
   fileUploadSuccessHandler : function(file, data)
   {
      if(this.hasListeners.fileuploadsuccess){
         this.fireEvent('fileuploadsuccess', data);
      }
   },
   /**
    * 单个文件上传失败
    */
   fileUploadErrorHandler : function(file, reason)
   {
      if(this.hasListeners.fileuploaderror){
         this.fireEvent('fileuploaderror', reason);
      }
   },
   getTopBarConfig : function()
   {
      var BTN_TEXT = this.LANG_TEXT.BTN;
      return [this.getUploaderObject(),{
         xtype : 'button',
         text : BTN_TEXT.START,
         listeners : {
            click : this.batchStartHandler,
            afterrender : function(btn)
            {
               this.startBtn = btn;
            },
            scope : this
         },
         disabled : true
      }, {
         xtype : 'button',
         text : BTN_TEXT.CANCEL_ALL,
         listeners : {
            click : this.batchCancelHandler,
            afterrender : function(btn)
            {
               this.cancelBtn = btn;
            },
            scope : this
         },
         disabled : true
      }, {
         xtype : 'button',
         text : BTN_TEXT.CLEAR,
         listeners : {
            click : this.clearHandler,
            afterrender : function(btn)
            {
               this.clearBtn = btn;
            },
            scope : this
         },
         disabled : true
      }];
   },
   getBottomBarConfig : function()
   {
      return {
         xtype : 'toolbar',
         layout : 'fit',
         dock: 'bottom',
         height : 35,
         items : {
            xtype : 'progressbar',
            hidden : true,
            listeners : {
               afterrender : function(bar)
               {
                  this.progressBar = bar;
               },
               scope : this
            }
         }
      };
   },
   destroy : function()
   {
      this.uploaderConfig = {};
      delete this.LANG_TEXT;
      delete this.progressBar;
      delete this.queueView;
      delete this.startBtn;
      delete this.cancelBtn;
      delete this.clearBtn;
      delete this.uploader;
      this.callParent();
   }
});