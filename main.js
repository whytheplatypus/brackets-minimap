/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
	"use strict";

	require('jquery-ui-1.9.2.custom.min');
    require('runmode');

	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		DocumentManager = brackets.getModule("document/DocumentManager"),
		COMMAND_ID = "me.drewh.brackets.minimap";

	var loadCSSPromise = ExtensionUtils.loadStyleSheet(module, 'main.css');


	function _change(text) {
		$('#mini-map-code').html(text);
	}

	function _drawMap() {
		$('.main-view').append('<div id="mini-map"><div class="selection"></div><pre id="mini-map-code" class="cm-s-default"></pre></div>');
	}

	function lineToPx(line) {
		return line * 4;
	}


	function pxToLine(px) {
        return px / 8.4;
	}

    function _documentChange() {
        try{
            var editor = DocumentManager.getCurrentDocument()._masterEditor;
            var drag = false;
            
            var height = $(editor.getScrollerElement()).height();
            var width = $(editor.getScrollerElement()).width();
            
            var lineCount = editor.lineCount();
            
            var miniSelectionEl = $('#mini-map .selection');
            miniSelectionEl.css({
                height: height + 'px',
                width: width + 'px'
            });
            
            _documentUpdate();

            var totalHeight = $("#mini-map").height();
            console.log(totalHeight + ' ' + height );
            
            var ratio = height/totalHeight>200/width?200/width:height/totalHeight;

            $(miniSelectionEl).mousedown(function(e){
                drag = true;
            });
            
            $(document).mousemove(function(e){
                if(drag){
                    var x = editor.getScrollPos().x;
                    editor.setScrollPos(x, e.clientY*(1/ratio));
                }
            });

            $(document).mouseup(function(e){
                drag = false;
            });

            $("#mini-map").click(function(e){
                var x = editor.getScrollPos().x;
                var miniSelectionEl = $('#mini-map .selection')[0];
                editor.setScrollPos(x, (e.clientY)*(1/ratio)-$(miniSelectionEl).height()/2);
            });

            $("#mini-map").css('-webkit-transform', 'scale('+ratio+')');

            $(editor).on('scroll', function(e){
                //if(!drag){
                var height = $(editor.getScrollerElement()).height();
                var totalHeight = editor.totalHeight(true);
                var miniSelectionEl = $('#mini-map .selection')[0];
                //console.log(miniSelectionEl);
                //console.log(editor.getScrollPos().y);
                miniSelectionEl.style.top = editor.getScrollPos().y+"px";
                //}
            });
        } catch (e){
            console.log("the document probably wasn't ready yet");
            console.log(e);
        }
    }

	function _documentUpdate() {
		var doc = DocumentManager.getCurrentDocument();
		if (doc) {
			//console.log($('.CodeMirror-lines div div:eq(2)').html());
            CodeMirror.runMode(doc.getText(), doc._masterEditor._codeMirror.getOption("mode"), document.getElementById("mini-map-code"));
		}
	}



	loadCSSPromise.then(function () {
		_drawMap();
		_documentChange();
		$(DocumentManager).on('currentDocumentChange', _documentChange);
        $(DocumentManager).on('documentSaved', _documentUpdate);
	});

});