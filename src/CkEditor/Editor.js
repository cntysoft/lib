/*
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
Ext.require('Cntysoft.Kernel.StdPath', function(){
    var basePath = Cntysoft.Kernel.StdPath.getVenderPath();
    window.CKEDITOR_BASEPATH = basePath + '/CkEditor/';
    /**
     * 封装CKEDITOR富文本编辑器
     */
    Ext.define('Cntysoft.Component.CkEditor.Editor', {
        extend : 'Ext.Component',
        alias : 'widget.cmpckditor',
        mixins : {
            langTextProvider : 'Cntysoft.Mixin.LangTextProvider'
        },
        /**
         * TODO 这里要把所有的文件加载进来吗?
         */
        requires : [
            'Cntysoft.Component.CkEditor.CkExt.DialogCommand',
            'Cntysoft.Component.CkEditor.CkExt.PluginManager',
            'Cntysoft.Component.CkEditor.Config',
            //Lang
            'Cntysoft.Component.CkEditor.Lang.zh_CN',
            //CkExt
            'Cntysoft.Component.CkEditor.CkExt.AbstractPlugin',
            'Cntysoft.Component.CkEditor.CkExt.Dialog',
            'Cntysoft.Component.CkEditor.CkExt.DialogCommand',
            'Cntysoft.Component.CkEditor.CkExt.PluginManager',
            'Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Main',
            'Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Comp.ImageAlign',
            'Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Dialogs.Image'
        ],
        /**
         * @inheritdoc
         */
        LANG_NAMESPACE : 'Cntysoft.Component.CkEditor.Lang',
        autoEl : {
            tag : 'textarea'
        },
        /**
         * CKEDITR实例
         *
         * @property {CKEDITOR.editor} ckeditorRef
         */
        ckeditorRef : null,
        /**
         * ckeditor的配置对象
         *
         * @property {Cntysoft.Component.Ck.Config} ckConfig
         */
        ckConfig : null,
        /**
         * 编辑器实例是否加载完成
         *
         * @property {Boolean} ckInstanceReady
         */
        ckInstanceReady : false,
        /**
         * 编辑器工具栏模式
         *
         * @property {String} toolbarType
         */
        toobarType : 'standard',
        /**
         * 是否开启长度检查
         *
         * @property {Boolean} enableLengthCheck
         */
        enableLengthCheck : false,
        /**
         * 开启长度检查之后的最长的长度
         *
         * @property {Integer} maxLength
         */
        maxLength : 0,
        /**
         * @property {Ext.tip.ToolTip} tooltipRef
         */
        tooltipRef : null,
        /**
         * @TODO 这里传入默认的上传路径,  这里是作为独立库的惟一的配置入口
         *
         * @property {String} defaultUploadPath
         */
        defaultUploadPath : null,
        /**
         * @TODO 这里是作为独立库的惟一的配置入口
         *
         * @property {Mixed} uploadMaxSize
         */
        uploadMaxSize : null,
        /**
         * @TODO 这里是作为独立库的惟一的配置入口
         *
         * {
         *    url : '/Api/Sys',
         *    meta : {
         *         name : 'WebUploader',
         *         method : 'process'
         *    }
         * }
         *
         * @property {Object} uploaderRequestMeta
         */
        uploadRequestMeta : null,
        /**
         * @param {Object} config
         */
        constructor : function(config)
        {
            //形成正确的覆盖关系
            var config = config || {};
            if('' == Ext.String.trim(config.defaultUploadPath)) {
                Cntysoft.raiseError(Ext.getClassName(this), 'constructor', 'defaultUploadPath is null');
            }
            if('' == Ext.String.trim(config.uploadMaxSize)) {
                Cntysoft.raiseError(Ext.getClassName(this), 'constructor', 'uploadMaxSize is null');
            }

            var ckConfig = config.ckConfig || {};
            if(config.height){
                ckConfig.height = config.height;
            }
            if(config.width){
                ckConfig.width = config.width;
            }
            this.LANG_TEXT = this.GET_ROOT_LANG_TEXT();
            this.callParent([config]);
           if(!Ext.isObject(this.uploadRequestMeta)) {
              Cntysoft.raiseError(Ext.getClassName(this), 'constructor', 'uploadRequestMeta is null');
           }
            this.constructToolbar(ckConfig);
            this.ckConfig = new Cntysoft.Component.CkEditor.Config(ckConfig);
            delete config.ckConfig;
        },
        /**
         * 根据模式生成编辑器的工具栏
         *
         * @param {Object} config
         */
        constructToolbar : function(config)
        {
            if('basic' == this.toobarType){
                Ext.apply(config, {
                    toolbar : 'Basic'
                });
            } else if('standard' == this.toobarType){
                Ext.apply(config, {
                    toolbar : null
                });
            }
        },
        /**
         * 在这里设置CKEDITOR的基本路径，防止其进行遍历搜索
         */
        initComponent : function()
        {
            if(this.enableLengthCheck){
                this.addListener({
                    change : this.lengthCheckHandler,
                    scope : this
                });
            }
            this.callParent();
        },
        /**
         * 获取编辑器内容，这个内容是带有标签的
         *
         * @returns {String}
         */
        getData : function()
        {
            if(this.ckeditorRef){
                return this.ckeditorRef.getData();
            }
        },
        /**
         * 设置编辑器的内容
         *
         * @param {String} html
         * @returns {Cntysoft.Component.Ck.Editor}
         */
        setData : function(html)
        {
            if(this.ckeditorRef && this.ckInstanceReady){
                this.ckeditorRef.setData(html);
            }
            else if(!this.ckInstanceReady){
                this.addListener('editorready', function(){
                    this.setData(html);
                }, this, {
                    single : true
                });
            }
            return this;
        },
        /**
         * 设置全局CKEDITOR对象，给他加一些方法
         */
        setupCkEditor : function()
        {
            var me = this;
            CKEDITOR.OPEDITOR = this;
            //设置标志
            if(!CKEDITOR.__CNTYSOFT_){
                CKEDITOR.on('instanceCreated', function(event){
                    var editor = event.editor;
                    editor.pluginManager = new Cntysoft.Component.CkEditor.CkExt.PluginManager({
                        EDITOR : CKEDITOR.OPEDITOR,
                        editorRef : event.editor,
                        plugins : this.ckConfig.cntysoftPlugins,
                        baseFloatZIndex : me.ckConfig.baseFloatZIndex
                    });
                    Ext.apply(CKEDITOR.editor.prototype, {
                        Cntysoft : {
                            openDialog : function(config)
                            {
                                editor.pluginManager.openDialog(config);
                            }
                        }
                    });
                }, this);
                CKEDITOR.on('instanceDestroyed', function(event){
                    var editor = event.editor;
                    //这样的清除不知道有效吗？
                    editor.pluginManager.destroy();
                    delete editor.pluginManager;
                });
                CKEDITOR.__CNTYSOFT_ = true;
            }
        },
        warpCkEvents : function()
        {
            var ck = this.ckeditorRef;
            ck.on('instanceReady', this.ckInstanceReadyHandler, this);
            //绑定相关插件事件
            ck.on('focus', Ext.bind(this.ckEventBridgeHandler, this, ['focus']), this);
            ck.on('blur', Ext.bind(this.ckEventBridgeHandler, this, ['blur']), this);
            ck.on('change', Ext.bind(this.ckEventBridgeHandler, this, ['change', this]), this);
        },
        ckEventBridgeHandler : function()
        {
            var args = Array.prototype.slice.call(arguments, 0);
            var eventType = args.shift().toLowerCase();
            if(this.hasListeners[eventType]){
                this.fireEventArgs(eventType, args);
            }
        },
        ckInstanceReadyHandler : function(event)
        {
            this.ckInstanceReady = true;
            if(this.hasListeners.editorready){
                this.fireEvent('editorready', this);
            }
        },
        /**
         * 长度检查
         */
        lengthCheckHandler : function()
        {
            this.tooltipRef.show();
            var len = this.getData().length;
            if(len <= this.maxLength){
                this.fireEvent('lengthvalid',len, this);
                this.tooltipRef.update(Ext.String.format(this.LANG_TEXT.MSG.LENGTH_CHECK, len, this.maxLength - len));
            }else{
                if(this.hasListeners.lengthoverflow){
                    this.fireEvent('lengthoverflow',len, this.maxLength, this);
                }
                this.tooltipRef.update(Ext.String.format(this.LANG_TEXT.MSG.OVERFLOW, this.maxLength));
            }
        },
        //private
        afterRender : function()
        {
            Ext.Loader.loadScript({
                url : '/JsLibrary/CkEditor/ckeditor.js',
                onLoad : function() {
                    this.setupCkEditor();
                    if(this.enableLengthCheck){
                        this.tooltipRef = new Ext.tip.ToolTip({
                            target : this.el.parent(),
                            anchor : 'top'
                        });
                    }
                    this.ckeditorRef = CKEDITOR.replace(this.id, this.ckConfig);
                    this.warpCkEvents();
                },
                scope : this
            });
            this.callParent();
        },
        //private
        beforeDestroy : function()
        {
            this.ckeditorRef.destroy();
            delete this.tooltipRef;
            delete this.ckeditorRef;
            this.callParent();
        }
    });
});