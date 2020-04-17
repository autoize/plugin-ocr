"use strict";
(function() {
    var sOCRMainCanvasId = "ocr_main_canvas";
    var sOCROverlayCanvasId = "ocr_overlay_canvas";
    var sOCRFakeDivId = "ocr_fake_div";
    var sOCRFakeDivParentId = "ocr_fake_div_parent";
    var sOCRMaskCanvasId = "ocr_mask_canvas";
    var sCanvasStyle = "display: block; position: absolute; padding: 0; margin: 0; user-select: none; left: 0px; top: 0px; width: 100%; height: 100%; background: transparent;"
    var oDrawing = null;


    var MATRIX_ORDER_PREPEND = 0;
    var MATRIX_ORDER_APPEND  = 1;

    function CDrawing(oParent, oRecognition) {
        if(oDrawing !== null) {
            return oDrawing;
        }

        this.bMouseCaptured = false;
        this.bRecognition = false;
        oDrawing = this;
        this.parent = oParent;
        var oCanvas = document.getElementById(sOCRMainCanvasId);
        if(!oCanvas) {
            oCanvas = document.createElement("canvas");
            oCanvas.id = sOCRMainCanvasId;
            oCanvas.style.cssText = sCanvasStyle;
            oCanvas.style.zIndex = "1";
            oParent.appendChild(oCanvas);
        }
        this.screenScale =  window.Asc.plugin.retinaPixelRatio;
        this.canvas = oCanvas;
        this.overlay = new COverlay(this, oParent);
        this.page = -1;
        this.recognition = oRecognition;
        this.recognition.setDrawing(this);


        this.zoom = 1.0;
        this.pageX = 0;
        this.pageY = 0;

        this.pageWidth = -1;
        this.pageHeight = -1;

        this.fakeDivParent = document.createElement("div");
        this.fakeDivParent.id = sOCRFakeDivParentId;
        this.fakeDivParent.style.cssText = sCanvasStyle;
        this.fakeDivParent.style.position = "relative";
        this.fakeDivParent.style.zIndex = "3";
        oParent.appendChild(this.fakeDivParent);
        var oDiv = document.getElementById(sOCRFakeDivId);
        if(!oDiv) {
            oDiv = document.createElement("div");
            oDiv.id = sOCRFakeDivId;
            oDiv.style.cssText = sCanvasStyle;
            oDiv.style.position = "relative";
            this.fakeDivParent.appendChild(oDiv);
        }
        this.fakeDiv = oDiv;

        $(this.fakeDivParent).mousedown(function (e) {
            oDrawing.onMouseDown(e);
            e.stopPropagation();
            oDrawing.bMouseCaptured = true;
        });
        $(this.fakeDivParent).mousemove(function (e) {
            oDrawing.onMouseMove(e);
            e.stopPropagation();
        });
        $(this.fakeDivParent).mouseup(function (e) {
            oDrawing.onMouseUp(e);
            e.stopPropagation();
            oDrawing.bMouseCaptured = false;
        });

        $(window).mousemove(function (e) {

            if( oDrawing.bMouseCaptured) {
                oDrawing.onMouseMove(e);
            }
        });
        $(window).mouseup(function (e) {
            if( oDrawing.bMouseCaptured) {
                oDrawing.onMouseUp(e);
                oDrawing.bMouseCaptured = false;
            }
        });

        $(window).on('keydown', function (event) {
            oParent.stopScroll = !!(event.ctrlKey || event.metakey);
        });
        $(window).on('keypress', function (event) {
            oParent.stopScroll = !!(event.ctrlKey || event.metakey);
        });
        $(window).on('keyup', function (event) {
            oParent.stopScroll = !!(event.ctrlKey || event.metakey);
        });

        $(this.fakeDivParent).on('keydown', function (event) {
            oParent.stopScroll = !!(event.ctrlKey || event.metakey);
        });
        $(this.fakeDivParent).on('keypress', function (event) {
            oParent.stopScroll = !!(event.ctrlKey || event.metakey);
        });
        $(this.fakeDivParent).on('keyup', function (event) {
            oParent.stopScroll = !!(event.ctrlKey || event.metakey);
        });

        $(this.fakeDivParent).on('wheel', function (event) {
            if(oParent.stopScroll) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
                var delta = 0;

                if (undefined !== event.originalEvent.wheelDelta && event.originalEvent.wheelDelta !== 0)
                {
                    delta = event.originalEvent.wheelDelta;
                }
                else if (undefined !== event.originalEvent.detail && event.originalEvent.detail !== 0)
                {
                    delta = event.originalEvent.detail;
                }
                if(delta !== 0) {

                    var nClientWidth = oDrawing.getClientWidth();
                    var nClientHeight = oDrawing.getClientHeight();
                    var oImageC = oDrawing.convertScreenToImage(nClientWidth / 2 + 0.5 >> 0, nClientHeight / 2 + 0.5 >> 0);
                    if(delta > 0) {
                        oDrawing.zoom += 0.1;
                    }
                    else {
                        oDrawing.zoom -= 0.1;
                    }
                    oDrawing.zoom *= 10;
                    oDrawing.zoom = ((oDrawing.zoom + 0.5 ) >> 0);
                    oDrawing.zoom /= 10;
                    oDrawing.zoom = Math.min(32, Math.max(0.1, oDrawing.zoom));
                    oDrawing.pageX = 0;
                    oDrawing.pageY = 0;

                    var nPageWidth = oDrawing.getPageWidth();
                    var nPageHeight = oDrawing.getPageHeight();

                    oDrawing.pageX = 0;
                    oDrawing.pageY = 0;

                    var oScreenC = oDrawing.convertImageToScreen(oImageC.x, oImageC.y);

                    if(nPageWidth <= nClientWidth) {
                        oDrawing.pageX = ((nClientWidth - nPageWidth) / 2 + 0.5) >> 0;
                    }
                    else {
                        oDrawing.pageX = Math.min(0, (nClientWidth / 2 - oScreenC.x  + 0.5) >> 0)
                    }
                    if(nPageHeight <= nClientHeight) {
                        oDrawing.pageY = ((nClientHeight - nPageHeight) / 2 + 0.5) >> 0;
                    }
                    else {
                        oDrawing.pageY = Math.min(0, (nClientHeight / 2 - oScreenC.y  + 0.5) >> 0)
                    }
                    oParent.stopScroll = false;
                    oDrawing.drawCurPage();
                    oDrawing.updateScrolls();
                }
            }
        });

        this.scroll = new PerfectScrollbar('#' + this.fakeDivParent.id, {
            minScrollbarLength: 50
        });

        $(this.fakeDivParent).on('ps-scroll-x', function () {

            var nOld = oDrawing.pageX;
            var nPageWidth = oDrawing.getPageWidth();
            var nClientWidth = oDrawing.getClientWidth();
            if(nPageWidth <= nClientWidth) {
                oDrawing.pageX = ((nClientWidth - nPageWidth / oDrawing.screenScale) / 2 + 0.5) >> 0;
            }
            else {
                oDrawing.pageX = -oDrawing.fakeDivParent.scrollLeft;
            }
            if(nOld !== oDrawing.pageX) {
                oDrawing.drawCurPage();
            }
        });
        $(this.fakeDivParent).on('ps-scroll-y', function () {
            var nOld = oDrawing.pageY;
            var nPageHeight= oDrawing.getPageHeight();
            var nClientHeight = oDrawing.getClientHeight();
            if(nPageHeight <= nClientHeight) {
                oDrawing.pageY = ((nClientHeight - nPageHeight / oDrawing.screenScale) / 2 + 0.5) >> 0;
            }
            else {
                oDrawing.pageY = -oDrawing.fakeDivParent.scrollTop;
            }
            if(nOld !== oDrawing.pageY) {
                oDrawing.drawCurPage();
            }
        });


        oCanvas = document.getElementById(sOCRMaskCanvasId);
        if(!oCanvas) {
            oCanvas = document.createElement("canvas");
            oCanvas.id = sOCRMaskCanvasId;
            oCanvas.style.cssText = sCanvasStyle;
            oCanvas.style.zIndex = "10000";
            oCanvas.hidden = true;
            oParent.appendChild(oCanvas);
        }
        this.maskCanvas = oCanvas;
        $(this.maskCanvas).hide();

    }

CDrawing.prototype.updateCursor = function(sType) {

    $(this.fakeDivParent).css("cursor", sType);
};

    CDrawing.prototype.startRecognitionMask = function() {

        this.bRecognition = true;
        this.progress = 0;
        this.animCount = 0;
        var _t = this;
        $(this.maskCanvas).show();
        this.animId = requestAnimationFrame(function () {_t.drawMaskFrame()});
        this.recognition.updateInterfaceState();
        return function (oProgress) {
            if(oProgress.status === "recognizing text") {
                _t.progress = oProgress.progress;
            }
        };
    };

    CDrawing.prototype.drawMaskFrame = function() {

        var W = this.convertToScreen(this.canvas.clientWidth);
        var H = this.convertToScreen(this.canvas.clientWidth);

        if(this.maskCanvas.width !== W || this.maskCanvas.height !== H) {
            this.maskCanvas.width = this.convertToScreen(this.maskCanvas.clientWidth);
            this.maskCanvas.height = this.convertToScreen(this.maskCanvas.clientHeight);
        }

        var oCtx = this.maskCanvas.getContext("2d");
        oCtx.globalAlpha = 0.7;
        oCtx.fillStyle = "#CCCCC";
        oCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
        oCtx.globalAlpha = 1;
        var addText = "...";
        var phase = this.animCount % 4;
        if(phase === 0) {
            addText = "   ";
        }
        else if(phase === 1) {
            addText = ".  ";
        }
        else if(phase === 2) {
            addText = ".. ";
        }
        else {
            addText = "...";
        }
        this.animCount++;
        var sText = window.Asc.plugin.tr("Recognizing") + addText + "\n " + (this.progress * 100 + .5 >> 0) + "%";
        var nSize = this.convertToScreen(20);
        oCtx.font = nSize + 'px sans-serif';
        var text = oCtx.measureText(sText);
        text.width;
        oCtx.fillStyle = "white";
        oCtx.fillText(sText, ((this.maskCanvas.width) / 2 - text.width / 2 + 0.5) >> 0, ((this.maskCanvas.height) / 2 + 0.5) >> 0);
        var _t = this;
        _t.animId = null;
        this.timeOutId = setTimeout(function () {
            _t.animId = requestAnimationFrame(function () {_t.drawMaskFrame()});
        }, 600);

    };

    CDrawing.prototype.stopRecognitionMask = function() {

        if(this.animId) {
            cancelAnimationFrame(this.animId);
        }
        if(this.timeOutId ) {
            clearTimeout(this.timeOutId);
        }
        var _t = this;
        _t.drawMaskFrame();
        this.progress = 0;
        if(this.animId) {
            cancelAnimationFrame(this.animId);
        }
        if(this.timeOutId ) {
            clearTimeout(this.timeOutId);
        }
        $(this.maskCanvas).hide();

        this.bRecognition = false;

        this.recognition.updateInterfaceState();
    };


    CDrawing.prototype.convertScreenToImage = function(x, y){
        var oM = this.getInvertDrawMatrix();
        var tx = oM.TransformPointX(x, y) + 0.5 >> 0;
        var ty = oM.TransformPointY(x, y) + 0.5 >> 0;
        return {x: tx, y: ty};
    };
    CDrawing.prototype.convertImageToScreen = function(x, y){
        var oM = this.getDrawMatrix();
        var tx = oM.TransformPointX(x, y) + 0.5 >> 0;
        var ty = oM.TransformPointY(x, y) + 0.5 >> 0;
        return {x: tx, y: ty};
    };
    CDrawing.prototype.getPageDPI = function() {
        var oPage = this.recognition.getPage(this.page);
        if(oPage) {
            return oPage.getDPI();
        }
        return 96;
    };
    CDrawing.prototype.convertToScreen = function(nPix) {
        return (nPix * this.screenScale + 0.5) >> 0;
    };
    CDrawing.prototype.convertPixToMM = function(nPix) {

        return nPix / this.getPageDPI() * 25.4;
    };
    CDrawing.prototype.convertPixToTwips = function(nPix) {
        return (nPix / this.getPageDPI()  * 1440 + 0.5) >> 0;
    };
    CDrawing.prototype.convertPixToEMU = function(nPix) {
        return (nPix / this.getPageDPI()  * 914400 + 0.5) >> 0;
    };
    CDrawing.prototype.goToPage = function(nIndex) {
        this.page = nIndex;
        var oPage = this.recognition.getPage(this.page);
        if(!oPage) {
            this.page = -1;
        }
        else {
            //TODO
            var nWidth = oPage.getWidth();
            if(nWidth > 0) {
                this.zoom = this.canvas.clientWidth / nWidth;
            }
            else {
                this.zoom = 1.0;
            }
        }

        var nPageWidth = this.getPageWidth();
        var nPageHeight = this.getPageHeight();

        this.pageX = ((this.getClientWidth() - nPageWidth) / 2 + 0.5) >> 0;
        this.pageY = ((this.getClientHeight() - nPageHeight) / 2 + 0.5) >> 0;
        this.parent.stopScroll = false;
        this.drawCurPage();
        this.updateScrolls();
    };
    CDrawing.prototype.getEventCoords = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var x = e.originalEvent.clientX - rect.left - oDrawing.fakeDivParent.scrollLeft; //x position within the element.
        var y = e.originalEvent.clientY - rect.top - oDrawing.fakeDivParent.scrollTop;  //y position within the element.
        return {x: this.convertToScreen(x), y: this.convertToScreen(y)};
    };
    CDrawing.prototype.onMouseDown = function(e) {
        var p = this.getEventCoords(e);
        p = this.convertScreenToImage(p.x, p.y);
        this.recognition.onMouseDown(e, p.x, p.y);
    };
    CDrawing.prototype.onMouseMove = function(e) {
        var p = this.getEventCoords(e);
        p = this.convertScreenToImage(p.x, p.y);
        this.recognition.onMouseMove(e, p.x, p.y);
    };
    CDrawing.prototype.onMouseUp = function(e) {
        var p = this.getEventCoords(e);
        p = this.convertScreenToImage(p.x, p.y);
        this.recognition.onMouseUp(e, p.x, p.y);
    };
    CDrawing.prototype.getDrawMatrix = function() {
        var m = new CMatrix();
        m.sx  = this.screenScale*this.zoom;
        m.shx = 0.0;
        m.shy = 0.0;
        m.sy  = this.screenScale*this.zoom;
        m.tx  = this.screenScale*this.pageX;
        m.ty  = this.screenScale*this.pageY;
        return m;
    };
    CDrawing.prototype.getInvertDrawMatrix = function() {
        return this.getDrawMatrix().Invert();
    };
    CDrawing.prototype.drawBlockRect = function(oCtx, x0, y0, x1, y1, sColor, fAlpha, bRecognized) {
        var p0 = this.convertImageToScreen(x0, y0);
        var p1 = this.convertImageToScreen(x1, y1);
        oCtx.fillStyle = sColor;
        var fAlpha_ = fAlpha;
        if(!bRecognized) {
            fAlpha_ /= 3;
        }
        oCtx.globalAlpha = fAlpha_;
        oCtx.fillRect(p0.x + 0.5, p0.y + 0.5, p1.x - p0.x, p1.y - p0.y);
        oCtx.strokeStyle = sColor;
        oCtx.lineWidth = this.convertToScreen(1);
        var oldAlpha = oCtx.globalAlpha;
        oCtx.globalAlpha = 1;
        oCtx.strokeRect(p0.x + 0.5, p0.y + 0.5, p1.x - p0.x, p1.y - p0.y);

        if(!bRecognized) {
           // oCtx.globalAlpha = fAlpha*2;
            var sText = window.Asc.plugin.tr("Not recognized");
            var nSize = this.convertToScreen(20);
            oCtx.font = nSize + 'px sans-serif';
            var text = oCtx.measureText(sText);
            text.width;
            oCtx.fillStyle = "black";
            oCtx.fillText(sText, ((p1.x + p0.x) / 2 - text.width / 2 + 0.5) >> 0, ((p1.y + p0.y) / 2 + 0.5) >> 0);

        }
        oCtx.globalAlpha = oldAlpha;
    };
    CDrawing.prototype.drawCurPage = function() {
        this.canvas.width = this.convertToScreen(this.canvas.clientWidth);
        this.canvas.height = this.convertToScreen(this.canvas.clientHeight);
        var oContext = this.canvas.getContext("2d");
        oContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var m  = this.getDrawMatrix();
        oContext.setTransform(m.sx, 0.0, 0.0, m.sy, m.tx, m.ty);

        oContext.mozImageSmoothingEnabled = true;
        oContext.imageSmoothingQuality = "high";
        oContext.webkitImageSmoothingEnabled = true;
        oContext.msImageSmoothingEnabled = true;
        oContext.imageSmoothingEnabled = true;
        this.recognition.drawPage(this.page, oContext);

        oContext.mozImageSmoothingEnabled = false;
        oContext.imageSmoothingQuality = "medium";
        oContext.webkitImageSmoothingEnabled = false;
        oContext.msImageSmoothingEnabled = false;
        oContext.imageSmoothingEnabled = false;
        oContext.resetTransform();
        this.recognition.drawPageBlockRects(this.page, oContext);
        oContext.globalAlpha = 1;
        this.overlay.update();
    };
    CDrawing.prototype.onPageUpdate = function(oPage) {
        if(oPage === this.recognition.getPage(this.page)) {
            if(oPage.getWidth() !== this.pageWidth || oPage.getHeight() !== this.pageHeight) {
                this.goToPage(this.page);
            }
            else {
                this.drawCurPage();
                this.overlay.update();
                this.updateScrolls();
            }
        }
    };
    CDrawing.prototype.getPageWidth = function() {
        var nPageWidth = 0;
        var oPage = this.recognition.getPage(this.page);
        if(oPage) {
            nPageWidth = oPage.getWidth() * this.zoom + 0.5 >> 0;
        }
        return nPageWidth;
    };
    CDrawing.prototype.getPageHeight = function() {
        var nPageHeight = 0;
        var oPage = this.recognition.getPage(this.page);
        if(oPage) {
            nPageHeight = oPage.getHeight() * this.zoom + 0.5 >> 0;
        }
        return nPageHeight;
    };
    CDrawing.prototype.getClientWidth = function() {
        return this.canvas.clientWidth;
    };
    CDrawing.prototype.getClientHeight = function() {
        return this.canvas.clientHeight;
    };
    CDrawing.prototype.updateScrolls = function() {
        var nPageWidth = this.getPageWidth();
        var nPageHeight = this.getPageHeight();
        this.fakeDiv.style.width = nPageWidth + "px";
        this.fakeDiv.style.height = nPageHeight + "px";
        this.fakeDiv.width = nPageWidth + "px";
        this.fakeDiv.height = nPageHeight + "px";
        this.fakeDivParent.scrollLeft = -this.pageX;
        this.fakeDivParent.scrollTop = -this.pageY;
        this.scroll.update();
    };

    function COverlay(oDrawing, oParent) {
        this.drawing = oDrawing;
        this.bMouseCaptured = false;
        var _t = this;
        var oCanvas = document.getElementById(sOCROverlayCanvasId);
        if(!oCanvas) {
            oCanvas = document.createElement("canvas");
            oCanvas.id = sOCROverlayCanvasId;
            oCanvas.style.cssText = sCanvasStyle;
            oCanvas.style.zIndex = "2";
            oParent.appendChild(oCanvas);
            $(oCanvas).mousedown(function (e) {
                oDrawing.onMouseDown(e);
                oDrawing.bMouseCaptured = true;
                e.stopPropagation();
            });
            $(oCanvas).mousemove(function (e) {
                oDrawing.onMouseMove(e);
                e.stopPropagation();
            });
            $(oCanvas).mouseup(function (e) {

                oDrawing.onMouseUp(e);
                e.stopPropagation();
                oDrawing.bMouseCaptured = false;
            });
        }
        this.canvas = oCanvas;
    }
    COverlay.prototype.update = function() {
        this.canvas.width = this.drawing.convertToScreen(this.canvas.clientWidth);
        this.canvas.height = this.drawing.convertToScreen(this.canvas.clientHeight);
        var oContext = this.canvas.getContext("2d");
        oContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        oContext.resetTransform();
        this.drawing.recognition.updateOverlay(this, oContext);
    };
    COverlay.prototype.drawTrack = function(oCtx, x0, y0, x1, y1, sColor) {
        var p0 = this.drawing.convertImageToScreen(x0, y0);
        var p1 = this.drawing.convertImageToScreen(x1, y1);
        oCtx.strokeStyle = sColor;
        oCtx.lineWidth = this.drawing.convertToScreen(2);
        var oldAlpha = oCtx.globalAlpha;
        oCtx.globalAlpha = 1;

        oCtx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
        oCtx.globalAlpha = oldAlpha;
        var nW = this.drawing.convertToScreen(3);
        var nL = p0.x;
        var nT = p0.y;
        var nR = p1.x;
        var nB = p1.y;
        var xC = (p0.x + p1.x) / 2 + 0.5 >> 0;
        var yC = (p0.y + p1.y) / 2 + 0.5 >> 0;
        oCtx.fillStyle = sColor;
        oCtx.fillRect(nL - nW , nT - nW, 2*nW, 2*nW);
        oCtx.fillRect(xC - nW , nT - nW, 2*nW, 2*nW);
        oCtx.fillRect(nR - nW , nT - nW, 2*nW, 2*nW);
        oCtx.fillRect(nR - nW , yC - nW, 2*nW, 2*nW);
        oCtx.fillRect(nR - nW , nB - nW, 2*nW, 2*nW);
        oCtx.fillRect(xC - nW , nB - nW, 2*nW, 2*nW);
        oCtx.fillRect(nL - nW , nB - nW, 2*nW, 2*nW);
        oCtx.fillRect(nL - nW , yC - nW, 2*nW, 2*nW);
    };
    COverlay.prototype.drawTrackObject = function (oCtx, x0, y0, x1, y1, sColor, fAlpha) {
        this.drawing.drawBlockRect(oCtx, x0, y0, x1, y1, sColor, fAlpha / 2.0, true);
    };

    function CMatrix()
    {
        this.sx  = 1.0;
        this.shx = 0.0;
        this.shy = 0.0;
        this.sy  = 1.0;
        this.tx  = 0.0;
        this.ty  = 0.0;
    }
    CMatrix.prototype =
        {
            Reset           : function()
            {
                this.sx  = 1.0;
                this.shx = 0.0;
                this.shy = 0.0;
                this.sy  = 1.0;
                this.tx  = 0.0;
                this.ty  = 0.0;
            },
            // трансформ
            Multiply        : function(matrix, order)
            {
                if (MATRIX_ORDER_PREPEND == order)
                {
                    var m = new CMatrix();
                    m.sx  = matrix.sx;
                    m.shx = matrix.shx;
                    m.shy = matrix.shy;
                    m.sy  = matrix.sy;
                    m.tx  = matrix.tx;
                    m.ty  = matrix.ty;
                    m.Multiply(this, MATRIX_ORDER_APPEND);
                    this.sx  = m.sx;
                    this.shx = m.shx;
                    this.shy = m.shy;
                    this.sy  = m.sy;
                    this.tx  = m.tx;
                    this.ty  = m.ty;
                }
                else
                {
                    var t0   = this.sx * matrix.sx + this.shy * matrix.shx;
                    var t2   = this.shx * matrix.sx + this.sy * matrix.shx;
                    var t4   = this.tx * matrix.sx + this.ty * matrix.shx + matrix.tx;
                    this.shy = this.sx * matrix.shy + this.shy * matrix.sy;
                    this.sy  = this.shx * matrix.shy + this.sy * matrix.sy;
                    this.ty  = this.tx * matrix.shy + this.ty * matrix.sy + matrix.ty;
                    this.sx  = t0;
                    this.shx = t2;
                    this.tx  = t4;
                }
                return this;
            },
            // а теперь частные случаи трансформа (для удобного пользования)
            Translate       : function(x, y, order)
            {
                var m = new CMatrix();
                m.tx  = x;
                m.ty  = y;
                this.Multiply(m, order);
            },
            Scale           : function(x, y, order)
            {
                var m = new CMatrix();
                m.sx  = x;
                m.sy  = y;
                this.Multiply(m, order);
            },
            Rotate          : function(a, order)
            {
                var m   = new CMatrix();
                var rad = deg2rad(a);
                m.sx    = Math.cos(rad);
                m.shx   = Math.sin(rad);
                m.shy   = -Math.sin(rad);
                m.sy    = Math.cos(rad);
                this.Multiply(m, order);
            },
            RotateAt        : function(a, x, y, order)
            {
                this.Translate(-x, -y, order);
                this.Rotate(a, order);
                this.Translate(x, y, order);
            },
            // determinant
            Determinant     : function()
            {
                return this.sx * this.sy - this.shy * this.shx;
            },
            // invert
            Invert          : function()
            {
                var det = this.Determinant();
                if (0.0001 > Math.abs(det))
                    return;
                var d = 1 / det;

                var t0   = this.sy * d;
                this.sy  = this.sx * d;
                this.shy = -this.shy * d;
                this.shx = -this.shx * d;

                var t4  = -this.tx * t0 - this.ty * this.shx;
                this.ty = -this.tx * this.shy - this.ty * this.sy;

                this.sx = t0;
                this.tx = t4;
                return this;
            },
            // transform point
            TransformPointX : function(x, y)
            {
                return x * this.sx + y * this.shx + this.tx;
            },
            TransformPointY : function(x, y)
            {
                return x * this.shy + y * this.sy + this.ty;
            },
            // calculate rotate angle
            GetRotation     : function()
            {
                var x1  = 0.0;
                var y1  = 0.0;
                var x2  = 1.0;
                var y2  = 0.0;
                var _x1 = this.TransformPointX(x1, y1);
                var _y1 = this.TransformPointY(x1, y1);
                var _x2 = this.TransformPointX(x2, y2);
                var _y2 = this.TransformPointY(x2, y2);

                var _y = _y2 - _y1;
                var _x = _x2 - _x1;

                if (Math.abs(_y) < 0.001)
                {
                    if (_x > 0)
                        return 0;
                    else
                        return 180;
                }
                if (Math.abs(_x) < 0.001)
                {
                    if (_y > 0)
                        return 90;
                    else
                        return 270;
                }

                var a = Math.atan2(_y, _x);
                a     = rad2deg(a);
                if (a < 0)
                    a += 360;
                return a;
            },
            // сделать дубликата
            CreateDublicate : function()
            {
                var m = new CMatrix();
                m.sx  = this.sx;
                m.shx = this.shx;
                m.shy = this.shy;
                m.sy  = this.sy;
                m.tx  = this.tx;
                m.ty  = this.ty;
                return m;
            },

            IsIdentity  : function()
            {
                if (this.sx == 1.0 &&
                    this.shx == 0.0 &&
                    this.shy == 0.0 &&
                    this.sy == 1.0 &&
                    this.tx == 0.0 &&
                    this.ty == 0.0)
                {
                    return true;
                }
                return false;
            },
            IsIdentity2 : function()
            {
                if (this.sx == 1.0 &&
                    this.shx == 0.0 &&
                    this.shy == 0.0 &&
                    this.sy == 1.0)
                {
                    return true;
                }
                return false;
            },

            GetScaleValue : function()
            {
                var x1 = this.TransformPointX(0, 0);
                var y1 = this.TransformPointY(0, 0);
                var x2 = this.TransformPointX(1, 1);
                var y2 = this.TransformPointY(1, 1);
                return Math.sqrt(((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1))/2);
            }
        };

    //export
    window.OCR = window.OCR || {};
    window.OCR.CDrawing = CDrawing;
})();
