(function(window, undefined){

	var oLangMap = {};
    oLangMap['eng'] = "English";
    oLangMap['chi_sim'] = "Chinese";
    oLangMap['rus'] = "Russian";
    oLangMap['meme'] = "Meme";
    oLangMap['tha'] = "Thai";
    oLangMap['deu'] = "German";
    oLangMap['jpn'] = "Japanese";
    oLangMap['spa'] = "Spanish";
    oLangMap['fra'] = "French";
    oLangMap['por'] = "Portuguese";
    oLangMap['ita'] = "Italian";
    oLangMap['pol'] = "Polish";
    oLangMap['tur'] = "Turkish";
    oLangMap['nld'] = "Dutch";
    oLangMap['ara'] = "Arabic";
    oLangMap['ces'] = "Czech";
    oLangMap['kor'] = "Korean";
    oLangMap['swe'] = "Swedish";
    oLangMap['vie'] = "Vietnamese";
    oLangMap['ron'] = "Romanian";
    oLangMap['ell'] = "Greek";
    oLangMap['ind'] = "Indonesian";
    oLangMap['hun'] = "Hungarian";
    oLangMap['dan'] = "Danish";
    oLangMap['bul'] = "Bulgarian";
    oLangMap['fin'] = "Finnish";
    oLangMap['nor'] = "Norwegian";
    oLangMap['ukr'] = "Ukrainian";
    oLangMap['cat'] = "Catalan";
    oLangMap['hrv'] = "Croatian";
    oLangMap['heb'] = "Hebrew";
    oLangMap['lit'] = "Lithuanian";
    oLangMap['slv'] = "Slovenian";
    oLangMap['hin'] = "Hindi";
    oLangMap['ben'] = "Bengali";
    oLangMap['tel'] = "Telugu";
    oLangMap['tam'] = "Tamil";
    oLangMap['kan'] = "Kannada";
    oLangMap['mal'] = "Malayalam";
    oLangMap['tgl'] = "Tagalog";
    oLangMap['swa'] = "Swahili";
    oLangMap['aze'] = "Azerbaijani";
    oLangMap['bel'] = "Belarusian";
    oLangMap['afr'] = "Afrikaans";
    oLangMap['sqi'] = "Albanian";
    oLangMap['eus'] = "Basque";
    oLangMap['epo'] = "Esperanto";
    oLangMap['est'] = "Estonian";
    oLangMap['glg'] = "Galician";
    oLangMap['isl'] = "Icelandic";
    oLangMap['lav'] = "Latvian";
    oLangMap['mkd'] = "Macedonian";
    oLangMap['msa'] = "Malay";
    oLangMap['mlt'] = "Maltese";
    oLangMap['grc'] = "Ancient Greek";
    oLangMap['chr'] = "Cherokee";
    oLangMap['enm'] = "English (Old)";
    oLangMap['frk'] = "Frankish";
    oLangMap['equ'] = "Math";
    oLangMap['srp'] = "Serbian (Latin)";
    oLangMap['slk'] = "Slovak";

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

                for(i = 0; i < arrFiles.length; ++i) {
                    oRecognition.addPageFromFile(arrFiles[i]);
                }
                oDrawing.goToPage(0);
            }
        });
        $('#recognize-button').click(
            function () {

                var arrImagesCopy = [].concat(arrImages);
                for (var i = 0; i < arrImagesCopy.length; i++)
                {
                    if (arrImagesCopy[i] && (0 == arrImagesCopy[i].naturalWidth) && (0 == arrImagesCopy[i].naturalHeight))
                    {
                        arrImagesCopy.splice(i, 1);
                        i--;
                    }
                }
                if (0 == arrImagesCopy.length)
                    return;

                var oTextContainer = document.getElementById('text-container-div');
                while (oTextContainer.firstChild) {
                    oTextContainer.removeChild(oTextContainer.firstChild);
                }
                arrParsedData.length = 0;
                document.getElementById('recognize-button').setAttribute('disabled', '');
                document.getElementById('lang-select').setAttribute('disabled', '');
                document.getElementById('load-file-button-id').setAttribute('disabled', '');
                var fTesseractCall = function(){


                    const { createWorker } = Tesseract;
                    (async () => {
                        const worker = createWorker();
                        await worker.load();
                        await worker.loadLanguage('eng');
                        await worker.initialize('eng');
                        const { data} = await worker.recognize(image);
                        console.log(data);
                    })();


                    Tesseract.recognize(arrImagesCopy.splice(0, 1)[0], {lang: $('#lang-select option:selected')[0].value}).progress(function (progress) {
                        if(progress && progress.status === "recognizing text"){
                            var nPercent =  (100*(progress.progress + nStartFilesCount - arrImagesCopy.length - 1)/nStartFilesCount) >> 0;
                            $('#status-label').text('Recognizing: '+ nPercent + '%');
                        }
                    }).catch(function(err){
                                $('#status-label').text('');
                                document.getElementById('recognize-button').removeAttribute('disabled');
                                document.getElementById('lang-select').removeAttribute('disabled');
								document.getElementById('load-file-button-id').removeAttribute('disabled', '');

					}).then(function(result){
						 document.getElementById('text-container-div').appendChild($(result.html)[0]);
                            arrParsedData.push(result);
                            if(arrImagesCopy.length > 0){
                                fTesseractCall();
                            }
							else{
                                $('#status-label').text('');
                                document.getElementById('recognize-button').removeAttribute('disabled');
                                document.getElementById('lang-select').removeAttribute('disabled');
								document.getElementById('load-file-button-id').removeAttribute('disabled', '');
							}
					});
                };
                $('#status-label').text('Recognizing: 0%');
                fTesseractCall();
            }
        );
        oRecognition.updateInterfaceState();
    };

    window.Asc.plugin.button = function(id){
        if (id == 0){
            window.Asc.plugin.info.recalculate = true;
            this.executeCommand("close", oRecognition.getScript().s);
            return;
            var oPage =  oRecognition.pages[0];
            var aSections = oPage.dataProcess();
            var sScript = '';
            sScript += 'var oDocument = Api.GetDocument();\n';
            for(var nSectionIndex = aSections.length - 1; nSectionIndex > -1; --nSectionIndex) {
                var oCurSection = aSections[nSectionIndex];


                if(oCurSection.columns.length === 0) {
                    sScript += '\nvar oParagraph, oRun, oTextPr, oFirstSectionParagraph;\n';


                    sScript += '\noFirstSectionParagraph = Api.CreateParagraph();\n';
                    sScript += "oDocument.Push(oFirstSectionParagraph);";

                    sScript += "var oSection1 = oDocument.CreateSection(oFirstSectionParagraph);";
                    sScript += "oSection1.SetPageSize("+oPage.convertPixToTwips(oPage.getWidth()) +", "+oPage.convertPixToTwips(oPage.getHeight()) +");";
                    sScript += "oSection1.SetPageMargins("+oPage.convertPixToTwips(oPage.marginL) +", "+oPage.convertPixToTwips(oPage.marginT) +", "+oPage.convertPixToTwips(oPage.marginR) +", "+oPage.convertPixToTwips(oPage.marginB) +");";
                    if(nSectionIndex === aSections.length - 1) {
                        sScript += "oSection1.SetType(\"nextPage\");";
                    }
                    else {
                        sScript += "oSection1.SetType(\"continuous\");";
                    }

                    for(var z = 0; z < oCurSection.blocks.length; ++z) {
                        var oBlock = oCurSection.blocks[z];
                        if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_TEXT) {
                            sScript += "var oFill = Api.CreateNoFill();";
                            sScript += "var oStroke = Api.CreateStroke(0, Api.CreateNoFill());";
                            var nWidth = oPage.convertPixToEMU(oBlock.bbox.x1 - oBlock.bbox.x0);
                            var nHeight = oPage.convertPixToEMU(oBlock.bbox.y1 - oBlock.bbox.y0);
                            sScript += "var oShape = Api.CreateShape(\"rect\", "+nWidth +", "+nHeight +", oFill, oStroke);";
                            sScript += "oShape.SetWrappingStyle(\"square\");";
                            sScript += "oShape.SetPaddings(0, 0, 0, 0);";
                            sScript += "oShape.SetDistances(0, 0, 0, 0);";
                            sScript += "oShape.SetHorPosition(\"page\", "+oPage.convertPixToEMU(oBlock.bbox.x0)+");";
                            sScript += "oShape.SetVerPosition(\"page\", "+oPage.convertPixToEMU(oBlock.bbox.y0)+");";
                            sScript += "oShape.SetVerticalTextAlign(\"top\");";




                            sScript += "oFirstSectionParagraph.AddDrawing(oShape);";

                            sScript += "var oDocContent = oShape.GetDocContent();";
                            sScript += "oDocContent.RemoveAllElements();";

                            for(var j = 0;  j < oBlock.paragraphs.length; ++j){
                                var oCurParagraph = oBlock.paragraphs[j];
                                if(j === 0) {
                                    sScript += '\noParagraph = oDocContent.GetElement(0);\n';
                                }
                                else {
                                    sScript += '\noParagraph = Api.CreateParagraph();\n';
                                    sScript += "oDocContent.Push(oParagraph);";
                                }

                                sScript += '\noParagraph.SetJc("left");\n';
                                var oFirstLine = oCurParagraph.lines[0];
                                if(oFirstLine) {
                                    sScript += "oParagraph.SetIndFirstLine(" + oPage.convertPixToTwips(oFirstLine.bbox.x0 - oBlock.bbox.x0) + ");";
                                }
                                for(var t = 0; t < oCurParagraph.lines.length; ++t){
                                    var oCurLine = oCurParagraph.lines[t];
                                    for(var k = 0; k < oCurLine.words.length; ++k){
                                        var oWord = oCurLine.words[k];
                                        var sText = oWord.text + (k < oCurLine.words.length - 1 ? ' ' : '');
                                        sText = escapeHtml(sText);
                                        sScript += '\noRun = oParagraph.AddText(\'' + sText + '\');\n';
                                        sScript += '\noTextPr = oRun.GetTextPr();\n';
                                        sScript += '\noTextPr.SetColor(0, 0, 0, false);\n';
                                        // var arrFontName = oWord.font_name.split('_');
                                        var sFontName = oWord.font_name;
                                        if(sFontName.length > 0) {
                                            sScript += '\noTextPr.SetFontFamily(\'' + sFontName + '\');\n';
                                        }
                                        if(oWord.is_bold){
                                            sScript += '\noTextPr.SetBold(true);\n';
                                        }
                                        else {
                                            sScript += '\noTextPr.SetBold(false);\n';
                                        }
                                        if(oWord.is_italic){
                                            sScript += '\noTextPr.SetItalic(true);\n';
                                        }
                                        else {
                                            sScript += '\noTextPr.SetItalic(false);\n';
                                        }

                                        if(oWord.is_underlined){
                                            sScript += '\noTextPr.SetUnderline(true);\n';
                                        }
                                        else {
                                            sScript += '\noTextPr.SetUnderline(false);\n';
                                        }
                                        if(oWord.is_smallcaps){
                                            sScript += '\noTextPr.SetSmallCaps(true);\n';
                                        }
                                        else {
                                            sScript += '\noTextPr.SetSmallCaps(false);\n';
                                        }
                                        sScript += '\noTextPr.SetFontSize(' + ((oWord.font_size * 2)) + ');\n';
                                    }
                                }
                            }

                        }
                    }
                }
                else {
                    for(var nColumnIndex = 0; nColumnIndex < oCurSection.columns.length; ++ nColumnIndex) {
                        var oColumn = oCurSection.columns[nColumnIndex];
                        sScript += '\nvar oParagraph, oRun, oFirstSectionPar, oTextPr;\n';
                        var oLastParagraph = null;
                        for(var z = 0; z < oColumn.blocks.length; ++z) {
                            var oBlock = oColumn.blocks[z];
                            if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_TEXT) {

                                for(var j = 0;  j < oBlock.paragraphs.length; ++j){
                                    var oCurParagraph = oBlock.paragraphs[j];
                                    if(j === oBlock.paragraphs.length - 1
                                        && z === oColumn.blocks.length - 1
                                        && nColumnIndex === oCurSection.columns.length - 1) {

                                        sScript += '\noParagraph = Api.CreateParagraph();\n';
                                        sScript += "oDocument.Push(oParagraph);";

                                        sScript += "var oSection1 = oDocument.CreateSection(oParagraph);";
                                        sScript += "oSection1.SetPageSize("+oPage.convertPixToTwips(oPage.getWidth()) +", "+oPage.convertPixToTwips(oPage.getHeight()) +");";
                                        sScript += "oSection1.SetPageMargins("+oPage.convertPixToTwips(oPage.marginL) +", "+oPage.convertPixToTwips(oPage.marginT) +", "+oPage.convertPixToTwips(oPage.marginR) +", "+oPage.convertPixToTwips(oPage.marginB) +");";
                                        if(nSectionIndex === aSections.length - 1) {
                                            sScript += "oSection1.SetType(\"nextPage\");";
                                        }
                                        else {
                                            sScript += "oSection1.SetType(\"continuous\");";
                                        }
                                        if(oCurSection.columns.length > 1) {
                                            sScript += "var aWidths = [], aSpaces = [];";
                                            for(var nColumnIndex2 = 0; nColumnIndex2 < oCurSection.columns.length; ++nColumnIndex2) {
                                                var oCurColumn = oCurSection.columns[nColumnIndex2];
                                                var nColumnWidth = oPage.convertPixToTwips(oCurColumn.maxX - oCurColumn.minX);
                                                sScript += "aWidths.push(" + nColumnWidth + ");";
                                                if(nColumnIndex2 < oCurSection.columns.length - 1) {
                                                    var nSpaceAfterColumn = oPage.convertPixToTwips(oCurSection.columns[nColumnIndex2 + 1].minX - oCurColumn.maxX);
                                                    sScript += "aSpaces.push(" + nSpaceAfterColumn + ");";
                                                }
                                            }
                                            sScript += "oSection1.SetNotEqualColumns(aWidths, aSpaces);";
                                        }
                                    }
                                    else {
                                        sScript += '\noParagraph = Api.CreateParagraph();\n';
                                        sScript += "oDocument.Push(oParagraph);";
                                    }
                                    if(j === 0 && z === 0 && nColumnIndex === 0) {
                                        sScript += "oFirstSectionPar = oParagraph;";
                                    }
                                    sScript += '\noParagraph.SetJc("left");\n';
                                    var oFirstLine = oCurParagraph.lines[0];
                                    sScript += "oParagraph.SetSpacingAfter(0, false);";
                                    if(oFirstLine) {
                                        sScript += "oParagraph.SetIndFirstLine(" + oPage.convertPixToTwips(oFirstLine.bbox.x0 - oBlock.bbox.x0) + ");";


                                        if(oLastParagraph) {
                                            var oLastLine = oLastParagraph.lines[oLastParagraph.lines.length - 1];
                                            if(oLastLine) {
                                                sScript += "oParagraph.SetSpacingBefore(" + oPage.convertPixToTwips(oFirstLine.bbox.y0 - oLastLine.bbox.y1) + ", false);";

                                            }
                                        }
                                    }
                                    if(oCurParagraph.lines.length > 1) {
                                        var nSpacing = ((1.0 + (oCurParagraph.lines[1].bbox.y0 - oCurParagraph.lines[0].bbox.y1) / (oCurParagraph.lines[1].bbox.y1 - oCurParagraph.lines[1].bbox.y0)) * 240) >> 0;
                                        sScript += "oParagraph.SetSpacingLine(" + nSpacing + ", \"auto\");"
                                    }
                                    oLastParagraph = oCurParagraph;
                                    for(var t = 0; t < oCurParagraph.lines.length; ++t){
                                        var oCurLine = oCurParagraph.lines[t];
                                        for(var k = 0; k < oCurLine.words.length; ++k){
                                            var oWord = oCurLine.words[k];
                                            var sText = oWord.text + (k < oCurLine.words.length - 1 ? ' ' : '');
                                            sText = escapeHtml(sText);
                                            sScript += '\noRun = oParagraph.AddText(\'' + sText + '\');\n';
                                            sScript += '\noTextPr = oRun.GetTextPr();\n';
                                            sScript += '\noTextPr.SetColor(0, 0, 0, false);\n';
                                            // var arrFontName = oWord.font_name.split('_');
                                            var sFontName = oWord.font_name;
                                            if(sFontName.length > 0) {
                                                sScript += '\noTextPr.SetFontFamily(\'' + sFontName + '\');\n';
                                            }
                                            if(oWord.is_bold){
                                                sScript += '\noTextPr.SetBold(true);\n';
                                            }
                                            else {
                                                sScript += '\noTextPr.SetBold(false);\n';
                                            }
                                            if(oWord.is_italic){
                                                sScript += '\noTextPr.SetItalic(true);\n';
                                            }
                                            else {
                                                sScript += '\noTextPr.SetItalic(false);\n';
                                            }

                                            if(oWord.is_underlined){
                                                sScript += '\noTextPr.SetUnderline(true);\n';
                                            }
                                            else {
                                                sScript += '\noTextPr.SetUnderline(false);\n';
                                            }
                                            if(oWord.is_smallcaps){
                                                sScript += '\noTextPr.SetSmallCaps(true);\n';
                                            }
                                            else {
                                                sScript += '\noTextPr.SetSmallCaps(false);\n';
                                            }
                                            sScript += '\noTextPr.SetFontSize(' + ((oWord.font_size * 2)) + ');\n';
                                        }
                                    }
                                }

                            }
                        }
                    }
                }
                for(var z = 0; z < oCurSection.images.length; ++z) {
                    var oBlock = oCurSection.images[z];
                    if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_IMAGE) {
                        var nWidth = oPage.convertPixToEMU(oBlock.bbox.x1 - oBlock.bbox.x0);
                        var nHeight = oPage.convertPixToEMU(oBlock.bbox.y1 - oBlock.bbox.y0);
                        var sImage = oPage.getImageData(oBlock.bbox.x0, oBlock.bbox.y0, oBlock.bbox.x1 - oBlock.bbox.x0, oBlock.bbox.y1 - oBlock.bbox.y0);
                        sScript += "var oImage = Api.CreateImage(\"" + sImage+"\", "+nWidth +", "+nHeight +");";
                        sScript += "oImage.SetWrappingStyle(\"square\");";
                        sScript += "oImage.SetDistances(0, 0, 0, 0);";
                        sScript += "oImage.SetHorPosition(\"page\", "+oPage.convertPixToEMU(oBlock.bbox.x0)+");";
                        sScript += "oImage.SetVerPosition(\"page\", "+oPage.convertPixToEMU(oBlock.bbox.y0)+");";
                        sScript += "oFirstSectionPar.AddDrawing(oImage);";
                    }
                }
            }
            window.Asc.plugin.info.recalculate = true;
            this.executeCommand("close", sScript);
        }
        else{
            this.executeCommand("close", "");
        }
    };


	window.Asc.plugin.onTranslate = function(){
		var elem = document.getElementById("label1");
		if (elem){
			elem.innerHTML = window.Asc.plugin.tr("Tesseract.js lets recognize text in pictures (png, jpg)");
		}
		elem = document.getElementById("load-file-button-id");
		if (elem){
			elem.innerHTML = window.Asc.plugin.tr("Load File");
		}
		elem = document.getElementById("label2");
		if (elem){
			elem.innerHTML = window.Asc.plugin.tr("Choose language");
		}
		elem = document.getElementById("recognize-button");
		if (elem){
			elem.innerHTML = window.Asc.plugin.tr("Recognize");
		}
		elem = document.getElementById("lang-select");
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
