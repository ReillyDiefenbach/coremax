$.WOLF.questionnaire = {
	save: function (id = null) {
		if(!id) id = 'middle';
		if($('#' + id).find('main').length == 0) return standardError('no questionnaire found!');
		else if($('#' + id).find('main').length > 1) return standardError('Too many questionnaires found!');
		else return $.WOLF.questionnaire.saveQuestionnaire($('#' + id).find('main'));
	},
	saveQuestionnaire: function (obj = null) {
		
		/*** stats 
		standardError($('main article > fieldset').length);
		***/
		const ignoreArray = ['sequence','fields','number','allow','listener', 'starSvg'];
		
		let json = {}, 
			main = $(obj);
			
		$.each(main.data(), function(key,value) {
			if(jQuery.inArray(key, ignoreArray) === -1) json[key] = value;
		});
		if($(main).find('section').length > 0) { 
			json['section'] = new Array; 
			$.each($(main).find('section'), function() {
				self = this;
				let newSection = {};
				$.each($(self).data(), function (sKey,sVal) {
					if(sVal && jQuery.inArray(sKey, ignoreArray) === -1) 
						newSection[sKey] = sVal;
				});
				if($(self).find('article').length > 0) { 
					newSection['article'] = new Array; 
					$.each($(self).find('article'), function() {
						_this = this;
						let newArticle = {};
						$.each($(_this).data(), function (aKey,aVal) {
							if(aVal && jQuery.inArray(aKey, ignoreArray) === -1) 
									newArticle[aKey] = aVal;
						});
						/* now the fieldsets */
						if($(_this).find('> fieldset').length > 0) { 
							newArticle['fieldset'] = new Array; 
							$.each($(_this).find('> fieldset'), function() {
								let newFieldset = {};
								$.each($(this).data(), function (fKey,fVal) {
									if (fVal && jQuery.inArray(fKey, ignoreArray) === -1) 
										newFieldset[fKey] = fVal;
								});
								newArticle['fieldset'].push(newFieldset);
							});	
						}
						/* end fieldsets */
						newSection['article'].push(newArticle);
					});	
				}
			json['section'].push(newSection);
			});
		}
		
		/* now the html */
		let HTML = $('<html></html>'),
			MAIN = $('<main></main>');
		$(HTML).append(MAIN);
		
		$.each(json, function (jKey, jVal) {
			
			if(jKey !== 'section') 
				MAIN.attr('data-' + jKey, jVal);
			else {
				let sections = jVal;
				for(let S = 0;S < sections.length;S++) {
					let newSection = $('<section></section>'); 
					$.each(sections[S], function (sKey,sVal) {
						if(sKey !== 'article') 
							newSection.attr('data-' + sKey, sVal);
						else {
							let articles = sVal;
							for(let A = 0;A < articles.length;A++) {
								let newArticle = $('<article></article>'); 
								$.each(articles[A], function (aKey,aVal) {
									if(aKey !== 'fieldset') 
										newArticle.attr('data-' + aKey, aVal);
									else {
										let fieldsets = aVal;
										for(let F = 0;F < fieldsets.length;F++) {
											let newFieldset = $('<fieldset></fieldset>'); 
											$.each(fieldsets[F], function (fKey,fVal) {
													newFieldset.attr('data-' + fKey, fVal);
											});
											newArticle.append(newFieldset);
										}
									}
								});
								newSection.append(newArticle);
							}
						} 
					});
					MAIN.append(newSection);
				}
			} 
		});
		
		let code = $(HTML).html();
		return $.WOLF.direct.saveQUESTfile(code, json);
	},
	preview: function (lang = null) {
		if(!lang) lang = $('html').attr('lang');
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('body').append('<form id="dummyForm" name="dummyForm" method="POST" target="_new" action="' + DEPLOYPATH + '" style="display:none;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		$('#dummyForm').append('<input type="text" name="admin_project" id="admin_project" value="' + $('#admin_project').val() + '" />');
		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + $('#admin_id').val() + '" />');
		$('#dummyForm').append('<input type="text" name="admin_usertype" id="admin_usertype" value="' + $('#admin_usertype').val() + '" />');
		$('#dummyForm').append('<input type="text" name="lang" id="lang" value="' + lang + '" />');
		return document.dummyForm.submit();
	},
	depack: function () {
		   		let txt = $('#unpack').text(), 
		   			json = $.parseJSON(txt),
		   			HTML = $('<html></html>'),
					MAIN = $('<main></main>');
				
				$(HTML).append(MAIN);
				
				$.each(json, function (jKey, jVal) {
					
					if(jKey !== 'section') 
						MAIN.attr('data-' + jKey, jVal);
					else {
						let sections = jVal;
						for(let S = 0;S < sections.length;S++) {
							let newSection = $('<section></section>'); 
							$.each(sections[S], function (sKey,sVal) {
								if(sKey !== 'article') 
									newSection.attr('data-' + sKey, sVal);
								else {
									let articles = sVal;
									for(let A = 0;A < articles.length;A++) {
										let newArticle = $('<article></article>'); 
										$.each(articles[A], function (aKey,aVal) {
											if(aKey !== 'fieldset') 
												newArticle.attr('data-' + aKey, aVal);
											else {
												let fieldsets = aVal;
												for(let F = 0;F < fieldsets.length;F++) {
													let newFieldset = $('<fieldset></fieldset>'); 
													$.each(fieldsets[F], function (fKey,fVal) {
															newFieldset.attr('data-' + fKey, fVal);
													});
													newArticle.append(newFieldset);
												}
											}
										});
										newSection.append(newArticle);
									}
								} 
							});
							MAIN.append(newSection);
						}
					} 
				});
				$('#middle').prepend(MAIN);
				$('#unpack').empty().remove();
				standardError('ready with depacking');
	},
}



