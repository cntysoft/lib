/*
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 封装CKEDITOR富文本编辑器 配置对象, 根据我们的平台做了调整
 */
Ext.define('Cntysoft.Component.CkEditor.Config', {
    baseFloatZIndex : 100000,
    language : 'zh-cn',
    height : 200,
    resize_enabled : false,
    toolbarCanCollapse : false,
//    toolbar_Standard :
//    [
//        ['Source', '-', 'Save', 'NewPage', 'Preview', '-', 'Templates'],
//        ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Print', 'SpellChecker', 'Scayt'],
//        ['Undo', 'Redo', '-', 'Find', 'Replace', '-', 'SelectAll', 'RemoveFormat'],
//        ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'],
//        '/',
//        ['Bold', 'Italic', 'Underline', 'Strike', '-', 'Subscript', 'Superscript'],
//        ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', 'Blockquote'],
//        ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
//        ['Link', 'Unlink', 'Anchor'],
//        ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak'],
//        '/',
//        ['Styles', 'Format', 'Font', 'FontSize'],
//        ['TextColor', 'BGColor'],
//        ['Maximize', 'ShowBlocks', '-', 'About']
//    ],
    toolbar_Basic :
    [
        ['Bold', 'Italic', '-', 'TextColor', 'BGColor', '-','Font', 'FontSize','-','NumberedList', 'BulletedList', '-', 'Link', 'Unlink', '-', 'About']
    ],
    font_names : '宋体;微软雅黑;楷体;黑体;隶书;' +
    'Arial/Arial, Helvetica, sans-serif;' +
    'Comic Sans MS/Comic Sans MS, cursive;' +
    'Courier New/Courier New, Courier, monospace;' +
    'Georgia/Georgia, serif;' +
    'Lucida Sans Unicode/Lucida Sans Unicode, Lucida Grande, sans-serif;' +
    'Tahoma/Tahoma, Geneva, sans-serif;' +
    'Times New Roman/Times New Roman, Times, serif;' +
    'Trebuchet MS/Trebuchet MS, Helvetica, sans-serif;' +
    'Verdana/Verdana, Geneva, sans-serif',
    cntysoftPlugins : ['Image'],
    plugins :
    'about,' +
    'a11yhelp,' +
    'basicstyles,' +
    'bidi,' +
    'blockquote,' +
    'clipboard,' +
    'colorbutton,' +
    'colordialog,' +
    'contextmenu,' +
    'dialogadvtab,' +
    'div,' +
    'elementspath,' +
    'enterkey,' +
    'entities,' +
    'filebrowser,' +
    'find,' +
    'flash,' +
    'floatingspace,' +
    'font,' +
    'format,' +
    'forms,' +
    'horizontalrule,' +
    'htmlwriter,' +
    'iframe,' +
    'indent,' +
    'justify,' +
    'link,' +
    'list,' +
    'liststyle,' +
    'magicline,' +
    'maximize,' +
    'newpage,' +
    'pagebreak,' +
    'pastefromword,' +
    'pastetext,' +
    'preview,' +
    'print,' +
    'removeformat,' +
    'resize,' +
    'save,' +
    'selectall,' +
    'showblocks,' +
    'showborders,' +
    'smiley,' +
    'sourcearea,' +
    'specialchar,' +
    'stylescombo,' +
    'tab,' +
    'table,' +
    'tabletools,' +
    'templates,' +
    'toolbar,' +
    'undo,' +
    'wysiwygarea',
    constructor : function(config)
    {
        Ext.apply(this, config);
    }
});