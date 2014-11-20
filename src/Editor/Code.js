/*
 * Cntysoft Cloud Software Team
 * 
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
Ext.define('Cntysoft.Component.Editor.Code', {
   extend : 'Ext.Component',
   alias : 'widget.compeditorcode',
   requires : [
      'Cntysoft.Utils.Common',
      'Cntysoft.Kernel.StdPath'
   ],
   inheritableStatics : {
      /**
       * 这个是风格名称对CSS文件的映射关系
       *
       * @property {Object} THEME_MAP
       */
      THEME_TO_CSS_MAP : {
         default : ['default', 'lib/codemirror.css'],
         neat : ['neat', 'theme/neat.css'],
         ambiance : ['ambiance', 'theme/ambiance.css'],
         blackboard : ['blackboard', 'theme/blackboard.css'],
         cobalt : ['cobalt', 'theme/cobalt.css'],
         eclipse : ['eclipse', 'theme/eclipse.css'],
         elegant : ['elegant', 'theme/elegant.css'],
         erlangDark : ['erlang-dark', 'theme/erlang-dark.css'],
         lesserDark : ['lesser-dark', 'theme/lesser-dark.css'],
         monokai : ['monokai', 'theme/monokai.css'],
         night : ['night', 'theme/night.css'],
         rubyBlue : ['rubyblue', 'theme/rubyblue.css'],
         solarizedDark : ['solarized dark', 'theme/solarized.css'],
         solarizedLight : ['solarized light', 'theme/solarized.css'],
         twilight : ['twilight', 'theme/twilight.css'],
         vibrantInk : ['vibrant-ink', 'theme/vibrant-ink.css'],
         xqDark : ['xq-dark', 'theme/xq-dark.css'],
         xqLight : ['xq-light', 'theme/xq-light.css']
      },
      //很多模式暂时不需要
      MODES : {
         js : 'javascript',
         css : 'css',
         html : 'htmlmixed',
         sql : 'sql',
         php : 'php',
         xml : 'xml',
         phtml : 'php'
      },
      /**
       * 模块是否支持
       *
       * @return  {Boolean}
       */
      modeIsSupported : function(mode)
      {
         return this.MODES.hasOwnProperty(mode);
      },
      /**
       * 风格是否支持
       *
       * @return {boolean}
       */
      themeIsSupported : function(theme)
      {
         var map = this.THEME_TO_CSS_MAP;
         for(var key in map) {
            if(theme == key){
               return true;
            }
         }
         return false;
      },
      /**
       * 获取Theme对应的Css文件
       *
       * @return {String} 风格文件
       */
      getThemeCssFile : function(theme)
      {

         var data = this.THEME_TO_CSS_MAP[theme];
         var basePath = Cntysoft.Kernel.StdPath.getJsLibraryPath();
         return basePath + '/CodeMirror/' + data[1];
      },
      /**
       * 获取CODE MIRROR地址
       *
       * @return {String}
       */
      getBasePath : function()
      {
         return  Cntysoft.Kernel.StdPath.getJsLibraryPath() + '/CodeMirror';
      },
      /**
       * 获取codemirror mode的地址
       *
       * @return {String}
       */
      getCodeMirrorModeUrl : function()
      {
         return this.getBasePath() + "/mode/%N/%N.js";
      }
   },
   /**
    * 我们系统对于CODE MIRROR指定的一些默认值
    * 详细文档可以参照 http://codemirror.net/doc/manual.html#config
    *
    * @property {Object} codeMirrorConfig
    */
   codeMirrorConfig : {
      /**
       * @property {string|object} mode
       */
      mode : 'js',
      /**
       * @property {String|Object} theme
       */
      skin : 'rubyBlue',
      /**
       * @property {Integer} indentUnit
       */
      indentUnit : 4,
      /**
       * 根据上下文只能判断缩进
       *
       * @property {Boolean} smartIndent
       */
      smartIndent : true,
      /**
       * 制表符的大小，默认4个空格
       *
       * @property {Integer} tabSize
       */
      tabSize : 4,
      /**
       * 利用TAB进行缩进
       *
       * @property {Boolean} indentWithTabs
       */
      indentWithTabs : false,
      /**
       * 动态进行缩进
       *
       * @property {Boolean} electricChars
       */
      electricChars : true,
      /**
       * @property {Boolean} lineWrapping
       */
      lineWrapping : false,
      /**
       * 是否在编辑器左边显示行号
       *
       * @property {Boolean} lineNumbers
       */
      lineNumbers : true,
      /**
       * @property {Integer} firstLineNumber
       */
      firstLineNumber : 1,
      /**
       * 行号格式化函数
       *
       * @param {Function} lineNumberFormatter
       */
      //lineNumberFormatter : Ext.emptyFn,
      /**
       * @property {Boolean} readOnly
       */
      readOnly : false,
      /**
       * @property {Boolean} showCursorWhenSelecting
       */
      showCursorWhenSelecting : false,
      /**
       * @property {Integer} undoDepth
       */
      undoDepth : 40
   },

   /**
    * 编辑器是否准备好
    *
    * @property {Boolean} editorReady
    */
   editorReady : false,
   /**
    * CODE MIRROR实例
    *
    * @property {Object} cmInstanceRef
    */
   cmInstanceRef : null,
   /**
    * @event change
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    * @param {Object} changeInfo
    */
   /**
    * @event beforechange
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    * @param {Object} changeInfo
    */
   /**
    * @event cursoractivity
    *
    * Will be fired when the cursor or selection moves, or any change is made to the editor content.
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    */
   /**
    * @event beforeselectionchange
    *
    * This event is fired before the selection is moved. Its handler may modify the resulting selection head and anchor.
    * The selection parameter is an object with head and anchor properties holding {line, ch} objects,
    * which the handler can read and update. Handlers for this event have the same restriction as "beforeChange"
    *  handlers — they should not do anything to directly update the state of the editor.
    *
    *  @param {Cntysoft.Component.Editor.Code} editor
    *  @param {Object} selection
    */
   /**
    * @event viewportchange
    *
    * Fires whenever the view port of the editor changes (due to scrolling, editing, or any other factor).
    * The from and to arguments give the new start and end of the viewport.
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    * @param {Integer} from
    * @param {Integer} to
    */
   /**
    * @event focus
    *
    * Fires whenever the editor is focused.
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    */
   /**
    * @event blur
    *
    * Fires whenever the editor is unfocused.
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    */
   /**
    * @event scroll
    *
    * Fires when the editor is scrolled.
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    */
   /**
    * @event update
    *
    * Will be fired whenever CodeMirror updates its DOM display.
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    */
   /**
    * @event editorready
    *
    * 当编辑器实例化完成的时候派发事件
    *
    * @param {Cntysoft.Component.Editor.Code} editor
    */


   /**
    * 构造函数,这里会对配置项进行处理
    *
    * @param {Object} config
    */
   constructor : function(config)
   {
      var config = config || {};
      if(Ext.isDefined(config.codeMirrorConfig)){
         Ext.apply(this.codeMirrorConfig, config.codeMirrorConfig);
         config.codeMirrorConfig = null;
         delete config.codeMirrorConfig;
      }
      this.codeMirrorConfig.theme = this.codeMirrorConfig.skin;
      this.loadThemeCss(this.codeMirrorConfig.theme);
      this.callParent([config]);
   },
   initComponent : function()
   {
      this.addListener({
         afterrender : this.afterRenderHandler,
         scope : this
      });
      this.callParent();
   },
   /**
    * @param {String} modeName
    */
   changeMode : function(modeName)
   {
      if(!this.editorReady){
         this.addListener('editorready', function(){
            this.changeMode(modeName);
         }, this, {
            single : true
         });
         return;
      }
      if(!this.self.modeIsSupported(modeName)){
         //本系统不支持的mode
         Cntysoft.raiseError(Ext.getClassName(this), 'changeMode', 'mode : ' + modeName + ' is not supported');
      }
      modeName = this.self.MODES[modeName];
      CodeMirror.autoLoadMode(this.cmInstanceRef, modeName);
      CodeMirror.modeURL = this.self.getCodeMirrorModeUrl();
      this.cmInstanceRef.setOption('mode', modeName);
   },
   /**
    * 获取当前编辑器的mode
    *
    * @return {String}
    */
   getCurrentModeType : function()
   {
      if(this.editorReady){
         return CodeMirror.getOption('mode');
      }else{
         return null;
      }

   },
   /**
    * 判断是否有改动
    *
    * @return {String}
    */
   isDirty : function()
   {
      if(this.cmInstanceRef){
         return this.cmInstanceRef.isClean();
      }else{
         //没加载好肯定是false
         return false;
      }
   },
   /**
    * 设置编辑器的内容
    *
    * @param {String} value
    * @return {Cntysoft.Component.Editor.Code}
    */
   setValue : function(value)
   {
      if(this.cmInstanceRef){
         this.cmInstanceRef.setValue(value);
      }else{
         //通过事件实现设置
         this.addListener('editorready', function(editor){
            editor.setValue(value);
         },{
            single : true
         });
      }
      return this;
   },
   /**
    * 获取编辑器的内容
    *
    * @param {String} seperator
    * @return {String}
    */
   getValue : function(seperator)
   {
      if(this.cmInstanceRef){
         return this.cmInstanceRef.getValue(seperator);
      }
   },

   setWidth : function(width)
   {
      this.callParent(arguments);
      if(this.cmInstanceRef){
         this.cmInstanceRef.setSize(width);
      }
      return this;
   },

   setHeight : function(height)
   {
      this.callParent(arguments);
      if(this.cmInstanceRef){
         this.cmInstanceRef.setSize(null, height - 5);
      }
   },
   /**
    * @return {CodeMirror}
    */
   getCmInstance : function()
   {
      return this.cmInstanceRef;
   },
   /**
    * 获取光标的位置
    *
    * @return {Object}
    */
   getCursor : function()
   {
      if(this.editorReady){
         var doc = this.cmInstanceRef.getDoc();
         return doc.getCursor();
      }else{
         return null;
      }

   },
   /**
    *  获取一定范围的内容
    */
   getRange : function(from, to, separator)
   {
      if(this.editorReady){
         var doc = this.cmInstanceRef.getDoc();
         return doc.getRange(from, to, separator);
      }else{
         return null;
      }
   },
   /**
    * 清除历史记录
    */
   clearHistory : function()
   {
      if(this.editorReady){
         var doc = this.cmInstanceRef.getDoc();
         doc.clearHistory();
      }else{
         this.addListener('editorready', function(){
            this.clearHistory();
         }, this, {
            single : true
         });
      }

   },
   /**
    * 丢掉修改信息
    */
   markClean : function()
   {
      if(this.editorReady){
         var doc = this.cmInstanceRef.getDoc();
         doc.markClean();
      }else{
         this.addListener('editorready', function(){
            this.markClean();
         }, this, {
            single : true
         });
      }

   },
   /**
    * 在光标的位置插入字符串
    *
    * @param {String} text
    */
   insertStringAtCursor : function(text)
   {
      if(this.editorReady){
         var doc = this.cmInstanceRef.getDoc();
         doc.replaceRange(text, doc.getCursor());
      }else{
         this.addListener('editorready', function(){
            this.insertStringAtCursor(text);
         }, this, {
            single : true
         });
      }

   },
   /**
    * 加载风格Css文件
    *
    * @param {String} theme
    */
   loadThemeCss : function(theme)
   {
      //风格文件不删除好吗？
      var SELF = this.self;
      if(!SELF.themeIsSupported(theme)){
         Cntysoft.raiseError(Ext.getClassName(this), 'loadThemeCss', 'theme is not exist');
      }
      var file = SELF.getThemeCssFile(theme);
      var id = 'codemirror_css_id_' + theme.toLowerCase();
      if(!Ext.fly(id)){
         Cntysoft.Utils.Common.createStyleSheet(id, file);
      }

      this.codeMirrorConfig.theme = SELF.THEME_TO_CSS_MAP[theme][0];
   },
   //将CodeMirror的事件映射成我们自己的事件
   /**
    * @param {Object} cmInstance CodeMirror实例
    * @param {Boolean} isOn 如果为true的话则是绑定事件
    */
   setupEventHandler : function(cmInstance, isOn)
   {
      var events = [
         'change',
         'beforeChange',
         'cursorActivity',
         'beforeSelectionChange',
         'viewportChange',
         'focus',
         'blur',
         'scroll',
         'update',
         'contextmenu'
      ];
      var len = events.length;
      var event;
      var handler;
      for(var i = 0; i < len; i++) {
         event = events[i];
         handler = 'cm'+Ext.String.capitalize(event)+'Handler';
         handler = Ext.bind(this[handler], this);
         if(isOn){
            cmInstance.on(event, handler);
         } else{
            cmInstance.off(event, handler);
         }
      }
   },

   /**
    * 将codemirror核心加入到ExtJs组件里
    */
   afterRenderHandler : function()
   {
      var basePath = this.self.getBasePath();
      Cntysoft.Utils.Common.createStyleSheet('CodeMirrorEditor', basePath+'/lib/codemirror.css');
      Ext.Loader.loadScripts({
         url: [
            basePath+'/lib/codemirror.js',
            basePath+'/addon/mode/loadmode.js'
         ],
         onLoad: function () {
            CodeMirror.modeURL = this.self.getCodeMirrorModeUrl();
            this.cmInstanceRef = CodeMirror(this.el.dom, this.codeMirrorConfig);
            //宽度会自动探测
            this.cmInstanceRef.setSize(null, this.height);
            this.setupEventHandler(this.cmInstanceRef, true);
            //这个时候可以派发编辑器就绪事件了
            this.editorReady = true;
            if(this.hasListeners.editorready){
               this.fireEvent('editorready', this);
            }
         },
         scope : this
      });

   },
   cmChangeHandler : function(cmInstance, changeInfo)
   {
      if(this.hasListeners.change){
         this.fireEvent('change', this, changeInfo);
      }
   },
   cmBeforeChangeHandler : function(cmInstance, changeInfo)
   {
      if(this.hasListeners.beforechange){
         return this.fireEvent('beforechange', this, changeInfo);
      }
   },
   cmCursorActivityHandler : function(cmInstance)
   {
      if(this.hasListeners.cursoractivity){
         this.fireEvent('cursoractivity', this);
      }
   },
   cmContextmenuHandler : function(cmInstance, event)
   {
      if(this.hasListeners.contextmenu){
         this.fireEvent('contextmenu', this, new Ext.EventObjectImpl(event));
      }
   },
   cmBeforeSelectionChangeHandler : function(cmInstance, selection)
   {
      if(this.hasListeners.beforeselectionchange){
         this.fireEvent('beforeselectionchange', this, selection);
      }
   },
   cmViewportChangeHandler : function(cmInstance, from, to)
   {
      if(this.hasListeners.viewportchange){
         this.fireEvent('viewportchange', this, from, to);
      }
   },
   cmFocusHandler : function(cmInstance)
   {
      if(this.hasListeners.focus){
         this.fireEvent('focus', this);
      }
   },
   cmBlurHandler : function(cmInstance)
   {
      if(this.hasListeners.blur){
         this.fireEvent('blur', this);
      }
   },
   cmScrollHandler : function(cmInstance)
   {
      if(this.hasListeners.scroll){
         this.fireEvent('scroll', this);
      }
   },
   cmUpdateHandler : function()
   {
      if(this.hasListeners.update){
         this.fireEvent('update', this);
      }
   },
   destroy : function()
   {
      this.setupEventHandler(this.cmInstanceRef, false);
      //貌似没有发现CodeMirror的销毁函数
      delete this.cmInstanceRef;
      this.callParent();
   }
});