$.WOLF.direct = {  
	saveHTMLFile: function (filename, content, data = {}) {
		if(!filename || !content) return standardError('some things are missing'); 
		data['req'] = 'saveHTMLFile';
		data['filename'] = filename;
		data['content'] = content;
		$.ajax({  type: 'POST', 
						 url: BACKDIRECT, 
						 dataType: 'html',
						 cache:false, 
						 data: data, 
						 success: function (response) { standardOK(response); },
						 error: function (response) {standardError(response); }
		});
	},
	saveQUESTfile: function (code, json, data={}) {
		data['req'] = 'saveQUESTfiles';
		data['project'] = $('#admin_project').val();
		data['htmlfile'] = $.trim(code);
		data['jsonfile'] = JSON.stringify(json);
		/*first send the html file */
		$.ajax({  type: 'POST', 
						 url: BACKQUEST, 
						 dataType: 'html',
						 cache:false, 
						 data: data, 
						 success: function (response) { standardOK(response); },
						 error: function (response) {standardError(response); }
		});
		
	},
}

$.WOLF.admin = {  //magage the links out of the chapters
	/*** global starter function ***/
	checkClass: function () {
		
	},
	start: function (obj = '#middle') {  
		try {
			$.WOLF.reinit(); 
			$.WOLF.admin.trans();  
			$.WOLF.navy.cleanUp();
			$.WOLF.jumper.start(obj);
			
			/*if($('#masterLoader:visible').length > 0) {
				$('#masterLoader').addClass('sleep');
				console.log('sleep');
			}
			$('.waiting').removeClass('waiting');*/
			return;
		} catch (e) { 
			catcher('admin.start', e); 
		}
	},
	data: function (data = {}) { 
		data['rand'] = getRandom();
		data['lang'] = lang = $('html').hasAttr('lang') ? $('html').attr('lang') : 'en';
		$.each($('#adminFields').find('input[id^=admin_]'), function () {
			data[$(this).attr('id')] = $(this).val();
		});
		//console.log(data);
		return data;
	},
	serializeData: function (data = {}) { 
		//var lang = $('html').hasAttr('lang') ? $('html').attr('lang') : 'en';
		data = '?' + getRandom();
		data += $('html').hasAttr('lang') ? '&lang=' + $('html').attr('lang') : '&lang=en';
		
		$.each($('#adminFields').find('input[id^=admin_]'), function () {
			data += '&' + $(this).attr('id') + '=' + $(this).val();
		});
		return data;
	},
	
	/* starting functions */
	func: function(functionName, args) {
			
			try {
			    let context = window;
				
				var args 		= Array.prototype.slice.call(arguments, 1);
				var namespaces 	= functionName.split(".");
				var func 		= namespaces.pop();

				for(var i = 0; i < namespaces.length; i++) {
					context = context[namespaces[i]];
				}
				return context[func].apply(context, args);

			
			} catch (e) {  
				return catcher('error at calling function ' + functionName, e); 
			}
	},
	
	/* member, lang in/out ***/
	
	
	logout: function (type = true) {  
		try {
			var logID = $.WOLF.value.get('logID');
			alert(LOGINPATH);
			if(!$.WOLF.value.get('logID')) return window.location.href = LOGINPATH;
			
			var successhandle = function (response) {
				window.location.href = LOGINPATH;
			}
			if(type == false) successhandle = function () {};
			var data = $.extend($.WOLF.admin.data(), {req: 'login_logout', logID: logID});
			return $.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });
		} catch (e) {catcher('admin.logout', e);}
	},
	reloadLang: function (newLang) {  
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('body').append('<form id="dummyForm" name="dummyForm" method="POST" action="/" style="display:none;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + $('#admin_id').val() + '">');
		$('#dummyForm').append('<input type="text" name="lang" id="lang" value="' + newLang + '">');
		document.dummyForm.submit();
	},
	reloadMember: function (member) {  alert('reloadingMember for adminmanager');
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('body').append('<form id="dummyForm" name="dummyForm" method="POST" action="/" style="display:none;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + member + '">');
		document.dummyForm.submit();
	},
	
	
	
	checkContent: function (response) { 
		response = response.replace(/<header>/g,'<div class="header"><span>')
					.replace(/<\/header>/g,'</span></div>')
					.replace(/<footer>/g,'<div class="footer">')
					.replace(/<\/footer>/g,'</div>')
					.replace(/<main>/g,'<div class="body"><p>')
					.replace(/<\/main>/g,'</p></div>')
					.replace(/>\s+</g,'><');
		response = response.replace(/<p><p>/g,'<p>').replace(/<\/p><\/p>/g,'<\p>');
		return '<div class="modal-content">' + response + '</div>';
		var content = '', header = '', footer = '', body = '';
		response.match(/<header>(.*?)<\/header>/m).map(function(val){
			   var headerTxt = val.replace(/<\/?header>/m,'');
			   header = '<div class="header"><span>' + headerTxt + '</span></div>';
			   response = response.replace(/<header>(.*?)<\/header>/m,'');
		});
					
		response.match(/<footer>(.*?)<\/footer>/m).map(function(val){
				var footerTxt = val.replace(/<\/?footer>/m,'');
				footer = '<div class="footer">' + footerTxt + '</div>';
				response = response.replace(/<footer>(.*?)<\/footer>/m,'');
		});
		
		content = '<div class="body">' + response.trim() + '</div>';
		return header + content + footer;
		
	},
	trans: function (obj = 'body', show = true) {  /*** global placeholder function ***/
		try {
			if(show == true) { 
				setTimeout(function () { 
					$.WOLF.helper.loadingSpinner('hide');
					$('body').removeClass('loadingContent');
					//console.log('hiding');
					}, 100);
					
				return;
			}
			else { 
				$.WOLF.helper.loadingSpinner('show');
				return $('body').addClass('loadingContent');
			}
		} catch (e) {
				catcher('admin/trans', e);
		}
	},
	site: function (site = '', successhandle = 'show', data = {}) { //get files or forms from the formpath
		    
		    
		    $('.tooltip').remove();
		    if(!site) { standardError('no listtype!');return;}
		    
		    /* wenn es eine funktion ist, dann .... */
		    if(typeof successhandle === "function") { 
		    	$.WOLF.admin.trans('#middle',false); 
		    	setTimeout(function () { $.WOLF.admin.trans(); }, timeout);
		    	successhandle = successhandle; 
		    } else if(successhandle == 'preview') {
		    	$.WOLF.admin.trans('#middle',false);
		    	/* toggler between admin and preview */
		    	setTimeout(function () { $.WOLF.admin.trans(); }, timeout);
				successhandle = function (response) { 
					$('#wrapper').removeClass('admin');
					$('#middle').removeClass('admin').html(response);
					$.WOLF.admin.start('#middle');
					return; 
				}
		    /* wenn nichts, show, oder #middle */
		    } else if(successhandle == 'show' || successhandle == '#middle') {
		    	$.WOLF.admin.trans('#middle',false);
		    	setTimeout(function () { $.WOLF.admin.trans(); }, timeout);
				successhandle = function (response) { 
					$('#wrapper').addClass('admin');
					$('#middle').addClass('admin').html(response);
					$.WOLF.admin.start('#middle');
					return; 
				}
			/* into several notes */
		    } else if(successhandle == 'note') {  //show the note
		    	successhandle = function (response) {  return standardSuccess(response); }
		    } else if(successhandle == 'console') {  //show in console
		    	successhandle = function (response) {  return console.log('response', response); }
		    } else if(successhandle == 'errornote') {  //show the error
		    	successhandle = function (response) {  return standardError(response); }
		    } else if(successhandle == 'infonote') {  //show the information
		    	successhandle = function (response) {  return standardInfo(response); }
		    /* dialogs */
		    } else if (successhandle == 'alert') {
				var myWidth = ' style="width:400px;max-width:100%;" ';
				if(data && data.width) myWidth = ' style="width:' + data.width + ';max-width:100%;" ';
				
				successhandle = function (response) { 
					
					if($('#myModal').length > 0) $('#myModal').remove();
					var mod = $('<div class="wmodal" id="myModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"></div>');
					/*append the dismiss-modal*/	
					if($('#myModal').find('.header').find('button[data-dismiss]').length == 0) {
							$('#myModal').find('.header').append('<button data-dismiss="modal"></button>');
					} 
					
					$(mod).append('<div class="wmodal-content"><span class="close">&times;</span><p>Some text in the Modal..</p></div>');
					$('body').append(mod);
					setTimeout(function () {
						$('.wmodal-content').addClass('open');
					}, 1000);
					// Get the modal
					var modal = document.getElementById("myModal");
					
					// Get the button that opens the modal
					var btn = document.getElementById("myBtn");
					
					// Get the <span> element that closes the modal
					var span = document.getElementsByClassName("close")[0];
					
					// When the user clicks the button, open the modal 
					//$(btn).click(function() {
					  modal.style.display = "block";
					//});
					
					// When the user clicks on <span> (x), close the modal
					$(span).click(function() {
					  modal.style.display = "none";
					});
					
					// When the user clicks anywhere outside of the modal, close it
					window.onclick = function(event) {
					  if (event.target == modal) {
					    modal.style.display = "none";
					  }
					}
					
					response = response.trim();
					if(response.substr(0, 9) == 'noteError') return standardError(response.substr(10));
					else if(response.substr(0, 8) == 'noteInfo') return standardInfo(response.substr(9));
					else if(response.substr(0, 11) == 'noteSuccess') return standardOK(response.substr(12));
					return;
					if($('#myModal').length > 0) $('#myModal').remove();
					$('body').append('<div class="modal" id="myModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div role="document" class="modal-dialog modal-dialog-centered" ' + myWidth + '>' + response + '</div></div>');
					/*append the dismiss-modal*/	
					if($('#myModal').find('.header').find('button[data-dismiss]').length == 0) {
							$('#myModal').find('.header').append('<button data-dismiss="modal"></button>');
					}
						
					$('#myModal').on('shown.bs.modal', function (event) { $.WOLF.admin.start(); });
					$('#myModal').on('hide.bs.modal', function () { });
					$('#myModal').on('hidden.bs.modal', function () { $('#myModal').remove();});
					$('#myModal').modal({backdrop: 'static', keyboard: true, focus: true, show: true});
					return; 
				}
			} else if (successhandle == 'confirm') {
				
				successhandle = function (response) { 
					var type = 'help';
					$('#aside-' + type).empty().html($.WOLF.admin.checkContent(response));
					return $.WOLF.navy.mobile_rightview(type, true);
				}
				
			} else if (successhandle == 'help') {
				
				successhandle = function (response) { 
					var type = 'help';
					$('#aside-' + type).find('.mainWrap').empty().html($.WOLF.admin.checkContent(response));
					return $.WOLF.navy.mobile_rightview(type, true);
				}
				
			} else if (successhandle == 'right') {
				
				successhandle = function (response) { 
					var type = 'slide';
					$('#aside-' + type).empty().append('<div class="fullsize">' + $.WOLF.admin.checkContent(response) + '</div>');
					return $.WOLF.navy.mobile_rightview(type, true);
				}
				
			} else if (successhandle == 'bottom') {
				
				successhandle = function (response) { 
					var type = 'bottom';
					$('#aside-' + type).empty().append('<div class="fullsize">' + $.WOLF.admin.checkContent(response) + '</div>');
					return $.WOLF.navy.mobile_rightview(type, true);
				}
				
			} else if (successhandle == 'dialog') {
				
				
				var myWidth = ' style="width:600px;max-width:100%;" ';
				if(data && data.width) myWidth = ' style="width:' + data.width + ';max-width:100%;" ';
				
				successhandle = function (response) { 
					return myDialog(response, data);
					return; 
				}
			} else if (successhandle == 'modal') {
				alert('site:modal -> change this into dialog');
				var myWidth = ' style="width:600px;max-width:100%;" ';
				if(data && data.width) myWidth = ' style="width:' + data.width + ';max-width:100%;" ';
				
				successhandle = function (response) { 
					response = response.trim();
					if(response.substr(0, 9) == 'noteError') return standardError(response.substr(10));
					else if(response.substr(0, 8) == 'noteInfo') return standardInfo(response.substr(9));
					else if(response.substr(0, 11) == 'noteSuccess') return standardOK(response.substr(12));
					
					if($('#myModal').length > 0) $('#myModal').remove();
					$('body').append('<div class="modal fade" id="myModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div role="document" class="modal-dialog modal-dialog-centered" ' + myWidth + '>' + response + '</div></div>');
					/*append the dismiss-modal*/	
					if($('#myModal').find('.header').find('button[data-dismiss]').length == 0) {
							$('#myModal').find('.header').append('<button data-dismiss="modal"></button>');
					}
						
					$('#myModal').on('shown.bs.modal', function (event) { $.WOLF.admin.start(); });
					$('#myModal').on('hide.bs.modal', function () { });
					$('#myModal').on('hidden.bs.modal', function () { $('#myModal').remove();});
					$('#myModal').modal({backdrop: 'static', keyboard: true, focus: true, show: true});
					return; 
				}
			} else if (successhandle == 'right') {
				
				successhandle = function (response) { 
					
					var myWidth = ' style="width:600px;max-width:100%;" ';
					if(data && data.width) myWidth = ' style="width:' + data.width + ';max-width:100%;" ';
				
					
					if($('#myModal').length > 0) $('#myModal').remove();
					
					
					var content = $('<div class="modal-content"></div>'), header = null, footer = null, body = null;
					var result = response.match(/<headline>(.*?)<\/headline>/g).map(function(val){
					   var headerTxt = val.replace(/<\/?headline>/g,'');
					   header = $('<div class="header">' + headerTxt + '</div>');
					   response = response.replace(/<headline>(.*?)<\/headline>/g,'');
					});
					
					response.match(/<footerline>(.*?)<\/footerline>/g).map(function(val){
					   var footerTxt = val.replace(/<\/?footerline>/g,'');
					   footer = $('<div class="footer">' + footerTxt + '</div>');
					   response = response.replace(/<footerline>(.*?)<\/footerline>/g,'');
					});
					//rest in body
					body = $('<div class="body">' + response + '</div>');
        
                    if(header) { $(content).append(header);}
					if(body) { $(content).append(body);}
					if(footer) { $(content).append(footer);}
					
					
					
					
					$('body').append('<div class="modal" id="myModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div role="document" class="modal-dialog modal-dialog-centered" ' + myWidth + '></div></div>');
					$('#myModal').find('.modal-dialog').append(content);
					
					/*append the dismiss-modal*/	
					if($('#myModal').find('.header').find('button[data-dismiss]').length == 0) {
							$('#myModal').find('.header').append('<button data-dismiss="modal"></button>');
					}
					
					$('#myModal').on('shown.bs.modal', function (event) { $.WOLF.admin.start(); });
					$('#myModal').on('hide.bs.modal', function () { });
					$('#myModal').on('hidden.bs.modal', function () { $('#myModal').remove();});
					$('#myModal').modal({backdrop: 'static', keyboard: true, focus: true, show: true});
					return; 
				}
			}
			/* sonst in sleector rein ... */
			else if($(successhandle).length > 0) {
		    	var obj = successhandle;
		    	$.WOLF.admin.trans(obj,false);
				successhandle = function (response) { 
					$(obj).html(response);
					$.WOLF.admin.start();
					$.WOLF.admin.trans(obj);
					return; 
				}
		    } else return standardError ('No output selected');
			
			$.extend( data, $.WOLF.admin.data(), {req: 'site', site: site });
			jQuery.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });
			return;
	},
	update: function (obj) {  
		//standardPrompt('$.WOLF.admin.update --> adminUPDATE');/* prooved alert('message alert from $.WOLF.admin.update'); */
		
		//testing:
		let doTable = $(obj).closest('[data-table]').length > 0 && $(obj).closest('[data-table]').data('id')  ? true : false,
			doPid = $(obj).closest('[data-table]').length > 0 && $(obj).closest('[data-table]').hasData('pid') ? true : false,
			doJson = $(obj).closest('[data-json]').length > 0 && $(obj).closest('[data-json]').hasData('id') ? true : false;
			
		//collecting	
		var fieldname = $(obj).hasData('field') && $(obj).data('field').length > 0 ? $(obj).data('field') : 'Data',
			fieldname = '<span>' + fieldname + ' updated</span>';
		
		var field = $(obj).attr('name');
		
		var table = $(obj).closest('[data-table]').data('table');
		
		var value = $.WOLF.value.get(obj);
		if(!value) value = '';
		
		var id = $(obj).closest('[data-table], [data-json]').attr('data-id'),
			pid =  $(obj).closest('[data-table], [data-json]').attr('data-pid');
		
		var addData = {};	
		if(doJson && doTable) {
			addData = {json: $(obj).closest('[data-json]').data('json')};
			//myP('xboth json && table'); 
		}
		else if(doJson && doPid) {
			addData = {json: $(obj).closest('[data-json]').data('json') };
			//standardError('both json && table');
		}
		else if(doJson) {  //json only
			addData = {json: $(obj).closest('[data-json]').data('json') };
			//standardError('only json');
		}
		/*else if(doTable) { standardError('only table'); }
		else if(doSubtable) { standardError('only subtable'); }*/
		
		var successhandle = function (response) { 
			
				function _mySuccess (txt, value) {
					if($(obj).hasClass('noInfo')) return;
					standardInfo(txt, '', 'bottom-right', 1000);
					
					if($(obj).closest('[data-table]').length > 0 && $('[data-clone]').length > 0) {
						var tabname = $(obj).closest('[data-table]').data('table'),
							fieldname = $(obj).attr('name');
						$('img[data-clone="' + tabname + fieldname + '"]').attr('src', value);
						$('span[data-clone="' + tabname + fieldname + '"]').css('background-image', 'url(\'' + value + '\')');
						$('span[data-clone="' + fieldname + '"]').text(value);
					}
					return false;
				}
						
				function _myError (txt) {
					standardError(txt, '', 'bottom-right', 2500, true);
					$('#lastButton').prop('disabled', false).removeAttr('disabled');
					return false;
				}
			
				if(response == 1) { return _mySuccess(fieldname, value);}
				else if(response == -1) { return _myError('Something went wrong when updating this entry', value);}
				else if(response == 0) { return _myError('Cannot execute this update', value);}
				else standardError(response);
				return $('#lastButton').prop('disabled', false).removeAttr('disabled');
		}
		
		if(doPid) {
			if(!pid || !table || !field || !pid) 
				return standardError('MissingPid: ' + table + '#' + value + '#' + field + '#' + pid); 
			var data = $.extend($.WOLF.admin.data(), addData, {req: 'form_update_pid', table: table, field: field, val: value, pid: pid });
			jQuery.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });
		} else if(doTable) {  //standardError('check: ' + table + '#' + value + '#' + field + '#' + id);
			if(!id || !table || !field|| !id) 
				return standardError('MissingID: ' + table + '#' + value + '#' + field + '#' + id); 
			var data = $.extend($.WOLF.admin.data(), addData, {req: 'form_update', table: table, field: field, val: value, id: id });
			jQuery.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });
		} else if (doJson && !doPid && !doTable) {  //musts json, field
			var data = $.extend($.WOLF.admin.data(), addData, {req: 'form_update_json', field: field, val: value });
			jQuery.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });
		}
		return;
				
	},
	parser: function (filename, data = {}) {
		if(!filename) return alert('admin.parser no filename');
		var successhandle = function (response) { standardInfo('from server: ' + response);}
		var data = $.extend($.WOLF.admin.data(), {req: 'parse_word', filename: filename });
		jQuery.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });
    },
	uploadDirect: function (obj, masterclone = null) {  alert('$.WOLF.admin.uploadDirect');

	
		//optional - only if data-table, data-id, field
		function insertAfterUpload (obj, value, info = null) {
		    var field = $(obj).attr('name'), 
				table = $(obj).attr('data-table'), 
				id = $(obj).attr('data-id'),
				successhandle = function (response) { 
					//if(table == 'project' && field == 'image') alert('copy');
					if(response) mySuccess(response);
					return;  },
				data = $.extend($.WOLF.admin.data(), {
					req: 'form_update', 
					table: table, 
					field: field, 
					val: value, 
					id: id });
			
			if(value && id && table && field) jQuery.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });	
			if(alttable) {
				if(value && id && alttable && field) jQuery.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });	
			}
		}
	
		var master = $(obj).closest('[data-type]');
		$(master).addClass('loading');
		
		var fd = new FormData();
        var files = $(obj)[0].files[0];
        fd.append('file',files);
        var prefix = $(obj).hasData('prefix') ? $(obj).data('prefix') : null;
		var dir = $(obj).hasData('dir') ? $(obj).data('dir') : null;
		var copy = $(obj).hasData('copy') ? $(obj).data('copy') : 'no';
		
		$.ajax({
            url: BACKBONE + '?req=media_smart&dir=' + dir + '&prefix=' + prefix + '&copy=' + copy + '&randy=' + getRandom(),
            type: 'POST',
            data: fd,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        //console.log(percentComplete);
                        $('#status').html((Math.round(percentComplete * 100)) + '%');
                    }
                }, true);
                return xhr;
            },
            success: function(response){  response = response.trim();
            	if(response != -1) { 
                	//if($(master).find('[data-variable]').length > 0) $(master).find('[data-variable]').val(response);
                	
                	if ($(master).find('img').length == 0) {  
                    	$(master).css('background-image', "url('" + response + "')");
                    	if($(masterclone).length > 0) {
							$(masterclone).css('background-image', "url('" + response + "')");
						}
                    } else if($(master).find('img').length > 0) {
                    	$(master).find('img').attr('src', response);
                    }
                    if($(obj).closest('[data-table][data-id]').length > 0) {
                    	$.WOLF.admin.updateDirect($(obj).closest('[data-table]').attr('data-table'), $(obj).attr('name'), $(obj).closest('[data-id]').attr('data-id'), response); 
	                }
	                if($(obj).hasAttr('data-alttable')) { 
                    	$.WOLF.admin.updateDirect_pid($(obj).attr('data-alttable'), $(obj).attr('name'), $(obj).closest('[data-id]').attr('data-id'), response); 
	                }
	                $(master).removeClass('loading');
	                /*try {
	                	//insertAfterUpload(obj, response);
	                } catch (e) {}*/
	                return;
                } else{
                    alert('file not uploaded');
                    $(master).removeClass('loading');
	            }
            },
            error: function (response) {
            	standardError(response);
            	$(master).removeClass('loading');
	            //$('#upLoader').remove();
            },
            cache: false,
            contentType: false,
            processData: false
        });
        return false;
    },
    deleteFile: function (obj) { return alert('delete File -> should goes to mediaDelete');
				var successhandle = function (response) { 
					if(response.trim() == '-1') standardError('Something went wrong when trying to delete the selected file!'); 
					else if(response.trim() == '-99') standardError('File missing!');
					else {
						trigger($(obj).closest('[data-trigger]'));
						/*if($(obj).closest('[data-filebox]').length > 0)
		    				$(obj).closest('[data-filebox]').html(response);*/
						standardSuccess('The selected file has been successfully deleted!'); 
					}
					//$.WOLF.media.refreshBox(myBox);
					return;
				}
				
		    	var filename = null;
				if( Object.prototype.toString.call(obj) == '[object String]' ) {
					filename = obj;
				} else {
					filename = $(obj).hasData('src') ? $(obj).data('src') : $(obj).attr('src');
				}
				filename = filename.replace('/thumbnail','');
		    	
		    	var data = $.extend( $.WOLF.admin.data(), {req: 'fileDelete', filename: filename});
				$.ajax({  type: 'POST', url: BACKBONE, data: data, success: successhandle, error: standardError  });
		    	return;
	},
}



