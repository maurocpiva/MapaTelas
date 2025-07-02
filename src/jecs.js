(function () {
	window.lastInputFocus = "";
	window.insideTextArea = false;
	window.lastCaret = -1;
	continueBlocked = false;
	window.innow = false;
	window.eventsBlocked = false;
	window.stillCountDown = false;
	window.loadingImgPopupComp = null;

	//Browser Detect
	//Opera 8.0+
	window.isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	// Firefox 1.0+
	window.isFirefox = typeof InstallTrigger !== 'undefined';
	// Safari 3.0+ "[object HTMLElementConstructor]" 
	window.isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
	// Internet Explorer 6-11
	window.isIE = /*@cc_on!@*/false || !!document.documentMode;
	window.isIE8e9 = false;
	window.testIE8e9 = document.createElement('div');
	testIE8e9.innerHTML = '<!--[if lte IE 8]>2<![endif]--><!--[if lte IE 9]>3<![endif]-->';
	if ('2' === testIE8e9.innerHTML) {
		isIE8e9 = true;
	} else if ('3' === testIE8e9.innerHTML) {
		isIE8e9 = true;
	} else if (document.all && document.documentMode && 8 === document.documentMode) {
		isIE8e9 = true;
	}
	// Edge 20+
	window.isEdge = !isIE && !!window.StyleMedia;
	// Chrome 1+
	window.isChrome = !!window.chrome && !!window.chrome.webstore;
	// Blink engine detection
	window.isBlink = (isChrome || isOpera) && !!window.CSS;



	//Used at index pg...
	window.indexFocus = function () {
		var libEl = document.getElementById("prgExec:libExecName");
		var prgEl = document.getElementById("prgExec:prgExecName");
		if (libEl != null && libEl.value == "") {
			libEl.focus();
		} else {
			prgEl.focus();
		}
	}

	//Used at run pg...
	window.focusElement = function (id) {
		if (document.getElementById("prgRun:" + id) != null)
			document.getElementById("prgRun:" + id).focus();
	}
	window.selectAllElementText = function (id) {
		lastInputFocus = id;
		var currentElement = document.getElementById("prgRun:" + id);
		if (currentElement != null) {
			currentElement.select();
		}
		innow = true;
	}
	window.mainFocus = function () {
		if (document.getElementById("prgRun:mainFocusVal") != null
			&& document.getElementById("prgRun:mainFocusVal").defaultValue != "") {
			focusElement(document.getElementById("prgRun:mainFocusVal").defaultValue);
		} else if (document.getElementById("prgRun:continueDefaultJsfButton") != null) {
			focusElement("continueDefaultJsfButton");
		}
	}
	window.leaveField = function (e, field, inputsize) {
		if (innow) {
			innow = false;
		} else {
			var intialPos = getCaretPosition(field);
			var event = e || window.event;
			leaveFieldFinal(field, inputsize, intialPos, event);
		}
	}
	window.leaveFieldFinal = function (field, inputsize, intialPos, evt) {
		//console.log('[leaveFieldFinal] keyCode: ' + evt.keyCode + ' = ' + evt.type + ' > keyStillDown: ' + keyStillDown);
		if (evt.keyCode != 16) {
			if (field.value.length == inputsize
				&& evt.keyCode != 9 //TAB 
				&& evt.keyCode != 37 && evt.keyCode != 38 && evt.keyCode != 39 && evt.keyCode != 40 //ARROWS
				&& !evt.shiftKey
			) {
				focusNextInputField(field);
			} else if (evt.keyCode == 39 || evt.keyCode == 40) {//Right Arrow or Up Arrow
				//go to next input field
				if (field.value.length == 0 || (intialPos == field.value.length && lastCaret == field.value.length)) {
					focusNextInputField(field);
					lastCaret = -1;
				} else {
					lastCaret = intialPos;
				}
			} else if (evt.keyCode == 37 || evt.keyCode == 38) {//Left Arrow or Down Arrow
				//go to previews input field
				if (field.value.length == 0 || (intialPos == 0 && lastCaret == 0)) {
					focusPreviewInputField(field);
					lastCaret = -1;
				} else {
					lastCaret = intialPos;
				}
			} else if (evt.keyCode == 9 && keyStillDown != 16) { //TAB without SHIFT pressed
				field.select();
			} else if (evt.keyCode == 16 && keyStillDown == 16) {
				prevField.select();
			}
		}
		especialCharRemove(field);
	}
	window.leaveFieldToUpperCase = function (e, field, inputsize) {
		var intialPos = getCaretPosition(field);
		field.value = field.value.toUpperCase();
		setCaretPosition(field, intialPos);
		var evt = e || window.event;
		leaveFieldFinal(field, inputsize, intialPos, evt);
	}

	window.getCaretPosition = function (oField) {
		// node.focus();
		/* without node.focus() IE will returns -1 when focus is not on node */
		if (oField.selectionStart) {
			//		console.log("caret pos: " + oField.selectionStart);
			return oField.selectionStart;
		} else if (!document.selection) {
			//		console.log("caret pos: 0");
			return 0;
		}
		var c = "\001";
		var sel = document.selection.createRange();
		var dul = sel.duplicate();
		var len = 0;
		dul.moveToElementText(oField);
		sel.text = c;
		len = (dul.text.indexOf(c));
		sel.moveStart('character', -1);
		sel.text = "";
		//	console.log("caret pos: " + len);
		return len;
	}

	window.setCaretPosition = function (field, caretPos) {
		if (field != null) {
			if (field.createTextRange) {
				var range = field.createTextRange();
				range.move('character', caretPos);
				range.select();
			} else {
				if (field.selectionStart) {
					field.focus();
					field.setSelectionRange(caretPos, caretPos);
				} else {
					field.focus();
				}
			}
		}
	}

	// NEXT FIELD
	window.focusNextInputField = function (currentfield) {
		//var fields = $(currentfield).parents('form:eq(0),body').find('button,input,textarea,select');
		var fields = $(currentfield).parents('form:eq(0),body').find('input,textarea,select,a');
		var index = fields.index(currentfield);
		var nextField = getNextField(fields, ++index);
		nextField.focus();
		nextField.select();
	}
	//PREVIEW FIELD
	window.focusPreviewInputField = function (currentfield) {
		var fields = $(currentfield).parents('form:eq(0),body').find('input,textarea,select,a');
		var index = fields.index(currentfield);
		var prevField = getNextField(fields, --index);
		prevField.focus();
		prevField.select();
	}
	window.getNextField = function (fields, index) {
		var retField = null;
		if (index > -1 && index < fields.length) {
			var nextField = fields[index];
			if (nextField != undefined && nextField.type != 'hidden' && nextField.type != 'submit') {
				retField = nextField;
			} else {
				retField = getNextField(fields, ++index);
			}
		} else if (index == fields.length) {
			retField = getNextField(fields, 0);
		}
		if (retField == null) {
			retField = getNextField(fields, 0);
		}
		return retField;
	}


	window.soundAlarm = function () {
		var sound = document.getElementById("sound1");
		sound.Play();
		/*<embed src="success.wav" autostart="false" width="0" height="0" id="sound1" enablejavascript="true">*/
	}

	window.keyUp = function (field, type) {
		//console.log("Key: " + window.event.keyCode);
		if (type == 'NumericInt') {
			checkNumericInt(field);
		} else if (type == 'NumericDecimal') {
			checkNumericDecimal(field);
		} else if (type == 'NumericFloat') {
			checkNumericFloat(field);
		} else if (type == 'DateS') {
			checkDate(field, 'S');
		} else if (type == 'DateL') {
			checkDate(field, 'L');
		} else if (type == 'DateI') {
			checkDate(field, 'I');
		} else if (type == 'Time') {
			checkTime(field);
		}
	}

	window.checkNumericFloat = function (field) {
		var re = /[^0-9\,\.\-\e\E\+\?]/g;
		if (re.test(field.value)) {
			field.value = field.value.replace(re, '');
			field.value = field.value.replace(/\./, '');
		}
	}

	window.checkNumericDecimal = function (field) {
		var re = /[^0-9\,\.\-\?]/g;
		if (re.test(field.value)) {
			field.value = field.value.replace(re, '');
			field.value = field.value.replace(/\./, '');
		}
	}

	window.checkNumericInt = function (field) {
		var re = /[^0-9\-\?]/g;
		if (re.test(field.value)) {
			field.value = field.value.replace(re, '');
			field.value = field.value.replace(/\./, '');
		}
	}

	window.noSign = function (field) {
		var ret = field.value;
		if (ret.indexOf('-') == 0) {
			var intialPos = getCaretPosition(field);
			ret = ret.substring(1, ret.lenght);
			field.value = ret;
			setCaretPosition(field, intialPos);
		}
	}

	window.checkDate = function (field, type) {
		var re = '';
		if (type == 'S' || type == 'L') {
			re = '/[^0-9\-]/g';
		} else if (type == 'I') {
			re = '/[^0-9]/g';
		}
		if (re.test(field.value)) {
			field.value = field.value.replace(re, '');
			field.value = field.value.replace('/\./', '');
		}
	}

	window.checkTime = function (field) {
		var re = /[^0-9\:]/g;
		if (re.test(field.value)) {
			field.value = field.value.replace(re, '');
			field.value = field.value.replace(/\./, '');
		}
	}



	window.especialCharRemove = function (field) {
		var especialChar = field.value;
		especialChar = especialChar.replace(/[áàãâä]/, 'a');
		especialChar = especialChar.replace(/[éèêë]/, 'e');
		especialChar = especialChar.replace(/[íìîï]/, 'i');
		especialChar = especialChar.replace(/[óòõôö]/, 'o');
		especialChar = especialChar.replace(/[úùûü]/, 'u');
		especialChar = especialChar.replace(/[ÁÀÂÃÄ]/, 'A');
		especialChar = especialChar.replace(/[ÉÈÊË]/, 'E');
		especialChar = especialChar.replace(/[ÍÌÎÏ]/, 'I');
		especialChar = especialChar.replace(/[ÓÒÕÔÖ]/, 'O');
		especialChar = especialChar.replace(/[ÚÙÛÜ]/, 'U');
		especialChar = especialChar.replace(/[ç]/, 'c');
		especialChar = especialChar.replace(/[Ç]/, 'C');
		//    especialChar = especialChar.replace(/[˜]/, '');
		//    especialChar = especialChar.replace(/[~]/, '');
		field.value = especialChar;
	}



	//Calendar I = dd/MM/yyyy
	window.formatCalendarI = function (e, d) {
		var evt = e || window.event;
		if (evt.keyCode != 8) {
			var dt = d.value;
			var da = dt.split('/');
			for (var a = 0; a < da.length; a++) {
				if (da[a] != +da[a])
					da[a] = da[a].substr(0, da[a].length - 1);
			}
			if (da[0] > 31) { da[0] = da[0].substr(0, da[0].length - 1); }
			if (da[1] > 12) { da[1] = da[1].substr(0, da[1].length - 1); }
			if (da[2] > 9999) { da[2] = da[2].substr(0, da[2].length - 1); }
			dt = da.join('/');
			if (dt.length == 2 || dt.length == 5) { dt += '/'; }
			d.value = dt;
		}
	}
	//Calendar L = dd MMM yyyy
	window.formatCalendarL = function (e, d) {
		var evt = e || window.event;
		if (evt.keyCode != 8) {
			var dt = d.value;
			var da = dt.split(' ');
			for (var a = 0; a < da.length; a++) {
				if (da[a] != +da[a])
					da[a] = da[a].substr(0, da[a].length - 1);
			}
			if (da[0] > 31) { da[0] = da[0].substr(0, da[0].length - 1); }
			if (da[1].length > 3) { da[1] = da[1].substr(0, 3); }
			if (da[2] > 9999) { da[2] = da[2].substr(0, da[2].length - 1); }
			dt = da.join(' ');
			if (dt.length == 2 || dt.length == 6) { dt += ' '; }
			d.value = dt;
		}
	}
	//Calendar S = dd/MM/yy
	window.formatCalendarS = function (e, d) {
		var evt = e || window.event;
		if (evt.keyCode != 8) {
			var dt = d.value;
			var da = dt.split('/');
			for (var a = 0; a < da.length; a++) {
				if (da[a] != +da[a])
					da[a] = da[a].substr(0, da[a].length - 1);
			}
			if (da[0] > 31) { da[0] = da[0].substr(0, da[0].length - 1); }
			if (da[1] > 12) { da[1] = da[1].substr(0, da[1].length - 1); }
			if (da[2] > 99) { da[2] = da[2].substr(0, da[2].length - 1); }
			dt = da.join('/');
			if (dt.length == 2 || dt.length == 5) { dt += '/'; }
			d.value = dt;
		}
	}

	//S=yy-mm-dd
	window.formatDtS = function (e, d) {
		var evt = e || window.event;
		if (evt.keyCode != 8) {
			var dt = d.value;
			var da = dt.split('-');
			for (var a = 0; a < da.length; a++) {
				if (da[a] != +da[a])
					da[a] = da[a].substr(0, da[a].length - 1);
			}
			if (da[0] > 99) da[0] = da[0].substr(0, da[0].length - 1);
			if (da[1] > 12) { da[1] = da[1].substr(0, da[1].length - 1); }
			if (da[2] > 31) { da[2] = da[2].substr(0, da[2].length - 1); }
			dt = da.join('-');
			if (dt.length == 2 || dt.length == 5) dt += '-';
			d.value = dt;
		}
	}

	//I=yyyymmdd
	window.formatDtI = function (e, d) {
		var evt = e || window.event;
		if (evt.keyCode != 8) {
			var dt = d.value;
			var df = "";
			var da = new Array();
			da[0] = dt.substr(0, 4);
			df = da[0];
			if (dt.length >= 5) da[1] = dt.substr(4, 2);
			if (dt.length >= 7) da[2] = dt.substr(6, 2);
			if (da.length > 1) {
				if (da[1] > 12) { da[1] = da[1].substr(0, 1); }
				df = df + da[1];
				if (da.length > 2) {
					if (da[2] > 31) { da[2] = da[2].substr(0, 1); }
					df = df + da[2];
				}
			}
			d.value = df;
		}
	}

	//L=yyyy-mm-dd 2012-12-12
	window.formatDtL = function (e, d) {
		var evt = e || window.event;
		if (evt.keyCode != 8) {
			var dt = d.value;
			var da = dt.split('-');
			if (da[0] > 9999) da[0] = da[0].substr(0, da[0].length - 1);
			if (da[1] > 12) { da[1] = da[1].substr(0, da[1].length - 1); }
			if (da[2] > 31) { da[2] = da[2].substr(0, da[2].length - 1); }
			dt = da.join('-');
			if (dt.length == 4 || dt.length == 7) dt += '-';
			d.value = dt;
		}
	}

	//10:10:10
	window.formatTime = function (e, d) {
		var evt = e || window.event;
		if (evt.keyCode != 8) {
			var dt = d.value;
			var da = dt.split(':');
			if (da[0] == 24) {
				d.value = '24:00:00';
			} else {
				if (da[0] > 24) { da[0] = da[0].substr(0, da[0].length - 1); }
				if (da[1] && da[1].length == 1 && da[1] == 6) { da[1] = ""; }
				if (da[1] > 59) { da[1] = da[1].substr(0, da[1].length - 1); }
				if (da[2] && da[2].length == 1 && da[2] == 6) { da[2] = ""; }
				if (da[2] > 59) { da[2] = da[2].substr(0, da[2].length - 1); }
				dt = da.join(':');
				if (dt.length == 2 || dt.length == 5) dt += ':';
				d.value = dt;
			}
		}
	}

	window.getPfId = function (id) {
		console.log('getPfId called!');
		document.getElementById("prgRun:pfHidden").value = id;
	}

	window.getPfGridLine = function (gridLine) {
		document.getElementById("prgRun:pfGridLineHidden").value = gridLine;
	}

	window.setEventId = function (id) {
		if (!eventsBlocked) {
			eventsBlocked = true;
			if (isFirefox) {
				event = Event;
			}
			var gerarClick = true;
			document.getElementById("prgRun:eventHidden").value = id;
			if (event != undefined && event.relatedTarget != undefined) {
				if (event.relatedTarget.className == "pfKeyFixedPositionClass") {
					gerarClick = false;
				} else if (event.relatedTarget.parentElement != undefined
					&& event.relatedTarget.parentElement.parentElement != undefined
					&& event.relatedTarget.parentElement.parentElement.parentElement != undefined
					&& event.relatedTarget.parentElement.parentElement.parentElement.parentElement != undefined
					&& event.relatedTarget.parentElement.parentElement.parentElement.parentElement.className.endsWith("BtClass")
				) {
					gerarClick = false;
				}
			}
			if (gerarClick) {
				showLoadingPopUpNoTimeout();
				document.getElementById('prgRun:continueEventJsfButton').click();
			}
		}
	}

	window.setDataValue = function (text) {
		if (lastInputFocus != "") {
			document.getElementById("prgRun:" + lastInputFocus).value = text;
		}
	}

	//captura tecla precionada em qq momento
	window.keyPressed = function (event) {
		if (event.which == 13 && !insideTextArea) {
			if (document.getElementById('prgRun:errorPopupBtRestart') != null) {
				//				console.log('[PRESSED] prgRun:errorPopupBtRestart');
				showLoadingPopUp();
				document.getElementById('prgRun:errorPopupBtRestart').click();
			} else if (document.getElementById('prgRun:errorPopupBtReinput') != null) {
				//				console.log('[PRESSED] prgRun:errorPopupBtReinput');
				showLoadingPopUp();
				document.getElementById('prgRun:errorPopupBtReinput').click();
			} else if (document.getElementById('prgRun:continueDefaultJsfButton') != null) {
				//				console.log('[PRESSED] prgRun:continueDefaultJsfButton');
				if (!continueBlocked) {
					showLoadingPopUp();
					document.getElementById('prgRun:continueDefaultJsfButton').click();
				}
			}
			//	    console.log("Keypress: " + event.which);
			return false;

		}
	}

	window.uploadPcFileComplete = function () {
		showLoadingPopUp();
		document.getElementById('prgRun:continueDefaultJsfButton').click();
	}

	window.lockUserAction = function () {
		continueBlocked = true;
		//	console.log("continueBlocked=true;");
	}

	window.inputKeyUp = function (e, field) {
		var evt = e || window.event;
		//console.log("KeyUp - HE: " + evt.keyCode);
		if (field.value.indexOf("?") != -1 && evt.keyCode == 191) {
			//console.log("HE action!!! KeyUp:" + evt.keyCode);
			callHelpRoutine(field);
		}
		//	else if(evt.keyCode == 112){ //if F1 pressed
		//		//console.log("HE action!!! KeyUp:" + evt.keyCode);
		//		var pf = 'prgRun:PF' + (evt.keyCode - 111);
		//		if(!continueBlocked){
		//			getPfId('PF1');
		//			document.getElementById('prgRun:inputHelpRoutineField').value = field.id;
		//			var bt = document.getElementById(pf);
		//			if(bt != null){
		//				bt.click();
		//			}else{
		//				bt = document.getElementById('prgRun:continueDefaultJsfButton');
		//				if(bt != null){
		//					document.getElementById('prgRun:continueDefaultJsfButton').click();
		//				}
		//			}	
		//		}
		//	}
	}

	window.callHelpRoutine = function (field) {
		document.getElementById('prgRun:inputHelpRoutineField').value = field.id;
		setTimeout(function () {
			showLoadingPopUpNoTimeout();
			document.getElementById('prgRun:continueDefaultJsfButton').click();
		}, 300);
	}

	window.callHelpRoutineUsingHelp = function (field) {
		showLoadingPopUp();
		var field = document.getElementById("prgRun:mainFocusVal").defaultValue;
		document.getElementById('prgRun:inputHelpRoutineField').value = field;
		document.getElementById('prgRun:continueDefaultJsfButton').click();
	}

	//WINDOWS
	//posicionamento das windows
	window.setPosition = function (id, position) {
		var element = document.getElementById("prgRun:" + id + "_container");
		if (element != null) {
			if (position == 'RIGHT') {
				windowWidth = $(window).width();
				elementWidth = $(element).width();
				elPosLeft = windowWidth - elementWidth;
				element.style.left = elPosLeft;
			} else if (position == 'BOTTON') {
				windowHeight = $(window).height();
				elementHeight = $(element).height();
				elPosTop = windowHeight - elementHeight;
				element.style.top = elPosTop - 64;
			} else if (position == 'CURSOR') {
				if (lastInputFocus != "") {
					focusElem = document.getElementById("prgRun:" + lastInputFocus);
					var position = focusElem.position();
					focusElemWidth = focusElem.width();
					element.style.left = position.left + focusElemWidth;
					element.style.top = position.top;
				}
			}
		}
	}

	window.setSizeQuarter = function (id) {
		var element = document.getElementById("prgRun:" + id + "_container");
		var windowWidth = $(window).width() / 2;
		var windowHeight = (getWindowHeight() - getHeaderHeight()) / 2;
		if (element != null) {
			element.style.width = windowWidth;
			element.style.height = windowHeight;
		}
		//prgRun:windowPopup_JKL_content_scroller height-22
		var element = document.getElementById("prgRun:" + id + "_content_scroller");
		if (element != null) {
			element.style.width = windowWidth;
			element.style.height = windowHeight - 22;
		}
	}

	window.setMaxSize = function (id) {
		var elemento = document.getElementById("prgRun:" + id + "_container");
		var windowHeight = getWindowHeight() + 20;
		var elementHeight = $(elemento).height();
		var elPosTop = getTopOffset(elemento);
		if (elementHeight >= windowHeight) {
			if (elemento != null) {
				elemento.style.height = windowHeight - (elPosTop - getHeaderHeight());
			}
			//prgRun:windowPopup_JKL_content_scroller height-22
			var element = document.getElementById("prgRun:" + id + "_content_scroller");
			if (element != null) {
				element.style.height = windowHeight - (elPosTop - getHeaderHeight()) - 22;
			}
		}
	}

	window.getWindowHeight = function () {
		var window = document.getElementById("prgRun:screenAll");
		return $(window).height();
	}
	window.getHeaderHeight = function () {
		var header = document.getElementById("header");
		return $(header).height();
	}
	window.getFooterHeight = function () {
		var controls = document.getElementById("controls");
		var footer = document.getElementById("footer");
		return $(controls).height() + $(footer).height();
	}
	window.getTopOffset = function (obj) {
		var top = 0;
		if (obj.offsetParent) {
			do {
				top += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}
		return top;
	}
	//END WINDOWS


	window.nonConversationalMode = function () {
		if (document.getElementById('prgRun:errorPopupBtRestart') != null) {
			//		console.log('[PRESSED] prgRun:errorPopupBtRestart');
			showLoadingPopUp();
			document.getElementById('prgRun:errorPopupBtRestart').click();
		} else if (document.getElementById('prgRun:errorPopupBtReinput') != null) {
			//		console.log('[PRESSED] prgRun:errorPopupBtReinput');
			showLoadingPopUp();
			document.getElementById('prgRun:errorPopupBtReinput').click();
		} else if (document.getElementById('prgRun:continueDefaultJsfButton') != null) {
			//		console.log('[PRESSED] prgRun:continueDefaultJsfButton');
			showLoadingPopUp();
			document.getElementById('prgRun:continueDefaultJsfButton').click();
		}
	}

	window.keyStillDown = null;
	$(document).keydown(function (e) {
		evt = e || event;
		//console.log('[keydown] keyCode: ' + evt.keyCode + ' = ' + evt.type);
		if (keyStillDown == null) {
			keyStillDown = evt.keyCode;
		}
		//console.log('[keydown] keyStillDown: ' + keyStillDown);
	}).keyup(function (e) {
		evt = e || event;
		//console.log('[keyup] keyCode: ' + evt.keyCode + ' = ' + evt.type);
		if (evt.keyCode == keyStillDown) {
			keyStillDown = null;
		}
		//console.log('[keyup] keyStillDown: ' + keyStillDown);
	});

	//PFs -> F1 a F12
	window.detectEvent = function (e) {
		var evt = e || window.event;
		//console.log('[detectEvent] keyCode: ' + evt.keyCode + ' = ' + evt.type);
		if (evt.keyCode > 111 && evt.keyCode < 124) {
			var pf = 'prgRun:PF' + (evt.keyCode - 111);
			if (!continueBlocked) {
				if (evt.keyCode == 112) {
					//if F1 it will be treated by inputKeyUp().

					//console.log("HE action!!! KeyUp:" + evt.keyCode);
					var pf = 'prgRun:PF' + (evt.keyCode - 111);
					if (!continueBlocked) {
						getPfId('PF1');
						//					document.getElementById('prgRun:inputHelpRoutineField').value = field.id;
						document.getElementById('prgRun:inputHelpRoutineField').value = document.activeElement.id;
						var bt = document.getElementById(pf);
						if (bt != null) {
							showLoadingPopUp();
							bt.click();
						} else {
							bt = document.getElementById('prgRun:continueDefaultJsfButton');
							if (bt != null) {
								showLoadingPopUp();
								bt.click();
							}
						}
					}
				} else {
					var bt = document.getElementById(pf);
					if (bt != null) {
						showLoadingPopUp();
						bt.click();
					} else {
						bt = document.getElementById('prgRun:continueDefaultJsfButton');
						if (bt != null) {
							showLoadingPopUp();
							bt.click();
						}
					}
				}
			}
			return false;
		}
		if (e.keyCode == 8) { // 8 == backspace
			var rx = /INPUT|SELECT|TEXTAREA/i;
			if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
				e.preventDefault();
				return false;
			} else {
				return true;
			}
		}
		//	if(evt.keyCode == 191){ 
		//		console.log('[detectEvent] keyCode: ' + evt.keyCode);
		//	}
		return true;
	}


	window.changeInputFocusLine = function (line) {
		document.getElementById("prgRun:inputLineHidden").value = line;
	}

	window.toggleSelectedRadio = function (field) {
		variable = field.id.substr(field.id.indexOf(":") + 1, field.id.indexOf("_jecin_") - 7);
		campos = document.getElementById("prgRun").getElementsByTagName('input');
		for (var x = 0; x < campos.length; x++) {
			if (campos[x].type == "radio") {
				var variable2 = campos[x].id.substr(campos[x].id.indexOf(":") + 1, campos[x].id.indexOf("_jecin_") - 7);
				if (variable2 == variable) {
					campos[x].checked = "";
				}
			}
		}
		field.checked = "checked";
	}

	window.setInsideTextArea = function () {
		insideTextArea = true;
	}
	window.setOutTextArea = function () {
		insideTextArea = false;
		console.log("setOutTextArea()......");
	}


	//INIT NAJA CONTROLS
	window.init = function (loadingImgPopupCompParam) {
		eventsBlocked = false;
		wireUpEvents();
		mainFocus();
		$(document).keypress(function (event) { return keyPressed(event); });
		//USER INACTIVITY
		$(document).on("idle.idleTimer", function () {
			//		clearNajaSession();
			expireSession();
			//		console.log('Session expired!!!');
		});
		loadingImgPopupComp = loadingImgPopupCompParam;
		loadingImgPopupComp.hide();
		continueBlocked = false;
		//	console.log("continueBlocked=FALSE;");
	}

	//CLEAR SESSION
	window.clearNajaSession = function () {
		clearCurrentSession();
		//	console.log('Clear Naja session web!!!');
	}


	window.showLoadingPopUp = function () {
		setTimeout(function () {
			loadingImgPopupComp.show();
		}, 500);
	}

	window.showLoadingPopUpNoTimeout = function () {
		loadingImgPopupComp.show();
		//	RichFaces.ui.PopupPanel.showPopupPanel('prgRun:loadingImgPopup');
	}

	//PASTE HANDLER
	if (!isIE && !isIE8e9) {
		['paste'].forEach(function (event) {
			document.addEventListener(event, function (e) {
				//console.log(event + " - " + this);
				var clipboardData, pastedData;
				// Stop data actually being pasted into div
				e.stopPropagation();
				e.preventDefault();
				// Get pasted data via clipboard API
				clipboardData = e.clipboardData || window.clipboardData;
				pastedData = clipboardData.getData('Text');
				var focused = $(':focus').attr('id');
				handlePaste(pastedData, document.getElementById(focused));
			});
		});
	}
	window.handlePaste = function (pastedData, field) {
		var pastedDataLength = pastedData.length;
		// Threat pasted data
		var fields = $(field).parents('form:eq(0),body').find('input,textarea,select,a');
		var index = fields.index(field);
		if (field.maxLength > 0) {
			while (pastedDataLength > 0 && index < fields.length) {
				var fieldLength = field.maxLength;
				var pastedDataTemp = pastedData.substring(0, fieldLength);
				pastedData = pastedData.substring(fieldLength);
				pastedDataLength = pastedData.length;
				field.value = pastedDataTemp;
				index = fields.index(field);
				field = getNextField(fields, ++index);
				if (pastedDataLength > 0 && index < fields.length) {
					field.focus();
					field.select();
				}
			}
		} else {
			field.value = pastedData;
		}
	}


	window.getUrlParameter = function (url_string, sParam) {
		var sPageURL = url_string.split("?")[1];
		var sURLVariables = sPageURL.split("&");
		var sParameterName;
		var i;
		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split("=");
			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	}


	window.setSessionTimeout = function (willTimeoutPopupComp, timeoutPopupComp, willTimeoutSecondsHtmlEl) {
		var timeoutValue = document.getElementById("prgRun:sessiontimeout").value;
		var beforeTimeoutValueSec = 60; //segundos
		var beforeTimeoutValue = beforeTimeoutValueSec * 1000; //milisegundos
		var willTimeoutValue = timeoutValue - beforeTimeoutValue;
		var secondsTimeoutValue = beforeTimeoutValue / 1000;
		setTimeout(function () {
			if (isIE && isIE8e9) {
				document.getElementById("prgRun:willTimeoutSeconds").innerHTML = secondsTimeoutValue;
				willTimeoutSecondsHtmlEl = document.getElementById("segundosIE89");
				willTimeoutSecondsHtmlEl.innerHTML = secondsTimeoutValue;
				stillCountDown = true;
				setTimeout(function () { countDown(willTimeoutPopupComp, timeoutPopupComp, willTimeoutSecondsHtmlEl); }, 1000);
				showWillTimeoutPopupIE89();
			} else {
				//console.log('Session will expire!!!');
				document.getElementById("prgRun:willTimeoutSeconds").innerHTML = secondsTimeoutValue;
				stillCountDown = true;
				setTimeout(function () { countDown(willTimeoutPopupComp, timeoutPopupComp, willTimeoutSecondsHtmlEl); }, 1000);
				willTimeoutPopupComp.show();
			}
		}, willTimeoutValue);
	}
	window.countDown = function (willTimeoutPopupComp, timeoutPopupComp, willTimeoutSecondsHtmlEl) {
		if (stillCountDown) {
			var secondsTimeoutValue = willTimeoutSecondsHtmlEl.innerHTML;
			secondsTimeoutValue = secondsTimeoutValue - 1;
			if (secondsTimeoutValue == 0) {
				if (isIE && isIE8e9) {
					document.getElementById("sessionIE8e9Expired").style.display = "block";
					document.getElementById("sessionIE8e9").style.display = "none";
				} else {
					//console.log('Session expired!!!');
					willTimeoutPopupComp.hide();
					timeoutPopupComp.show();
				}
				stillCountDown = false;
			} else {
				willTimeoutSecondsHtmlEl.innerHTML = secondsTimeoutValue;
				setTimeout(function () { countDown(willTimeoutPopupComp, timeoutPopupComp, willTimeoutSecondsHtmlEl); }, 1000);
			}
		}
	}
	window.keepSessionJs = function () {
		stillCountDown = false;
	}
	//SESSION TIMEOUT - IE8 e IE9
	window.showWillTimeoutPopupIE89 = function () {
		document.getElementById("sessionIE8e9").style.display = "block";
		document.getElementById("sessionIE8e9Fundo").style.display = "block";
	}
	window.hideWillTimeoutPopupIE89 = function () {
		document.getElementById("sessionIE8e9").style.display = "none";
		document.getElementById("sessionIE8e9Fundo").style.display = "none";
	}
})();