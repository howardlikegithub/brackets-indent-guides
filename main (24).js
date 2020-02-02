/*jslint vars: true, plusplus: true, devel: true, regexp: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    'use strict';
    
    // --- Required modules ---
    var PreferencesManager  = brackets.getModule('preferences/PreferencesManager'),
        Menus               = brackets.getModule('command/Menus'),
        Editor              = brackets.getModule('editor/Editor').Editor,
        EditorManager       = brackets.getModule('editor/EditorManager'),
        AppInit             = brackets.getModule('utils/AppInit'),
        Commands            = brackets.getModule('command/Commands'),
        CommandManager      = brackets.getModule('command/CommandManager'),
        DocumentManager     = brackets.getModule('document/DocumentManager'),
        ViewCommandHandlers = brackets.getModule('view/ViewCommandHandlers');
    
    // --- Constants ---
    var COMMAND_NAME = 'Sync Font Size',
        COMMAND_ID = 'bgearon.toggleFontSizeSync',
		DYNAMIC_FONT_STYLE_ID = 'codemirror-dynamic-fonts';
    
    // --- Local variables ---
    var _defPrefs   = { enabled: false, size: null },
        _prefs      = PreferencesManager.getPreferenceStorage(module, _defPrefs),
        _viewMenu   = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        
    // --- Event handlers ---
    function _updateFontSize() {
        var command     = CommandManager.get(COMMAND_ID),
            editor  = EditorManager.getCurrentFullEditor(),
            fontSize    = PreferencesManager.get(COMMAND_ID + '.fontSize'),
            lineHeight    = PreferencesManager.get(COMMAND_ID + '.lineHeight');       
			
		$('#' + DYNAMIC_FONT_STYLE_ID).remove();
        var style = $('<style type="text/css"></style>')
			.attr('id', DYNAMIC_FONT_STYLE_ID);
        
        style.html(
            '.CodeMirror {' +
                'font-size: '   + fontSize   + ' !important;' +
                'line-height: '   + lineHeight   + ' !important;' +                   
            '}');
        
        $('head').append(style);
        editor.refreshAll();
    }
    
    function _toggleFontSizeSync() {
        var command = CommandManager.get(COMMAND_ID);
        command.setChecked(!command.getChecked());
        PreferencesManager.set(COMMAND_ID + '.enabled', command.getChecked());
        _updateFontSize();
    }
    
    function _handleFontSizeChange(evt, adjustment, fontSize, lineHeight) {
        PreferencesManager.set(COMMAND_ID + '.fontSize', fontSize);
        PreferencesManager.set(COMMAND_ID + '.lineHeight', lineHeight);
    }
    
    // --- Initialize Extension ---
    AppInit.appReady(function () {
        var isEnabled = PreferencesManager.get(COMMAND_ID + '.enabled');
        
        // --- Register command ---
        CommandManager.register(COMMAND_NAME, COMMAND_ID, _toggleFontSizeSync);
        
        // --- Add to View menu ---
        if (_viewMenu) {
            _viewMenu.addMenuItem(COMMAND_ID);
        }
        
        // Apply user preferences
        CommandManager.get(COMMAND_ID).setChecked(isEnabled);
        
        // Add event listeners for updating the indent guides
        $(DocumentManager).on('currentDocumentChange', _updateFontSize);
        $(ViewCommandHandlers).on('fontSizeChange', _handleFontSizeChange);
        
    });
});
