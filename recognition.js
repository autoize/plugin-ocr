"use strict";
(function() {
    var IMAGE_STATUS_LOADING = 0;
    var IMAGE_STATUS_COMPLETE = 1;
    var IMAGE_STATUS_ERROR = 2;

    window.AREA_TYPE_TEXT = 0;
    window.AREA_TYPE_IMAGE = 1;
    window.AREA_TYPE_TABLE = 2;
    window.AREA_TYPE_BACKGROUND = 3;

    var MAP_COLORS = {};
    MAP_COLORS[window.AREA_TYPE_TEXT] = "#008000";
    MAP_COLORS[window.AREA_TYPE_IMAGE] = "#800000";
    MAP_COLORS[window.AREA_TYPE_TABLE] = "#000080";
    MAP_COLORS[window.AREA_TYPE_BACKGROUND] = "#CCCCCC";

    var MAP_TESSERACT_AREAS = {};
    MAP_TESSERACT_AREAS["UNKNOWN"] = AREA_TYPE_BACKGROUND;
    MAP_TESSERACT_AREAS["FLOWING_TEXT"] = AREA_TYPE_TEXT;
    MAP_TESSERACT_AREAS["HEADING_TEXT"] = AREA_TYPE_TEXT;
    MAP_TESSERACT_AREAS["PULLOUT_TEXT"] = AREA_TYPE_TEXT;
    MAP_TESSERACT_AREAS["EQUATION"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["INLINE_EQUATION"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["TABLE"] = AREA_TYPE_TEXT;//AREA_TYPE_TABLE;
    MAP_TESSERACT_AREAS["VERTICAL_TEXT"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["CAPTION_TEXT"] = AREA_TYPE_TEXT;
    MAP_TESSERACT_AREAS["FLOWING_IMAGE"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["HEADING_IMAGE"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["PULLOUT_IMAGE"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["HORZ_LINE"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["VERT_LINE"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["NOISE"] = AREA_TYPE_IMAGE;
    MAP_TESSERACT_AREAS["COUNT"] = AREA_TYPE_IMAGE;
    window.MAP_TESSERACT_AREAS = MAP_TESSERACT_AREAS;

    var sBaseScript =
        "function CreateRun(oParagraph, oRunInfo) {" +
        "   var oRun = oParagraph.AddText(oRunInfo.text);" +
        "   var oTextPr = oRun.GetTextPr();" +
        "   oTextPr.SetColor(oRunInfo.r, oRunInfo.g, oRunInfo.b, false);" +
        "   if(oRunInfo.fontName.length > 0) {" +
        "       oTextPr.SetFontFamily(oRunInfo.fontName);" +
        "   }" +
        "   oTextPr.SetFontSize(oRunInfo.fontSize);" +
        "   oTextPr.SetBold(oRunInfo.bold);" +
        "   oTextPr.SetItalic(oRunInfo.italic);" +
        "   oTextPr.SetUnderline(oRunInfo.underline);" +
        "   oTextPr.SetSmallCaps(oRunInfo.smallcaps);" +
        "}" +
        "function escapeHtml(string) {" +
        "   var res = string;" +
        "   res = res.replace(/[\', \",\\\\]/g, function (sSymbol) {" +
        "       return sSymbol;" +
        "       return \'\\\\\' + sSymbol;" +
        "   });" +
        "   return res;" +
        "}" +
        "function FillParagraph(oParagraph, oDataParagraph, oPreviousDataParagraph, oBlock, oColumn, oUC) {" +
        "       var nLineIndex, nDelta = 10, nColumnLeft, nColumnRight, nColumnCenter, nLineLeft, nLineRight, nLineCenter, oLine;" +
        "       var nParagraphLeft, nParagraphRight, nParagraphCenter;" +
        "       var nBlockLeft, nBlockRight, nBlockCenter;" +
        "       var oFL = oDataParagraph.lines[0];" +
        "       if(!oFL) {" +
        "           return;" +
        "       }" +
        "       var sAlign = \"left\", nFirstLine = 0, nLeftInd = 0, nRightInd = 0;" +
        "       nColumnLeft = oBlock.bbox.x0;" +
        "       nColumnRight = oBlock.bbox.x1;" +
        "       nBlockLeft = oBlock.bbox.x0;" +
        "       nBlockRight = oBlock.bbox.x1;" +
        "       nBlockCenter = (nBlockLeft + nBlockRight)/2;" +
        "       if(oColumn){" +
        "           nColumnLeft = oColumn.minX;" +
        "           nColumnRight = oColumn.maxX;" +
        "       }" +
        "       nColumnCenter = (nColumnRight + nColumnLeft) / 2;" +
        "       nParagraphLeft = oDataParagraph.bbox.x0;" +
        "       nParagraphRight = oDataParagraph.bbox.x1;" +
        "       nParagraphCenter = (nParagraphRight + nParagraphLeft) / 2;" +
        "       if(oDataParagraph.lines.length === 1) {" +
        "           oLine = oFL;" +
        "           nLineCenter = (oLine.bbox.x1 + oLine.bbox.x0) / 2;" +
        "           nLineRight = oLine.bbox.x1;" +
        "           nLineLeft = oLine.bbox.x0;" +
        "           if(Math.abs(nLineCenter - nBlockCenter) < nDelta) {" +
        "               sAlign = \"center\";" +
        "           }" +
        "           else if(nBlockRight - nLineRight < nDelta && (nLineLeft - nBlockLeft) > (nBlockRight - nLineRight)){" +
        "                sAlign = \"right\";" +
        "                nRightInd = nColumnRight - nLineRight;" +
        "           }" +
        "           else {" +
        "               sAlign = \"left\";" +
        "               nFirstLine = nLineLeft - nParagraphLeft;" +
        "           }" +
        "       }" +
        "       else if(oDataParagraph.lines.length === 2) {" +
        "           oLine = oFL;" +
        "           nLineCenter = (oLine.bbox.x1 + oLine.bbox.x0) / 2;" +
        "           nLineRight = oLine.bbox.x1;" +
        "           nLineLeft = oLine.bbox.x0;" +
        "           if(Math.abs(nLineCenter - nParagraphCenter) < nDelta) {" +
        "               oLine = oDataParagraph.lines[1];" +
        "               nLineCenter = (oLine.bbox.x1 + oLine.bbox.x0) / 2;" +
        "               nLineRight = oLine.bbox.x1;" +
        "               nLineLeft = oLine.bbox.x0;" +
        "               if(Math.abs(nLineCenter - nParagraphCenter) < nDelta && (nLineLeft - nParagraphLeft) > nDelta) {" +
        "                   sAlign = \"center\";" +
        "               }" +
        "               else if(nParagraphRight - nLineRight < nDelta && (nLineLeft - nParagraphLeft) > (nParagraphRight - nLineRight)) {" +
        "                    sAlign = \"right\";" +
        "                    nRightInd = nColumnRight - nLineRight;" +
        "               }" +
        "               else {" +
        "                   sAlign = \"left\";" +
        "                   nLeftInd = nLineLeft - nColumnLeft;" +
        "                   nFirstLine = oFL.bbox.x0 - nColumnLeft - nLeftInd;" +
        "               }" +
        "           }" +
        "       }" +
        "       else {" +
        "           var nL = 0, nC = 0, nR = 0, oLLine = oDataParagraph.lines[1], oCLine = oDataParagraph.lines[1], oRLine = oDataParagraph.lines[1];" +
        "           for(nLineIndex = 1; nLineIndex < oDataParagraph.lines.length; ++nLineIndex) {" +
        "               oLine = oDataParagraph.lines[nLineIndex];" +
        "               nLineCenter = (oLine.bbox.x1 + oLine.bbox.x0) / 2;" +
        "               nLineRight = oLine.bbox.x1;" +
        "               nLineLeft = oLine.bbox.x0;" +
        "               if(Math.abs(nLineCenter - nParagraphCenter) < nDelta) {" +
        "                   oCLine = oLine;" +
        "                   ++nC;" +
        "               }" +
        "               if(nParagraphRight - nLineRight < nDelta){" +
        "                   oRLine = oLine;" +
        "                    ++nR;" +
        "               }" +
        "               if((nLineLeft - nParagraphLeft) < nDelta) {" +
        "                   oLLine = oLine;" +
        "                   ++nL;" +
        "               }" +
        "           }" +
        "           var nMax = Math.max(nL, nC, nR);" +
        "           if(nMax === nL) {" +
        "              sAlign = \"left\";" +
        "              nLeftInd = oLLine.bbox.x0 - nColumnLeft;" +
        "              nFirstLine = oFL.bbox.x0 - nColumnLeft - nLeftInd;" +
        "           }" +
        "           else if(nMax === nC) {" +
        "                sAlign = \"center\";" +
        "           }" +
        "           else {" +
        "               sAlign = \"right\";" +
        "               nRightInd = nColumnRight - oRLine.bbox.x1;" +
        "           }" +
        "       }" +
        "       oParagraph.SetJc(sAlign);" +
        "       oParagraph.SetSpacingAfter(0, false);" +
        "       oParagraph.SetIndLeft(oUC.convertPixToTwips(nLeftInd));" +
        "       oParagraph.SetIndRight(oUC.convertPixToTwips(nRightInd));" +
        "       oParagraph.SetIndFirstLine(oUC.convertPixToTwips(nFirstLine));" +
        "       if(oDataParagraph.lines.length > 1) {" +
        "           var nSpacing = ((1.0 + (oDataParagraph.lines[1].bbox.y0 - oFL.bbox.y1) / (oDataParagraph.lines[1].bbox.y1 - oDataParagraph.lines[1].bbox.y0)) * 240 + 0.5) >> 0;" +
        "           oParagraph.SetSpacingLine(nSpacing, \"auto\");" +
        "           oParagraph.SetSpacingLine((1.15 * 240 +0.5 )>> 0, \"auto\");" +
        "       }" +
        "       var sText = \"\", oPrevWord;" +
        "       function fCompareRPr(oWord, oPrev) {" +
        "           return oWord.font_size === oPrev.font_size " +
        "                  && oWord.is_bold === oPrev.is_bold " +
        "                   && oWord.is_italic === oPrev.is_italic" +
        "                   && oWord.underline === oPrev.underline " +
        "                   && oWord.is_smallcaps === oPrev.is_smallcaps; " +
        "       }" +
        "       for(nLineIndex = 0; nLineIndex < oDataParagraph.lines.length; ++nLineIndex) {" +
        "           oLine = oDataParagraph.lines[nLineIndex];" +
        "           for(var nWordIndex = 0; nWordIndex < oLine.words.length; ++nWordIndex) {" +
        "               var oWord = oLine.words[nWordIndex];" +
        "               var bAddSpace = (nWordIndex !== oLine.words.length - 1 || nLineIndex !== oDataParagraph.lines.length - 1);" +
        "               var sText2 = escapeHtml(oWord.text);" +
        "               if(bAddSpace) {" +
        "                   sText2 += \" \";" +
        "               }" +
        "               if(!oPrevWord) {" +
        "                   sText = sText2;" +
        "               }" +
        "               else{" +
        "                   if(fCompareRPr(oWord, oPrevWord)) {" +
        "                       sText += sText2;" +
        "                   }" +
        "                   else {" +
        "                       var sFontName = \"\";" +//TODO: FontName
        "                       var nFontSize = oPrevWord.font_size * 2;" +
        "                       var oRunInfo = {" +
        "                           text: sText," +
        "                           r: 0," +
        "                           g: 0," +
        "                           b: 0," +
        "                           fontName: sFontName," +
        "                           fontSize: nFontSize," +
        "                           bold: oPrevWord.is_bold," +
        "                           italic: oPrevWord.is_italic," +
        "                           underline: oPrevWord.is_underlined," +
        "                           smallcaps: oPrevWord.is_smallcaps" +
        "                       };" +
        "                       CreateRun(oParagraph, oRunInfo);" +
        "                       sText = sText2;" +
        "                   }" +
        "               }" +
        "               oPrevWord = oWord;" +
        "           }" +
        "       }" +
        "       var sFontName = \"\";" +//TODO: FontName
        "       var nFontSize = oPrevWord.font_size * 2;" +
        "       var oRunInfo = {" +
        "           text: sText," +
        "           r: 0," +
        "           g: 0," +
        "           b: 0," +
        "           fontName: sFontName," +
        "           fontSize: nFontSize," +
        "           bold: oPrevWord.is_bold," +
        "           italic: oPrevWord.is_italic," +
        "           underline: oPrevWord.is_underlined," +
        "           smallcaps: oPrevWord.is_smallcaps" +
        "       };" +
        "       CreateRun(oParagraph, oRunInfo);" +
        "}" +
        "function FillSection(oSection, oPrevSection) {" +
        "   var oUC = {" +
        "       convertPixToMM: function(nPix) {" +
        "           return nPix / oSection.dpi * 25.4;" +
        "       }," +
        "       convertPixToTwips: function(nPix) {" +
        "           return (nPix / oSection.dpi  * 1440 + 0.5) >> 0;" +
        "       }," +
        "       convertPixToEMU: function(nPix) {" +
        "           return (nPix / oSection.dpi  * 914400 + 0.5) >> 0;" +
        "       }" +
        "   };" +
        "   var oDocument = Api.GetDocument();" +
        "   var oDocSection, oParagraph, oBlock, oDataParagraph, oPreviousDataParagraph, nWidth, nHeight, sImageUrl, oImage, nImageIndex, oFirstParagraph;" +
        "   if(oSection.columns.length > 0) {" +
        "       var aWidths = [], aSpaces = [], oColumn, nColumnWidth, nSpaceAfter, nParagraphIndex;" +
        "       for(var nColumnIndex = 0; nColumnIndex < oSection.columns.length; ++nColumnIndex) {" +
        "           if(oColumn) {" +
        "               nSpaceAfter = oSection.columns[nColumnIndex].minX - oColumn.maxX;" +
        "               aSpaces.push(nSpaceAfter);" +
        "           }" +
        "           oColumn = oSection.columns[nColumnIndex];" +
        "           nColumnWidth = oUC.convertPixToTwips(oColumn.maxX - oColumn.minX);" +
        "           aWidths.push(nColumnWidth);" +
        "           oPreviousDataParagraph = null;" +
        "           for(var nBlockIndex = 0; nBlockIndex < oColumn.blocks.length; ++nBlockIndex) {" +
        "               oBlock = oColumn.blocks[nBlockIndex];" +
        "               for(nParagraphIndex = 0; nParagraphIndex < oBlock.paragraphs.length; ++nParagraphIndex) {" +
        "                   oDataParagraph = oBlock.paragraphs[nParagraphIndex];" +
        "                   oParagraph = Api.CreateParagraph();" +
        "                   oDocument.Push(oParagraph);" +
        "                   FillParagraph(oParagraph, oDataParagraph, oPreviousDataParagraph, oBlock, oColumn, oUC);" +
        "                   if(nColumnIndex === 0 && nParagraphIndex === 0 && nBlockIndex === 0){" +
        "                       oFirstParagraph = oParagraph;" +
        "                   }" +
        "                   if(nBlockIndex === 0 && nParagraphIndex === 0) {" +
        "                       if(oPrevSection){" +
        "                           var nParDelta = oDataParagraph.bbox.y0 - oSection.minY;" +
        "                           oParagraph.SetSpacingBefore(Math.max(oUC.convertPixToTwips(oDataParagraph.bbox.y0 - oPrevSection.maxY - nParDelta), 0), false);" +
        "                       }" +
        "                   }" +
        "                   else {" +
        "                       if(oPreviousDataParagraph) {" +
        "                           oParagraph.SetSpacingBefore(oUC.convertPixToTwips(oDataParagraph.bbox.y0 - oPreviousDataParagraph.bbox.y1), false);" +
        "                       }" +
        "                   }" +
        "                   oPreviousDataParagraph = oDataParagraph;" +
        "               }" +
        "           }" +
        "       }" +
        "       if(oParagraph) {" +
        "           oDocSection = oDocument.CreateSection(oParagraph);" +
        "           oDocSection.SetType(oSection.type);" +
        "           oDocSection.SetPageSize(oUC.convertPixToTwips(oSection.pageWidth), oUC.convertPixToTwips(oSection.pageHeight));" +
        "           oDocSection.SetPageMargins(oUC.convertPixToTwips(oSection.marginL), oUC.convertPixToTwips(oSection.marginT), oUC.convertPixToTwips(oSection.marginR), oUC.convertPixToTwips(oSection.marginB));" +
        "           if(aWidths.length > 1) {" +
        "               oDocSection.SetNotEqualColumns(aWidths, aSpaces);" +
        "           }"+
        "       }" +
        "       if(oFirstParagraph) {" +
        "           for(nImageIndex = 0; nImageIndex < oSection.images.length; ++nImageIndex) {" +
        "               oBlock = oSection.images[nImageIndex];" +
        "               nWidth = oUC.convertPixToEMU(oBlock.bbox.x1 - oBlock.bbox.x0);" +
        "               nHeight = oUC.convertPixToEMU(oBlock.bbox.y1 - oBlock.bbox.y0);" +
        "               sImageUrl = oBlock.imageData;" +
        "               oImage = Api.CreateImage(sImageUrl, nWidth , nHeight);" +
        "               oImage.SetWrappingStyle(\"square\");" +
        "               oImage.SetDistances(0, 0, 0, 0);" +
        "               oImage.SetHorPosition(\"page\", oUC.convertPixToEMU(oBlock.bbox.x0));" +
        "               oImage.SetVerPosition(\"page\", oUC.convertPixToEMU(oBlock.bbox.y0));" +
        "               oFirstParagraph.AddDrawing(oImage);" +
        "           }" +
        "       }" +
        "   }" +
        "   else {" +
        "       oFirstParagraph = Api.CreateParagraph();" +
        "       oDocument.Push(oFirstParagraph);" +
        "       oDocSection = oDocument.CreateSection(oFirstParagraph);" +
        "       oDocSection.SetType(oSection.type);" +
        "       oDocSection.SetPageSize(oUC.convertPixToTwips(oSection.pageWidth), oUC.convertPixToTwips(oSection.pageHeight));" +
        "       oDocSection.SetPageMargins(oUC.convertPixToTwips(oSection.marginL), oUC.convertPixToTwips(oSection.marginT), oUC.convertPixToTwips(oSection.marginR), oUC.convertPixToTwips(oSection.marginB));" +
        "       for(nImageIndex = 0; nImageIndex < oSection.images.length; ++nImageIndex) {" +
        "           oBlock = oSection.images[nImageIndex];" +
        "           nWidth = oUC.convertPixToEMU(oBlock.bbox.x1 - oBlock.bbox.x0);" +
        "           nHeight = oUC.convertPixToEMU(oBlock.bbox.y1 - oBlock.bbox.y0);" +
        "           sImageUrl = oBlock.imageData;" +
        "           oImage = Api.CreateImage(sImageUrl, nWidth , nHeight);" +
        "           oImage.SetWrappingStyle(\"topAndBottom\");" +
        "           oImage.SetDistances(0, 0, 0, 0);" +
        "           oImage.SetHorPosition(\"page\", oUC.convertPixToEMU(oBlock.bbox.x0));" +
        "           oImage.SetVerPosition(\"page\", oUC.convertPixToEMU(oBlock.bbox.y0));" +
        "           oFirstParagraph.AddDrawing(oImage);" +
        "       }" +
        "       for(var nTextBlockIndex = 0; nTextBlockIndex < oSection.textBoxes.length; ++nTextBlockIndex) {" +
        "           oBlock = oSection.textBoxes[nTextBlockIndex];" +
        "           var oFill = Api.CreateNoFill();" +
        "           var oStroke = Api.CreateStroke(0, Api.CreateNoFill());" +
        "           var oShape = Api.CreateShape(\"rect\", nWidth, nHeight, oFill, oStroke);" +
        "           oShape.SetWrappingStyle(\"topAndBottom\");" +
        "           oShape.SetPaddings(0, 0, 0, 0);" +
        "           oShape.SetDistances(0, 0, 0, 0);" +
        "           oShape.SetHorPosition(\"page\", oUC.convertPixToEMU(oBlock.bbox.x0));" +
        "           oShape.SetVerPosition(\"page\", oUC.convertPixToEMU(oBlock.bbox.y0));" +
        "           oShape.SetVerticalTextAlign(\"top\");" +
        "           oFirstParagraph.AddDrawing(oImage);" +
        "           var oDocContent = oShape.GetDocContent();" +
        "           oDocContent.RemoveAllElements();" +
        "           oPreviousDataParagraph = null;" +
        "           for(nParagraphIndex = 0; nParagraphIndex < oBlock.paragraphs.length; ++nParagraphIndex) {" +
        "               oDataParagraph = oBlock.paragraphs[nParagraphIndex];" +
        "               if(nParagraphIndex === 0) {" +
        "                   oParagraph = oDocContent.GetElement(0);" +
        "               }" +
        "               else {" +
        "                   oParagraph = Api.CreateParagraph();" +
        "                   oDocContent.Push(oParagraph);" +
        "               }" +
        "               FillParagraph(oParagraph, oDataParagraph, oPreviousDataParagraph, oBlock, null, oUC);" +
        "               oPreviousDataParagraph = oDataParagraph;" +
        "           }" +
        "       }" +
        "   }" +
        "}" +
        "function HandleSections(aSections){" +
        "   var oDocument = Api.GetDocument();" +
        "   var oLastElement = oDocument.Last();" +
        "   var oLastParagraph;" +
        "   if(oLastElement.GetClassType() === \"paragraph\") {" +
        "       oLastParagraph = oLastElement;" +
        "   }" +
        "   else {" +
        "       oLastParagraph = Api.CreateParagraph();" +
        "       oDocument.Push(oLastParagraph);" +
        "   }" +
        "   var oSection = oDocument.CreateSection(oLastParagraph);" +
        "   oSection.SetType(\"nextPage\");" +
        "   var oPrevSection;" +
        "   for(var nSectionIndex = 0; nSectionIndex < aSections.length; ++nSectionIndex) {" +
        "       var oSection = aSections[nSectionIndex];" +
        "       FillSection(oSection, oPrevSection);" +
        "       oPrevSection = oSection;" +
        "   }" +
        "}";
    window.sBaseScript = sBaseScript;
    function CRecognition() {
        this.drawing = null;
        this.pages = [];

        this.selectedObjects = [];
        this.tracks = [];
        this.state = new NullState(this);

        this.history = [];
        this.curPoint = -1;
    }
    CRecognition.prototype.addPageFromFile = function(oFile) {
        this.pages.push(new CPage(oFile, this));
    };
    CRecognition.prototype.setDrawing = function(oDrawing) {
        this.drawing = oDrawing;
    };
    CRecognition.prototype.getPage = function(nIndex) {
        if(nIndex > -1 && nIndex < this.pages.length) {
            return this.pages[nIndex];
        }
        return null;
    };
    CRecognition.prototype.getPageIndex = function(oPage) {
        for(var i = 0; i < this.pages.length; ++i) {
            if(this.pages[i] === oPage) {
                return i;
            }
        }
        return -1;
    };
    CRecognition.prototype.createBBoxDiv = function(oBBox) {

    };
    CRecognition.prototype.isText = function(oBlock) {
        if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_TEXT) {
            return true;
        }
    };
    CRecognition.prototype.isImage = function(oBlock) {
        if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_IMAGE) {
            return true;
        }
    };
    CRecognition.prototype.isRecognizedBlock = function(oBlock) {
        if(oBlock.bRecognized === false && !this.isImage(oBlock)) {
            return false;
        }
        return  true;
    };
    CRecognition.prototype.updateReviewDiv = function(oPage) {
        $("#text-container-div").empty();
        if(!oPage.data || !oPage.data.hocr) {
            return;
        }
        $("#text-container-div").css("overflow", "hidden");
        var oParentDiv = $("<div><div/>");
        oParentDiv.empty();
        oParentDiv.addClass("float-block");
        var fAspectW = $("#text-container-div").width() / oPage.getWidth();
        var fAspectH = $("#text-container-div").height() / oPage.getHeight();
        var nWidth, nHeight;
        if(fAspectW < fAspectH) {
            nWidth = $("#text-container-div").width();
            nHeight =(oPage.getHeight() * fAspectW + 0.5 >> 0);

        }
        else {
            nWidth = (oPage.getWidth() * fAspectH + 0.5 >> 0);
            nHeight =  $("#text-container-div").height();
        }
        var fScale = Math.min(fAspectW, fAspectH);
        oParentDiv.css("width", nWidth+ "px");
        oParentDiv.css("height", nHeight + "px");
        oParentDiv.css("margin-left", (($("#text-container-div").width() - nWidth) / 2  +0.5 >> 0)+ "px");
        oParentDiv.css("margin-top", (($("#text-container-div").height() - nHeight) / 2  +0.5 >> 0)+ "px");
        var aBlocks = oPage.data.blocks;
        var oDiv, oHtmlPar, oBlock, bb, oParagraph, i, j, k, t, oSpan, oLine, sText, oWord;
        for(i = 0; i < aBlocks.length; ++i) {
            oBlock = aBlocks[i];
            bb = oBlock.bbox;
            oDiv = null;
            if(!this.isRecognizedBlock(oBlock)) {
                continue;
            }
            if(this.isText(oBlock)) {
                oDiv = $("<div><div/>");
                oDiv.empty();
                $(oParentDiv).append(oDiv);
                for(j = 0;  j < oBlock.paragraphs.length; ++j) {
                    oParagraph = oBlock.paragraphs[j];
                    oHtmlPar = $("<p></p>");
                    oHtmlPar.css("margin", "0px");
                    var oFirstLine = oParagraph.lines[0];
                    if(oFirstLine) {
                        oHtmlPar.css("text-indent", ((oFirstLine.bbox.x0 - bb.x0) * fScale + 0.5 >> 0) + "px");
                    }
                    oDiv.append(oHtmlPar);
                    var nHeightsS = 0;
                    var minH =10000;
                    for(k = 0; k < oParagraph.lines.length; ++k) {
                        oLine = oParagraph.lines[k];
                        for(t = 0; t < oLine.words.length; ++t) {
                            oWord = oLine.words[t];
                            oSpan = $("<span></span>");
                            oHtmlPar.append(oSpan);
                            $(oSpan).css("fontSize", (oWord.font_size * 2 * fScale + 0.5 >> 0) + "pt");
                            sText = oWord.text;
                            if(k !== oParagraph.lines.length - 1 || t !== oLine.words.length - 1) {
                                sText += " ";
                            }
                            $(oSpan).text(sText);
                        }
                        minH = Math.min(minH, ((oLine.bbox.y1 - oLine.bbox.y0)*fScale));
                        nHeightsS += ((oLine.bbox.y1 - oLine.bbox.y0)*fScale);
                    }
                    var nLH = (nHeightsS / oParagraph.lines.length + .5 >> 0);
                   oHtmlPar.css("line-height", nLH + "px");
                    var nPH = oParagraph.bbox.y1 - oParagraph.bbox.y0;
                    nPH *= fScale;
                    // while (oHtmlPar.height() > nPH && nLH > 1) {
                    //     --nLH;
                    //     oHtmlPar.css("line-height", nLH + "px");
                    // }
                }
                oDiv.fitText(.8);
            }
            else if(this.isImage(oBlock)){
                oDiv = document.createElement("canvas");
                oDiv.width = (bb.x1 - bb.x0)*this.drawing.screenScale;
                oDiv.height = (bb.y1 - bb.y0)*this.drawing.screenScale;
                oDiv.cliendWidth = (bb.x1 - bb.x0);
                oDiv.cliendHeight = (bb.y1 - bb.y0);
                oPage.drawToCanvas(oDiv, bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0);
                $(oParentDiv).append($(oDiv));
                oDiv = $(oDiv);
            }
            if(oDiv) {
                oDiv.addClass("float-block");

                var left = bb.x0 * nWidth / oPage.getWidth() + 0.5 >> 0;
                var top = bb.y0 * nHeight / oPage.getHeight() + 0.5  >> 0;
                var width = (bb.x1 - bb.x0) * nWidth / oPage.getWidth() + 0.5 >> 0;
                var height = (bb.y1 - bb.y0) * nHeight / oPage.getHeight() + 0.5 >> 0;
                oDiv.css("margin-left", left + "px");
                oDiv.css("margin-top", top + "px");
                oDiv.css("width", width + "px");
                oDiv.css("height", height + "px");
            }
        }
        $("#text-container-div").append(oParentDiv);
        panzoom(oParentDiv[0], {  beforeMouseDown: function(e) {
                var shouldIgnore = !e.altKey;
                return shouldIgnore;
            }})
    };
    CRecognition.prototype.onPageUpdate = function(oPage) {
        this.updateReviewDiv(oPage);
        this.drawing.onPageUpdate(oPage);
    };
    CRecognition.prototype.drawPage = function(nIndex, oCtx) {
        var oPage = this.getPage(nIndex);
        if(oPage) {
            oPage.draw(oCtx);
        }
    };
    CRecognition.prototype.drawPageBlockRects = function(nIndex, oCtx) {
        var oPage = this.getPage(nIndex);
        if(oPage) {
            oPage.drawBlockRects(this.drawing, oCtx);
        }
    };
    CRecognition.prototype.updateOverlay = function(oOverlay, oCtx) {
        for(var i = 0; i < this.selectedObjects.length; ++i) {
            var oBlock = this.selectedObjects[i];
            var oBBox = oBlock.bbox;
            var sColor = "#CCCCCC";
            if(MAP_COLORS[MAP_TESSERACT_AREAS[oBlock.blocktype]]) {
                sColor = MAP_COLORS[MAP_TESSERACT_AREAS[oBlock.blocktype]];
            }
            oOverlay.drawTrack(oCtx, oBBox.x0, oBBox.y0, oBBox.x1, oBBox.y1, sColor);
        }
        for(i = 0; i < this.tracks.length; ++i){
            this.tracks[i].draw(oOverlay, oCtx);
        }

    };
    CRecognition.prototype.dataProcess = function () {
        var aSections = [], oSection, nPageIndex, nSectionIndex;
        for(nPageIndex = 0; nPageIndex < this.pages.length; ++nPageIndex) {
            aSections = aSections.concat(this.pages[nPageIndex].dataProcess());
        }
        return aSections;
    };
    CRecognition.prototype.getScript = function () {
        var oScript = {
            s: "var aSectionJSON = [];"
        };
        var aSections = this.dataProcess();
        for(var nSectionIndex = 0; nSectionIndex < aSections.length; ++nSectionIndex) {
            aSections[nSectionIndex].createJSON(oScript, "aSectionJSON");
        }
        oScript.s += sBaseScript;
        oScript.s += "\nHandleSections(aSectionJSON);";
        oScript.s = "(function(){\n" +
            oScript.s +
            "})();";
        return oScript;
    };
    CRecognition.prototype.onMouseDown = function(e, x, y) {
        this.state.onMouseDown(e, x, y);
        this.updateInterfaceState();
    };
    CRecognition.prototype.onMouseMove = function(e, x, y) {
        this.state.onMouseMove(e, x, y);
    };
    CRecognition.prototype.onMouseUp = function(e, x, y) {
        this.state.onMouseUp(e, x, y);
        this.updateInterfaceState();
    };
    CRecognition.prototype.getCurPage = function() {
        return this.pages[this.drawing.page];
    };
    CRecognition.prototype.deleteSelectedBlocks = function() {
        var oPage = this.getCurPage();
        if(!oPage) {
            return;
        }
        var t = this;
        var oPairs = [];
        var aSelected = this.selectedObjects.slice();
        for(var i = 0; i < t.selectedObjects.length; ++i) {
            for(var j = 0; j < oPage.data.blocks.length; ++j) {
                if(oPage.data.blocks[j] === t.selectedObjects[i]) {
                    oPairs.push({obj: oPage.data.blocks[j], idx: j});
                    break;
                }
            }
        }
        oPairs.sort(function (a, b) {
            return a.idx - b.idx;
        });
        oPage.history.useHistory(function () {
            for(var i = oPairs.length - 1; i > -1 ; --i) {
                oPage.data.blocks.splice(oPairs[i].idx, 1);
            }
            t.selectedObjects.length = 0;
            oPage.onPageUpdate();
        }, function () {
            for(var i = oPairs.length - 1; i > -1 ; --i) {
                oPage.data.blocks.splice(oPairs[i].idx, 0, oPairs[i].obj);
            }
            t.selectedObjects = aSelected;
        });
    };
    CRecognition.prototype.undo = function() {
        var oPage = this.getCurPage();
        if(!oPage) {
            return;
        }
        var t = this;
        oPage.history.undo();
        this.updateInterfaceState();
    };
    CRecognition.prototype.redo = function() {
        var oPage = this.getCurPage();
        if(!oPage) {
            return;
        }
        var t = this;
        oPage.history.redo();
        this.updateInterfaceState();
    };
    CRecognition.prototype.startAdd = function(sType) {
        this.state = new AddBoxState(this, sType);
    };
    CRecognition.prototype.checkOldTesseract = function() {
        if(Tesseract.createWorker) {
            return false;
        }
        return true;
    };
    CRecognition.prototype.getLangParam = function() {
        return "eng";
    };
    CRecognition.prototype.createTesseractParams = function(mode, dpi) {
       return {
           tessedit_pageseg_mode: mode,
           tessedit_create_box: '0',
           tessedit_create_unlv: '0',
           tessedit_create_osd: '0',
           tessedit_parallelize: '0',
           user_defined_dpi: dpi+ "",
           hocr_font_info: '1'
       }
    };
    CRecognition.prototype.startRecognize = async function () {
        var oPage = this.getCurPage();
        if(!oPage) {
            return;
        }
        var _t = this;
        var fProgress;
        if(!oPage.data) {
            if(this.checkOldTesseract()) {
                fProgress = this.drawing.startRecognitionMask();
                var oParams = _t.createTesseractParams("2", oPage.getDPI());

                oParams.lang = this.getLangParam();
                Tesseract.recognize(oPage.img.canvas, oParams)
                    .progress(function  (p) {
                        fProgress(p);
                    })
                    .then(function (data) {
                        oPage.data = data;
                        oPage.postProcessData();
                        _t.drawing.stopRecognitionMask();
                        oPage.onPageUpdate();
                    }).finally(function(){
                    _t.drawing.stopRecognitionMask();
                    oPage.onPageUpdate();
                });
            }
            else {
                fProgress = this.drawing.startRecognitionMask();
                await (async () => {
                    const worker = await Tesseract.createWorker({
                        logger: m => fProgress(m)
                    });
                    await worker.load();
                    await worker.loadLanguage(this.getLangParam());
                    await worker.initialize(this.getLangParam());
                    await worker.setParameters(this.createTesseractParams(Tesseract.PSM.AUTO, oPage.getDPI()));
                    const {data} = await worker.recognize(oPage.img.canvas);
                    await worker.terminate();
                    oPage.data = data;
                    oPage.postProcessData();
                    _t.drawing.stopRecognitionMask();
                    oPage.onPageUpdate();
                })();
            }
        }
        else {
            var aBlocks = oPage.data.blocks;
            var rectangles = [], oBlock;
            var aIndexes = [];
            for(var i = 0; i < aBlocks.length; ++i) {
                oBlock = aBlocks[i];
                if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_TEXT) {
                    if(oBlock.bRecognized === false) {
                        var bb = oBlock.bbox;
                        rectangles.push({left: bb.x0, top: bb.y0, width: bb.x1 - bb.x0, height: bb.y1 - bb.y0});
                        aIndexes.push(i);
                    }
                }
            }
            if(rectangles.length > 0) {
                var results;
                if(this.checkOldTesseract()) {

                }
                else {
                    fProgress = this.drawing.startRecognitionMask();
                    var nWorkersCount = 1;
                    if(navigator && typeof navigator.hardwareConcurrency === "number") {
                        nWorkersCount = navigator.hardwareConcurrency;
                    }
                    nWorkersCount = Math.min(rectangles.length, nWorkersCount);
                    const oScheduler = Tesseract.createScheduler();
                    var aProgress = new Array(nWorkersCount);
                    for(let nWorkerIndex = 0; nWorkerIndex < nWorkersCount; ++nWorkerIndex) {
                        aProgress[nWorkerIndex] = 0;

                        let worker = await (async (nWorkerIndex)=>{
                            var fOnWorkerProgress = function (oProgress) {
                                if(oProgress.status === "recognizing text") {
                                    aProgress[nWorkerIndex] = oProgress.progress;
                                    var nSumm = 0;
                                    for (var i = 0; i < aProgress.length; ++i) {
                                        nSumm += aProgress[i];
                                    }
                                    fProgress({status: "recognizing text", progress: nSumm / aProgress.length});
                                }
                            }
                            return  await (async () => {
                                const worker = await Tesseract.createWorker({
                                    logger: m => fOnWorkerProgress(m)
                                });
                                await worker.load();
                                await worker.loadLanguage(this.getLangParam());
                                await worker.initialize(this.getLangParam());
                                await worker.setParameters(this.createTesseractParams(Tesseract.PSM.SINGLE_BLOCK, oPage.getDPI()));
                                return worker;
                            })();
                        })(nWorkerIndex);
                        oScheduler.addWorker(worker);
                    }
                    results = await Promise.all(rectangles.map((rectangle) => (
                        oScheduler.addJob('recognize', oPage.img.canvas, { rectangle: rectangle })
                    )));
                    await oScheduler.terminate();
                }
                var aOldBlocks = [];
                oPage.history.useHistory(function () {
                    for(var i = 0; i < aIndexes.length; ++i) {
                        aOldBlocks[i] = oPage.data.blocks[aIndexes[i]];
                        if(results[i].data.blocks[0] && results[i].data.blocks[0].paragraphs[0]) {
                            results[i].data.blocks[0].bbox = aOldBlocks[i].bbox;
                            oPage.data.blocks[aIndexes[i]] = results[i].data.blocks[0];
                        }
                    }
                    oPage.onPageUpdate();
                }, function () {
                    for(var i = 0; i < aIndexes.length; ++i) {
                        oPage.data.blocks[aIndexes[i]] = aOldBlocks[i];
                    }
                });
                this.drawing.stopRecognitionMask();
            }
        }
    };
    CRecognition.prototype.updateInterfaceState = function() {
       var oCurPage = this.getCurPage();
       if(!oCurPage || this.drawing.bRecognized) {
            $("#load-file-button-id").attr("disabled", this.drawing.bRecognized);
            $('#recognize-button').attr("disabled", true);
            $('#delete-area-button').attr("disabled", true);
            $('#text-area-button').attr("disabled", true);
            $('#picture-area-button').attr("disabled", true);
            $('#undo-button').attr("disabled", true);
            $('#redo-button').attr("disabled", true);
            $('#recognize-blocks-button').attr("disabled", true);
            $('#lang-select').attr("disabled", true);
       }
       else {
           $("#load-file-button-id").attr("disabled", false);
           $('#recognize-button').attr("disabled", true);
           $('#delete-area-button').attr("disabled", this.selectedObjects.length === 0);
           $('#text-area-button').attr("disabled", oCurPage.data === null );
           $('#picture-area-button').attr("disabled", oCurPage.data === null );
           $('#undo-button').attr("disabled", !oCurPage.history.canUndo());
           $('#redo-button').attr("disabled", !oCurPage.history.canRedo());
           $('#recognize-blocks-button').attr("disabled", false);
           $('#lang-select').attr("disabled", false);
       }
        $("#delete-area-button").attr("title", function () {
            if( $("#delete-area-button").attr("disabled") === "disabled") {
                return null;
            }
            var sVal = "Delete area";
            if(window.Asc.plugin.tr) {
                sVal = window.Asc.plugin.tr(sVal);
            }
            return sVal;
        });
        $("#text-area-button").attr("title", function () {
            if( $("#text-area-button").attr("disabled") === "disabled") {
                return null;
            }
            var sVal = "Draw text area";
            if(window.Asc.plugin.tr) {
                sVal = window.Asc.plugin.tr(sVal);
            }
            return sVal;
        });
        $("#picture-area-button").attr("title", function () {
            if( $("#picture-area-button").attr("disabled") === "disabled") {
                return null;
            }
            var sVal = "Draw picture area";
            if(window.Asc.plugin.tr) {
                sVal = window.Asc.plugin.tr(sVal);
            }
            return sVal;
        });
        $("#undo-button").attr("title", function () {
            if( $("#undo-button").attr("disabled") === "disabled") {
                return null;
            }
            var sVal = "Undo" ;
            if(window.Asc.plugin.tr) {
                sVal = window.Asc.plugin.tr(sVal);
            }
            return sVal;
        });
        $("#redo-button").attr("title",  function () {
            if( $("#redo-button").attr("disabled") === "disabled") {
                return null;
            }
            var sVal = "Redo";
            if(window.Asc.plugin.tr) {
                sVal = window.Asc.plugin.tr(sVal);
            }
            return sVal;
        });
        $("#recognize-blocks-button").attr("title",function () {
            if( $("#recognize-blocks-button").attr("disabled") === "disabled") {
                return null;
            }
            var sVal = "Recognize not recognized blocks" ;
            if(window.Asc.plugin.tr) {
                sVal = window.Asc.plugin.tr(sVal);
            }
            return sVal;
        });

    };



    var MIN_SHAPE_SIZE = 2;
    function ResizeTrack(originalObject, nHandle) {
        this.bLastCenter = false;
        this.bIsTracked = false;
        this.bRecognized = originalObject.bRecognized;
        this.originalObject = originalObject;
        this.numberHandle = nHandle;
        var numberHandle = this.numberHandle;
        var _flip_h = false;
        var _flip_v = false;
        var b = originalObject.bbox;
        var extX = (b.x1 - b.x0);
        var extY = (b.y1 - b.y0);
        var _half_height = extY*0.5;
        var _half_width = extX*0.5;
        switch (numberHandle)
        {
            case 0:
            case 1:
            {
                this.fixedPointX = _half_width + _half_width + b.x0;
                this.fixedPointY = _half_height + _half_height + b.y0;
                break;
            }
            case 2:
            case 3:
            {
                this.fixedPointX = -_half_width + _half_width + b.x0;
                this.fixedPointY = _half_height + _half_height + b.y0;
                break;
            }
            case 4:
            case 5:
            {
                this.fixedPointX = -_half_width + _half_width + b.x0;
                this.fixedPointY = -_half_height + _half_height + b.y0;
                break;
            }
            case 6:
            case 7:
            {
                this.fixedPointX = _half_width + _half_width + b.x0;
                this.fixedPointY = -_half_height + _half_height + b.y0;
                break;
            }
        }

        this.originalExtX = extX;
        this.originalExtY = extY;
        this.originalFlipH = _flip_h;
        this.originalFlipV = _flip_v;
        this.usedExtX =  this.originalExtX === 0 ? (/*this.lineFlag ? this.originalExtX :*/ 0.01) : this.originalExtX;
        this.usedExtY =  this.originalExtY === 0 ? (/*this.lineFlag ? this.originalExtY :*/ 0.01) : this.originalExtY;

        this.resizedExtX = this.originalExtX;
        this.resizedExtY = this.originalExtY;
        this.resizedPosX = b.x0;
        this.resizedPosY = b.y0;

        this.x0 = this.originalObject.bbox.x0;
        this.y0 = this.originalObject.bbox.y0;
        this.x1 = this.originalObject.bbox.x1;
        this.y1 = this.originalObject.bbox.y1;
    }

    ResizeTrack.prototype.undo = function(){
        this.originalObject.bbox.x0 = this.x0;
        this.originalObject.bbox.y0 = this.y0;
        this.originalObject.bbox.x1 = this.x1;
        this.originalObject.bbox.y1 = this.y1;
        this.originalObject.bRecognized = this.bRecognized;
    };


    ResizeTrack.prototype.track = function(kd1, kd2, ShiftKey)
    {

        var _real_height, _real_width;
        var _abs_height, _abs_width;
        var _new_resize_half_width;
        var _new_resize_half_height;
        var _new_used_half_width;
        var _new_used_half_height;
        var _temp;


        switch (this.numberHandle)
        {
            case 0:
            case 1:
            {
                if(this.numberHandle === 0)
                {
                    _real_width = this.usedExtX*kd1;
                    _abs_width = Math.abs(_real_width);
                    this.resizedExtX = _abs_width >= MIN_SHAPE_SIZE  ? _abs_width : MIN_SHAPE_SIZE;
                }
                if(this.numberHandle === 1)
                {
                    _temp = kd1;
                    kd1 = kd2;
                    kd2 = _temp;
                }

                _real_height = this.usedExtY*kd2;
                _abs_height = Math.abs(_real_height);

                this.resizedExtY = _abs_height >= MIN_SHAPE_SIZE  ? _abs_height : MIN_SHAPE_SIZE;


                this.resizedExtY = _abs_height >= MIN_SHAPE_SIZE  ? _abs_height : MIN_SHAPE_SIZE;
                if(_real_height < 0 )
                {
                    this.resizedflipV = !this.originalFlipV;
                }
                else
                {
                    this.resizedflipV = this.originalFlipV;
                }


                _new_resize_half_width = this.resizedExtX*0.5;
                _new_resize_half_height = this.resizedExtY*0.5;
                    _new_used_half_width = _new_resize_half_width;
                if(this.resizedflipV !== this.originalFlipV)
                {
                    _new_used_half_height = -_new_resize_half_height;
                }
                else
                {
                    _new_used_half_height = _new_resize_half_height;
                }

                this.resizedPosX = this.fixedPointX + (-_new_used_half_width) - _new_resize_half_width;
                this.resizedPosY = this.fixedPointY + (- _new_used_half_height) - _new_resize_half_height;
                break;
            }
            case 2:
            case 3:
            {
                if(this.numberHandle === 2)
                {
                    _temp = kd2;
                    kd2 = kd1;
                    kd1 = _temp;
                    _real_height = this.usedExtY*kd2;
                    _abs_height = Math.abs(_real_height);
                    this.resizedExtY = _abs_height >= MIN_SHAPE_SIZE  ? _abs_height : ( MIN_SHAPE_SIZE);
                    if(_real_height < 0 )
                        this.resizedflipV = !this.originalFlipV;
                    else
                        this.resizedflipV = this.originalFlipV;
                }

                _real_width = this.usedExtX*kd1;
                _abs_width = Math.abs(_real_width);
                this.resizedExtX = _abs_width >= MIN_SHAPE_SIZE  ? _abs_width : (MIN_SHAPE_SIZE);


                _new_resize_half_width = this.resizedExtX*0.5;
                _new_resize_half_height = this.resizedExtY*0.5;
                    _new_used_half_width = _new_resize_half_width;

                    _new_used_half_height = _new_resize_half_height;
                this.resizedPosX = this.fixedPointX + (_new_used_half_width) - _new_resize_half_width;
                this.resizedPosY = this.fixedPointY + ( - _new_used_half_height) - _new_resize_half_height;
                break;
            }

            case 4:
            case 5:
            {
                if(this.numberHandle === 4)
                {
                    _real_width = this.usedExtX*kd1;
                    _abs_width = Math.abs(_real_width);
                    this.resizedExtX = _abs_width >= MIN_SHAPE_SIZE   ? _abs_width : (MIN_SHAPE_SIZE);
                }
                else
                {
                    _temp = kd2;
                    kd2 = kd1;
                    kd1 = _temp;
                }

                _real_height = this.usedExtY*kd2;
                _abs_height = Math.abs(_real_height);
                this.resizedExtY = _abs_height >= MIN_SHAPE_SIZE  ? _abs_height :  (MIN_SHAPE_SIZE);
                if(_real_height < 0 )
                {
                    this.resizedflipV = !this.originalFlipV;
                }
                else
                {
                    this.resizedflipV = this.originalFlipV;
                }

                _new_resize_half_width = this.resizedExtX*0.5;
                _new_resize_half_height = this.resizedExtY*0.5;
                    _new_used_half_width = _new_resize_half_width;

                    _new_used_half_height = _new_resize_half_height;

                this.resizedPosX = this.fixedPointX + (_new_used_half_width) - _new_resize_half_width;
                this.resizedPosY = this.fixedPointY + ( _new_used_half_height) - _new_resize_half_height;

                break;
            }

            case 6:
            case 7:
            {
                if(this.numberHandle === 6)
                {
                    _real_height = this.usedExtY*kd1;
                    _abs_height = Math.abs(_real_height);
                    this.resizedExtY = _abs_height >= MIN_SHAPE_SIZE   ? _abs_height : ( MIN_SHAPE_SIZE);
                }
                else
                {
                    _temp = kd2;
                    kd2 = kd1;
                    kd1 = _temp;
                }

                _real_width = this.usedExtX*kd2;
                _abs_width = Math.abs(_real_width);
                this.resizedExtX = _abs_width >= MIN_SHAPE_SIZE   ? _abs_width : (MIN_SHAPE_SIZE);

                _new_resize_half_width = this.resizedExtX*0.5;
                _new_resize_half_height = this.resizedExtY*0.5;
                    _new_used_half_width = _new_resize_half_width;
                    _new_used_half_height = _new_resize_half_height;

                this.resizedPosX = this.fixedPointX + (-_new_used_half_width) - _new_resize_half_width;
                this.resizedPosY = this.fixedPointY + ( _new_used_half_height) - _new_resize_half_height;
                break;
            }
        }
    };

    ResizeTrack.prototype.trackEnd = function()
    {
        this.originalObject.bbox.x0 = Math.min(this.resizedPosX, this.resizedPosX + this.resizedExtX);
        this.originalObject.bbox.y0 = Math.min(this.resizedPosY, this.resizedPosY + this.resizedExtY);
        this.originalObject.bbox.x1 = Math.max(this.resizedPosX, this.resizedPosX + this.resizedExtX);
        this.originalObject.bbox.y1 = Math.max(this.resizedPosY, this.resizedPosY + this.resizedExtY);
        this.originalObject.bRecognized = false;
    };

    ResizeTrack.prototype.draw = function(oOverlay, oCtx)
    {
        var x0 = Math.min(this.resizedPosX, this.resizedPosX + this.resizedExtX);
        var y0 = Math.min(this.resizedPosY, this.resizedPosY + this.resizedExtY);
        var x1 = Math.max(this.resizedPosX, this.resizedPosX + this.resizedExtX);
        var y1 = Math.max(this.resizedPosY, this.resizedPosY + this.resizedExtY);

        var sColor = "#CCCCCC";
        if(MAP_COLORS[MAP_TESSERACT_AREAS[this.originalObject.blocktype]]) {
            sColor = MAP_COLORS[MAP_TESSERACT_AREAS[this.originalObject.blocktype]];
        }
        oOverlay.drawTrackObject(oCtx, x0, y0, x1, y1, sColor, 0.3)
    };


    function MoveTrack(oBlock) {
        this.originalObject = oBlock;
        this.bRecognized = oBlock.bRecognized;
        this.x = oBlock.bbox.x0;
        this.y = oBlock.bbox.y0;

        this.x0 = oBlock.bbox.x0;
        this.y0 = oBlock.bbox.y0;
        this.x1 = oBlock.bbox.x1;
        this.y1 = oBlock.bbox.y1;
    }
    MoveTrack.prototype.undo = function(){
        this.originalObject.bbox.x0 = this.x0;
        this.originalObject.bbox.y0 = this.y0;
        this.originalObject.bbox.x1 = this.x1;
        this.originalObject.bbox.y1 = this.y1;
        this.originalObject.bRecognized = this.bRecognized;
    };

    MoveTrack.prototype.track =function (dx, dy) {
        this.x = this.originalObject.bbox.x0 - dx;
        this.y = this.originalObject.bbox.y0 - dy;
    };

    MoveTrack.prototype.trackEnd = function () {
        var dx = this.originalObject.bbox.x0 - this.x;
        var dy = this.originalObject.bbox.y0 - this.y;
        this.originalObject.bbox.x0 += dx;
        this.originalObject.bbox.y0 += dy;
        this.originalObject.bbox.x1 += dx;
        this.originalObject.bbox.y1 += dy;
        this.originalObject.bRecognized = false;
    };
    MoveTrack.prototype.draw = function (oOverlay, oCtx) {

        var x0 = this.originalObject.bbox.x0;
        var y0 = this.originalObject.bbox.y0;
        var x1 = this.originalObject.bbox.x1;
        var y1 = this.originalObject.bbox.y1;

        var dx = this.originalObject.bbox.x0 - this.x;
        var dy = this.originalObject.bbox.y0 - this.y;
        x0 += dx;
        y0 += dy;
        x1 += dx;
        y1 += dy;
        var sColor = "#CCCCCC";
        if(MAP_COLORS[MAP_TESSERACT_AREAS[this.originalObject.blocktype]]) {
            sColor = MAP_COLORS[MAP_TESSERACT_AREAS[this.originalObject.blocktype]];
        }
        oOverlay.drawTrackObject(oCtx, x0, y0, x1, y1, sColor, 0.3)
    };


    function NewTrack(stX, stY, sType, oPage) {
        this.stX = stX;
        this.stY = stY;
        this.type = sType;
        this.x0 = this.stX;
        this.y0 = this.stY;
        this.x1 = this.stX;
        this.y1 = this.stY;
        this.page = oPage;
    }
    NewTrack.prototype.undo = function(){
        this.page.data.blocks.pop();
    };

    NewTrack.prototype.track =function (x, y) {
        this.x0 = Math.min(x, this.stX);
        this.y0 = Math.min(y, this.stY);
        this.x1 = Math.max(x, this.stX);
        this.y1 = Math.max(y, this.stY);
    };

    NewTrack.prototype.trackEnd = function () {

        var oBlock = {bbox: {}}
        oBlock.bbox.x0 = this.x0;
        oBlock.bbox.y0 = this.y0;
        oBlock.bbox.x1 = this.x1;
        oBlock.bbox.y1 = this.y1;
        oBlock.bRecognized = false;
        oBlock.blocktype = this.type;
        this.page.data.blocks.push(oBlock);
    };
    NewTrack.prototype.draw = function (oOverlay, oCtx) {

        var x0 = this.x0;
        var y0 = this.y0;
        var x1 = this.x1;
        var y1 = this.y1;
        var sColor = "#CCCCCC";
        if(MAP_COLORS[MAP_TESSERACT_AREAS[this.type]]) {
            sColor = MAP_COLORS[MAP_TESSERACT_AREAS[this.type]];
        }
        oOverlay.drawTrackObject(oCtx, x0, y0, x1, y1, sColor, 0.3)
    };


    function NullState(oRecognition) {
        this.recognition = oRecognition;
    }

    NullState.prototype.hitToHandles = function(oBlock, x, y) {
        var nSzie = this.recognition.drawing.convertToScreen(5);
        var nDelta  = this.recognition.drawing.convertScreenToImage(nSzie, 0).x - this.recognition.drawing.convertScreenToImage(0, 0).x;
        var b = oBlock.bbox;
        var tx, ty;
        tx = b.x0;
        ty = b.y0;
        if(Math.abs(x - tx) < nDelta && Math.abs(y - ty) < nDelta ) {
            return 0;
        }
        tx = (b.x0 + b.x1) / 2;
        ty = b.y0;
        if(Math.abs(x - tx) < nDelta && Math.abs(y - ty) < nDelta ) {
            return 1;
        }
        tx = b.x1;
        ty = b.y0;
        if(Math.abs(x - tx) < nDelta && Math.abs(y - ty) < nDelta ) {
            return 2;
        }
        tx = b.x1;
        ty = (b.y0 + b.y1) / 2;
        if(Math.abs(x - tx) < nDelta && Math.abs(y - ty) < nDelta ) {
            return 3;
        }
        tx = b.x1;
        ty = b.y1;
        if(Math.abs(x - tx) < nDelta && Math.abs(y - ty) < nDelta ) {
            return 4;
        }
        tx = (b.x0 + b.x1) / 2;
        ty = b.y1;
        if(Math.abs(x - tx) < nDelta && Math.abs(y - ty) < nDelta ) {
            return 5;
        }
        tx = b.x0;
        ty = b.y1;
        if(Math.abs(x - tx) < nDelta && Math.abs(y - ty) < nDelta ) {
            return 6;
        }
        tx = b.x0;
        ty = (b.y0 + b.y1) / 2;
        if(Math.abs(x - tx) < nDelta && Math.abs(y - ty) < nDelta ) {
            return 7;
        }
        return -1;
    };

    NullState.prototype.hit = function(oBlock, x, y) {
        var b = oBlock.bbox;

        var nSzie = this.recognition.drawing.convertToScreen(5);
        var nDelta  = this.recognition.drawing.convertScreenToImage(nSzie, 0).x - this.recognition.drawing.convertScreenToImage(0, 0).x;
        return x >= (b.x0 - nDelta) && x <= (b.x1 + nDelta) && y >= (b.y0 - nDelta) && y <= (b.y1 + nDelta);
    };

    NullState.prototype.onMouseDown = function (e, x, y) {
        var oPage = this.recognition.getPage(this.recognition.drawing.page);
        if(!oPage || !oPage.data) {
            return;
        }
        var aBlocks = this.recognition.selectedObjects;
        for(var i = aBlocks.length - 1; i > -1; --i) {
            var nHit = this.hitToHandles(aBlocks[i], x, y);
            if(nHit > -1){
                this.recognition.selectedObjects = [aBlocks[i]];
                this.recognition.tracks.length = 0;
                this.recognition.tracks[0] = new ResizeTrack(aBlocks[i], nHit);
                this.recognition.state = new ResizeState(this.recognition, nHit, aBlocks[i]);
                return;
            }
        }
        aBlocks = oPage.data.blocks;
        for(i = aBlocks.length - 1; i > -1; --i) {
            if(this.hit(aBlocks[i], x, y)) {

                for(var j = 0; j < this.recognition.selectedObjects.length; ++j) {
                    if(this.recognition.selectedObjects[j] === aBlocks[i]) {
                        break;
                    }
                }
                if(j === this.recognition.selectedObjects.length) {
                    if(!(e.ctrlKey || e.metaKey)) {
                        this.recognition.selectedObjects.length = 0;
                    }
                    this.recognition.selectedObjects.push(aBlocks[i]);
                }
                else {
                    if((e.ctrlKey || e.metaKey)) {
                        this.recognition.selectedObjects.splice(j, 1);
                    }
                }
                this.recognition.drawing.overlay.update();
                this.recognition.tracks.length = 0;
                for(var j = 0; j < this.recognition.selectedObjects.length; ++j) {
                    this.recognition.tracks.push(new MoveTrack(this.recognition.selectedObjects[j]));
                }
                this.recognition.state = new MoveState(this.recognition, aBlocks[i], x, y);

                return;
            }
        }
        this.recognition.selectedObjects.length = 0;
        this.recognition.drawing.overlay.update();      var oPage = this.recognition.getPage(this.recognition.drawing.page);
        if(!oPage || !oPage.data) {
            return;
        }
        var aBlocks = this.recognition.selectedObjects;
        for(var i = aBlocks.length - 1; i > -1; --i) {
            var nHit = this.hitToHandles(aBlocks[i], x, y);
            if(nHit > -1){
                this.recognition.selectedObjects = [aBlocks[i]];
                this.recognition.tracks.length = 0;
                this.recognition.tracks[0] = new ResizeTrack(aBlocks[i], nHit);
                this.recognition.state = new ResizeState(this.recognition, nHit, aBlocks[i]);
                return;
            }
        }
        aBlocks = oPage.data.blocks;
        for(i = aBlocks.length - 1; i > -1; --i) {
            if(this.hit(aBlocks[i], x, y)) {

                for(var j = 0; j < this.recognition.selectedObjects.length; ++j) {
                    if(this.recognition.selectedObjects[j] === aBlocks[i]) {
                        break;
                    }
                }
                if(j === this.recognition.selectedObjects.length) {
                    if(!(e.ctrlKey || e.metaKey)) {
                        this.recognition.selectedObjects.length = 0;
                    }
                    this.recognition.selectedObjects.push(aBlocks[i]);
                }
                this.recognition.drawing.overlay.update();
                this.recognition.tracks.length = 0;
                for(var j = 0; j < this.recognition.selectedObjects.length; ++j) {
                    this.recognition.tracks.push(new MoveTrack(this.recognition.selectedObjects[j]));
                }
                this.recognition.state = new MoveState(this.recognition, aBlocks[i], x, y);

                return;
            }
        }
        this.recognition.selectedObjects.length = 0;
        this.recognition.drawing.overlay.update();
    };


    NullState.prototype.onMouseMove = function (e, x, y) {

        var oPage = this.recognition.getPage(this.recognition.drawing.page);
        if(!oPage || !oPage.data) {
            return;
        }
        var aBlocks = this.recognition.selectedObjects;
        for(var i = aBlocks.length - 1; i > -1; --i) {
            var nHit = this.hitToHandles(aBlocks[i], x, y);
            if(nHit > -1){

                var sCursor = "default";
                switch (nHit) {

                    case 0:
                    {
                        sCursor = "nw-resize";
                        break;
                    }
                    case 1:
                    {
                        sCursor = "n-resize";
                        break;
                    }
                    case 2:
                    {
                        sCursor = "ne-resize";
                        break;
                    }
                    case 3:
                    {
                        sCursor = "e-resize";
                        break;
                    }
                    case 4:
                    {
                        sCursor = "se-resize";
                        break;
                    }
                    case 5:
                    {
                        sCursor = "s-resize";
                        break;
                    }
                    case 6:
                    {
                        sCursor = "sw-resize";
                        break;
                    }
                    case 7:
                    {
                        sCursor = "w-resize";
                        break;
                    }

                }
                this.recognition.drawing.updateCursor(sCursor);
                return;
            }
        }
        var aBlocks = oPage.data.blocks;
        for(i = aBlocks.length - 1; i > -1; --i) {
            if(this.hit(aBlocks[i], x, y)) {
                this.recognition.drawing.updateCursor("move");
                return;
            }
        }
        this.recognition.drawing.updateCursor("default");

    };
    NullState.prototype.onMouseUp = function (e, x, y) {

    };

    function ResizeState(oRecognition, num, majorObject) {
        this.recognition = oRecognition;
        this.handleNum = num;
        this.majorObject = majorObject;
        this.tracked = false;
    }
    ResizeState.prototype.getResizeCoefficients = function (x, y) {
        var cx, cy, b = this.majorObject.bbox;
        cx = b.x1 - b.x0;
        cy = b.y1 - b.y0;

        var t_x = x - b.x0;
        var t_y = y - b.y0;

        switch (this.handleNum) {
            case 0:
                return { kd1: (cx - t_x) / cx, kd2: (cy - t_y) / cy };
            case 1:
                return { kd1: (cy - t_y) / cy, kd2: 0 };
            case 2:
                return { kd1: (cy - t_y) / cy, kd2: t_x / cx };
            case 3:
                return { kd1: t_x / cx, kd2: 0 };
            case 4:
                return { kd1: t_x / cx, kd2: t_y / cy };
            case 5:
                return { kd1: t_y / cy, kd2: 0 };
            case 6:
                return { kd1: t_y / cy, kd2: (cx - t_x) / cx };
            case 7:
                return { kd1: (cx - t_x) / cx, kd2: 0 };
        }
        return { kd1: 1, kd2: 1 };
    };
    ResizeState.prototype.onMouseDown = function (e, x, y) {
    };
    ResizeState.prototype.onMouseMove = function (e, x, y) {
        var resize_coef = this.getResizeCoefficients(x, y);
        var aTracks = this.recognition.tracks;
        for(var i = 0; i < aTracks.length; ++i) {
            aTracks[i].track(resize_coef.kd1, resize_coef.kd2, false);
        }
        this.recognition.drawing.overlay.update();
        this.tracked = true;
    };
    ResizeState.prototype.onMouseUp = function (e, x, y) {
        var oPage = this.recognition.getPage(this.recognition.drawing.page);
        var recognition = this.recognition;
        if(!this.tracked) {
            recognition.tracks.length = 0;
            recognition.state = new NullState(recognition);
            recognition.drawing.overlay.update();
            return;
        }
        var aTracks = recognition.tracks.slice();
        var aSelected  = recognition.selectedObjects.slice();
        oPage.history.useHistory(function () {
            for(var i = 0; i < aTracks.length; ++i) {
                aTracks[i].trackEnd();
            }
            recognition.state = new NullState(recognition);
            recognition.tracks.length = 0;
            recognition.onPageUpdate(oPage);
        }, function () {
            for(var i = 0; i < aTracks.length; ++i) {
                aTracks[i].undo();
            }
            recognition.state = new NullState(recognition);
            recognition.tracks.length = 0;
            recognition.selectedObjects = aSelected;
            recognition.onPageUpdate(oPage);
        });
    };

    function MoveState(oRecognition, majorObject, stX, stY) {
        this.recognition = oRecognition;
        this.majorObject = majorObject;
        this.stX = stX;
        this.stY = stY;
        this.tracked = false;
    }

    MoveState.prototype.onMouseDown = function (e, x, y) {

    };
    MoveState.prototype.onMouseMove = function (e, x, y) {

        var dx = x - this.stX;
        var dy = y - this.stY;
        if(!this.tracked && Math.abs(dx) < 2 && Math.abs(dy) < 2 ) {
            return;
        }
        this.tracked = true;
        for(var i = 0; i < this.recognition.tracks.length; ++i) {
            this.recognition.tracks[i].track(dx, dy);
        }
        this.recognition.drawing.overlay.update();
    };
    MoveState.prototype.onMouseUp = function (e, x, y) {

        var oPage = this.recognition.getPage(this.recognition.drawing.page);
        var recognition = this.recognition;
        if(!this.tracked) {
            recognition.tracks.length = 0;
            recognition.state = new NullState(recognition);
            recognition.drawing.overlay.update();
           return;
        }
        var aSelected = this.recognition.selectedObjects.slice();
        var aTracks =  recognition.tracks.slice();
        oPage.history.useHistory(function () {
            for(var i = 0; i < aTracks.length; ++i) {
                aTracks[i].trackEnd();
            }
            recognition.tracks.length = 0;
            recognition.onPageUpdate(oPage);
            recognition.state = new NullState(recognition);
        }, function () {
            for(var i = 0; i < aTracks.length; ++i) {
                aTracks[i].undo();
            }
            recognition.tracks.length = 0;
            recognition.selectedObjects = aSelected;
            recognition.onPageUpdate(oPage);
            recognition.state = new NullState(recognition);
        });
    };

    function AddBoxState(oRecognition, sType) {
        this.stX = null;
        this.stY = null;
        this.type = sType;
        this.tracked = false;
        this.recognition = oRecognition;
    }
    AddBoxState.prototype.onMouseDown = function(e, x, y) {
        if(this.tracked){
            return;
        }
        this.stX = x;
        this.stY = y;
        this.recognition.tracks.length = 0;
        this.recognition.tracks.push(new NewTrack(x, y, this.type, this.recognition.getCurPage()));
    };
    AddBoxState.prototype.onMouseMove = function(e, x, y) {
        if(this.recognition.tracks[0]) {
            this.tracked = true;
            this.recognition.tracks[0].track(x, y);
            this.recognition.drawing.overlay.update();
        }
    };
    AddBoxState.prototype.onMouseUp = function(e, x, y) {
        if(!this.tracked) {
            return;
        }
        var oPage = this.recognition.getPage(this.recognition.drawing.page);
        var recognition = this.recognition;
        var aSelected = this.recognition.selectedObjects.slice();
        var aTracks =  recognition.tracks.slice();
        oPage.history.useHistory(function () {
            for(var i = 0; i < aTracks.length; ++i) {
                aTracks[i].trackEnd();
            }
            recognition.tracks.length = 0;
            recognition.onPageUpdate(oPage);
            recognition.state = new NullState(recognition);
        }, function () {
            for(var i = 0; i < aTracks.length; ++i) {
                aTracks[i].undo();
            }
            recognition.tracks.length = 0;
            recognition.selectedObjects = aSelected;
            recognition.onPageUpdate(oPage);
            recognition.state = new NullState(recognition);
        });
    };

    function CSection(oPage) {
        this.blocks = [];
        this.columns = [];
        this.images = [];
        this.textBoxes = [];
        this.minY = 1000000;
        this.maxY = 0;

        this.marginL = 1000000;
        this.marginT = 1000000;
        this.marginR = 1000000;
        this.marginB = 1000000;
        this.pageWidth = 100000;
        this.pageHeight = 100000;
        this.type = "continuous";
        if(oPage) {
            this.pageWidth = oPage.getWidth();
            this.pageHeight = oPage.getHeight();
            this.dpi = oPage.getDPI();
        }
    }
    CSection.prototype.hasBlocks = function() {
        return this.blocks.length !== 0;
    };
    CSection.prototype.addBlock = function(oBlock) {
        if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_IMAGE) {
            this.images.push(oBlock);
        }
        else if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_TEXT) {
            this.blocks.push(oBlock);
            if(this.minY > oBlock.bbox.y0) {
                this.minY = oBlock.bbox.y0;
            }
            if(this.maxY < oBlock.bbox.y1) {
                this.maxY = oBlock.bbox.y1;
            }
            if(oBlock.bbox.x0 < this.marginL) {
                this.marginL = oBlock.bbox.x0;
            }
            if(oBlock.bbox.y0 < this.marginT) {
                this.marginT = oBlock.bbox.y0;
            }
            if(this.pageWidth - oBlock.bbox.x1 < this.marginR) {
                this.marginR = this.pageWidth - oBlock.bbox.x1;
            }
            if(this.pageHeight - oBlock.bbox.y1 < this.marginB) {
                this.marginB = this.pageHeight - oBlock.bbox.y1;
            }
        }
    };
    CSection.prototype.addImage = function(oBlock, oPage) {
        oBlock.imageData = oPage.getImageData(oBlock.bbox.x0, oBlock.bbox.y0, oBlock.bbox.x1 - oBlock.bbox.x0, oBlock.bbox.y1 - oBlock.bbox.y0);
        this.images.push(oBlock);
    };
    CSection.prototype.findColumns = function () {
        var minX = this.pageWidth, oCurBlock, i, j;
        this.blocks.sort(function (a, b) {
            return a.bbox.x1 - b.bbox.x1;
        });
        var oCurColumn = new CColumn();
        this.columns.push(oCurColumn);
        for(i = this.blocks.length - 1; i > -1; --i) {
            oCurBlock = this.blocks[i];
            if(!oCurColumn.hasBlocks()) {
                oCurColumn.addBlock(oCurBlock);
            }
            else if(oCurBlock.bbox.x1 < minX) {

                oCurColumn.blocks.sort(function (a, b) {
                    return a.bbox.y1 - b.bbox.y1;
                });
                for(j = oCurColumn.blocks.length - 2; j > -1; --j) {
                    if(oCurColumn.blocks[j].bbox.y1 > oCurColumn.blocks[j+1].bbox.y0) {
                        break;
                    }
                }
                if(j > -1) {
                    break;
                }
                oCurColumn = new CColumn();
                this.columns.splice(0, 0, oCurColumn);
                oCurColumn.addBlock(oCurBlock);
                minX = oCurBlock.bbox.x0;
            }
            else {
                oCurColumn.addBlock(oCurBlock);
            }
            minX = Math.min(minX, oCurBlock.bbox.x0);
        }
        if(i > -1) {
            this.columns.length = 0;
            for(i = 0; i < this.blocks.length; ++i) {
                this.textBoxes.push(this.blocks[i]);
            }
        }
    };
    CSection.prototype.setPageSize = function (nPageWidth, nPageHeight) {
        this.pageWidth = nPageWidth;
        this.pageHeight = nPageHeight;
    };
    CSection.prototype.setDPI = function (nDPI) {
        this.dpi = nDPI;
    };
    CSection.prototype.setType = function (sType) {
        this.type = sType;
    };
    CSection.prototype.createJSON = function (oScriptObject, sArrayName) {

        var aBlocks = this.blocks;
        this.blocks = undefined;
        const seen = new WeakSet();
        oScriptObject.s += (sArrayName + ".push(" + JSON.stringify(this, function (key, value) {

            if(key === "blocktype" ||
                key === "polygon" ||
                key === "page" ||
                key === "confidence" ||
                key === "symbols" ||
                key === "choices") {
                return undefined;
            }
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return undefined;
                }
                seen.add(value);
            }
            return value;
        }) + ");");
        this.blocks = aBlocks;
    };
    CSection.prototype.union = function (oSection) {
        if(this.columns.length > 0 && this.columns.length === oSection.columns.length) {
            for(var nColumnIndex = 0; nColumnIndex < this.columns.length; ++nColumnIndex) {
                if(!this.columns[nColumnIndex].intersect(oSection.columns[nColumnIndex])) {
                    return false;
                }
            }
            var oNewSection = new CSection();
            oNewSection.marginL = this.marginL;
            oNewSection.marginT = this.marginT;
            oNewSection.marginR = this.marginR;
            oNewSection.marginB = this.marginB;
            oNewSection.blocks = this.blocks.concat(oSection.blocks);
            oNewSection.findColumns();
            if(oNewSection.columns.length > 0) {
                this.columns = oNewSection.columns;
                this.blocks = oNewSection.blocks;
                this.textBoxes = this.textBoxes.concat(oSection.textBoxes);
                this.images = this.images.concat(oSection.images);
                this.marginL = Math.min(this.marginL, oSection.marginL);
                this.marginR = Math.min(this.marginR, oSection.marginR);
                this.maxY = Math.max(this.maxY, oSection.maxY);
                this.minY = Math.min(this.minY, oSection.minY);
                return true;
            }
        }
        return false;
    };

    function CColumn() {
        this.blocks = [];
        this.minX = null;
        this.maxX = null;
    }
    CColumn.prototype.hasBlocks = function() {
        return this.blocks.length !== 0;
    };
    CColumn.prototype.addBlock = function (oBlock) {
        if(this.blocks.length === 0) {
            this.blocks.push(oBlock);
            this.minX = oBlock.bbox.x0;
            this.maxX = oBlock.bbox.x1;
        }
        else {
            this.blocks.splice(0, 0, oBlock);
            this.minX = Math.min(this.minX, oBlock.bbox.x0);
            this.maxX = Math.max(this.maxX, oBlock.bbox.x1);
        }
        this.blocks.sort(function (a, b) {
            return a.bbox.y0 - b.bbox.y0;
        });
    };
    CColumn.prototype.isIntersect = function(oBlock) {
        return this.isIntersectX(oBlock) && this.isIntersectY(oBlock);
    };
    CColumn.prototype.isIntersectX = function(oBlock) {
        var oOtherBBox = oBlock.bbox;
        return !(this.minX > oOtherBBox.x1 || this.maxX < oOtherBBox.x0);
    };
    CColumn.prototype.isIntersectY = function(oBlock) {
        var oOtherBBox = oBlock.bbox;
        return !(this.minY > oOtherBBox.y1 || this.maxY < oOtherBBox.y0);
    };

    CColumn.prototype.intersect = function(oColumn) {
        return !(this.maxX < oColumn.minX || this.minX > oColumn.maxX);
    };

    function CHistory(oPage){
        this.page = oPage;
        this.points = [];
        this.index = -1;
    }

    CHistory.prototype.canUndo = function() {
        return this.index > -1;
    };

    CHistory.prototype.canRedo = function() {
        return (this.index < this.points.length - 1);
    };

    CHistory.prototype.undo = function(){
        if(this.canUndo()) {
            var oPoint = this.points[this.index--];
            oPoint.undo();
            this.page.onPageUpdate();
        }
    };
    CHistory.prototype.redo = function(){
        if(this.canRedo()) {
            var oPoint = this.points[++this.index];
            oPoint.redo();
            this.page.onPageUpdate();
        }
    };

    function cloneObject(oObj) {
        var ret;
        if(Array.isArray(oObj)) {
            ret = [];
            for(var i = 0; i < oObj.length; ++i) {
                ret[i] = cloneObject(oObj[i]);
            }
        }
        else if(typeof oObj === "object") {
            ret = {};
            for (var key in oObj) {
                if(oObj.hasOwnProperty(key)) {
                    ret[key] = cloneObject(oObj[key]);
                }
            }
        }
        else {
            ret = oObj;
        }
        return ret;
    }

    CHistory.prototype.useHistory = function(fAction, fUndo){

        var oPoint = {
            undo: fUndo,
            redo: fAction
        };
        fAction();
        this.points.splice(this.index + 1, this.points.length - this.index + 1, oPoint);
        this.index++;
        this.page.parent.updateInterfaceState();
    };

    function CPage(oFile, oParent) {
        this.parent = oParent;
        this.img = new CImage(oFile, this);
        this.data = null;

        this.marginL = 10000000;
        this.marginT = 10000000;
        this.marginR = 10000000;
        this.marginB = 10000000;
        this.history = new CHistory(this);
    }
    CPage.prototype.getWidth = function() {
        return this.img.getWidth();
    };
    CPage.prototype.getHeight = function() {
        return this.img.getHeight();
    };
    CPage.prototype.getIndex = function() {
        return this.parent.getPageIndex(this);
    };
    CPage.prototype.onPageUpdate = function() {
        this.parent.onPageUpdate(this);
    };
    CPage.prototype.getImageData = function(x, y, w, h) {
        return this.img.getImageData(x, y, w, h);
    };

    CPage.prototype.drawToCanvas = function(oCanvas, x, y, w, h) {
        return this.img.drawToCanvas(oCanvas, x, y, w, h);
    };

    CPage.prototype.createWorker = async (fProgress, dpi, mode) => {
        const worker = await Tesseract.createWorker({
            logger: m => fProgress(m)
        });
        var _mode = mode || Tesseract.PSM.AUTO;
        await worker.load();
        await worker.loadLanguage('rus');
        await worker.initialize('rus');
        await worker.setParameters({
            tessedit_pageseg_mode: _mode,
            tessedit_create_box: '1',
            tessedit_create_unlv: '1',
            tessedit_create_osd: '1',
            tessedit_parallelize: '1',
            user_defined_dpi: dpi + "",
            hocr_font_info: '1'
        });
        return worker;
    };

    CPage.prototype.postProcessData = function() {

        for(var nBlock = this.data.blocks.length - 1; nBlock > -1; --nBlock) {
            var oBlock = this.data.blocks[nBlock];
            if(oBlock.blocktype === "TABLE") {
                this.data.blocks.splice(nBlock, 1);
                for(var nParIndex = 0; nParIndex < oBlock.paragraphs.length; ++nParIndex) {
                    var oParagraph = oBlock.paragraphs[nParIndex];
                    for(var nLine = 0; nLine < oParagraph.lines.length; ++nLine) {
                        var oLine = oParagraph.lines[nLine];
                        oBlock = {
                            blocktype: "FLOWING_TEXT",
                            paragraphs: [{
                                lines: [oLine],
                                bbox: cloneObject(oLine.bbox),
                            }],
                            bbox: cloneObject(oLine.bbox)
                        };

                        this.data.blocks.splice(nBlock, 0, oBlock);
                    }
                }
            }
        }
    };
    CPage.prototype.startRecognize = function() {

        (async () => {
            var fProgress = this.parent.drawing.startRecognitionMask();
            const worker = await this.createWorker(fProgress, this.getDPI(), Tesseract.PSM.AUTO);
            const { data} = await worker.recognize(this.img.canvas);
            await worker.terminate();
            this.data = data;
            this.postProcessData();
            this.parent.drawing.stopRecognitionMask();
            this.onPageUpdate();
        })();
    };
    CPage.prototype.draw = function(oCtx) {
        this.img.draw(oCtx);
    };
    CPage.prototype.getDPI = function() {
        return this.img.getDPI();
    };
    CPage.prototype.checkMargins = function(oBlock) {
        if(oBlock.bbox.x0 < this.marginL) {
            this.marginL = oBlock.bbox.x0;
        }
        if(oBlock.bbox.y0 < this.marginT) {
            this.marginT = oBlock.bbox.y0;
        }
        if(this.getWidth() - oBlock.bbox.x1 < this.marginR) {
            this.marginR = this.getWidth() - oBlock.bbox.x1;
        }
        if(this.getHeight() - oBlock.bbox.y1 < this.marginB) {
            this.marginB = this.getHeight() - oBlock.bbox.y1;
        }
    };
    CPage.prototype.getBlockParams = function(oBlock) {

    };
    CPage.prototype.detectParagraphAlign = function(oParagraph) {
        return ;
    };
    CPage.prototype.dataProcess = function() {
        if(!this.data) {
            return [];
        }
        var aSortedBlocks = this.data.blocks.slice(0, this.data.blocks.length);
        var aSections = [];
        if(aSortedBlocks.length > 0) {
            aSortedBlocks.sort(function (a, b) {
                return a.bbox.y0 - b.bbox.y0;
            });
            var oCurSection;
            var oBlock, oPreviousSection;
            oCurSection = new CSection(this);
            aSections.push(oCurSection);
            for(var nBlockIndex = 0; nBlockIndex < aSortedBlocks.length; ++nBlockIndex) {
                oBlock = aSortedBlocks[nBlockIndex];
                if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_IMAGE) {
                    oCurSection.addImage(oBlock, this);
                }
                else if(MAP_TESSERACT_AREAS[oBlock.blocktype] === AREA_TYPE_TEXT) {
                    this.checkMargins(oBlock);
                    if(!oCurSection.hasBlocks()) {
                        oCurSection.addBlock(oBlock);
                        continue;
                    }
                    if(oBlock.bbox.y0 > oCurSection.maxY) {
                        if(oCurSection.hasBlocks()) {
                            oCurSection.findColumns();
                            if(oPreviousSection) {
                                if(oPreviousSection.union(oCurSection)){
                                    aSections.pop();
                                }
                                else {
                                    oPreviousSection = oCurSection;
                                }
                            }
                            else {
                                oPreviousSection = oCurSection;
                            }
                            oCurSection = new CSection(this);
                        }
                        oCurSection.addBlock(oBlock);
                        aSections.push(oCurSection);
                    }
                    else {
                        oCurSection.addBlock(oBlock);
                    }
                }
            }
            oCurSection.findColumns();
            if(oPreviousSection && oPreviousSection.union(oCurSection)){
                aSections.pop();
            }
           // oCurSection.setType("continuous");

        }
        for(var i = 0; i < aSections.length; ++i) {
            //aSections[i].marginL = this.marginL;
            aSections[i].marginT = this.marginT;
            //aSections[i].marginR = this.marginR;
            aSections[i].marginB = this.marginB;
        }
        return aSections;
    };
    CPage.prototype.drawBlockRects = function(oDrawing, oCtx) {
        if(this.data) {
            for(var i = 0; i < this.data.blocks.length; ++i) {

                var oBlock = this.data.blocks[i];
                var sColor = "#CCCCCC";
                if(MAP_COLORS[MAP_TESSERACT_AREAS[oBlock.blocktype]]) {
                    sColor = MAP_COLORS[MAP_TESSERACT_AREAS[oBlock.blocktype]];
                }

                var bb = oBlock.bbox;
                var fAlpha = 0.3;
                oDrawing.drawBlockRect(oCtx, bb.x0, bb.y0, bb.x1, bb.y1, sColor, fAlpha, !(oBlock.bRecognized === false) || MAP_TESSERACT_AREAS[oBlock.blocktype] !== AREA_TYPE_TEXT);
            }
        }
    };
    CPage.prototype.convertPixToMM = function(nPix) {

        return nPix / this.img.getDPI() * 25.4;
    };
    CPage.prototype.convertPixToTwips = function(nPix) {
        return (nPix / this.img.getDPI()   * 1440) >> 0;
    };
    CPage.prototype.convertPixToEMU = function(nPix) {
        return (nPix / this.img.getDPI()   * 914400) >> 0;
    };

    function CImage(oFile, oPage) {
        this.page = oPage;
        this.status = IMAGE_STATUS_LOADING;
        this.canvas = null;
        this.dpi = 300;
        var oThis = this;
        if(oFile.type === "image/tiff" || oFile.type === "image/x-tiff") {

            var oFileReader = new FileReader();
            oFileReader.onloadend = function() {
                var oTiff = new Tiff({buffer: oFileReader.result});
                oThis.canvas = oTiff.toCanvas();
                if(oThis.canvas) {
                    oThis.status = IMAGE_STATUS_COMPLETE;
                    oThis.page.parent.startRecognize();
                }
                else {
                    oThis.status = IMAGE_STATUS_ERROR;
                }
                oThis.page.onPageUpdate();
            };
            oFileReader.readAsArrayBuffer(oFile);
        }
        else if(oFile.type === "image/jpeg" || oFile.type === "image/png") {
            var oFileReader = new FileReader();
            oFileReader.onloadend = function() {
                var oDataView = new DataView(oFileReader.result);
                var nCurPos = 0;
                var nLength = oFileReader.result.byteLength;
                var SOI_MARKER = 0xD8;
                var APP0_MARKER = 0xE0;
                var APP1_MARKER = 0xE1;
                var nCode;
                while(nCurPos < nLength) {
                    nCode = oDataView.getUint8(nCurPos++);
                    if(0xFF !== nCode) {
                        break;
                    }
                    else {
                        nCode = oDataView.getUint8(nCurPos++);
                        if(nCode === SOI_MARKER) {
                            continue;
                        }
                        else {
                            var nRecordLength = oDataView.getUint16(nCurPos);
                            var nEndPos = nCurPos + nRecordLength;
                            nCurPos += 2;
                            if(nCode === APP0_MARKER) {
                                var sAPP0Type = "";
                                sAPP0Type += String.fromCharCode(oDataView.getUint8(nCurPos++));
                                sAPP0Type += String.fromCharCode(oDataView.getUint8(nCurPos++));
                                sAPP0Type += String.fromCharCode(oDataView.getUint8(nCurPos++));
                                sAPP0Type += String.fromCharCode(oDataView.getUint8(nCurPos++));
                                nCurPos++;
                                if("JFIF" === sAPP0Type) {
                                    nCurPos += 2;//APP0.version
                                    var nUnit = oDataView.getUint8(nCurPos++);
                                    var Xdensity = oDataView.getUint16(nCurPos); nCurPos += 2;
                                    var Ydensity = oDataView.getUint16(nCurPos); nCurPos += 2;
                                    if(nUnit === 0) {

                                    }
                                    else if(nUnit === 1) {
                                        oThis.dpi = Xdensity;
                                        break;
                                    }
                                    else if(nUnit === 2) {
                                        oThis.dpi = Xdensity * 2.54;
                                        break;
                                    }
                                }
                                else {

                                }
                            }
                            else if(nCode === APP1_MARKER) {

                            }
                            nCurPos = nEndPos;
                        }
                    }
                }
                var oImg = new Image();
                oImg.onload = function(){
                    oThis.canvas = document.createElement("canvas");
                    oThis.canvas.width = oImg.width;
                    oThis.canvas.height = oImg.height;
                    var oContext = oThis.canvas.getContext("2d");
                    oContext.drawImage(oImg, 0, 0, oImg.width, oImg.height);
                    oThis.status = IMAGE_STATUS_COMPLETE;
                    oThis.page.onPageUpdate();
                    oThis.page.parent.startRecognize();
                    oImg = undefined;
                };
                oImg.onerror = function(){
                    oThis.status = IMAGE_STATUS_ERROR;
                    oThis.page.onPageUpdate();
                    oImg = undefined;
                };
                oImg.src = URL.createObjectURL(oFile);
                //ReadWord(SOI_marker);//0
                //ReadWord(APP0.marker);//2
                //ReadWord(APP0.len);//4
                //ReadByte(APP0.JFIF[0]);//6
                //ReadByte(APP0.JFIF[1]);//7
                //ReadByte(APP0.JFIF[2]);//8
                //ReadByte(APP0.JFIF[3]);//9
                //ReadByte(APP0.JFIF[4]);//10
                //ReadWord(APP0.version);//11
                //ReadByte(APP0.density_unit);//13
                //ReadWord(APP0.Xdensity);//14
                //ReadWord(APP0.Ydensity);//16
                //ReadWord(APP0.thumbnail);//18
            };
            oFileReader.readAsArrayBuffer(oFile);

        }
        else {

        }
    }
    CImage.prototype.draw = function(oCtx) {
        if(this.status === IMAGE_STATUS_COMPLETE) {
            oCtx.drawImage(this.canvas, 0, 0);
        }
        else {
            //TODO: Draw red cross
            oCtx.fillRect(0, 0, 100, 100);
        }
    };
    CImage.prototype.getDPI = function() {
        return this.dpi;
    };
    CImage.prototype.getWidth = function() {
        if(this.status === IMAGE_STATUS_COMPLETE) {
            return this.canvas.width;
        }
        return 50;
    };
    CImage.prototype.getHeight = function() {
        if(this.status === IMAGE_STATUS_COMPLETE) {
            return this.canvas.height;
        }
        return 50;
    };
    CImage.prototype.getImageData = function(x, y, w, h) {
        if(this.status === IMAGE_STATUS_COMPLETE) {
            var oCanvas = document.createElement("canvas");
            oCanvas.width = w;
            oCanvas.height = h;
            var oContext = oCanvas.getContext("2d");
            oContext.drawImage(this.canvas, x, y, w, h, 0, 0, w, h);
            return oCanvas.toDataURL();
        }
        return ""
    };
    CImage.prototype.drawToCanvas = function(oCanvas, x, y, w, h) {
        if(this.status === IMAGE_STATUS_COMPLETE) {
            var oContext = oCanvas.getContext("2d");
            oContext.drawImage(this.canvas, x, y, w, h, 0, 0, oCanvas.width, oCanvas.height);
        }
        return ""
    };

    function CArea(nType, oBBox) {
        this.type = nType;
        this.bbox = oBBox;
    }
    CArea.prototype.isIntersect = function(oArea) {
        return this.isIntersectX(oArea) && this.isIntersectY(oArea);
    };
    CArea.prototype.isIntersectX = function(oArea) {
        var oBBox = this.bbox;
        var oOtherBBox = oArea.bbox;
        return !(oBBox.x0 > oOtherBBox.x1 || oBBox.x1 < oOtherBBox.x0);
    };
    CArea.prototype.isIntersectY = function(oArea) {
        var oBBox = this.bbox;
        var oOtherBBox = oArea.bbox;
        return !(oBBox.y0 > oOtherBBox.y1 || oBBox.y1 < oOtherBBox.y0);
    };

    //export
    window.OCR = window.OCR || {};
    window.OCR.CRecognition = CRecognition;
})();
