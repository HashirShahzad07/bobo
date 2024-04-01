"use_strict";

const URL = window.webkitURL || window.URL;
const WIDTH = 711; // 16:9 aspect ratio
const HEIGHT = 400;

const stage = new Konva.Stage({
	container: 'meme-canvas',
	width: WIDTH,
	height: HEIGHT,
});

const layer = new Konva.Layer();
stage.add(layer);

// unique transformer to be used for all shapes
const tr = new Konva.Transformer({
	ignoreStroke: true,
	// set minimum width of text
	boundBoxFunc: function (oldBox, newBox) {
		newBox.width = Math.max(30, newBox.width);
		return newBox;
	},
});
tr.keepRatio(true); // for text resize
layer.add(tr);

// add a new feature, lets add ability to draw selection rectangle
const selectionRectangle = new Konva.Rect({
	fill: 'rgba(0,0,255,0.5)',
	visible: false,
});
layer.add(selectionRectangle);

// function from https://stackoverflow.com/a/15832662/512042
function downloadURI(uri, name) {
	let link = document.createElement('a');
	link.download = name;
	link.href = uri;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	delete link;
}

// must be a global variable
let bgImg

function uploadBackgroundImage(uploadedImg) {
	if (!!bgImg) bgImg.destroy(); // remove old bg img if exists

	const bgWidth = Math.min(uploadedImg.width, WIDTH);
	const heightWidthRatio = uploadedImg.height / uploadedImg.width;
	const bgHeight = bgWidth * heightWidthRatio
	console.log(bgWidth, heightWidthRatio, bgHeight)

	// change Konva stage size to match bg img
	stage.width(bgWidth);
	stage.height(bgHeight);

	// change Konva stage parent size to match stage
	$('#meme-canvas-wrapper').width(bgWidth);
	// $('##meme-canvas-wrapper').height(bgHeight);

	bgImg = new Konva.Image({
		image: uploadedImg,
		x: 0,
		y: 0,
		width: bgWidth,
		height: bgHeight,
		draggable: false,
		rotation: 0
	});

	layer.add(bgImg);
	bgImg.zIndex(0);
	layer.draw();
}

function deleteSelectedNodes() {
	const selectedNodes = tr.nodes().slice(); // copy
	if (!selectedNodes.length) return;

	// remove all selected nodes
	for (const node of selectedNodes) {
		node.destroy();
	}

	// empty selection
	tr.nodes([]);

	layer.draw();
}

