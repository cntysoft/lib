/*
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 因为我们的系统是WEBOS，那么我们系统的UI是完全可以使用Ext强大UI能力
 * 而不用去在乎CKEDITOR那种弱小的UI能力 呵呵
 */
Ext.define('Cntysoft.Component.QiniuCkEditor.CkExt.DialogCommand', {
    requires : [
        'Cntysoft.Component.QiniuCkEditor.CkExt.Dialog'
    ],
    /**
     * 命令的名称
     * 
     * @property {String} name
     */
    name : '',
    canUndo : false,
    editorFocus: 1,
    constructor : function(config)
    {

        if(!Ext.isDefined(config.name)){
            Cntysoft.raiseError(Ext.getClassName(this), 'constructor', 'Dialog Command must have name field');
        }
        Ext.apply(this, config);
        this.rawName = config.name;
    },
    exec : function(editor)
    {
        editor.pluginManager.openDialog(this.rawName);
    }
});