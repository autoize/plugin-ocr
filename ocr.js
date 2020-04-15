(function(window, undefined){

	var oLangMap = {};
    oLangMap["eng"] = "English";
    oLangMap["chi_sim"] = "Chinese";
    oLangMap["rus"] = "Russian";
    oLangMap["meme"] = "Meme";
    oLangMap["tha"] = "Thai";
    oLangMap["deu"] = "German";
    oLangMap["jpn"] = "Japanese";
    oLangMap["spa"] = "Spanish";
    oLangMap["fra"] = "French";
    oLangMap["por"] = "Portuguese";
    oLangMap["ita"] = "Italian";
    oLangMap["pol"] = "Polish";
    oLangMap["tur"] = "Turkish";
    oLangMap["nld"] = "Dutch";
    oLangMap["ara"] = "Arabic";
    oLangMap["ces"] = "Czech";
    oLangMap["kor"] = "Korean";
    oLangMap["swe"] = "Swedish";
    oLangMap["vie"] = "Vietnamese";
    oLangMap["ron"] = "Romanian";
    oLangMap["ell"] = "Greek";
    oLangMap["ind"] = "Indonesian";
    oLangMap["hun"] = "Hungarian";
    oLangMap["dan"] = "Danish";
    oLangMap["bul"] = "Bulgarian";
    oLangMap["fin"] = "Finnish";
    oLangMap["nor"] = "Norwegian";
    oLangMap["ukr"] = "Ukrainian";
    oLangMap["cat"] = "Catalan";
    oLangMap["hrv"] = "Croatian";
    oLangMap["heb"] = "Hebrew";
    oLangMap["lit"] = "Lithuanian";
    oLangMap["slv"] = "Slovenian";
    oLangMap["hin"] = "Hindi";
    oLangMap["ben"] = "Bengali";
    oLangMap["tel"] = "Telugu";
    oLangMap["tam"] = "Tamil";
    oLangMap["kan"] = "Kannada";
    oLangMap["mal"] = "Malayalam";
    oLangMap["tgl"] = "Tagalog";
    oLangMap["swa"] = "Swahili";
    oLangMap["aze"] = "Azerbaijani";
    oLangMap["bel"] = "Belarusian";
    oLangMap["afr"] = "Afrikaans";
    oLangMap["sqi"] = "Albanian";
    oLangMap["eus"] = "Basque";
    oLangMap["epo"] = "Esperanto";
    oLangMap["est"] = "Estonian";
    oLangMap["glg"] = "Galician";
    oLangMap["isl"] = "Icelandic";
    oLangMap["lav"] = "Latvian";
    oLangMap["mkd"] = "Macedonian";
    oLangMap["msa"] = "Malay";
    oLangMap["mlt"] = "Maltese";
    oLangMap["grc"] = "Ancient Greek";
    oLangMap["chr"] = "Cherokee";
    oLangMap["enm"] = "English (Old)";
    oLangMap["frk"] = "Frankish";
    oLangMap["equ"] = "Math";
    oLangMap["srp"] = "Serbian (Latin)";
    oLangMap["slk"] = "Slovak";

    window.oncontextmenu = function(e)
	{
		if (e.preventDefault)
			e.preventDefault();
		if (e.stopPropagation)
			e.stopPropagation();
		return false;
    };

    function escapeHtml(string) {
        var res = string;
        res = res.replace(/[\', \", \\]/g, function (sSymbol) {
            return '\\' + sSymbol;
        });
        return res;
    }

    var arrParsedData = [];
    var oRecognition;
    window.Asc.plugin.init = function(){

        this.resizeWindow(592, 100, 592, 100, 592, 100);
        var oImagesContainer = document.getElementById('image-container-div');
        var container = document.getElementById('scrollable-image-text-div');
        window.addEventListener("wheel", function(e){
            var bCtrl = e.ctrlKey || e.metaKey;
            if(bCtrl) {
                e.preventDefault && e.preventDefault();
                e.stopPropagation && e.stopPropagation();
                return;
            }}, { passive: false });
        oRecognition = new OCR.CRecognition();
        var oDrawing = new OCR.CDrawing(oImagesContainer, oRecognition);
        var nStartFilesCount = 0, arrImages;


        $( window ).resize(function(){
        });
        function updateScroll(){
        }
        $('#delete-area-button').click(function (e) {
            oRecognition.deleteSelectedBlocks();
        });
        $('#undo-button').click(function (e) {
            oRecognition.undo();
        });

        $('#redo-button').click(function (e) {
            oRecognition.redo();
        });

        $('#text-area-button').click(function (e) {
            oRecognition.startAdd("FLOWING_TEXT");
        });

        $('#picture-area-button').click(function (e) {
            oRecognition.startAdd("FLOWING_IMAGE");
        });

        $('#recognize-blocks-button').click(function (e) {
            oRecognition.startRecognize();
        });



        $('#load-file-button-id').click(

			function (e) {

				if (window["AscDesktopEditor"])
				{
					window["AscDesktopEditor"]["OpenFilenameDialog"]("images", true, function(files) {
                        arrImages = [];

                        if (!Array.isArray(files)) // string detect
                            files = [files];

						if (files.length == 0)
							return;

						window.Asc.plugin.resizeWindow(800, 571, 800, 571);

						var oImagesContainer = document.getElementById('image-container-div');
						while (oImagesContainer.firstChild) {
							oImagesContainer.removeChild(oImagesContainer.firstChild);
						}
						var oTextContainer = document.getElementById('text-container-div');
						while (oTextContainer.firstChild) {
							oTextContainer.removeChild(oTextContainer.firstChild);
						}

						for (var i = 0; i < files.length; i++)
						{
							var oImgElement = document.createElement('img');
							oImgElement.src = window["AscDesktopEditor"]["GetImageBase64"](files[i], false);
							oImgElement.style.width = '100%';
							oImgElement.style.marginBottom = "10px";
							arrImages.push(oImgElement);
							oImagesContainer.appendChild(oImgElement);
						}

						document.getElementById('lang-select').removeAttribute('disabled');
						document.getElementById('recognize-button').removeAttribute('disabled');
						nStartFilesCount = files.length;
						$('#status-label').text('');
						$('#scrollable-image-text-div').css('display', 'inline-block');
						updateScroll();
					});

					return;
				}

                $('#images-input').click();
            }
        );

        $('#images-input').change(function(e) {
            var arrFiles = e.target.files;
			//check for images in file list
			var arrFiles2 = [];
			for(var i = 0; i < arrFiles.length; ++i){
				if(arrFiles[i] && arrFiles[i].type && arrFiles[i].type.indexOf('image') === 0){
					arrFiles2.push(arrFiles[i]);
				}
				else{
					alert(arrFiles[i].name + "\nOCR plugin cannot read this file.");
				}
			}
			// var file = arrFiles[0];
            // if (file && file.name) {
            //     EXIF.getData(file, function() {
            //         var exifData = EXIF.pretty(this);
            //         if (exifData) {
            //             alert(exifData);
            //         } else {
            //             alert("No EXIF data found in image '" + file.name + "'.");
            //         }
            //     });
            // }
			arrFiles = arrFiles2;
            if(arrFiles.length > 0){
                window.Asc.plugin.resizeWindow(800, 571, 800, 571);
                oRecognition.addPageFromFile(arrFiles[0]);
            }
        });
        $('#recognize-button').click(
            function () {
                oRecognition.startRecognize();
            }
        );

        $("#lang-select").change(function () {
            oRecognition.onPageUpdate(oRecognition.getCurPage());
        });

        oRecognition.updateInterfaceState();
    };

    window.Asc.plugin.button = function(id){
        if (id === 0){
            window.Asc.plugin.info.recalculate = true;
            this.executeCommand("close", oRecognition.getScript().s);
        }
        else{
            this.executeCommand("close", "");
        }
    };


	window.Asc.plugin.onTranslate = function(){

	    var tr = window.Asc.plugin.tr;

        $("#label1").text(tr("Tesseract.js lets recognize text in pictures (png, jpg)"));
        $("#label2").text(tr("Choose language"));
        $("#load-file-button-id").text(tr("Load File"));
        $("#recognize-button").text(tr("Analyze and recognize"));
		var elem = document.getElementById("lang-select");
		if(elem){
			var sInnerHtml = "";
			for(var key in oLangMap){
				if(oLangMap.hasOwnProperty(key)){
					sInnerHtml += "<option value = \'" + key + "'>" + window.Asc.plugin.tr(oLangMap[key]) + "</option>";
				}
			}
			elem.innerHTML = sInnerHtml;
		}
	};

	})(window, undefined);