$(document).ready(function () {
	const canvasOffsetLeft = $('#meme-canvas').offset().left;
	const canvasOffsetTop = $('#meme-canvas').offset().top;

	//
	// Click to add hair image
	//

	$("#meme-hair-list > img").on('click', function () {
		// create new image on every hair click (otherwise all hairs use the same image url)
		let hairImage = new Image();
		hairImage.src = this.src;

		$("#meme-hair-list > .selected").removeClass("selected");
		$(this).addClass("selected");

		const hair = new Konva.Image({
			image: hairImage, // data URI
			x: 30,
			y: 30,
			width: 114, // original width: 571
			height: 74, // original height: 370
			draggable: true,
			rotation: 0
		});

		layer.add(hair);
		layer.draw();
	})

	//
	// Upload background image through button
	//

	$("#meme-canvas-bg-image-input").change((e) => {
		const uploadedImg = new Image();
		uploadedImg.src = URL.createObjectURL(e.target.files[0]);
		uploadedImg.onload = () => uploadBackgroundImage(uploadedImg);
	});

	//
	// Drag and drop image onto canvas (simple solution, doesn't work for IE)
	//

	const memeCanvasWrapper = document.getElementById('meme-canvas-wrapper');

	// dragover & dragenter events need to have 'preventDefault' called in order for the 'drop' event to register. 
	// See: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_operations#droptargets
	memeCanvasWrapper.ondragover = memeCanvasWrapper.ondragenter = (e) => e.preventDefault();
	memeCanvasWrapper.ondrop = function (e) {
		e.preventDefault();
		const uploadedImg = new Image();
		uploadedImg.src = URL.createObjectURL(e.dataTransfer.files[0]);
		uploadedImg.onload = () => uploadBackgroundImage(uploadedImg);
	};

	//
	// Add editable text object on click
	//

	$('#meme-canvas-add-text-btn').on('click', () => {
		const textColor = $('#meme-canvas-text-color').val();
		const textNode = new Konva.Text({
			text: 'Text box',
			x: 150,
			y: 30,
			fontSize: 18,
			draggable: true,
			width: 200,
			fill: textColor,
		});

		textNode.on('transform', function () {
			// reset scale, so only with is changing by transformer
			textNode.setAttrs({
				width: textNode.width() * textNode.scaleX(),
				fontSize: textNode.fontSize() * textNode.scaleX(),
				scale: 1,
			});
		});

		// textNode.on('transformend', function () {
		// 	this.fontSize(this.fontSize() * this.scaleX());
		// 	this.scale({ x: 1 });
		// 	layer.batchDraw();
		// });

		layer.add(textNode);
		layer.draw();

		textNode.on('dblclick dbltap', () => {
			// hide text node and transformer:
			textNode.hide();
			tr.hide();

			// create textarea over canvas with absolute position
			// first we need to find position for textarea
			// how to find it?

			// at first lets find position of text node relative to the stage:
			var textPosition = textNode.absolutePosition();

			// so position of textarea will be the sum of positions above:
			var areaPosition = {
				x: canvasOffsetLeft + stage.container().offsetLeft + textPosition.x,
				y: canvasOffsetTop + stage.container().offsetTop + textPosition.y,
			};

			// create textarea and style it
			var textarea = document.createElement('textarea');
			document.body.appendChild(textarea);

			// apply many styles to match text on canvas as close as possible
			// remember that text rendering on canvas and on the textarea can be different
			// and sometimes it is hard to make it 100% the same. But we will try...
			textarea.value = textNode.text();
			textarea.style.position = 'absolute';
			textarea.style.top = areaPosition.y + 'px';
			textarea.style.left = areaPosition.x + 'px';
			textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
			textarea.style.height =
				textNode.height() - textNode.padding() * 2 + 5 + 'px';
			textarea.style.fontSize = textNode.fontSize() + 'px';
			textarea.style.border = 'none';
			textarea.style.padding = '0px';
			textarea.style.margin = '0px';
			textarea.style.overflow = 'hidden';
			textarea.style.background = 'none';
			textarea.style.outline = 'none';
			textarea.style.resize = 'none';
			textarea.style.lineHeight = textNode.lineHeight();
			textarea.style.fontFamily = textNode.fontFamily();
			textarea.style.transformOrigin = 'left top';
			textarea.style.textAlign = textNode.align();
			textarea.style.color = textNode.fill();
			rotation = textNode.rotation();
			var transform = '';
			if (rotation) {
				transform += 'rotateZ(' + rotation + 'deg)';
			}

			var px = 0;
			// also we need to slightly move textarea on firefox
			// because it jumps a bit
			var isFirefox =
				navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
			if (isFirefox) {
				px += 2 + Math.round(textNode.fontSize() / 20);
			}
			transform += 'translateY(-' + px + 'px)';

			textarea.style.transform = transform;

			// reset height
			textarea.style.height = 'auto';
			// after browsers resized it we can set actual value
			textarea.style.height = textarea.scrollHeight + 3 + 'px';

			textarea.focus();

			function removeTextarea() {
				textarea.parentNode.removeChild(textarea);
				window.removeEventListener('click', handleOutsideClick);
				textNode.show();
				tr.show();
				tr.forceUpdate();
			}

			function setTextareaWidth(newWidth) {
				if (!newWidth) {
					// set width for placeholder
					newWidth = textNode.placeholder.length * textNode.fontSize();
				}
				// some extra fixes on different browsers
				var isSafari = /^((?!chrome|android).)*safari/i.test(
					navigator.userAgent
				);
				var isFirefox =
					navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
				if (isSafari || isFirefox) {
					newWidth = Math.ceil(newWidth);
				}

				var isEdge =
					document.documentMode || /Edge/.test(navigator.userAgent);
				if (isEdge) {
					newWidth += 1;
				}
				textarea.style.width = newWidth + 'px';
			}

			textarea.addEventListener('keydown', function (e) {
				// hide on enter
				// but don't hide on shift + enter
				if (e.keyCode === 13 && !e.shiftKey) {
					textNode.text(textarea.value);
					removeTextarea();
				}
				// on esc do not set value back to node
				if (e.keyCode === 27) {
					removeTextarea();
				}
			});

			textarea.addEventListener('keydown', function (e) {
				scale = textNode.getAbsoluteScale().x;
				setTextareaWidth(textNode.width() * scale);
				textarea.style.height = 'auto';
				textarea.style.height =
					textarea.scrollHeight + textNode.fontSize() + 'px';
			});

			function handleOutsideClick(e) {
				if (e.target !== textarea) {
					textNode.text(textarea.value);
					removeTextarea();
				}
			}
			setTimeout(() => {
				window.addEventListener('click', handleOutsideClick);
			});
		});
	});

	//
	// Download image as file
	//

	$('#meme-canvas-save-btn').on('click', () => {
		// before saving the image, hide the transformer (and show afterwards)
		tr.hide()
		const dataURL = stage.toDataURL({ pixelRatio: 3 });
		downloadURI(dataURL, 'nyoo-wondy.png');
		tr.show();
	});

	//
	// Add ability to select and transform shapes
	//
	// From: https://konvajs.org/docs/select_and_transform/Basic_demo.html#page-title
	//

	let x1, y1, x2, y2;
	let selecting = false;
	stage.on('mousedown touchstart', (e) => {
		// do nothing if we mousedown on any shape
		if (e.target !== stage) {
			return;
		}
		e.evt.preventDefault();
		x1 = stage.getPointerPosition().x;
		y1 = stage.getPointerPosition().y;
		x2 = stage.getPointerPosition().x;
		y2 = stage.getPointerPosition().y;

		selectionRectangle.width(0);
		selectionRectangle.height(0);
		selecting = true;
	});

	stage.on('mousemove touchmove', (e) => {
		// do nothing if we didn't start selection
		if (!selecting) {
			return;
		}
		e.evt.preventDefault();
		x2 = stage.getPointerPosition().x;
		y2 = stage.getPointerPosition().y;

		selectionRectangle.setAttrs({
			visible: true,
			x: Math.min(x1, x2),
			y: Math.min(y1, y2),
			width: Math.abs(x2 - x1),
			height: Math.abs(y2 - y1),
		});
	});

	stage.on('mouseup touchend', (e) => {
		// do nothing if we didn't start selection
		selecting = false;
		if (!selectionRectangle.visible()) {
			return;
		}
		e.evt.preventDefault();
		// update visibility in timeout, so we can check it in click event
		selectionRectangle.visible(false);
		var shapes = stage.find('.rect');
		var box = selectionRectangle.getClientRect();
		var selected = shapes.filter((shape) =>
			Konva.Util.haveIntersection(box, shape.getClientRect())
		);
		tr.nodes(selected);
	});

	// clicks should select/deselect shapes
	// NOTE: all if statements must come in order
	stage.on('click tap', function (e) {
		// if we are selecting with rect, do nothing
		if (selectionRectangle.visible()) {
			return;
		}

		// if click on empty area (or bg img) - remove all selections
		if (e.target === stage || e.target === bgImg) {
			tr.nodes([]);
			return;
		}

		// do we pressed shift or ctrl?
		const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
		const isSelected = tr.nodes().indexOf(e.target) >= 0;

		if (!metaPressed && !isSelected) {
			// if no key pressed and the node is not selected
			// select just one
			tr.nodes([e.target]);
		} else if (metaPressed && isSelected) {
			// if we pressed keys and node was selected
			// we need to remove it from selection:
			const selectedNodes = tr.nodes().slice(); // use slice to have new copy of array
			// remove node from array
			selectedNodes.splice(selectedNodes.indexOf(e.target), 1);
			tr.nodes(selectedNodes);
		} else if (metaPressed && !isSelected) {
			// add the node into selection
			const selectedNodes = tr.nodes().concat([e.target]);
			tr.nodes(selectedNodes);
		}
	});

	//
	// Allow deleting shapes by right clicking and selecting delete
	//

	const menuNode = document.getElementById('meme-item-menu');
	const containerRect = stage.container().getBoundingClientRect();
	let rightClickedShape

	stage.on('contextmenu', function (e) {
		// prevent default behavior
		e.evt.preventDefault();
		// if we are on empty place of the stage we will do nothing
		if (e.target === stage) return;

		rightClickedShape = e.target;

		// show menu
		menuNode.style.display = 'initial';
		menuNode.style.top = containerRect.top + stage.getPointerPosition().y + 4 + 'px';
		menuNode.style.left = containerRect.left + stage.getPointerPosition().x + 4 + 'px';
	});

	$('#meme-item-delete-btn').on('click', () => {
		if (!rightClickedShape) return;

		// remove node from selection
		const selectedNodes = tr.nodes().slice();
		selectedNodes.splice(selectedNodes.indexOf(rightClickedShape), 1);
		tr.nodes(selectedNodes);

		// remove shape
		rightClickedShape.destroy();
		rightClickedShape = null;

		layer.draw();
	});

	// hide meme item menu
	$(window).on('click', () => menuNode.style.display = 'none');

	//
	// Allow deleting shapes by clicking "Delete selected" button with selected objects
	// Also allow deleting by pressing "Delete" (backspace) key
	//

	$('#meme-canvas-delete-select-btn').on('click', () => deleteSelectedNodes());

	$('html').keyup((e) => {
		// 8 is backspace
		if (e.keyCode === 8) deleteSelectedNodes()
	})
})
