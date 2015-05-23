/**
 * Cntysoft OpenEngine
 *
 * @author Changwang <chenyongwang1104@163.com>
 * copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
Ext.define('Cntysoft.Component.QiniuUploader.Lang.zh_CN', {
    extend : 'Cntysoft.Kernel.AbstractLangHelper',
    data : {
        CORE : {
            BROWSE : '选择文件',
            REPLACE_ASK : '上传队列中已经存在文件 : [ {0} ] \n你是否想要替换队列中的文件?',
            ERROR_MSG : {
                QUEUE_LIMIT_EXCEEDED : '您选择的文件数量超过了上传队列的大小限制 ({0}) 。',
                FILE_EXCEEDS_SIZE_LIMIT : '文件: [ {0} ]大小超过了系统上传限制 : {1} MB。',
                ZERO_BYTE_FILE : '文件 [ {0} ] 大小为空。',
                INVALID_FILETYPE : '文件 [ {0} ] 类型错误, 系统支持的类型有 {1}',
                UNKNOW : '未知错误'
            }
        },
        WINDOW : {
            TITLE : '平台QiniuUploader上传器窗口',
            BTN : {
                START : '开始上传',
                CANCEL_ALL : '取消所有',
                CLEAR : '清空队列'
            }
        },
        QUEUE_VIEW : {
            COLS : {
                NAME : '文件名称',
                SIZE : '文件大小',
                STATUS : '状态'
            },
            EMPTY_TEXT : '亲,没有文件需要上传哦',
            STATUS_MAP : {
                queued : '等待上传',
                progress : '<span style = "color : blue">正在上传</span>',
                error : '<span style = "color:red">上传出错</span>',
                complete : '上传完成',
                cancelled : '上传取消'
            },
            ACTION : '操作',
            TOOLTIP : {
                UPLOAD : '开始上传',
                DELETE : '删除文件'
            },
            MENU : {
                REMOVE : '移除选中文件'
            },
            ERROR_MSG : {
                //只处理可以预知的错误
                10006 : '文件 {0} 在服务器端已经存在，当前上传器配置了不能覆盖的参数'
            }
        },
       'ERROR_MAP' : {
          404 : '文件不存在！',
          614 : '文件名重复，请修改上传文件名称！',
          612 : '文件资源不存在！'
       }
    }
});