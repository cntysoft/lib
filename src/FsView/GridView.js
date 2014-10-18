/**
 * Cntysoft OpenEngine
 * 
 * @author SOFTBOY <cntysoft@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 表格式文件浏览
 */
Ext.define('Cntysoft.Component.FsView.GridView', {
    extend : 'Cntysoft.Component.FsView.AbstractView',
    alias : 'widget.cmpgridfsview',
    requires : [
        'Cntysoft.Component.FsView.ImagePreview'
    ],
    
    /**
     * @property {Object} bbarObject  底部工具栏
     */
    bbarObject : null,
    /**
     * 显示的列的集合
     */
    displayColumns : [
        'rawName',
        'size',
        'type',
        'mTime'
    ],
    imagePreview : null,
    currentSetTimeoutId : null,
    /**
     * 是否创建底部工具栏
     */
    isCreateBBar : true,
    isCreateFsTree : true,
    LANG_TEXT : null,
    constructor : function(config)
    {
        config = config || {};
        this.LANG_TEXT = this.GET_LANG_TEXT('GRID_VIEW');
        this.callParent([config]);
    },
    initComponent : function()
    {
        this.callParent();
        var items = [];
        if(this.isCreateFsTree){
            items.push(this.getFsTreeConfig());
        }
        items.push(this.getGridViewConfig());
        this.add({
            xtype : 'container',
            flex : 1,
            layout : 'border',
            style : 'background:#ffffff',
            items : items
        });
        this.imagePreview = new Cntysoft.Component.FsView.ImagePreview();
    },
    /**
     * 获取表格方式配置对象
     * 
     * @return {Object} 
     */
    getGridViewConfig : function()
    {
        var NAMES = this.LANG_TEXT.GRID_COL_NAMES;
        var allCols = {
            rawName : {text : NAMES.NAME, dataIndex : 'rawName', flex : 1, resizable : false, menuDisabled : true},
            size : {text : NAMES.SIZE, width : 80, dataIndex : 'size', resizable : false, menuDisabled : true},
            type : {text : NAMES.TYPE, width : 100, dataIndex : 'type', resizable : false, menuDisabled : true, renderer : Ext.bind(this.fileTypeRenderer, this)},
            mTime : {text : NAMES.M_TIME, width : 150, dataIndex : 'mTime', resizable : false, menuDisabled : true}
        };
        var cols = [];
        var len = this.displayColumns.length;
        var col;
        for(var i = 0; i < len; i++) {
            col = this.displayColumns[i];
            if(allCols[col]){
                cols.push(allCols[col]);
            }
        }
        var bbar = null;
        if(this.isCreateBBar){
            bbar = this.createBBar();
        }
        return {
            xtype : 'grid',
            border : false,
            region : 'center',
            margin : this.isShowPath ? '4 0 0 2' : '0 0 0 2',
            selModel : {
                mode : this.allowMutiSelect ? 'MULTI' : 'SINGLE',
                allowDeselect : true
            },
            columns : cols,
            store : this.getFsStore(),
            listeners : {
                beforeitemclick : function(grid, record, item, index, event){
                    if(this.hasListeners.beforeitemclick){
                        return this.fireEvent('beforeitemclick', this, record, event);
                    }
                    return true;
                },
                beforeselect : function(grid, record, item, index, event){
                    if(this.hasListeners.beforeselect){
                        return this.fireEvent('beforeselect', this, record, event);
                    }
                    return true;
                },
                select : function(grid, record, item, index, event){
                    if(this.hasListeners.select){
                        return this.fireEvent('select', this, record, event);
                    }
                    return true;
                },
                itemmouseenter : this.itemMouseEnterHandler,
                itemmouseleave : this.itemModuseLeaveHandler,
                containermouseout : this.itemModuseLeaveHandler,
                itemdblclick : this.itemDblClickHandler,
                itemclick : function(grid, record, item, index, event){
                    if(this.hasListeners.itemclick){
                        this.fireEvent('itemclick', this, record, event);
                    }
                },
                containerclick : function(grid){
                    grid.getSelectionModel().deselectAll();
                },
                beforeitemcontextmenu : function(grid, record, item, index, event){
                    if(this.hasListeners.beforeitemcontextmenu){
                        event.stopEvent();
                        return this.fireEvent('beforeitemcontextmenu', this, record, event);
                    }
                    return true;
                },
                itemcontextmenu : this.itemRightClickHandler,
                afterrender : function(grid)
                {
                    this.viewObject = grid;
                },
                scope : this
            },
            bbar : bbar
        };
    },
    reloadView : function()
    {
        this.viewObject.store.load({
            params : {
                path : this.path
            }
        });
    },
    /**
     * 创建底部工具栏
     */
    createBBar : function()
    {
        var items = this.getBBarItems();
        return {
            xtype : 'toolbar',
            items : items
        };
    },
    /**
     * 获取底部工具栏的集合
     */
    getBBarItems : function()
    {
        var B_TEXT = this.LANG_TEXT.BTN;
        return [{
                text : B_TEXT.SELECT_ALL,
                listeners : {
                    click : this.selectAllHandler,
                    scope : this
                }
            }, {
                text : B_TEXT.UN_SELECT_ALL,
                listeners : {
                    click : this.deselectAllHandler,
                    scope : this
                }
            }, {
                text : B_TEXT.DELETE_SELECTED,
                listeners : {
                    click : this.deleteSelectionHandler,
                    scope : this
                }
            }, {
                text : B_TEXT.NEW_FOLDER,
                listeners : {
                    click : this.createNewDirHandler,
                    scope : this
                }
            }, {
                text : B_TEXT.PASTE,
                listeners : {
                    click : function(){
                        this.paste(this.path);
                    },
                    scope : this
                }
            }, {
                text : B_TEXT.NEW_FILE,
                listeners : {
                    click : this.createNewFileHandler,
                    scope : this
                }
            }, {
                text : B_TEXT.UPLOAD_FILE,
                listeners : {
                    click : this.uploadFilesHandler,
                    scope : this
                }
            }, {
                text : B_TEXT.UP_DIR,
                listeners : {
                    click : this.upDirHandler,
                    scope : this
                }
            }];
    },
    itemMouseEnterHandler : function(view, record, html)
    {
        var me = this;
        var allowTypes = Cntysoft.Const.IMAGE_TYPES;
        if(Ext.Array.contains(allowTypes, record.get('type'))){
            me.imagePreview.setTarget(html);
            this.currentSetTimeoutId = window.setTimeout(function(){
                me.imagePreview.loadImage(record.get('fullPath') + '/' + record.get('rawName'));
            }, 600);
        }
    },
    itemModuseLeaveHandler : function()
    {
        clearTimeout(this.currentSetTimeoutId);
        if(this.imagePreview){
            this.imagePreview.hide();
        }
    },
    /**
     * @return {String}
     */
    fileTypeRenderer : function(value)
    {
        var T = this.ABSTRACT_LANG_TEXT.FILE_TYPE;
        if('dir' == value){
            return T.DIR;
        } else{
            return value + T.FILE;
        }
    },
    destroy : function()
    {
        delete this.bbarObject;
        delete this.LANG_TEXT;
        this.imagePreview.destroy();
        delete this.imagePreview;
        this.callParent();
    }
});