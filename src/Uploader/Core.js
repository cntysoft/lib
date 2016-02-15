/*
 * Cntysoft OpenEngine
 *
 * @author SOFTBOY <cntysoft@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 整合百度flash上传器
 */
Ext.define('Cntysoft.Component.Uploader.Core', {
   extend : 'Ext.Component',
   alias : 'widget.cmpuploadercore',
   requires : [
      'Cntysoft.Kernel.StdPath',
      'Cntysoft.Component.Uploader.Lang.zh_CN'
   ],
   mixins : {
      langTextProvider : 'Cntysoft.Mixin.LangTextProvider'
   },
   /**
    * @inheritdoc
    */
   LANG_NAMESPACE : 'Cntysoft.Component.Uploader.Lang',
   inheritableStatics : {
      ALLOWED_PATHS : []
   },
   /**
    * 是否自动开始上传文件
    *
    * @cfg {Boolean} [autoStart=false]
    */
   autoStart : false,
   /**
    * 是否执行分片上传
    *
    * @cfg {Boolean} [chunked=true]
    */
   chunked : false,
   /**
    * 默认的按钮类名称
    *
    * @cfg {String} [buttonCls='cntysoft-comp-component-uploader']
    */
   cls : 'cntysoft-comp-component-uploader',
   /**
    * @cfg {Number} [height=24]
    */
   height : 32,
   /**
    * @cfg {Number} [width=80]
    */
   width : 85,
   /**
    * @readonly
    * @property {Number} fileSingleSizeLimit 上传文件大小， 这个由服务器端确定
    */
   fileSingleSizeLimit : null,
   /**
    * 队列中总文件数量
    *
    * @cfg {Number} [queueSizeLimit=100]
    */
   queueSizeLimit : 20,
   /**
    * 上传按钮文字
    *
    * @cfg {String} buttonText
    */
   buttonText : '',
   /**
    * 上传目录设置,系统能上传的文件目录只有几个指定的地方
    *
    * @property {String} uploadPath
    */
   uploadPath : '',
   /**
    * 允许的文件类型，用','隔开
    *
    * @cfg {Array} fileTypeExts
    */
   fileTypeExts : ['gif', 'png', 'jpg', 'jpeg', 'txt', 'rar', 'zip', 'tar.gz', 'html'],
   /**
    * 文件类型判断的正则
    *
    * @private
    * @property {String} fileTypeRegex
    */
   fileTypeRegex : null,
   /**
    * 是否开启文件引用追踪, 启用之后系统会自动保存文件的链接相关信息
    *
    * @property {Boolean} enableFileRef
    */
   enableFileRef : false,
   /**
    * 是否开启图片生成缩略图功能，只对上传文件为图片的时候起作用，默认为关闭状态
    *
    * @author Changwang <chenyongwang1104@163.com>
    * @property {Boolean} enableNail
    */
   enableNail : false,
   /**
    * 是否允许多文件上传
    *
    * @cfg {Boolean} [multi=true]
    */
   multi : true,
   /**
    * 判断当文件存在的时候是否覆盖
    *
    * @property {Boolean} overwrite
    */
   overwrite : false,
   /**
    * 是否在文件名称后面加上随机码
    *
    * @property {Boolean} randomize
    */
   randomize : true,
   /**
    * 是否根据日期创建子文件夹
    *
    * @property {Boolean} createSubDir
    */
   createSubDir : false,
   /**
    * 指定当前上传文件的文件名称
    *
    * @property {String} targetName
    */
   targetName : '',
   /**
    * 是否使用OSS储存上传的文件
    * 
    * @property {Boolean} useOss
    */
   useOss : true,
   /**
    * 上传的并发数目
    * 
    * @property {Number} threads
    */
   threads : 3,
   /**
    * 百度上传组建引用
    *
    * @property {WebUploader} webUploader
    */
   webUploader : null,
   /**
    * @protected
    * @property {Object} LANG_TEXT
    */
   LANG_TEXT : null,
   /**
    * 上传文件的大小限制
    *
    *@property {int} maxSize
    */
   maxSize : null,
   /**
    * 上传请求的URL地址
    *
    * @property {String} requestUrl
    */
   requestUrl : null,
   /**
    * 出错信息对象， 支持处理多个错误
    *
    * @private
    * @property {String} queueErrorMsg
    */
   queueErrorMsg : '',
   /**
    * 上传之后的图片是否需要进行裁剪
    * 
    * @property {Boolean} needCrop
    */
   needCrop : false,
   /**
    * 请求Api接口信息
    *
    * @property {Object} apiRequestMeta
    */
   apiRequestMeta : null,

   constructor : function(config)
   {
      config = config || {};
      if('' == Ext.String.trim(config.uploadPath)){
         Cntysoft.raiseError(Ext.getClassName(this), 'constructor', 'uploadPath is null');
      }
      this.mixins.langTextProvider.constructor.call(this);
      this.LANG_TEXT = this.GET_LANG_TEXT('CORE');
      this.applyConstraintConfig(config);
      this.setupAllowedPaths();
      this.callParent([config]);
      if(!this.maxSize){
         this.getUploadLimitSize();
      }
      if(this.enableFileRef){
         this.createSubDir = true;
      }
   },
   /**
    * @param {Object} config
    */
   applyConstraintConfig : function(config)
   {

   },
   initComponent : function()
   {
      this.fileTypeRegex = this.fileTypeExts.join(',')
         .replace(/,/g, '|')
         .replace(/\*/g, '.*');
      this.fileTypeRegex = new RegExp(this.fileTypeRegex, 'i');
      if(!Ext.isDefined(this.buttonText) || Ext.isEmpty(this.buttonText)){
         this.buttonText = this.LANG_TEXT.UPLOAD;
      }
      this.callParent();
   },
   /**
    * 开始上传。此方法可以从初始状态调用开始上传流程，也可以从暂停状态调用，继续上传流程
    */
   startUpload : function()
   {
      if(this.webUploader){
         this.webUploader.upload();
      }
   },
   /**
    * 停止上传循环
    */
   stopUpload : function()
   {
      if(this.webUploader){
         this.webUploader.stop();
      }
   },
   /**
    * 取消队列的文件的上传循环
    */
   cancelUpload : function()
   {
      if(this.webUploader){
         var files = this.getFiles();
         var len = files.length;
         var file;
         var S = this.self.FILE_STATUS;
         var status;
         for(var i = 0; i < len; i++) {
            file = files[i];
            status = file.getStatus();
            if(status == S.INITED || status == S.QUEUED || status == S.PROGRESS){
               this.removeFile(file);
            }
         }
         if(this.hasListeners.cancelupload){
            this.fireEvent('cancelupload', this);
         }
      }
   },
   /**
    * 按照file对象或者fileid 删除上传队列里面的文件
    *
    * @param {String|Object} file
    */
   removeFile : function(file)
   {
      if(this.webUploader){
         this.webUploader.removeFile(file);
      }
   },
   /**
    * 返回指定状态的文件集合，不传参数将返回所有状态的文件。
    *
    * @return {Array}
    */
   getFiles : function()
   {
      if(this.webUploader){
         return this.webUploader.getFiles.apply(this.webUploader, arguments);
      }
      return array();
   },
   /**
    * 设置上传允许的路径信息
    */
   setupAllowedPaths : Ext.emptyFn,

   setupConst : function()
   {
      this.self.addStatics({
         /**
          * <code>
          * {
             *  INITED:     'inited',    // 初始状态
             *  QUEUED:     'queued',    // 已经进入队列, 等待上传
             *  PROGRESS:   'progress',    // 上传中
             *  ERROR:      'error',    // 上传出错，可重试
             *  COMPLETE:   'complete',    // 上传完成。
             *  CANCELLED:  'cancelled',    // 上传取消。
             *  INTERRUPT:  'interrupt',    // 上传中断，可续传。
             *  INVALID:    'invalid'    // 文件不合格，不能重试上传。
             *  };
          *  </code>
          */
         FILE_STATUS : WebUploader.File.Status
      });
   },
   /**
    * 设置上传核心上传路径
    *
    * @param {String} path
    * @return {Cntysoft.Component.Uploadify.Core}
    */
   setUploadPath : function(path)
   {
      //if(!this.checkUploadPath(path)){
      //    Cntysoft.raiseError(Ext.getClassName(this), 'setUploadPath', 'upload path : ' + path + ' is not allowed');
      //}
      this.uploadPath = path;
      if(this.webUploader){
         this.applyConfigToUploader();
      }
      return this;
   },
   /**
    * 设置附件追踪
    *
    * @param {Boolean} flag
    * @return {Cntysoft.Component.Uploadify.Core}
    */
   setEnableFileRef : function(flag)
   {
      this.enableFileRef = flag;
      if(flag){
         this.createSubDir = true;
      }
      if(this.webUploader){
         this.applyConfigToUploader();
      }
      return this;
   },
   /**
    * 设置上传图片是否生成缩略图
    *
    * @param {Boolean} flag
    * @return {Cntysoft.Component.Uploadify.Core}
    */
   setEnableNail : function(flag)
   {
      this.enableNail = flag;
      if(this.webUploader){
         this.applyConfigToUploader();
      }
      return this;
   },
   /**
    * 设置上传的文件的文件名称
    *
    * @param {Boolean} flag
    * @return {Cntysoft.Component.Uploadify.Core}
    */
   setTargetName : function(targetName)
   {
      this.targetName = targetName;
      if(this.webUploader){
         this.applyConfigToUploader();
      }
      return this;
   },
   /**
    * 文件存在是否重写
    *
    * @param {Boolean} flag
    * @return {Cntysoft.Component.Uploadify.Core}
    */
   setOverwrite : function(flag)
   {
      this.overwrite = !!flag;
      if(this.webUploader){
         this.applyConfigToUploader();
      }
      return this;
   },
   /**
    * 是否在上传的文件名称后面添加随机码
    *
    * @param {Boolean} flag
    * @return {Cntysoft.Component.Uploadify.Core}
    */
   setRandomize : function(flag)
   {
      this.overwrite = !!flag;
      if(this.webUploader){
         this.applyConfigToUploader();
      }
      return this;
   },
   /**
    * 是否在上传成功保存文件的时候创建日期文件夹
    *
    * @param {Boolean} flag
    * @return {Cntysoft.Component.Uploadify.Core}
    */
   setCreateSubDir : function(flag)
   {
      this.createSubDir = !!flag;
      if(this.webUploader){
         this.applyConfigToUploader();
      }
      return this;
   },
   /**
    * 是否将上传文件保存在OSS服务器上
    *
    * @param {Boolean} flag
    * @return {Cntysoft.Component.Uploadify.Core}
    */
   setUseOss : function(flag)
   {
      this.useOss = !!flag;
      if(this.webUploader){
         this.applyConfigToUploader();
      }
      return this;
   },
   /**
    * 检查上传路径是否合法
    * 暂时禁用这个方法，因为每个项目的上传路径不一样
    *
    * @param {String} path
    * @return {Boolean}
    */
   checkUploadPath : function(path)
   {
      var path = this.uploadPath;
      var allowPaths = this.self.ALLOWED_PATH;
      var len = allowPaths.length;
      var item;
      for(var i = 0; i < len; i++) {
         item = allowPaths[i];
         if(item == path.substr(0, item.length)){
            return true;
         }
      }
      return false;
   },
   afterRender : function()
   {
      this.callParent();
      Ext.Loader.loadScript({
         url : [
            '/JsLibrary/Jquery/jquery-1.10.1.min.js',
            '/JsLibrary/WebUploader/webuploader.min.js'
         ],
         onLoad : function() {
            this.setupConst();
            this.wrapperWebUploader();
         },
         scope : this
      });
   },
   /**
    * 加载百度上传器对象
    */
   wrapperWebUploader : function()
   {
      var cfg = this.getWebUploaderConfig();
      this.applyEventHandlers(cfg);
      this.webUploader = WebUploader.create(cfg);
      var picker = this.el.child('.webuploader-pick');
      var height = this.height;
      var width = this.width;
      picker.setStyle({
         height : height + 'px',
         lineHeight : height + 'px',
         width : width + 'px'
      });
      this.webUploader.on('uploadAccept', this.uploadAcceptHandler, this);
   },
   /**
    * 获取默认的Uploader配置对象
    *
    * @return {Object}
    */
   getWebUploaderConfig : function()
   {
      var STD_PATH = Cntysoft.Kernel.StdPath;
      var fileSingleSize = this.fileSingleSizeLimit = parseInt(this.maxSize) * 1024 * 1024;//单位默认为MB
      //这里是否需要包裹？
      var el = this.el;
      var targetId = '#' + el.id;
      return {
         auto : this.autoStart,
         pick : {
            id : targetId,
            label : this.buttonText,
            multiple : this.multi
         },
         // swf文件路径
         swf : STD_PATH.getVenderPath() + '/WebUploader/Uploader.swf',
         chunked : true,
         fileNumLimit : this.queueSizeLimit,
         accept : {
             extensions : this.fileTypeExts
         },
         fileSingleSizeLimit : fileSingleSize,
         server : this.requestUrl,
         formData : this.getApiMetaInfo(),
         compress : false, //暂时压缩，这个特性把我害惨了，组件在这个地方有个小bug
         threads : this.threads
      };
   },
   /**
    * 绑定一些默认的事件处理函数
    */
   applyEventHandlers : function(cfg)
   {
      Ext.apply(cfg, {
         onError : Ext.bind(this.errorHandler, this),
         onBeforeFileQueued : Ext.bind(this.beforeFileQueuedHandler, this),
         onFileQueued : Ext.bind(this.fileQueuedHandler, this),
         onFilesQueued : Ext.bind(this.filesQueuedHandler, this),
         onFileQueueError : Ext.bind(this.fileQueueErrorHandler, this),
         onFileDequeued : Ext.bind(this.fileDequeuedHandler, this),
         onStartUpload : Ext.bind(this.startUploadHandler, this),
         onStopUpload : Ext.bind(this.stopUploadHandler, this),
         onUploadFinished : Ext.bind(this.uploadFinishedHandler, this),
         onUploadStart : Ext.bind(this.uploadStartHandler, this),
         onUploadProgress : Ext.bind(this.uploadProgressHandler, this),
         onUploadError : Ext.bind(this.uploadErrorHandler, this),
         onUploadSuccess : Ext.bind(this.uploadSuccessHandler, this),
         onUploadComplete : Ext.bind(this.uploadCompleteHandler, this)
      });
   },
   /**
    * 将配置信息传递到上传器中
    */
   applyConfigToUploader : function()
   {
      var options = this.webUploader.options;
      Ext.apply(options, {
         auto : this.autoStart,
         formData : this.getApiMetaInfo()
      });
   },
   /**
    * 设置API调用元信息
    */
   getApiMetaInfo : function()
   {
      //if(!this.checkUploadPath(this.uploadPath)){
      //    Cntysoft.raiseError(Ext.getClassName(this), 'getApiMetaInfo', 'upload path ' + this.uploadPath + ' is not in allowed path');
      //}
      if(!this.apiRequestMeta){
         this.apiRequestMeta = this.getApiRequestMeta();
      }
      if(!Ext.isDefined(this.apiRequestMeta)){
         Cntysoft.raiseError(Ext.getClassName(this), 'getApiMetaInfo', 'apiRequestMeta can not be null');
      }
      return {
         REQUEST_META : Ext.JSON.encode(this.apiRequestMeta),
         //这几个参数可能有冲突
         REQUEST_DATA : Ext.JSON.encode({
            uploadDir : this.uploadPath,
            overwrite : this.overwrite,
            enableFileRef : this.enableFileRef,
            randomize : this.randomize,
            createSubDir : this.createSubDir,
            targetName : this.targetName,
            enableNail : this.enableNail, //是否生成缩略图
            useOss : this.useOss,
            needCrop : this.needCrop
         }),
         REQUEST_SECURITY : Ext.JSON.encode({})
      };
   },

   /**
    * @template
    * @return {Object}
    */
   getApiRequestMeta : Ext.emptyFn,

   /**
    * @template
    * @return {Number}
    */
   getUploadLimitSize : Ext.emptyFn,

   /**
    * 上传接受处理器
    */
   uploadAcceptHandler : function(block, ret, rejectFn)
   {
      if(!ret.status){
         if(ret.errorCode == 10008/*需要更多的分块*/){
            return true;
         } else{
            rejectFn(ret);
            return false;
         }
      } else{
         return true;
      }
   },
   /**
    * @param {Object} file 文件对象
    */
   beforeFileQueuedHandler : function(file)
   {
      //探测文件类型错误
      //webuploader在这里实现有问题
      if(!this.fileTypeRegex.test(file.name)){
         this.webUploader.trigger('fileQueueError', file, 'fileTypeError');
         return false;
      }
      if(this.hasListeners.beforefilequeued){
         return this.fireEvent('beforefilequeued', file, this);
      }
      return true;
   },
   /**
    * webuploader一些错误处理, 比如队列长度溢出，单个文件大小溢出等等
    */
   errorHandler : function(type)
   {
      this.fileQueueErrorHandler(null, type);
   },
   /**
    * 文件加入队列之前错误探测
    *
    * @param {Object} file 文件对象
    * @param {String} errorType 错误类型
    */
   fileQueueErrorHandler : function(file, errorType)
   {
      var errorMap = this.LANG_TEXT.ERROR_MSG;
      if(errorType == 'emptyFileError'){
         this.queueErrorMsg += Ext.String.format(errorMap.ZERO_BYTE_FILE, file.name) + '</br>';
      } else if(errorType == 'fileTypeError'){
         this.queueErrorMsg += Ext.String.format(errorMap.INVALID_FILETYPE, file.name, this.fileTypeExts) + '</br>';
      } else if(errorType == 'exceed_size'){
         this.queueErrorMsg += Ext.String.format(errorMap.FILE_EXCEEDS_SIZE_LIMIT, file.name, this.maxSize) + '</br>';
      } else if(errorType == 'Q_EXCEED_NUM_LIMIT'){
         this.queueErrorMsg += Ext.String.format(errorMap.QUEUE_LIMIT_EXCEEDED, this.queueSizeLimit) + '</br>';
      } else{
         this.queueErrorMsg += errorMap.UNKNOW + '</br>';
      }
   },
   /**
    * 当单个文件超过文件限制的时候，webuploader没有触发事件，唉，为什么这样设计啊
    * 我们在这里进行相关处理
    *
    * @param {Object} file 文件对象
    */
   fileQueuedHandler : function(file)
   {
      if(file.getStatus() !== this.self.FILE_STATUS.INVALID){
         if(this.hasListeners.filequeued){
            this.fireEvent('filequeued', file, this);
         }
      } else{
         this.fileQueueErrorHandler(file, file.statusText);
      }
   },
   /**
    * @param {Object[]} files
    */
   filesQueuedHandler : function(files)
   {
      if(this.queueErrorMsg.length > 0){
         if(this.hasListeners.filequeuederror){
            this.fireEvent('filequeuederror', this.queueErrorMsg, this);
         }
         this.queueErrorMsg = '';
      }else{
         if(this.hasListeners.filesqueued){
            this.fireEvent('filesqueued', files, this);
         }
      }
   },
   /**
    * @param {Object} file 文件对象
    */
   fileDequeuedHandler : function(file)
   {
      if(this.hasListeners.filedequeued){
         this.fireEvent('filedequeued', file, this);
      }
   },
   /**
    * 开始整个上传周期事件处理
    */
   startUploadHandler : function()
   {
      if(this.hasListeners.startupload){
         this.fireEvent('startupload', this);
      }
   },
   /**
    * 暂停上传处理函数
    */
   stopUploadHandler : function()
   {
      if(this.hasListeners.stopupload){
         this.fireEvent('stopupload', this);
      }
   },
   /**
    * 单个上传周期开始时间
    */
   uploadStartHandler : function(file)
   {
      if(this.hasListeners.uploadstart){
         this.fireEvent('uploadstart', file, this);
      }
   },
   /**
    * 我们在这里清除队列
    */
   uploadFinishedHandler : function()
   {
      if(this.hasListeners.uploadfinished){
         this.fireEvent('uploadfinished', this);
      }
   },
   /**
    * @param  {Object} File对象
    * @param {Number} percentage上传进度
    */
   uploadProgressHandler : function(file, percentage)
   {
      if(this.hasListeners.uploadprogress){
         this.fireEvent('uploadprogress', file, percentage, this);
      }
   },
   /**
    * @param {Object} file File对象
    */
   uploadSuccessHandler : function(file, response)
   {
      if(this.hasListeners.uploadsuccess){
         this.fireEvent('uploadsuccess', file, response.data, this);
      }
   },
   /**
    * @param {Object} file File对象
    * @param {Object} reason
    */
   uploadErrorHandler : function(file, reason)
   {
      if(this.hasListeners.uploaderror){
         this.fireEvent('uploaderror', file, reason, this);
      }
   },
   /**
    * @param {Object} file File对象
    */
   uploadCompleteHandler : function(file)
   {
      this.removeFile(file);
      if(this.hasListeners.uploadcomplete){
         this.fireEvent('uploadcomplete', file, this);
      }
   },
   destroy : function()
   {
      delete this.webUploader;
      this.callParent();
   }
});

