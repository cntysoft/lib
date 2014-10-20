/**
 * Cntysoft OpenEngine
 * 
 * @author SOFTBOY <cntysoft@163.com>
 * @author changwang <chenyongwang1104@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
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
    statics : {
        M_NEW : 1,
        M_MODIFY : 2
    },
    /**
     * @property {String} currentImageUrl 
     */
    currentImageUrl : '',
    /**
     * @property {Ext.Component} imagePreview 
     */
    imagePreview : null,
    /**
     * @property {Ext.form.Panel} form 
     */
    form : null,
    /**
     * @property {Ext.form.field.Checkbox} lockField 
     */
    lockField : null,
    /**
     * @property {Ext.form.field.Number} widthField 
     */
    widthField : null,
    /**
     * @property {Ext.form.field.Number} heightField 
     */
    heightField : null,
    /**
     * @property {Cntysoft.COmponent.CkEditor.CkExt.Plugins.Image.Comp.ImageAlign} imageAlign
     */
    imageAlign : null,
    /**
     * @property {DomElement} imageElement 
     */
    imageElement : null,
    /**
     * @property {Ext.tab.Panel} tabPanel
     */
    tabPanel : null,
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
     * @property {Cntysoft.Component.Uploader} uploader 
     */
    uploader : null,
    constructor : function(config)
    {
        this.LANG_TEXT = Cntysoft.GET_COMP_LANG_TEXT('VENDER_EXT.CK.PLUGINS.IMAGE.DIALOGS');
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
                        this.tabPanel = panel;
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
            var img = this.imagePreview.el.first();
            if(img){
                img.remove();
            }
            img = Ext.get(Ext.DomHelper.createDom({
                tag : 'img',
                src : values.url,
                width : values.width,
                height : values.height
            }));
            var form = this.form.getForm();
            this.imagePreview.el.appendChild(img);
            var fields = this.form.query('numberfield');
            for(var i = 0; i < fields.length; i++) {
                fields[i].suspendEvents();
            }
            form.setValues(values);
            for(var i = 0; i < fields.length; i++) {
                fields[i].resumeEvents();
            }
            this.imageAlign.setValue(values.floatStyle);
        } else{
            this.mode = this.self.M_NEW;
        }
    },
    okClickHandler : function()
    {
        var values = this.form.getValues();
        var url = Ext.String.trim(values.url);
        values.floatStyle = this.imageAlign.getValue();
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
                    this.editor.insertElement(img);
                }
            } else if(this.mode == this.self.M_NEW){
                var img = new CKEDITOR.dom.element(Ext.DomHelper.createDom({
                    tag : 'img',
                    src : url,
                    title : values.description
                }));
                img.setStyles(style);
                this.editor.insertElement(img);
            }
        }
        this.close();
        this.editor.focus();
    },
    /**
     * 重置对话框
     */
    resetDialog : function()
    {
        this.form.getForm().reset();
        this.imageAlign.reset();
        this.tabPanel.setActiveTab(0);
        if(this.imagePool){
            this.imagePool.cd2InitDir();
        }
        this.imageElement = null;
        this.imgUrlChange = false;
        this.currentImageUrl = null;
    },
    imgWidthChangeHandler : function(field, width)
    {
        var target = this.imagePreview.el.first();
        if(target){
            if(this.lockField.getValue()){
                var height = parseInt(width / this.previewRatio);
                this.heightField.suspendEvents();
                this.heightField.setValue(height);
                this.heightField.resumeEvents();
                target.setSize(width, height);
            } else{
                target.setWidth(width);
            }
        }
    },
    imgHeightChangeHandler : function(field, height)
    {
        var target = this.imagePreview.el.first();
        if(target){
            if(this.lockField.getValue()){
                var width = parseInt(height * this.previewRatio);
                this.widthField.suspendEvents();
                this.widthField.setValue(width);
                this.widthField.resumeEvents();
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
            var img = this.imagePreview.el.first();
            if(img){
                img.remove();
            }
            img = Ext.get(Ext.DomHelper.createDom({
                tag : 'img',
                src : url
            }));
            img.on('load', this.previewImgLoadedHandler, this);
            this.imagePreview.el.appendChild(img);
        }
        this.currentImageUrl = url;
    },
    previewImgLoadedHandler : function(event, img)
    {
        this.previewRatio = img.width / img.height;
        this.form.getForm().setValues({
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
        this.form.getForm().setValues({
            url : data.filename
        });
        if(this.EDITOR.hasListeners.filerefrequest){
            this.EDITOR.fireEvent('filerefrequest', data.rid);
        }
        this.imageUrlFieldBlurHandler(this.urlField);
    },
    getRemotePanelConfig : function()
    {
        var UI_MSG = this.LANG_TEXT;
        var F_TEXT = UI_MSG.FIELDS;
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
                                    this.urlField = field;
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
                                    this.tabPanel.setActiveTab(1);
                                },
                                scope : this
                            },
                            height : 32,
                            margin : '0 0 0 10'
                        }, {
                            xtype : 'cmpsimpleuploader',
                            margin : '0 0 0 10',
                            requestUrl : '/ApiGate/Sys',
                            requestMeta : {
                                name : 'WebUploaderHandler',
                                method : 'process'
                            },
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
                                            this.lockField = comp;
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
                                            this.widthField = field;
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
                                            this.heightField = field;
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
                                    main : this.main,
                                    name : 'align',
                                    listeners : {
                                        afterrender : function(comp){
                                            this.imageAlign = comp;
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
                                    this.imagePreview = comp;
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
                    this.form = form;
                },
                scope : this
            }
        };
    },
    getImagePoolConfig : function()
    {
        var me = this;
        var LABEL = me.LANG_TEXT.LABEL;
        return {
            xtype : 'cmpgridfsview',
            title : this.LANG_TEXT.PANEL.IMAGE_POOL_TITLE,
            startPaths : [
                Cntysoft.Kernel.StdPath.getDefaultUploadPath()
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
                    var imagePreview = fsView.imagePreview;
                    this.imagePool = fsView;
                },
                scope : this
            },
            itemDblClickHandler : function(view, record)
            {
                if(record.get('type') != 'dir'){
                    //处理图片选中
                    me.form.getForm().setValues({
                        url : record.get('fullPath') + '/' + record.get('rawName')
                    });
                    me.imageUrlFieldBlurHandler(me.urlField);
                    this.imagePreview.hide();
                    me.tabPanel.setActiveTab(0);
                } else{
                    this.callParent(arguments);
                }
            }
        };
    },
    destroy : function()
    {
        delete this.LANG_TEXT;
        delete this.imagePreview;
        delete this.imageAlign;
        delete this.lockField;
        delete this.urlField;
        delete this.form;
        delete this.widthField;
        delete this.heightField;
        delete this.imagePool;
        delete this.tabPanel;
        if(this.uploader){
            this.uploader.destroy();
        }
        delete this.uploader;
        this.callParent();
    }
});