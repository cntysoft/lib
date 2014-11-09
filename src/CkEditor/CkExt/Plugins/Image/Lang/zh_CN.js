/*
 * Cntysoft Cloud Software Team
 * 
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
Ext.define('Cntysoft.Component.CkEditor.CkExt.Plugins.Image.Lang.zh_CN', {
   extend : 'Cntysoft.Kernel.AbstractLangHelper',
   data : {
      NAME : 'Image',
      LABEL : '图片管理器',
      COMP : {
         IMAGE_ALIGN : {
            NoneFocus : '默认对齐',
            LeftFocus : '图片左浮动',
            RightFocus : '图片右浮动'
         }
      },
      DIALOGS : {
         DIALOG_TITLE : '图片管理器窗口',
         PANEL : {
            REMOTE_TITLE : '远程图片',
            IMAGE_POOL_TITLE : '图片库'
         },
         FIELDS : {
            IMAGE_URL : '图片地址',
            ALIGN_TYPE : '对齐方式',
            IMG_DES : '图片描述',
            MARGIN : '边距',
            BORDER : '边框',
            LOCK : '锁定比例',
            HEIGHT : '图片高度',
            WIDTH : '图片宽度'
         },
         LABEL : '双击选择图片',
         BTN : {
            BROWSE : '浏览图片库'
         }
      }
   }
});