/**
 * Cntysoft OpenEngine
 * 
 * @author SOFTBOY <cntysoft@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 系统浏览器左边的文件系统树面板
 */
Ext.define('Cntysoft.Component.FsView.FsTree', {
   extend: 'Ext.tree.Panel',
   alias: 'widget.cntsmfstree',
   requires: [
      'SenchaExt.Data.TreeStore'
   ],
   mixins: {
      fcm: 'Cntysoft.Mixin.ForbidContextMenu',
      langTextProvider: 'Cntysoft.Mixin.LangTextProvider'
   },
   /**
    * @inheritdoc
    */
   LANG_NAMESPACE: 'Cntysoft.Component.FsView.Lang',
   fsViewRef: null,
   LANG_TEXT: null,
   dataProxy: null,
   constructor: function(config)
   {
      this.mixins.langTextProvider.constructor.call(this);
      this.LANG_TEXT = this.GET_LANG_TEXT('FS_TREE');
      config = config||{};
      this.applyConstraintConfig(config);
      Ext.apply(this, config);
      Ext.apply(config, {
         store: this.createFsTreeStore(config)
      });
      this.title = this.LANG_TEXT.TITLE;
      this.callParent([config]);
      this.mixins.fcm.forbidContextMenu.call(this);
   },
   applyConstraintConfig: function(config)
   {
      Ext.apply(config, {
         collapsible: true,
         autoScroll: true
      });
   },
   initComponent: function()
   {
      //检查fsViewRef是否合法
      if(!(this.fsViewRef instanceof Cntysoft.Component.FsView.AbstractView)){
         Cntysoft.raiseError(Ext.getClassName(this), 'initComponent', 'fsViewRef must be the instance of Cntysoft.Component.FsView.AbstractView');
      }
      this.addListener({
         afterrender: function(){
            this.getRootNode().expand();
         },
         itemclick: this.itemClickHandler,
         beforeitemexpand: function(obj){
            var proxy = this.getStore().getProxy();
            proxy.setInvokeParams({
               path: obj.getId()
            });
         },
         scope: this
      });
      this.callParent();
   },
   createFsTreeStore: function(config)
   {
      var STORE = this.LANG_TEXT.STORE;
      if(!Ext.isDefined(config.startPaths)||0==config.startPaths.length){
         Cntysoft.raiseError(Ext.getClassName(this), 'createFsTreeStore', 'startPaths can not be null');
      }
      return new SenchaExt.Data.TreeStore({
         root: {
            text: STORE.ROOT,
            id: config.startPaths.join('|')
         },
         fields: [
            {name: 'id', type: 'string', persist: false},
            {name: 'text', type: 'string', persist: false}
         ],
         nodeParam: 'id',
         proxy :this.getDataProxy()
      });
   },
   getDataProxy: function()
   {
      if(this.dataProxy){
         return this.dataProxy;
      }else{
         return {
            type: 'apigateway',
            callType: 'Sys',
            invokeMetaInfo: {
               name: 'Filesystem',
               method: 'treeLs'
            },
            reader: {
               type: 'json',
               rootProperty: 'data'
            }
         };
      }
   },
   itemClickHandler: function(panel, record)
   {
      this.fsViewRef.cd(record.get('id'));
   },
   destroy: function()
   {
      delete this.fsViewRef;
      delete this.LANG_TEXT;
      this.callParent();
   }
});
