/**
 * Cntysoft OpenEngine
 *
 * @author SOFTBOY <cntysoft@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 菜单操作的mixin对象，提供一个可以扩展的菜单体系，主要是两个菜单
 * 一个item的点击菜单 一个是容器菜单，但是grid的方式容器菜单是没办法调用的
 */
Ext.define('Cntysoft.Component.FsView.HandlerMixin', {
   /**
    * 文件浏览器，当文件项被点击时候显示的菜单
    *
    * @protected
    * @property {Ext.menu.Menu} [itemFileMenuRef = null]
    */
   itemFileMenuRef : null,
   /**
    * 文件夹项上下文菜单
    *
    * @protected
    * @property {Ext.menu.Menu} [itemDirMenuRef = null]
    */
   itemDirMenuRef : null,
   /**
    * 批量操作上下文菜单
    *
    * @protected
    * @property {Ext.menu.Menu} [batchMenuRef = null]
    */
   batchMenuRef : null,
   /**
    * 准备文件两个数据,设置缩短的文件名称 和 设置文件的icon类型
    *
    * @template
    * @protected
    */
   prepareFileHandler : function(data)
   {
      //对数据集合进行处理
      var entry;
      var name;
      var IMG = this.self.IMG_TYPE;
      this.path = data.path;
      var entries = data.entries;
      var len = entries.length;
      if(this.hasListeners.pathchange){
         this.fireEvent('pathchange', this.path);
      }
      if(0 == len){
         return;
      }
      for(var i = 0; i < len; i++) {
         entry = entries[i];
         name = entry.name;
         entry.rawName = name;
         entry.name = Ext.String.ellipsis(name, 10);
         entry.path =  this.path;
         //if(Ext.Array.contains(IMG, entry.type)){
         //    entry.icon =  '/' + this.path + '/' + name;
         //} else{
         //    entry.icon = this.getIconByFileType(entry.type);
         //}
      }
   },
   /**
    * 处理项双击处理函数，默认行为是文件夹双击打开，可编辑的文件双击弹出编辑器进行编辑
    *
    * @protected
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
    * 编辑文件处理函数， 这个处理器根据当前文件的类型，打开相应的编辑器进行编辑
    *
    * @protected
    * @param {Ext.data.Model} record
    */
   editFileHandler : function(record)
   {
      var type = record.get('type');
      var fileVeItem = this.getVeMapItem(type);

      if(fileVeItem){
         var editable = fileVeItem[1];
         if(editable){
            var editorCls = fileVeItem[2];
            var filename = record.get('fullPath') + '/' + record.get('rawName');
            var key = filename.replace(/[#'"&$_/\\`~]/g, '');
            var editor;
            if(this.editors.containsKey(key)){
               editor = this.editors.get(key);
               editor.show();
            } else{
               var me = this;
               //减少第一次的数据加载
               Cntysoft.showLoadScriptMask();
               Ext.require(editorCls, function(){
                  Cntysoft.hideLoadScriptMask();
                  editor = Ext.create(editorCls, {
                     filename : filename,
                     mode : 2, //编辑模式
                     fsViewRef : this,
                     listeners : {
                        destroy : function(editor){
                           delete editor.fsViewRef;
                           me.editors.removeAtKey(key);
                        },
                        scope : me
                     }
                  });
                  me.editors.add(key, editor);
                  editor.show();
               }, this);
            }
         }
      }
   },
   /**
    * 这个函数将在创建item右键点击的时候进行创建,文件类型的按钮项,子类可以按照自己的需求增加菜单项，或者删除其中的菜单项
    *
    * @protected
    * @template
    * @param {Object[]} items 当前已经有的菜单项集合
    * @return {Object[]}
    */
   createFileItemMenuItems : function(items, record)
   {
      var M = this.self.A_MAP;
      var M_TEXT = this.ABSTRACT_LANG_TEXT.MENU;
      var type = record.get('type');
      var actionValue = this.getVeMapItem(type);
      items = Ext.Array.merge(items, [{
         text : M_TEXT.RENAME,
         code : M.RENAME
      }, {
         text : M_TEXT.COPY,
         code : M.COPY
      }, {
         text : M_TEXT.CUT,
         code : M.CUT
      }, {
         text : M_TEXT.DELETE_FILE,
         code : M.DELETE_FILE
      }]);
      if(!Ext.isEmpty(actionValue)){
         if(actionValue[1]){
            items.unshift({
               text : M_TEXT.EDIT,
               code : M.EDIT_FILE
            });
         }
      }
      return items;
   },
   /**
    * 文件夹类型的按钮项
    *
    * @param {Array} items
    * @return {Array}
    */
   createDirItemMenuItems : function(items, record)
   {
      var M_TEXT = this.ABSTRACT_LANG_TEXT.MENU;
      var M = this.self.A_MAP;
      items = Ext.Array.merge(items, [{
         text : M_TEXT.GOTO_CHILD,
         code : M.GOTO_CHILD
      }, {
         text : M_TEXT.RENAME,
         code : M.RENAME
      }, {
         text : M_TEXT.COPY,
         code : M.COPY
      }, {
         text : M_TEXT.CUT,
         code : M.CUT
      }, {
         text : M_TEXT.DELETE_FOLDER,
         code : M.DELETE_FOLDER
      }]);
      return items;
   },
   /**
    * 创建ITEM按钮
    *
    * @param {String} type 创建类型 dir 或者 file
    * @param {Object} record 文件项目
    * @return {Ext.menu.Menu}
    */
   createItemMenu : function(type, record)
   {
      var items = [];
      if('dir' == type){
         //每次都全新创建 这个可以保持按钮根据条件作出判断
         items = this.createDirItemMenuItems(items, record);
         if(null == this.itemDirMenuRef){
            this.itemDirMenuRef = new Ext.menu.Menu({
               ignoreParentClicks : true,
               width : 150,
               items : items,
               listeners : {
                  click : this.dirMenuClickHandler,
                  scope : this
               }
            });
         } else{
            this.itemDirMenuRef.removeAll();
            this.itemDirMenuRef.add(items);
         }
         return this.itemDirMenuRef;
      } else if('file' == type){
         //每次都全新创建 这个可以保持按钮根据条件作出判断
         items = this.createFileItemMenuItems(items, record);
         if(null == this.itemFileMenuRef){
            this.itemFileMenuRef = new Ext.menu.Menu({
               ignoreParentClicks : true,
               width : 150,
               items : items,
               listeners : {
                  click : this.fileMenuClickHandler,
                  scope : this
               }
            });
         } else{
            this.itemFileMenuRef.removeAll();
            this.itemFileMenuRef.add(items);
         }
         return this.itemFileMenuRef;
      } else{
         Cntysoft.raiseError(Ext.getClassName(this), 'createItemMenu', 'type : ' + type + ' is invalid');
      }
   },
   /**
    * 这个按钮是不需要定制菜单项的
    *
    * @return {Ext.menu.Menu}
    */
   createBatchMenu : function()
   {
      var M_TEXT = this.ABSTRACT_LANG_TEXT.MENU;
      var M = this.self.A_MAP;
      if(null == this.batchMenuRef){
         this.batchMenuRef = new Ext.menu.Menu({
            ignoreParentClicks : true,
            width : 150,
            listeners : {
               click : this.batchMenuClickHandler,
               scope : this
            },
            items : [{
               text : M_TEXT.BATCH_COPY,
               code : M.BATCH_COPY
            }, {
               text : M_TEXT.BATCH_CUT,
               code : M.BATCH_CUT
            }, {
               text : M_TEXT.BATCH_DELETE,
               code : M.BATCH_DELETE
            }]
         });
      }
      return this.batchMenuRef;
   },
   itemRightClickHandler : function(view, record, item, index, event)
   {
      var pos = event.getXY(),
         type,
         menu,
         selectRecords = view.selModel.getSelection();
      event.stopEvent();
      if(selectRecords.length > 1){
         menu = this.createBatchMenu();
         menu.records = selectRecords;
      } else{
         if('dir' == record.get('type')){
            type = 'dir';
         } else{
            type = 'file';
         }
         menu = this.createItemMenu(type, record);
         menu.record = record;
      }
      menu.showAt(pos[0], pos[1]);
   },
   containerRightClick : function()
   {

   },
   /**
    * 批处理菜单处理函数
    *
    * @param {Ext.menu.Menu} menu
    * @param {Object} item
    */
   batchMenuClickHandler : function(menu, item)
   {
      var M = this.self.A_MAP;
      var records = menu.records;
      var code = item.code;
      switch (code) {
         case M.BATCH_DELETE:
            this.batchDeleteHandler(records);
            break;
         case M.BATCH_COPY:
            this.copyHandler(records);
            break;
         case M.BATCH_CUT:
            this.cutHandler(records);
            break;
      }
   },
   /**
    * 文件菜单处理函数，最基本的功能处理,这个函数是个事件派发器
    *
    * @protected
    * @param {Ext.menu.Menu} menu 当前的菜单
    * @param {Object} item
    */
   fileMenuClickHandler : function(menu, item)
   {
      var M = this.self.A_MAP;
      var record = menu.record;
      var code = item.code;
      switch (code) {
         case M.RENAME:
            this.renameHandler(record);
            break;
         case M.DELETE_FILE:
            this.deleteFileHandler(record);
            break;
         case M.COPY:
            this.copyHandler([record]);
            break;
         case M.CUT:
            this.cutHandler([record]);
            break;
         case M.EDIT_FILE:
            this.editFileHandler(record);
            break;
      }
   },
   /**
    * 文件夹菜单处理函数,最基本的功能处理,这个函数是个事件派发器
    *
    * @param {Ext.menu.Menu} menu
    * @param {Object} item
    */
   dirMenuClickHandler : function(menu, item)
   {
      var M = this.self.A_MAP;
      var record = menu.record;
      var code = item.code;
      switch (code) {
         case M.DELETE_FOLDER:
            this.deleteDirHandler(record);
            break;
         case M.COPY:
            this.copyHandler([record]);
            break;
         case M.CUT:
            this.cutHandler([record]);
            break;
         case M.GOTO_CHILD:
            this.cd2ChildDir(record.get('rawName'));
            break;
         case M.RENAME:
            this.renameHandler(record);
            break;
      }
   },
   /**
    * @property {Ext.data.Model} record
    */
   renameHandler : function(record)
   {
      var oldName;
      var newName;
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      //@TODO这里暂时没有检测文件名称的特殊符号
      Ext.Msg.prompt({
         title : L_TEXT.PROMOTE_WIN_TITLE,
         prompt : true,
         width : 500,
         msg : L_TEXT.MSG.TYPE_NAME,
         buttons : Ext.Msg.OKCANCEL,
         multiline : false,
         callback : function(btn, name){
            if(btn == 'ok'){
               //@TODO 在这里是否需要对文件夹名称进行处理吗
               name = Ext.String.trim(name);
               if('' != name && name != record.get('rawName')){
                  if('' == this.path){
                     oldName = record.get('rawName');
                     newName = name;
                  } else{
                     oldName = this.path + '/' + record.get('rawName');
                     newName = this.path + '/' + name;
                  }
                  this.rename(oldName, newName);
               }
            }
         },
         scope : this,
         value : record.get('rawName')
      });
   },
   /**
    * 文件删除处理函数
    *
    * @property {Object} record
    */
   deleteFileHandler : function(record)
   {
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      var filename = this.path + '/' + record.get('rawName');
      Cntysoft.showQuestionWindow(Ext.String.format(L_TEXT.MSG.DELETE_FILE, filename), function(bid){
         if('yes' == bid){
            this.deleteFile(filename);
         }
      }, this);
   },
   /**
    * 删除文件夹处理函数
    *
    * @param {Object} record
    */
   deleteDirHandler : function(record)
   {
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      var dirname = this.path + '/' + record.get('rawName');
      Cntysoft.showQuestionWindow(Ext.String.format(L_TEXT.MSG.DELETE_DIR_QUESTION, dirname), function(bid){
         if('yes' == bid){
            this.deleteDir(dirname);
         }
      }, this);
   },
   /**
    * 批量删除处理函数
    *
    * @param {Array} records
    */
   batchDeleteHandler : function(records)
   {
      var orgCollection = this.classifyItems(records);
      var collection = {
         files : orgCollection.files
      };
      var dirs = orgCollection.dirs;
      var dirItemLen = dirs.length;
      var pool = [];
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      var tpl = L_TEXT.MSG.DELETE_AGGR_INFO;
      var files = collection.files;
      var file;
      var fileList = '';
      var dirList = '';
      var len;
      var msgInfoWin = new Ext.window.MessageBox({
         autoScroll : true,
         maxHeight : 300
      });
      var win = this.up('window');
      var deplexFn = function(bid)
      {
         win.show();
         if('yes' == bid){
            this.listDeleteFilesHandler(collection);
         }
      };
      msgInfoWin.buttonText = Ext.MessageBox.buttonText;
      if(dirItemLen > 0){
         //进行文件夹删除提示
         this.showEnsureDeleteDirWindow(dirs, pool, function(pool){
            collection.dirs = pool;
            //最终的汇总信息
            if(collection.dirs.length > 0 || collection.files.length > 0){
               var dirs = collection.dirs;
               var dir;
               len = files.length;
               for(var i = 0; i < len; i++) {
                  file = files[i];
                  fileList += '<span style = "color:blue">' + file + '</span></br>';
               }
               len = dirs.length;
               for(var i = 0; i < len; i++) {
                  dir = dirs[i];
                  dirList += '<span style = "color : red">' + dir + '</span></br>';
               }
               if('' == fileList){
                  fileList = '<span style = "color:blue">空</span></br>';
               }
               if('' == dirList){
                  dirList = '<span style = "color : red">空</span></br>';
               }
               var infoMsg = Ext.String.format(tpl, fileList, dirList);
               win.hide();
               msgInfoWin.show({
                  msg : infoMsg,
                  buttons : Ext.Msg.YESNO,
                  icon : Ext.Msg.INFO,
                  title : L_TEXT.PROMOTE_WIN_TITLE,
                  width : 500,
                  fn : deplexFn,
                  scope : this
               });
            }

         });
      } else{
         collection.dirs = [];
         len = files.length;
         fileList = '';
         for(var i = 0; i < len; i++) {
            file = files[i];
            fileList += '<span style = "color:blue">' + file + '</span></br>';
         }
         if('' == fileList){
            fileList = '<span style = "color:blue">空</span></br>';
         }
         dirList = '<span style = "color : red">空</span></br>';
         var infoMsg = Ext.String.format(tpl, fileList, dirList);
         msgInfoWin.show({
            msg : infoMsg,
            buttons : Ext.Msg.YESNO,
            icon : Ext.Msg.INFO,
            title : L_TEXT.PROMOTE_WIN_TITLE,
            width : 500,
            fn : deplexFn,
            scope : this
         });
      }
   },
   /**
    * 文件序列删除处理函数
    *
    * @param {Object} collection
    */
   listDeleteFilesHandler : function(collection)
   {
      this.deleteFiles(collection.files, function(){
         if(collection.dirs.length > 0){
            this.listDeleteDirsHandler(collection);
         }
      }, this);
   },
   /**
    * 删除文件夹列表
    *
    * @param {Object} collection
    */
   listDeleteDirsHandler : function(collection)
   {
      this.deleteDirs(collection.dirs);
   },
   /**
    * 递归调用显示确定删除目录信息
    *
    * @param {Array} items
    * @param {Array} pool
    */
   showEnsureDeleteDirWindow : function(items, pool, callback)
   {
      var dir = items.shift();
      var L_TEXT = this.ABSTRACT_LANG_TEXT;
      Cntysoft.showQuestionWindow(Ext.String.format(L_TEXT.MSG.DELETE_DIR_QUESTION, dir), function(bid){
         if('yes' == bid){
            pool.push(dir);
         }
         if(items.length > 0){
            this.showEnsureDeleteDirWindow(items, pool, callback);
         } else{
            callback.call(this, pool);
         }
      }, this);
   },
   createNewDirHandler : function()
   {
      var L_TEXT = this.ABSTRACT_LANG_TEXT;

      Ext.Msg.prompt(L_TEXT.PROMOTE_WIN_TITLE, L_TEXT.MSG.TYPE_NEW_DIR_NAME, function(btn, text){
         if(btn == 'ok'){
            var text = Ext.String.trim(text);
            if('' == text){
               Cntysoft.showErrorWindow(L_TEXT.MSG.DIR_NAME_EMPTY);
               return;
            }
            var isOk = true;
            //先在客户端判断一下是否有同名的
            var store = this.viewObject.getStore();
            store.each(function(record){
               if(record.get('rawName') == text){
                  isOk = false;
                  return false;
               }
            }, this);
            var dirname = this.path + '/' + text;
            if(!isOk){
               Cntysoft.showErrorWindow(Ext.String.format(L_TEXT.MSG.DIR_ALREADY_EXIST, dirname));
               return;
            } else{
               this.createDir(dirname);
            }
         }
      }, this);
   },
   /**
    * 复制文件夹或者文件处理函数
    *
    * @param {Array} records
    */
   copyHandler : function(records)
   {
      var len = records.length;
      var item;
      var list = [];
      for(var i = 0; i < len; i++) {
         item = records[i];
         list.push(this.path + '/' + item.get('rawName'));
      }
      this.copy(list);
   },
   /**
    * 剪切文件夹或者文件处理函数
    *
    * @param {Array} records
    */
   cutHandler : function(records)
   {
      var len = records.length;
      var item;
      var list = [];
      for(var i = 0; i < len; i++) {
         item = records[i];
         list.push(this.path + '/' + item.get('rawName'));
      }
      this.cut(list);
   },
   /**
    * 选中所有项
    */
   selectAllHandler : function()
   {
      if(this.viewObject){
         this.viewObject.getSelectionModel().selectAll(true);
      }
   },
   /**
    * 取消选中所有项
    */
   deselectAllHandler : function()
   {
      if(this.viewObject){
         this.viewObject.getSelectionModel().deselectAll(true);
      }
   },
   /**
    * 删除选中事件处理器
    */
   deleteSelectionHandler : function()
   {
      if(this.viewObject){
         var selModel = this.viewObject.getSelectionModel();
         var records = selModel.getSelection();
         if(records.length > 0){
            this.batchDeleteHandler(records);
         }
      }
   },
   /**
    * 创建一个文件，一般是代码和样式文件
    */
   createNewFileHandler : function()
   {
      var title = this.ABSTRACT_LANG_TEXT.TITLE.FILE_NAME;
      var tip = this.ABSTRACT_LANG_TEXT.MSG.CREATE_FILE;
      Ext.Msg.show({
         title : title,
         prompt : true,
         msg : tip,
         width : 500,
         modal : true,
         buttons : Ext.MessageBox.OKCANCEL,
         fn : function(btn, text){
            if('ok' == btn){
               var filename = Ext.String.trim(text);
               if('' !== filename){
                  filename = filename.replace(/[#@!~`$%^&*\\]/gi, '');
                  var pathInfo = Cntysoft.Stdlib.Common.pathInfo(this.path + '/' + filename);
                  var type = pathInfo.extension;
                  if(null == type){
                     Cntysoft.showErrorWindow(Ext.String.format(this.ABSTRACT_LANG_TEXT.ERROR.FILE_EXT_NOT_EXIST, text));
                     return;
                  }
                  if(this.fileExist(text)){
                     Cntysoft.showErrorWindow(Ext.String.format(this.ABSTRACT_LANG_TEXT.ERROR.FILE_ALREADY_EXIST, text));
                  } else{
                     this.renderEditorWindow(this.path + '/' + filename);
                  }
               }
            }
         },
         scope : this
      });
   },
   /**
    * 获取编辑器窗口
    */
   renderEditorWindow : function(filename)
   {
      var pathInfo = Cntysoft.Stdlib.Common.pathInfo(filename);
      var type = pathInfo.extension;
      var fileVeType = this.getVeMapItem(type);
      if(fileVeType){
         var me = this;
         var editorCls = fileVeType[2];
         var editor; //下边的引用没有提前声明为局部变量
         //减少第一次的数据加载
         Cntysoft.showLoadScriptMask();
         Ext.require(editorCls, function(){
            Cntysoft.hideLoadScriptMask();
            editor = Ext.create(editorCls, {
               filename : filename,
               mode : 1, //全新模式
               fsViewRef : this,
               listeners : {
                  datasaved : function()
                  {
                     this.refresh();
                  },
                  destroy : function(editor)
                  {
                     delete editor.fsViewRef;
                  },
                  scope : me
               }
            });
            editor.show();
         }, this);
      }
   },
   /**
    * 上传文件按钮点击事件监听函数
    */
   uploadFilesHandler : function()
   {
      this.renderUploaderWindow();
   },
   /**
    * 返回上一级按钮点击事件监听函数
    */
   upDirHandler : function()
   {
      this.cd2ParentDir();
   },
   /**
    * 分类多选项
    *
    * @param {array} records
    * @return {Object}
    */
   classifyItems : function(records)
   {
      var ret = {
         files : [],
         dirs : []
      };
      var len = records.length;
      var basePath = this.path;
      var item;
      var fullname;
      if(len > 0){
         for(var i = 0; i < len; i++) {
            item = records[i];
            fullname = basePath + '/' + item.get('rawName');
            if('dir' == item.get('type')){
               ret.dirs.push(fullname);
            } else{
               ret.files.push(fullname);
            }
         }
      }
      return ret;
   }
});