/*
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 图片管理器
 */
Ext.define('Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Dialogs.Image', {
    extend : 'Cntysoft.Component.CkEditor.CkExt.Dialog',
    requires : [
        'Cntysoft.Component.FsView.GridView',
        'Cntysoft.Kernel.StdPath',
        'Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Comp.ImageAlign',
        'Cntysoft.Component.Uploader.SimpleUploader'
    ],
    mixins : {
        langTextProvider : 'Cntysoft.Mixin.LangTextProvider'
    },
    /**
     * @inheritdoc
     */
    LANG_NAMESPACE : 'Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Lang',
    statics : {
        M_NEW : 1,
        M_MODIFY : 2
    },
    /**
     * @property {String} currentImageUrl
     */
    currentImageUrl : '',
    /**
     * @property {Ext.Component} imagePreviewRef
     */
    imagePreviewRef : null,
    /**
     * @property {Ext.form.Panel} formRef
     */
    formRef : null,
    /**
     * @property {Ext.form.field.Checkbox} lockFieldRef
     */
    lockFieldRef : null,
    /**
     * @property {Ext.form.field.Number} widthFieldRef
     */
    widthFieldRef : null,
    /**
     * @property {Ext.form.field.Number} heightFieldRef
     */
    heightFieldRef : null,
    /**
     * @property {Cntysoft.COmponent.CkEditor.CkExt.Plugins.Image.Comp.ImageAlign} imageAlignRef
     */
    imageAlignRef : null,
    /**
     * @property {DomElement} imageElement
     */
    imageElement : null,
    /**
     * @property {Ext.tab.Panel} tabPanelRef
     */
    tabPanelRef : null,
    /**
     * 图片库对象
     *
     * @property {Cntysoft.Component.FsView.GridView} imagePool
     */
    imagePool : null,
    /**
     * 当前窗口的模式
     */
    mode : 1,
    /**
     * 图片比率
     */
    previewRatio : 1,
    /**
     * @property {Boolean} imgUrlChange
     */
    imgUrlChange : false,
    /**
     * @property {Cntysoft.Component.Uploader} uploaderRef
     */
    uploaderRef : null,
    constructor : function(config)
    {
        this.LANG_TEXT = this.GET_LANG_TEXT('DIALOGS');
        this.applyConstarintConfig();
        this.callParent([config]);
    },
    applyConstarintConfig : function()
    {
        Ext.apply(this, {
            title : this.LANG_TEXT.DIALOG_TITLE,
            width : 645,
            minWidth : 645,
            height : 490,
            minHeight : 490,
            resizable : false
        });
    },
    initComponent : function()
    {
        Ext.apply(this, {
            border : false,
            items : {
                xtype : 'tabpanel',
                items : [
                    this.getRemotePanelConfig(),
                    this.getImagePoolConfig()
                ],
                listeners : {
                    afterrender : function(panel)
                    {
                        this.tabPanelRef = panel;
                    },
                    scope : this
                }
            }
        });
        this.addListener('show', this.showHandler, this);
        this.callParent();
    },
    /**
     * 解析元素 获取设置值
     *
     * @return {Object}
     */
    parseElement : function()
    {
        var el = this.imageElement;
        var values = {};
        Ext.apply(values, {
            url : el.getAttribute('src'),
            description : el.getAttribute('title'),
            width : parseInt(el.getStyle('width')),
            height : parseInt(el.getStyle('height')),
            border : parseInt(el.getStyle('border-width')),
            margin : parseInt(el.getStyle('margin')),
            floatStyle : el.getStyle('float')
        });
        return values;
    },
    load : function(element)
    {
        this.imageElement = element;
    },
    showHandler : function()
    {
        if(this.imageElement instanceof CKEDITOR.dom.element){
            this.mode = this.self.M_MODIFY;
            var values = this.parseElement();
            //获取比率
            this.previewRatio = values.width / values.height;
            var img = this.imagePreviewRef.el.first();
            if(img){
                img.remove();
            }
            img = Ext.get(Ext.DomHelper.createDom({
                tag : 'img',
                src : values.url,
                width : values.width,
                height : values.height
            }));
            var form = this.formRef.getForm();
            this.imagePreviewRef.el.appendChild(img);
            var fields = this.formRef.query('numberfield');
            for(var i = 0; i < fields.length; i++) {
                fields[i].suspendEvents();
            }
            form.setValues(values);
            for(var i = 0; i < fields.length; i++) {
                fields[i].resumeEvents();
            }
            this.imageAlignRef.setValue(values.floatStyle);
        } else{
            this.mode = this.self.M_NEW;
        }
    },
    okClickHandler : function()
    {
        var values = this.formRef.getValues();
        var url = Ext.String.trim(values.url);
        values.floatStyle = this.imageAlignRef.getValue();
        var style = {
            'padding' : '1px',
            'border-width' : values.border + 'px',
            'border-style' : 'solid',
            'border-color' : '#cccccc',
            'margin' : values.margin + 'px',
            'float' : values.floatStyle,
            'width' : values.width + 'px',
            'height' : values.height + 'px'
        };
        if('' != url){
            if(this.mode == this.self.M_MODIFY){
                if(!this.imgUrlChange){
                    var el = this.imageElement;
                    el.setStyles(style);
                    el.setAttribute('title', values.description);
                    el.setAttribute('src', values.url);
                } else{
                    this.imageElement.remove();
                    var img = new CKEDITOR.dom.element(Ext.DomHelper.createDom({
                        tag : 'img',
                        src : url,
                        title : values.description
                    }));
                    img.setStyles(style);
                    this.editorRef.insertElement(img);
                }
            } else if(this.mode == this.self.M_NEW){
                var img = new CKEDITOR.dom.element(Ext.DomHelper.createDom({
                    tag : 'img',
                    src : url,
                    title : values.description
                }));
                img.setStyles(style);
                this.editorRef.insertElement(img);
            }
        }
        this.close();
        this.editorRef.focus();
    },
    /**
     * 重置对话框
     */
    resetDialog : function()
    {
        this.formRef.getForm().reset();
        this.imageAlignRef.reset();
        this.tabPanelRef.setActiveTab(0);
        if(this.imagePool){
            this.imagePool.cd2InitDir();
        }
        this.imageElement = null;
        this.imgUrlChange = false;
        this.currentImageUrl = null;
    },
    imgWidthChangeHandler : function(field, width)
    {
        var target = this.imagePreviewRef.el.first();
        if(target){
            if(this.lockFieldRef.getValue()){
                var height = parseInt(width / this.previewRatio);
                this.heightFieldRef.suspendEvents();
                this.heightFieldRef.setValue(height);
                this.heightFieldRef.resumeEvents();
                target.setSize(width, height);
            } else{
                target.setWidth(width);
            }
        }
    },
    imgHeightChangeHandler : function(field, height)
    {
        var target = this.imagePreviewRef.el.first();
        if(target){
            if(this.lockFieldRef.getValue()){
                var width = parseInt(height * this.previewRatio);
                this.widthFieldRef.suspendEvents();
                this.widthFieldRef.setValue(width);
                this.widthFieldRef.resumeEvents();
                target.setSize(width, height);
            } else{
                target.setHeight(height);
            }
        }
    },
    imageUrlFieldBlurHandler : function(field)
    {
        var url = Ext.String.trim(field.getValue());
        if(this.currentImageUrl != url){
            if(this.mode == this.self.M_MODIFY){
                this.imgUrlChange = true;
            }
            var img = this.imagePreviewRef.el.first();
            if(img){
                img.remove();
            }
            img = Ext.get(Ext.DomHelper.createDom({
                tag : 'img',
                src : url
            }));
            img.on('load', this.previewImgLoadedHandler, this);
            this.imagePreviewRef.el.appendChild(img);
        }
        this.currentImageUrl = url;
    },
    previewImgLoadedHandler : function(event, img)
    {
        this.previewRatio = img.width / img.height;
        this.formRef.getForm().setValues({
            height : img.height,
            width : img.width
        });
    },
    /**
     * 图片上传成功事件
     */
    uploadSuccessHandler : function(data)
    {
        data = data.shift();
        this.formRef.getForm().setValues({
            url : data.filename
        });
        if(this.EDITOR.hasListeners.filerefrequest){
            this.EDITOR.fireEvent('filerefrequest', data.rid);
        }
        this.imageUrlFieldBlurHandler(this.urlFieldRef);
    },
    getRemotePanelConfig : function()
    {
        var UI_MSG = this.LANG_TEXT;
        var F_TEXT = UI_MSG.FIELDS;
        var requestMeta = this.EDITOR.uploadRequestMeta;
        return {
            xtype : 'form',
            title : this.LANG_TEXT.PANEL.REMOTE_TITLE,
            border : false,
            bodyPadding : 10,
            items : [{
                xtype : 'fieldcontainer',
                fieldLabel : F_TEXT.IMAGE_URL,
                labelWidth : 80,
                layout : 'hbox',
                items : [{
                    xtype : 'textfield',
                    flex : 1,
                    listeners : {
                        blur : this.imageUrlFieldBlurHandler,
                        afterrender : function(field){
                            this.urlFieldRef = field;
                        },
                        scope : this
                    },
                    name : 'url'
                }, {
                    xtype : 'button',
                    text : UI_MSG.BTN.BROWSE,
                    listeners : {
                        click : function()
                        {
                            this.tabPanelRef.setActiveTab(1);
                        },
                        scope : this
                    },
                    height : 32,
                    margin : '0 0 0 10'
                }, {
                    xtype : 'cmpsimpleuploader',
                    margin : '0 0 0 10',
                    requestUrl : requestMeta.url,
                    uploadPath : this.EDITOR.defaultUploadPath,
                    maxSize : this.EDITOR.uploadMaxSize,
                    apiRequestMeta : requestMeta.meta,
                    fileTypeExts : ['gif', 'png', 'jpg', 'jpeg'],
                    maskTarget : this,
                    enableFileRef : true,
                    listeners : {
                        fileuploadsuccess : this.uploadSuccessHandler,
                        scope : this
                    }
                }]
            }, {
                xtype : 'fieldcontainer',
                margin : '10 0 0 0',
                layout : 'hbox',
                items : [{
                    xtype : 'fieldcontainer',
                    height : 285,
                    width : 300,
                    defaults : {
                        width : 290,
                        labelWidth : 80
                    },
                    items : [{
                        xtype : 'checkbox',
                        fieldLabel : F_TEXT.LOCK,
                        checked : true,
                        name : 'lock',
                        listeners : {
                            afterrender : function(comp){
                                this.lockFieldRef = comp;
                            },
                            scope : this
                        }
                    }, {
                        xtype : 'numberfield',
                        fieldLabel : F_TEXT.WIDTH,
                        value : 1,
                        minValue : 1,
                        name : 'width',
                        listeners : {
                            change : this.imgWidthChangeHandler,
                            afterrender : function(field){
                                this.widthFieldRef = field;
                            },
                            scope : this
                        }
                    }, {
                        xtype : 'numberfield',
                        fieldLabel : F_TEXT.HEIGHT,
                        value : 1,
                        minValue : 1,
                        name : 'height',
                        listeners : {
                            change : this.imgHeightChangeHandler,
                            afterrender : function(field){
                                this.heightFieldRef = field;
                            },
                            scope : this
                        }
                    }, {
                        xtype : 'numberfield',
                        fieldLabel : F_TEXT.BORDER,
                        value : 0,
                        minValue : 0,
                        name : 'border'
                    }, {
                        xtype : 'numberfield',
                        fieldLabel : F_TEXT.MARGIN,
                        value : 0,
                        minValue : 0,
                        name : 'margin'
                    }, {
                        xtype : 'textarea',
                        fieldLabel : F_TEXT.IMG_DES,
                        height : 80,
                        name : 'description'
                    }, new Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Comp.ImageAlign({
                        height : 40,
                        labelWidth : 80,
                        fieldLabel : F_TEXT.ALIGN_TYPE,
                        mainRef : this.mainRef,
                        name : 'align',
                        listeners : {
                            afterrender : function(comp){
                                this.imageAlignRef = comp;
                            },
                            scope : this
                        }
                    })]
                }, {
                    xtype : 'component',
                    width : 315,
                    height : 285,
                    padding : 1,
                    style : 'border:1px solid #ccc',
                    autoScroll : true,
                    listeners : {
                        afterrender : function(comp){
                            this.imagePreviewRef = comp;
                        },
                        scope : this
                    }
                }]
            }],
            buttons : [{
                text : Cntysoft.GET_LANG_TEXT('UI.BTN.OK'),
                listeners : {
                    click : this.okClickHandler,
                    scope : this
                }
            }, this.getCancelBtnConfig()],
            listeners : {
                afterrender : function(form){
                    this.formRef = form;
                },
                scope : this
            }
        };
    },
    getImagePoolConfig : function()
    {
        var me = this;
        var LABEL = me.LANG_TEXT.LABEL;
        var cfg = Shenen.getSysEnv().get(Christ.Const.ENV_SITE_SETTING);
        return {
            xtype : 'cmpgridfsview',
            title : this.LANG_TEXT.PANEL.IMAGE_POOL_TITLE,
            startPaths : [
                this.EDITOR.defaultUploadPath + '/' + cfg.siteId
            ],
            allowFileTypes : Cntysoft.Const.IMAGE_TYPES,
            displayColumns : ['rawName', 'size', 'type'],
            createBBar : function()
            {
                return {
                    xtype : 'toolbar',
                    items : [{
                        xtype : 'label',
                        text : LABEL,
                        cls : 'cntysoft-comp-gridview-toobar-label'
                    }]
                };
            },
            listeners : {
                afterrender : function(fsView)
                {
                    var imagePreviewRef = fsView.imagePreview;
                    this.imagePool = fsView;
                },
                scope : this
            },
            itemDblClickHandler : function(view, record)
            {
                if(record.get('type') != 'dir'){
                    //处理图片选中
                    me.formRef.getForm().setValues({
                        url : record.get('fullPath') + '/' + record.get('rawName')
                    });
                    me.imageUrlFieldBlurHandler(me.urlFieldRef);
                    this.imagePreviewRef.hide();
                    me.tabPanelRef.setActiveTab(0);
                } else{
                    this.callParent(arguments);
                }
            }
        };
    },
    destroy : function()
    {
        delete this.LANG_TEXT;
        delete this.imagePreviewRef;
        delete this.imageAlignRef;
        delete this.lockFieldRef;
        delete this.urlFieldRef;
        delete this.formRef;
        delete this.widthFieldRef;
        delete this.heightFieldRef;
        delete this.imagePool;
        delete this.tabPanelRef;
        if(this.uploaderRef){
            this.uploaderRef.destroy();
        }
        delete this.uploaderRef;
        this.callParent();
    }
});