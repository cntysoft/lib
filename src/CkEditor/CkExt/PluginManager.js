/*
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 浮动窗口管理器
 */
Ext.define('Cntysoft.Component.CkEditor.CkExt.PluginManager',{
    requires : [
        'Cntysoft.Kernel.StdPath'
    ],
    /**
     * 系统封装之后的CK编辑器
     * 
     * @property {Cntysoft.Component.Ck.Editor} EDITOR
     */
    EDITOR : null,
    /**
     * ckeditor原生的编辑器实例
     * 
     * @property {CKEDITOR.editor} editor
     */
    editor : null,
    /**
     * 插件对象映射
     * 
     * @property {Ext.util.HashMap} plugins
     */
    plugins : null,
    constructor : function(config)
    {
        var config = config || {};
        Ext.apply(this, config);
        this.plugins = new Ext.util.HashMap();
        if(Ext.isArray(config.plugins) && config.plugins.length > 0){
            this.initPlugins(config.plugins);
        }
    },
    /**
     * 打开插件的对话框，定向到插件对象
     * 
     * @param {String}
     */
    openDialog : function(name)
    {
        if(!this.plugins.containsKey(name)){
            Cntysoft.raiseError(Ext.getClassName(this),'openDialog', 'plugin : ' + name + ' is not exist');
        }
        var plugin = this.plugins.get(name);
        plugin.openDialog();
    },
    initPlugins : function(plugins, keys)
    {
        
        if(!this.$_plugin_loaded_$){
            var clsArray = this.getPluginClsNames(plugins);
            Ext.require(clsArray, function(){
                this.$_plugin_loaded_$ = true;
                this.initPlugins(clsArray, plugins);
            }, this);
            return;
        }
        //第二遍操作
        var len = keys.length;
        for(var i = 0; i < len; i++){
            this.plugins.add(keys[i],Ext.create(plugins[i], {
                editor : this.editor,
                EDITOR : this.EDITOR
            }));
        }
    },
    /**
     * 获取系统插件的类的名称
     * 
     * @param {Array} plugins
     * @return {Array}
     */
    getPluginClsNames : function(plugins)
    {
        var len = plugins.length;
        var ret = [];
        var base = 'Cntysoft.Component.CkEditor.CkExt.Plugins.';
        for(var i = 0; i < len; i++){
            ret.push(base + plugins[i] + '.Main');
        }
        return ret;
    },
    destroy : function()
    {
        this.plugins.each(function(key, plugin){
            plugin.destroy();
        });
        this.plugins.clear();
        delete this.editor;
        delete this.EDITOR;
        delete this.plugins;
    }
});