/*********************** ENDE KORR *******************************/




var AL = {  //magage the links out of the chapters
	logout: function (type = true) {  return alert('AL.logout'); 
		var logID = $.WOLF.value.get('logID')
		if(!$.WOLF.value.get('logID')) return window.location.href = REDIRECT + '?login';
		
		var successhandle = function (response) {
			window.location.href = REDIRECT + '?login';
		}
		if(type == false) successhandle = function () {};
		return $.WOLF.admin.base('login_logout', successhandle, {logID: logID});
	},
	reloadLang: function (newLang) {  return alert('AL.reloadLang'); 
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('body').append('<form id="dummyForm" name="dummyForm" method="POST" action="/" style="display:none;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + $('#admin_id').val() + '">');
		$('#dummyForm').append('<input type="text" name="lang" id="lang" value="' + newLang + '">');
		document.dummyForm.submit();
	},
	reloadMember: function (member) {  return alert('AL.reloadMember'); //from login success
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('body').append('<form id="dummyForm" name="dummyForm" method="POST" action="/" style="display:none;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + member + '">');
		document.dummyForm.submit();
	},
	/*** probably no longer needed ***/
	toOverview: function (id) {  return alert('AL.toOverview');
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('body').append('<form id="dummyForm" name="dummyForm" method="POST" action="/" style="display:none;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + id + '">');
		document.dummyForm.submit();
	},
	toSettings: function (id) {  return alert('AL.toSettings');
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('body').append('<form id="dummyForm" name="dummyForm" method="POST" action="/" style="display:none;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + id + '">');
		$('#dummyForm').append('<input type="text" name="directly" id="directly" value="settings">');
		document.dummyForm.submit();
	},
	toMemberlist: function (id) {  return alert('AL.toMemberlist');
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('body').append('<form id="dummyForm" name="dummyForm" method="POST" action="/" style="display:none;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + id + '">');
		$('#dummyForm').append('<input type="text" name="directly" id="directly" value="members">');
		document.dummyForm.submit();
	},
	toKat: function (obj) { return alert('AL.toKat');    //obj -> id, usertype = null, gotokat = null, gotoid = null
		var projects = $(obj).closest('table').find('tr[data-type]').length, dat = $(obj).closest('tr').data();
		if($('#dummyForm').length > 0) $('#dummyForm').remove();
		$('#middle').append('<form id="dummyForm" name="dummyForm" method="POST" action="/" style="display:none !important;background:red;position:fixed;top:20px;left:20px;width:300px;"></form>');
		if(dat.user) 		$('#dummyForm').append('<input type="text" name="admin_id" id="admin_id" value="' + dat.user + '">');
		if(dat.usertype) 	$('#dummyForm').append('<input type="text" name="admin_usertype" id="admin_usertype" value="' + dat.usertype + '">');
		if(dat.type) 	    $('#dummyForm').append('<input type="text" name="admin_type" id="admin_type" value="' + dat.type + '">');
		if(dat.cat) 		$('#dummyForm').append('<input type="text" name="admin_cat" id="admin_cat" value="' + dat.cat + '">');
		if(dat.project) 	$('#dummyForm').append('<input type="text" name="admin_project" id="admin_project" value="' + dat.project + '">');
		if(dat.web) 		$('#dummyForm').append('<input type="text" name="admin_web" id="admin_web" value="' + dat.web + '">');
		$('#dummyForm').append('<input type="text" name="admin_projects" id="admin_projects" value="' + projects + '">');
		document.dummyForm.submit();
	},
	/*** END probably no longer needed ***/
	
}








