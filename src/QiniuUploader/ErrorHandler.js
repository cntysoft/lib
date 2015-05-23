/**
 * Cntysoft Cloud Software Team
 *
 * @author Changwang <chenyongwang1104@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
Ext.define('Cntysoft.Component.QiniuUploader.ErrorHandler', {
   singleton: true,
   requires: [
      'Cntysoft.Component.QiniuUploader.Lang.zh_CN'
   ],
   mixins: {
      langTextProvider: 'Cntysoft.Mixin.LangTextProvider'
   },
   /**
    * @inheritdoc
    */
   LANG_NAMESPACE: 'Cntysoft.Component.QiniuUploader.Lang',
   /**
    *  @property {Object} LANG_TEXT
    */
   LANG_TEXT: null,

   /**
    * 构造函数
    *
    * @param config
    */
   constructor: function (config)
   {
      this.LANG_TEXT = this.GET_LANG_TEXT('ERROR_MAP');
      this.callParent([config]);
   },

   /**
    * 处理七牛上传错误信息
    *
    * @param errorCode
    */
   processUploadError: function (errorCode, callback, scope)
   {
      if (errorCode && (200 != errorCode)) {
         var errorMsg = this.LANG_TEXT[errorCode];
         callback = callback || Ext.emptyFn;
         scope = scope || this;
         Cntysoft.showErrorWindow(errorMsg, callback, scope);
         if (window.CNTYSOFT_IS_DEBUG) {
            Cntysoft.raiseError(
               Ext.getClassName(this),
               'processUploadError',
               errorMsg
            );
         }
      }
   }
}, function ()
{
   var alias = Ext.Function.alias;
   /**
    * 建立别名
    */
   Ext.apply(Cntysoft, {
      processQiniuError: alias(this, 'processUploadError')
   });
});
