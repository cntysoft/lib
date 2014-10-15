/*
 * @author SOFTBOY <cntysoft@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
Ext.define('Cntysoft.Component.FsView.Lang.zh_CN', {
    extend : 'Cntysoft.Kernel.AbstractLangHelper',
    data : {
        //FsView\AbstractView.js
        ABSTRACT_VIEW : {
            PROMOTE_WIN_TITLE : '文件管理器对话框',
            BTN : {
                GOTO_PARENT : '返回上级目录'
            },
            CURRENT_PATH : '当前路径',
            FILE_TYPE : {
                FILE : '文件',
                DIR : '文件夹'
            },
            MENU : {
                RENAME : '重命名',
                COPY : '复制',
                CUT : '剪切',
                EDIT : '编辑',
                DELETE_FILE : '删除此文件',
                GOTO_CHILD : '进入子目录',
                DELETE_FOLDER : '删除文件夹',
                BATCH_COPY : '复制选中项',
                BATCH_CUT : '剪切选中项',
                BATCH_DELETE : '删除选中项'
            },
            TITLE : {
                FILE_NAME : '创建文件对话框'
            },
            MSG : {
                CREATE_FILE : '请输入文件名称',
                RENAME_OP : '正在重命名, 请稍候 ...',
                DELETE_FILE : '您确定要删除文件: {0} 吗？',
                DELETE_FILE_OP : '正在删除文件，请稍后...',
                DELETE_DIR_OP : '正在删除文件夹，请稍后...',
                CREATE_DIR_OP : '正在创建文件夹，请稍后...',
                CREATE_FILE_OP : '正在创建文件, 请稍后...',
                PASTE_OP : '正在进行粘贴操作，请稍后...',
                TYPE_NAME : '请您输入新的名称',
                TYPE_NEW_DIR_NAME : '请您输入新的文件夹名称',
                DIR_NAME_EMPTY : '您要创建的文件夹名称不能为空',
                DELETE_DIR_QUESTION : '您确定要删除文件夹: <span style = "color:red">{0}</span> 吗？选择确定将会删除本文件夹以及所有的子文件夹，这个操作不能恢复。',
                DELETE_AGGR_INFO : '您确定要删除以下信息吗? </br>文件列表:</br>{0}</br>目录列表:</br>{1}',
                DIR_ALREADY_EXIST : '文件夹: <span style = "color:red">{0}</span> 已经存在',
                FILE_ALREADY_EXIST : '文件 : <span style = "color:red">{0}</span> 已经存在',
                EMPTY_INFO_ITEM : '<span style = "color : red">空</span></br>',
                FILE_NAME : '文件',
                FOLDER_NAME : '文件夹',
                UPLOAD_COMPLETE_ASK : '上传完成，是否继续上传文件 ？ '
            },
            ERROR : {
                FILE_ALREADY_EXIST : '文件 : <span style = "color:blue">{0}</span> 已经存在',
                FILE_EXT_NOT_EXIST : '文件名: <span style = "color : red">{0} </span> 缺少扩展名'
            }
        },
        //FsTree.js
        FS_TREE : {
            TITLE : '文件系统树选择面板',
            STORE : {
                ROOT : '根目录'
            }
        },
        //GridView.js
        GRID_VIEW : {
            GRID_COL_NAMES : {
                NAME : '名称',
                SIZE : '大小',
                TYPE : '类型',
                M_TIME : '最后修改时间'
            },
            BTN : {
                DELETE_SELECTED : '删除选中',
                NEW_FOLDER : '新建文件夹',
                NEW_FILE : '新建文件',
                PASTE : '粘贴剪切板',
                SELECT_ALL : '选中所有项',
                UN_SELECT_ALL : '取消选中',
                UPLOAD_FILE : '上传文件到当前目录',
                UP_DIR : '返回上级'
            }
        },
        //ImagePreview.js
        IMAGE_PREVIEW : {
            LOADING : '正在加载图片...'
        },
        /**
         * 出错提示
         */
        ERROR_MAP : {
            'Cntysoft.Framework.Manager.Scripts.ErrorType' : {
                10006 : '当前文件夹 <span style="color:blue;">{0}</span> 不可写，请修改权限！'
            }
        }
    }
});
