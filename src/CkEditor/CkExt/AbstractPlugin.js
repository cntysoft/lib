/*
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 抽象的插件对象
 */
Ext.define('Cntysoft.Component.CkEditor.CkExt.AbstractPlugin', {
   requires : [
      'Cntysoft.Kernel.StdPath',
      'Cntysoft.Component.CkEditor.CkExt.DialogCommand'
   ],
   /**
    * 插件的名称
    *
    * @property {String} name
    */
   name : '',
   /**
    * @property {String} icon
    */
   icon : '',
   /**
    * 插件的toolbar分组
    *
    * @property {String} toolbar
    */
   toolbar : '',
   /**
    * 按钮的tooltip提示信息
    *
    * @property {String} label
    */
   label : '',
   /**
    * 插件的自己的路径
    *
    * @property {String} basePath
    */
   basePath : null,
   /**
    * @property {Cntysoft.Component.CkEditor.CkExt.DialogCommand} command
    */
   command : null,
   /**
    * 是否具有CSS样式
    *
    * @property {boolean} hasStylesheet
    */
   hasStylesheet : false,
   /**
    * 组件的语言包
    *
    * @param {Object} LANG_TEXT
    */
   LANG_TEXT : null,
   /**
    * @property {CKEDITOR.editor} editorRef
    */
   editorRef : null,
   /**
    * 系统封装之后的CK编辑器
    *
    * @property {Cntysoft.Component.CkEditor.Editor} EDITOR
    */
   EDITOR : null,
   /**
    * 弹窗对象引用
    */
   dialog : null,
   /**
    * @param {Object} config
    */
   constructor : function(config)
   {
      Ext.apply(this, config);
      //TODO 修改路径
      this.basePath = Cntysoft.Kernel.StdPath.getResourcePath() + '/Comp/CkEditor/Plugins/' + this.name;
      CKEDITOR.skin.addIcon(this.name, this.basePath + '/Icon.png');
      this.editorRef.ui.addButton(this.name.toUpperCase(), {
         label : this.label,
         command : this.name,
         toolbar : this.toolbar
      });
      if(this.hasStylesheet){
         this.initStylesheet();
      }
      this.setupEditorInstance();
   },
   /**
    * 应用语言数据
    */
   applyLangText : function()
   {
      var LANG = this.LANG_TEXT;
      Ext.apply(this, {
         name : LANG.NAME,
         label : LANG.LABEL
      });
   },
   /**
    * 获取命令对象
    *
    * @return {Cntysoft.VenderExt.CkEditor.DialogCommand}
    */
   getCommandObject : function(config)
   {
      var config = config ||{};
      Ext.apply(config,{
         name : this.name
      });
      if(null == this.command){
         this.path = new Cntysoft.Component.CkEditor.CkExt.DialogCommand(config);
      }
      return this.path;
   },

   /**
    * 获取插件本身的路径
    *
    * @return {String}
    */
   getSelfPath : function()
   {
      return this.basePath;
   },
   /**
    * 打开插件对话框
    */
   openDialog : function()
   {
      var dialog = this.getDialog();
      dialog.show();
   },
   /**
    * 获取对话框
    */
   getDialog : function()
   {
      if(null == this.dialog){
         var config = this.getDialogConfig();
         var cls = 'Cntysoft.Component.CkEditor.CkExt.Plugins.'+this.name+'.Dialogs.'+this.name;
         this.dialog = Ext.create(cls, config);
      }
      return this.dialog;
   },
   initStylesheet : function()
   {
      var id = 'CkEditor'+this.name;
      Ext.util.CSS.createStyleSheet(this.getStylesheetText(), id);
   },
   /**
    * 设置编辑器上下文菜单
    */
   setupContextMenu : Ext.emptyFn,
   /**
    * 每个插件都会加上一些自己的东西， 一般可以在这个里面进行设置
    */
   setupEditorInstance : Ext.emptyFn,
   /**
    * 获取弹窗的配置对象
    *
    * @return {Object}
    */
   getDialogConfig : function()
   {
      return {
         mainRef : this,
         editorRef : this.editorRef,
         EDITOR : this.EDITOR
      };
   },
   /**
    * 获取css样式字符
    *
    * @return {String}
    */
   getStylesheetText : Ext.emptyFn,

   destroy : function()
   {
      delete this.LANG_TEXT;
      delete this.editorRef;
      delete this.EDITOR;
      if(this.dialog){
         this.dialog.destroy();
         delete this.dialog;
      }
      if(this.hasStylesheet){
         Ext.util.CSS.removeStyleSheet('CkEditor'+this.name);
      }
   }
});