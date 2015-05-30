/**
 * Cntysoft OpenEngine
 *
 * @author Changwang <chenyongwang1104@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 简单按钮上传器， 这个上传器一次只能上传一个文件，不维护队列
 */
Ext.define('Cntysoft.Component.QiniuUploader.SimpleUploader', {
   extend : 'Cntysoft.Component.QiniuUploader.Core',
   alias : 'widget.cmpqiniusimpleuploader',
   requires : [
      'Cntysoft.Kernel.StdPath'
   ],
   /**
    * 上传提示信息显示的组件
    *
    * @property {Ext.Component} maskTarget
    */
   maskTarget : null,
   /**
    * 是否使用自带的错误提示
    *
    * @property {Boolean} useBuildInErrorHandler
    */
   useBuildInErrorHandler : true,
   applyConstraintConfig : function(config)
   {
      this.callParent(config);
      Ext.apply(config, {
         multi : false,
         queueSizeLimit : 1,
         autoStart : true,
         buttonText : this.LANG_TEXT.BROWSE
      });
   },
   initComponent : function()
   {
      this.addListener({
         uploadstart : this.startUploadFileHandler,
         uploaderror : this.uploadFileErrorHandler,
         uploadsuccess : this.uploadFileSuccessHandler,
         filequeuederror : this.fileQueuedErrorHandler,
         uploadprogress : this.uploadProgressHandler
      });
      this.callParent();
   },
   //千万不要覆盖父类的函数
   startUploadFileHandler : function()
   {
      if(this.maskTarget){
         this.maskTarget.setLoading(Cntysoft.GET_LANG_TEXT('MSG.UPLOADING'));
      }
   },
   fileQueuedErrorHandler : function(msg)
   {
      if(this.useBuildInErrorHandler){
         Cntysoft.showErrorWindow(msg);
      }
   },
   uploadFileErrorHandler : function(file, errorInfo, errorCode, uploader)
   {
      if(this.maskTarget){
         this.maskTarget.loadMask.hide();
      }
      if(200 === errorCode) {
         this.fireEvent('fileuploadsuccess', errorInfo, uploader);
      }else {
         if(this.useBuildInErrorHandler){
            Cntysoft.showErrorWindow(Ext.String.format(Cntysoft.GET_LANG_TEXT('ERROR.UPLOAD_ERR'), errorInfo.msg));
         }
      }
   },
   uploadFileSuccessHandler : function(file, data, uploader)
   {
      if(this.maskTarget){
         this.maskTarget.loadMask.hide();
      }
      //要提示吗？
      if(this.hasListeners.fileuploadsuccess){
         this.fireEvent('fileuploadsuccess', data, uploader);
      }
   },
   uploadProgressHandler : function(file, percent)
   {
      if(this.maskTarget){
         this.maskTarget.setLoading(Cntysoft.GET_LANG_TEXT('MSG.UPLOADING')+' '+parseInt(percent*100) + '%');
      }
   },
   destroy : function()
   {
      delete this.maskTarget;
      this.callParent();
   }
});