/**
 * Cntysoft OpenEngine
 *
 * @author SOFTBOY <cntysoft@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 文件管理器为系统提供一个上传文件，对文件系统的可视化操作以及创建文件提供方便
 *
 * 抽象系统文件系统浏览器,主要定义一些交互函数 。 对于事件处理函数请看 {@link Cntysoft.Component.FsView.HandlerMixin}
 * @abstract
 */
Ext.define('Cntysoft.Component.FsView.AbstractView', {
   extend : 'Ext.container.Container',
   requires : [
      'Cntysoft.Kernel.StdPath',
      'SenchaExt.Data.Proxy.ApiProxy',
      'Cntysoft.Utils.Common',
      'Cntysoft.Component.FsView.FsTree',
      'Cntysoft.Framework.Core.Filesystem',
      'Cntysoft.Stdlib.Common',
      //Lang
      'Cntysoft.Component.FsView.Lang.zh_CN'
   ],
   mixins : {
      menuHandler : 'Cntysoft.Component.FsView.HandlerMixin',
      langTextProvider : 'Cntysoft.Mixin.LangTextProvider'
   },
   /**
    * @inheritdoc
    */
   LANG_NAMESPACE : 'Cntysoft.Component.FsView.Lang',
   inheritableStatics : {
      /**
       * @private
       * @readonly
       * @property {Object} FILE_TYPE_MAP 文件类型的显示图片
       */
      FILE_TYPE_MAP : {
         dir : 'Dir.png',
         css : 'Css.png',
         js : 'Js.png',
         php : 'Php.png',
         html : 'Html.png',
         phtml : 'Phtml.png',
         txt : 'File.png',
         xml : 'Xml.png',
         gif : 'Gif.png',
         jpg : 'Jpg.png',
         jpeg : 'Jpg.png',
         png : 'Png.png',
         swf : 'Swf.png'
      },
      /**
       * @private
       * @readonly
       * @property {String[]}  IMG_TYPE 图片类型
       */
      IMG_TYPE : [
         'gif',
         'jpg',
         'jpeg',
         'png'
      ],
      /**
       * @private
       * @readonly
       * @property {Object} A_MAP
       */
      A_MAP : {
         DELETE_FOLDER : 1,
         DELETE_FILE : 2,
         GOTO_CHILD : 3,
         RENAME : 4,
         GOTO_PARENT : 5,
         NEW_FOLDER : 6,
         GOTO_ROOT : 7,
         REFRESH : 8,
         BATCH_COPY : 9,
         BATCH_DELETE : 10,
         BATCH_CUT : 11,
         COPY : 12,
         PASTE : 13,
         CUT : 14,
         SELECT_ALL : 15,
         NEW_FILE : 16,
         EDIT_FILE : 17
      },
      /**
       * 用于判断文件是否可以预览和编辑
       * [预览, 编辑]
       *
       * @private
       * @readonly
       */
      VE_MAP : {
         js : [true, true, 'Cntysoft.Component.Editor.Code.Window'],
         css : [true, true, 'Cntysoft.Component.Editor.Code.Window'],
         html : [true, true, 'Cntysoft.Component.Editor.Code.Window'],
         phtml : [true, true, 'Cntysoft.Component.Editor.Code.Window'],
         php : [true, true, 'Cntysoft.Component.Editor.Code.Window'],
         //img : [true, false, ''],
         txt : [true, true, 'Cntysoft.Component.Editor.TextEditorWindow']
      }
   },
   /**
    * @private
    * @property {Object} iconMap 文件与其对应的图片映射关系
    */
   iconMap : {},
   /**
    * 控制是否显示文件管理器当前的访问路径
    *
    * @cfg {Boolean} isShowPath
    */
   isShowPath : false,
   /**
    * 当前访问的路径
    *
    * @cfg {String} path
    */
   path : null,
   /**
    * @property {Array} startPaths
    */
   startPaths : [],
   /**
    * 有待复制的项
    *
    * @property {Array} pasteItems
    */
   pasteItems : [],
   /**
    * 路径显示label
    *
    * @property {Ext.form.Label} pathLabelRef
    */
   pathLabelRef : null,
   /**
    * 批量操作菜单
    *
    * @property {Ext.menu.Menu} batchMenuRef
    */
   batchMenuRef : null,
   /**
    * 文件系统仓库
    *
    * @property {Ext.data.Store} fsStore
    */
   fsStore : null,
   /**
    * 文件系统操作对象
    *
    * @property {Cntysoft.Framework.Core.Filesystem} fs
    */
   fs : null,
   /**
    * 视图的对象引用 icon 与 grid都有自己的显示方式对象
    *
    * @property {Object} viewObject
    */
   viewObject : null,
   /**
    * 文件浏览结构树
    *
    * @property {Ext.tree.Panel} fsTreeRef
    */
   fsTreeRef : null,
   /**
    * 是否允许多选
    *
    * @property {Boolean} allowMutiSelect
    */
   allowMutiSelect : true,
   /**
    * 允许的文件类型  *代表, 暂时现在客户端限制
    *
    * @property {String} allFileTypes
    */
   allowFileTypes : '*',
   /**
    * @property {Array} clipboard
    */
   clipboard : {
      type : null,
      items : []
   },
   /**
    * 编辑器hashMAP 是否需要一个开关呢
    *
    * @property {Ext.util.HashMap} editors
    */
   editors : null,
   /**
    * 系统上传组件
    *
    * @property {Cntysoft.Component.Uploader.Window} uploaderRef
    */
   uploaderRef : null,
   /**
    * 上传组建的配置对象
    *
    * @property {Object} uploaderConfig
    */
   uploaderConfig : {},
   /**
    * 多语言机制
    *
    * @property {Object} ABSTRACT_LANG_TEXT
    */
   ABSTRACT_LANG_TEXT : null,
   /**
    * 构造函数
    *
    * @param {Object} config
    */
   constructor : function(config)
   {
      this.mixins.langTextProvider.constructor.call(this);
      this.ABSTRACT_LANG_TEXT = this.GET_LANG_TEXT('ABSTRACT_VIEW');
      this.editors = new Ext.util.HashMap();
      this.callParent([config]);
   },
   initComponent : function()
   {
      //检查startpaths不能为空
      if(!this.startPaths || 0 == this.startPaths.length){
         Cntysoft.raiseError(Ext.getClassName(this), 'initComponent', 'startPaths can not be empty');
      }
      this.callParent();
      if(this.isShowPath){
         Ext.apply(this, {
            layout : {
               type : 'vbox',
               align : 'stretch'
            }
         });
         this.add({
            xtype : 'container',
            layout : 'hbox',
            margins : '3 0 0 0',
            style : 'border-bottom: 1px solid #3892D3',
            items : [this.getLabelConfig(), this.getCdParentBtn()]
         });
         this.addListener({
            pathchange : this.updateLabelText,
            scope : this
         });
      } else{
         Ext.apply(this, {
            layout : {
               type : 'fit'
            }
         });
      }
      this.addListener({
         afterrender : function()
         {
            this.cd2InitDir();
         },
         scope : this
      });
   },
   /**
    * 目录切换API
    */
   /**
    * 刷新当前文件夹
    */
   refresh : function()
   {
      if(this.fireEvent('beforecd', this.path)){
         this.getFsStore().load({
            params : {
               path : this.path
            }
         });
      }
   },
   /**
    * @param {String} path
    */
   cd : function(path)
   {
      if(path != this.path){
         if(this.fireEvent('beforecd', path)){
            var store = this.getFsStore();
            var proxy = store.getProxy();
            proxy.setInvokeParams({
               path : path
            });
            store.load();
         }
      }
   },
   /**
    * 进入初始化目录
    */
   cd2InitDir : function(){
      var store = this.getFsStore();
      var proxy = store.getProxy();
      proxy.setInvokeMetaInfo({
         name : 'Filesystem',
         method : 'getStartDirPaths'
      });
      proxy.setInvokeParams({
         startPaths : this.startPaths
      });
      store.load();
      proxy.setInvokeMetaInfo({
         name : 'Filesystem',
         method : 'ls'
      });
   },
   /**
    * 返回上一级菜单
    */
   cd2ParentDir : function(){
      var path = this.path,
         pos;
      if(Ext.Array.contains(this.startPaths, path)){
         this.cd2InitDir();
         return;
      }
      if('' == path){
         return;
      }
      pos = path.lastIndexOf('/');
      path = path.substring(0, pos);
      this.cd(path);
   },
   /**
    * 进入当前目录指定的子目录
    */
   cd2ChildDir : function(name){
      if('' != this.path){
         name = this.path + '/' + name;
      }
      this.cd(name);
   },
   /**
    * 判断一个文件夹是否存在当前的目录
    *
    * @param {String} name
    * @return {boolean}
    */
   dirExist : function(name)
   {
      var store = this.getFsStore();
      var exist = false;
      store.each(function(entry){
         if('dir' == entry.get('type') && name == entry.get('rawName')){
            exist = true;
            return false;
         }
      });
      return exist;
   },
   /**
    * 判断文件是否存在当前的路径
    *
    * @param {String} name
    * @return {Boolean}
    */
   fileExist : function(name)
   {
      var store = this.getFsStore();
      var exist = false;
      store.each(function(entry){
         if('dir' !== entry.get('type') && name == entry.get('rawName')){
            exist = true;
            return false;
         }
      });
      return exist;
   },
   /**
    * 创建一个新的文件夹
    *
    * @param {String} name
    */
   createDir : function(dirname)
   {
      var fs = this.getFsObject();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      this.setLoading(L_TEXT.MSG.CREATE_DIR_OP);
      fs.createDir(dirname, function(response){
         this.loadMask.hide();
         this.reloadView();
         if(!response.status){
            Cntysoft.Kernel.Utils.processApiError(response);
         }
      }, this);
   },
   /**
    * 复制指定文件夹或者文件
    *
    * @param {Array} items
    */
   copy : function(items)
   {
      this.clipboard.type = 'copy';
      this.clipboard.items = items;
   },
   /**
    * 剪切指定文件夹或者文件
    *
    * @param {Array} items
    */
   cut : function(items)
   {
      this.clipboard.type = 'cut';
      this.clipboard.items = items;
   },
   /**
    * 粘贴复制或者剪切的
    */
   paste : function(path)
   {
      if(this.clipboard.items.length > 0){
         var fs = this.getFsObject();
         var L_TEXT = this.ABSTRACT_LANG_TEXT;
         this.setLoading(L_TEXT.MSG.PASTE_OP);
         var data = Ext.apply(this.clipboard, {
            target : path
         });
         fs.paste(data, function(response){
            this.loadMask.hide();
            this.clipboard.type = null;
            this.clipboard.items = [];
            if(response.status){
               //对当前的文件路径进行刷新
               this.reloadView();
            } else{
               Cntysoft.Kernel.Utils.processApiError(response, this.GET_LANG_TEXT('ERROR_MAP'), {
                  10006 : [this.path]
               });
               this.reloadView();
            }
         }, this);
      }
   },
   /**
    * 重命名文件或者文件夹
    *
    * @param {String} oldName
    * @param {String} newName
    */
   rename : function(oldName, newName)
   {
      var fs = this.getFsObject();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      this.setLoading(L_TEXT.MSG.RENAME_OP);
      fs.rename({
         oldName : oldName,
         newName : newName
      }, function(response){
         this.loadMask.hide();
         if(response.status){
            //对当前的文件路径进行刷新
            this.reloadView();
         } else{
            Cntysoft.processApiError(response);
         }
      }, this);
   },
   deleteFile : function(filename)
   {
      var fs = this.getFsObject();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      this.setLoading(L_TEXT.MSG.DELETE_FILE_OP);
      fs.deleteFile(filename, function(response){
         this.loadMask.hide();
         if(response.status){
            this.reloadView();
         } else{
            Cntysoft.Kernel.Utils.processApiError(response);
            this.reloadView();
         }
      }, this);
   },
   /**
    * 批量删除指定文件
    */
   deleteFiles : function(files, callback, scope)
   {
      var fs = this.getFsObject();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;
      scope = scope ? scope : this;
      if(files.length > 0){
         this.setLoading(L_TEXT.MSG.DELETE_FILE_OP);
         fs.deleteFiles(files, function(response){
            this.loadMask.hide();
            if(response.status){
               callback.call(scope);
               this.reloadView();
            } else{
               Cntysoft.Kernel.Utils.processApiError(response);
               this.reloadView();
            }
         }, this);
      } else{
         //直接调用回调函数
         callback.call(this);
      }
   },
   /**
    * 删除指定的文件夹
    *
    * @param {String} dirname
    */
   deleteDir : function(dirname)
   {
      var fs = this.getFsObject();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      this.setLoading(L_TEXT.MSG.DELETE_DIR_OP);
      fs.deleteDir(dirname, function(response){
         this.loadMask.hide();
         this.reloadView();
         if(!response.status){
            Cntysoft.Kernel.Utils.processApiError(response);
         }
      }, this);
   },
   /**
    * 批量删除文件夹， 这里的callback是删除成功之后调用的
    *
    * @param {Array} dirs
    */
   deleteDirs : function(dirs, callback, scope)
   {
      var fs = this.getFsObject();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;
      scope = scope ? scope : this;
      if(dirs.length > 0){
         this.setLoading(L_TEXT.MSG.DELETE_DIR_OP);
         fs.deleteDirs(dirs, function(response){
            this.loadMask.hide();
            if(response.status){
               callback.call(scope);
               this.reloadView();
            } else{
               Cntysoft.Kernel.Utils.processApiError(response);
               this.reloadView();
            }
         }, this);
      } else{
         //直接调用回调函数
         callback.call(this);
      }
   },
   /**
    * 避免多次请求，不建议直接调用, 系统UI进行调用
    *
    * @param {object} collection
    */
   forceDeleteFiles : function(collection)
   {
      var fs = this.getFsObject();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      this.setLoading(L_TEXT.MSG.DELETE_FILE_OP);
      fs.deleteFiles(collection.files, function(response){
         this.loadMask.hide();
         if(response.status){
            if(collection.dirs.length > 0){
               this.forceDeleteDirs(collection);
            }
         } else{
            Cntysoft.Kernel.Utils.processApiError(response);
            this.reloadView();
         }
      }, this);
   },
   /**
    * 强制删除文件夹
    *
    * @param {Object} collection
    */
   forceDeleteDirs : function(collection)
   {
      var fs = this.getFsObject();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      this.setLoading(L_TEXT.MSG.DELETE_DIR_OP);
      fs.deleteDirs(collection.files, function(response){
         this.loadMask.hide();
         this.reloadView();
         if(!response.status){
            Cntysoft.Kernel.Utils.processApiError(response);
         }
      }, this);
   },
   /**
    * 获取预览编辑映射数据, 写这个函数为了给子类一个覆盖默认行为的机会
    *
    * @param {String} fileType
    * @return {null | Array}
    */
   getVeMapItem : function(fileType)
   {
      if(this.self.VE_MAP.hasOwnProperty(fileType)){
         return this.self.VE_MAP[fileType];
      }
      return null;
   },
   /**
    * 获取系统文件目录的数据仓库
    *
    * @return {Ext.data.Store}
    */
   getFsStore : function()
   {
      if(null == this.fsStore){
         this.fsStore = new Ext.data.Store({
            fields : [
               {name : 'name', type : 'string', persist : false},
               {name : 'rawName', type : 'string', persist : false},
               {name : 'icon', type : 'string', persist : false},
               {name : 'type', type : 'string', persist : false},
               {name : 'cTime', type : 'string', persist : false},
               {name : 'mTime', type : 'string', persist : false},
               {name : 'isReadable', type : 'boolean', persist : false},
               {name : 'isWritable', type : 'boolean', persist : false},
               {name : 'isStartup', type : 'boolean', persist : false},
               {name : 'size', type : 'string', persist : false},
               {name : 'fullPath', type : 'string', persist : false}
            ],
            proxy : {
               type : 'apigateway',
               callType : 'Sys',
               reader : {
                  type : 'json',
                  rootProperty : 'entries'
               },
               invokeMetaInfo : {
                  name : 'Filesystem',
                  method : 'ls'
               },
               pArgs : [{
                  key : 'allowFileTypes',
                  value : this.allowFileTypes
               }],
               listeners : {
                  dataready : this.prepareFileHandler,
                  scope : this
               }
            },
            filters : [
               Ext.bind(this.fileTypeFilter, this)
            ]
         });
      }
      return this.fsStore;
   },
   /**
    * @return {String}
    */
   getCurrentPath : function()
   {
      return this.path;
   },
   /**
    * @param {String} path
    */
   updateLabelText : function(path)
   {
      path = '/' + path;
      var text = this.ABSTRACT_LANG_TEXT.CURRENT_PATH;
      this.pathLabelRef.update(text + ':  ' + path);
   },
   /**
    * 刷新当前的view，子类覆盖的方法
    */
   reloadView : Ext.emptyFn,
   /**
    * 刷新系统文件树
    */
   reloadFsTree : function()
   {
      this.fsTreeRef.store.load();
   },
   /**
    * 获取文件系统操作对象
    *
    * @return {Cntysoft.Framework.Core.Filesystem}
    */
   getFsObject : function()
   {
      if(null == this.fs){
         this.fs = new Cntysoft.Framework.Core.Filesystem();
      }
      return this.fs;
   },
   /**
    * 获取选中的项
    *
    * @return {Array}
    */
   getSelectedItems : function()
   {
      var sel = this.viewObject.getSelectionModel();
      return sel.getSelection();
   },
   /**
    * 文件类型的过滤器
    *
    * @param {Object} record
    */
   fileTypeFilter : function(record)
   {
      var allowTypes = this.allowFileTypes;
      var type = record.get('type');
      if('*' == allowTypes){
         return true;
      } else if(Ext.isArray(allowTypes)){
         return Ext.Array.contains(allowTypes, type);
      }
   },
   /**
    * 处理项双击
    *
    * @param {Ext.Component} view
    * @param {Object} record
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
         this.editFileHandler(record);
      }
   },
   /**
    * 根据文件的类型获取对应类定icon图片链接
    *
    * @param {String} type
    * @return {String}
    */
   getIconByFileType : function(type){
      if(undefined != this.iconMap[type]){
         return this.iconMap[type];
      }
      var S = this.self;
      var base = Cntysoft.Kernel.StdPath.getWebOsImagePath() + '/Os/Component/FsView';
      var icon;
      var type;
      if(undefined == S.FILE_TYPE_MAP[type]){
         iconType = S.FILE_TYPE_MAP['txt'];
      } else{
         iconType = S.FILE_TYPE_MAP[type];
      }
      icon = base + '/' + iconType;
      this.iconMap[type] = icon;
      return icon;
   },
   /**
    * 显示上传窗口
    */
   renderUploaderWindow : Ext.emptyFn,

   /**
    * 获取左边目录树导航
    *
    * @return {Object}
    */
   getFsTreeConfig : function()
   {
      return {
         xtype : 'cntsmfstree',
         width : 250,
         border : true,
         margin : this.isShowPath ? '4 1 0 0' : '0 1 0 0',
         region : 'west',
         startPaths : this.startPaths,
         fsView : this,
         listeners : {
            afterrender : function(tree)
            {
               this.fsTreeRef = tree;
            },
            scope : this
         }
      };
   },
   /**
    *   获取路径显示配置文件
    *
    *   @return {Object}
    */
   getLabelConfig : function()
   {
      return {
         xtype : 'label',
         height : 25,
         margin : '0 0 0 5',
         padding : '5 0 0 0',
         flex : 1,
         listeners : {
            afterrender : function(label)
            {
               this.pathLabelRef = label;
            },
            scope : this
         }
      };
   },
   getCdParentBtn : function()
   {
      var T = this.ABSTRACT_LANG_TEXT.BTN;
      return {
         xtype : 'button',
         text : T.GOTO_PARENT,
         margin : '0 1 0 0',
         listeners : {
            click : function(){
               this.cd2ParentDir();
            },
            scope : this
         }
      };
   },
   destroy : function()
   {
      delete this.fsStore;
      delete this.pathLabelRef;
      delete this.ABSTRACT_LANG_TEXT;
      if(this.uploaderRef){
         this.uploaderRef.destroy();
         delete this.uploaderRef;
      }
      if(this.batchMenuRef){
         this.batchMenuRef.destroy();
         delete this.batchMenuRef;
      }
      if(this.itemFileMenuRef){
         this.itemFileMenuRef.destroy();
         delete this.itemFileMenuRef;
      }
      if(this.itemDirMenuRef){
         this.itemDirMenuRef.destroy();
         delete this.itemDirMenuRef;
      }
      delete this.viewObject;
      this.clipboard.items = [];
      delete this.clipboard;
      delete this.fs;
      delete this.fsTreeRef;
      //清除编辑器
      if(this.editors.getCount() > 0){
         this.editors.each(function(key, editor){
            editor.close();
         });
      }
      this.editors.clear();
      delete this.editors;
      this.callParent();
   }
});
