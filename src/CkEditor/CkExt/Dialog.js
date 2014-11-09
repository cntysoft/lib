/*
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 弹窗基类
 */
Ext.define('Cntysoft.Component.CkEditor.CkExt.Dialog', {
    extend : 'Ext.window.Window',
    /**
     * @property {CKEDITOR.editor} editor
     */
    editor : null,
    /**
     * 系统封装之后的CK编辑器
     * 
     * @property {Cntysoft.Component.Ck.Editor} EDITOR
     */
    EDITOR : null,
    /**
     * @property {Cntysoft.VenderExt.CkEditor.AbstractPlugin} main
     */
    main : null,
    constructor : function(config)
    {
        config = config || {};
        this.applyConstraintConfig(config);
        if(!Ext.isDefined(config.editor)){
            Cntysoft.raiseError(Ext.getClassName(this), 'constructor', 'must have editor instance');
        } else if(!Ext.isDefined(config.main)){
            Cntysoft.raiseError(Ext.getClassName(this), 'constructor', 'must have main instance');
        }
        this.callParent([config]);
    },
    applyConstraintConfig : function(config)
    {
        Ext.apply(config, {
            bodyStyle : 'background:#ffffff',
            closeAction : 'hide',
            modal : true,
            minWidth : 500,
            minHeight : 300,
            constrain : true,
            constrainTo : Ext.getBody(),
            layout : 'fit'
        });
    },
    initComponent : function()
    {
        this.addListener({
            beforeshow : this.beforeShowHandler,
            close : function()
            {
                this.editor.updateElement();
                this.resetDialog();
            },
            scope : this
        });
        this.callParent();
    },
    /**
     * 这个方法只是用来测试数据，至于数据怎么使用由show事件处理器决定
     */
    load : Ext.emptyFn,
    resetDialog : Ext.emptyFn,
    /**
     * 处理Ck删除ExtJs样式类的问题
     */
    beforeShowHandler : function()
    {
        this.center();
        var html = Ext.fly(Ext.dom.Query.selectNode('html'));
        var cls = ['x-border-box', 'x-strict'];
        for(var i = 0; i < cls.length; i++) {
            if(!html.hasCls(cls[i])){
                html.addCls(cls[i]);
            }
        }
    },
    /**
     * 获取取消按钮配置对象
     */
    getCancelBtnConfig : function()
    {
        return {
            text : Cntysoft.GET_LANG_TEXT('UI.BTN.CANCEL'),
            listeners : {
                click : function()
                {
                    this.close();
                },
                scope : this
            }
        };
    },
    destroy : function()
    {
        delete this.editor;
        delete this.main;
        delete this.EDITOR;
        this.callParent();
    }
});