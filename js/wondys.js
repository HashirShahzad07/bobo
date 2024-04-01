const FLIP_IMG_LIST = [
	'ass/stickers/trump.png',
	'ass/stickers/green-wojak.png',
	'ass/stickers/peephole.png',
	'ass/stickers/up-1-percent.png',
	'ass/stickers/sniper.png',
]

$(window).on('load', function () {
	"use strict";

	$('#wondys-wonderland').on('click touchstart', () => {
		const audio = document.getElementById('wondys-wonderland-audio');
		if (this.innerText === "plei wondys wonderland") {
			audio.play();
			this.innerText = "pawze wondys wonderland";
		} else {
			audio.pause();
			audio.currentTime = 0;
			this.innerText = "plei wondys wonderland";
		}
	});

	// $('#wondy-welkum-card').on('hover', function () {
	// 	const rand = getRandomInt(0, FLIP_IMG_LIST.length - 1);
	// 	$('#wondy-welkum-card-back img').src = FLIP_IMG_LIST[rand];
	// })

	$("#wondy-fall").Snowfall({
		//Sizing
		sizingMode: 'parent',//Either css (get pixel value from element css), parent (size canvas to parent size), explicit (use values below) or window (full screen canvas)
		// width: 800,//In case of sizingMode explicit: use this width for the canvas
		// height: 600,//In case of sizingMode explicit: use this height for the canvas

		//Amount of particles
		amount: 25,//Amount of particles that will be created

		//Positioning
		horizontalOffsetLeft: 0,//Horizontal offset from the left (can be positive or negative) in px, to shift starting point, useful when having diagonal snow
		horizontalOffsetRight: 0,//Horizontal offset from the right (can be positive or negative) in px, to shift starting point, useful when having diagonal snow
		verticalOffsetTop: 0,//Vertical offset from the top (can be positive or negative) in px, useful for the start position of the snow above the canvas

		//Vertical speed configuration
		verticalSpeed: 23,//Somewhere between 0.5 and 10 works best
		randomVerticalSpeed: true,//True or false
		minimumRandomVerticalSpeed: 3,//Minimum shouldn't be lower than zero and probably heigher than 0.5
		maxiumumRandomVerticalSpeed: 5,//Maxiumum shouln't be lower than zero and probably lower than 10

		//Horizontal speed configuration
		horizontalSpeed: 0,//Somewhere between -10 and 10 works best, negative values for left moving particles
		randomHorizontalSpeed: true,//True or false
		minimumRandomHorizontalSpeed: -5,//Minimum horizontal speed, can be negative for moving to the left.
		maxiumumRandomHorizontalSpeed: 5,//Maxiumum horizontal speed, can be negative for moving to the left.
		horizontalMirroring: true,//When set to true, particles which go out of screen horizontally will emerge at the other side

		//Wind
		wind: true,//Set to true to enable a basic wind element to the particles
		minimumWind: -5,//Minimum wind speed (can be negative)
		maximumWind: 5,//Maximun wind speed (can be negative)
		windPeriod: 5,//Period in which the wind comes full circle again and starts again

		//Graphics
		graphicMode: true,//True or false, draws a circle when false
		radius: 4,//In case graphicMode false: radius for drawn circles
		randomRadius: true,//In case graphicMode false: toggle random radius for drawn circles
		minimumRandomRadius: 1,//In case graphicMode false: minimum random radius
		maxiumRandomRadius: 2,//In case graphicMode false: maximum random radius
		graphics: [
			'ass/icons/fries-small.png',
			'ass/icons/burger-small.png',
			'ass/icons/frosty-small.png'
		]//In case graphicMode true: array of image urls to use
	});
});

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
