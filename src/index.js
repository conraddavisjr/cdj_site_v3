var THREE = require('three');
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE)
var TWEEN = require('tween.js');
var dat = require('dat.gui');
import './style.css';
import stageObj from './stage.obj';
import particleImg from './particle.jpg';

/*
 WEBGL World
 */

/*
	state
 */
	// var currentCameraCoords = {x: 0, y: 550, z: 0, rx: -1.6, ry: 0, rz: 0};
	let homePageCoords = {x: 0, y: 0, z: 600, rx: 0, ry: 0, rz: 0};
	let currentCameraCoords = {x: 0, y: 0, z: 600, rx: 0, ry: 0, rz: 0};
	// let currentCameraCoords = {x: -8.5, y: 24, z: -2, rx: 0, ry: -2.6, rz: 0}; /* ABOUT SECTION */
	// let currentCameraCoords = {x: 0, y: 28, z: -5, rx: 0.1, ry: -2.87, rz: -0.0113};
	let currentPage = 'home';
	let pageIsTransitioning;

/*
	setup elements
 */
var camera;
let homeButton = document.querySelector('.home-button');
let aboutButton = document.querySelector('.about-button');
let workButton = document.querySelector('.work-button');
let skillsButton = document.querySelector('.skills-button');

/**
 * start the WebGL application
 * @return {[obj]} [this returns the application scene]
 */
function init() {
	/*
		init scene
	 */
	var scene = new THREE.Scene();
	var gui = new dat.GUI();

	/*
		build camera
	 */
	camera = new THREE.PerspectiveCamera(
		45, // field of view
		window.innerWidth / window.innerHeight, // aspect ratio
		1, // near clipping plane
		1000 // far clipping plane
	);

	// initial camera positioning
	var {
		x: startX, y: startY, z: startZ,
		rx: startRX, ry: startRY, rz: startRZ
	} = homePageCoords;

	camera.position.set(startX, startY, startZ);
	camera.rotation.set(startRX, startRY, startRZ);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	/*
		build lights
	 */
	var ambLight = getLight('ambient', ['#222']);
	var dirLight = getLight('directional', ['#fff', 0.6]);
	var centerStageLight = getLight('point', ['#fff', 0.7]);

	// About section lights
	var aboutStagelampLight = getLight('point', ['#f90', 1]);
	var aboutfloatingLight = getLight('point', ['#f90', 1]);

	// Work section lights
	// 00ff95
	var workLampLightRight = getLight('spot', ['#00a9ff', 1]);
	var workLampLightLeft = getLight('spot', ['#00a9ff', 1]);

	// Skills section lights
	var skillsfloatingLightLeft = getLight('spot', ['#ff004e', 1]);
	var skillsfloatingLightRight = getLight('spot', ['#ff78cd', 1]);
	var skillsfloatingLightMid = getLight('spot', ['#ff78cd', 1]);

	// incapsulate lamp light in a sphere
	var aboutLampLightBulb = new THREE.Mesh(
		getGeometry('sphere', [0.2, 24, 24]),
		getMaterial('basic', '#ffffdb')
	);


	// place light source within the bulb
	aboutLampLightBulb.add(aboutStagelampLight);

	/*
		position lights
	 */
	// directional lighting
	dirLight.position.set( 50, 200, 100 );

	// center stage lighting
	centerStageLight.position.set(5, 20, 0);
	centerStageLight.intensity = 0.16;

	// the light bulb for the lamp in the about section
	aboutLampLightBulb.position.set(0.2, 23.8, 30);

	// the light bulb for the lamp in the about section
	aboutfloatingLight.position.set(5, 11, 20);
	aboutfloatingLight.intensity = 0.7;

	// work section right light properties
	workLampLightRight.position.set(6, 7, 31);
	workLampLightRight.intensity = 0.8;
	workLampLightRight.angle = 0.6;
	workLampLightRight.penumbra = 0.05;
	workLampLightRight.target.position.x = 31;
	workLampLightRight.target.position.y = 31;
	workLampLightRight.target.position.z = 0;
	workLampLightRight.target.updateMatrixWorld();

	// work section left light properties
	workLampLightLeft.position.set(22, 4.5, 27);
	workLampLightLeft.intensity = 0.8;
	workLampLightLeft.angle = 0.5;
	workLampLightLeft.penumbra = 0.07;
	workLampLightLeft.target.position.x = 0.2;
	workLampLightLeft.target.position.y = 18;
	workLampLightLeft.target.position.z = 29;
	workLampLightLeft.target.updateMatrixWorld();

	// skills section left light properties
	skillsfloatingLightLeft.position.set(16, 0, -20);
	skillsfloatingLightLeft.intensity = 0.6;
	skillsfloatingLightLeft.angle = 0.6;
	skillsfloatingLightLeft.penumbra = 0.02;
	skillsfloatingLightLeft.target.position.x = 0;
	skillsfloatingLightLeft.target.position.y = 5;
	skillsfloatingLightLeft.target.position.z = -17;
	skillsfloatingLightLeft.target.updateMatrixWorld();

	// skills section right light properties
	skillsfloatingLightRight.position.set(7, 11, -24);
	skillsfloatingLightRight.intensity = 0.5;
	skillsfloatingLightRight.angle = 0.5;
	skillsfloatingLightRight.penumbra = 0.02;
	skillsfloatingLightRight.target.position.x = -11;
	skillsfloatingLightRight.target.position.y = 0;
	skillsfloatingLightRight.target.position.z = 16;
	skillsfloatingLightRight.target.updateMatrixWorld();

	// skills section right light properties
	skillsfloatingLightMid.position.set(17.8, 11, -17);
	skillsfloatingLightMid.intensity = 0.7;
	skillsfloatingLightMid.angle = 0.7;
	skillsfloatingLightMid.penumbra = 0.02;
	skillsfloatingLightMid.target.position.x = -29;
	skillsfloatingLightMid.target.position.y = 0;
	skillsfloatingLightMid.target.position.z = -24;
	skillsfloatingLightMid.target.updateMatrixWorld();


	/*
		Load object model
	 */
	// instantiate a loader
	var objLoader = new THREE.OBJLoader();

	// load a resource
	objLoader.load(
		// resource URL
		stageObj,
		// called when resource is loaded
		function (object) {
			// enable shadows
			object.traverse(function (child) {

			    if (child instanceof THREE.Mesh) {
			        child.castShadow = true;
			        child.receiveShadow = true;
			    }
			});

			scene.add(object);

		},
		// called when loading is in progresses
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}
	);


	/*
		dat.gui props
	 */

	var folder1 = gui.addFolder('skils_right_light');
	folder1.add(skillsfloatingLightRight.position, 'x', -100, 100);
	folder1.add(skillsfloatingLightRight.position, 'y', -100, 100);
	folder1.add(skillsfloatingLightRight.position, 'z', -100, 100);
	folder1.add(skillsfloatingLightRight, 'intensity', 0, 10);
	folder1.add(skillsfloatingLightRight, 'penumbra', 0, 1);
	folder1.add(skillsfloatingLightRight, 'angle', 0, 1);
	folder1.add(skillsfloatingLightRight.target.position, 'x', -100, 100).onChange(()=> {
		skillsfloatingLightRight.target.updateMatrixWorld()
	});
	folder1.add(skillsfloatingLightRight.target.position, 'y', -100, 100).onChange(()=> {
		skillsfloatingLightRight.target.updateMatrixWorld()
	});
	folder1.add(skillsfloatingLightRight.target.position, 'z', -100, 100).onChange(()=> {
		skillsfloatingLightRight.target.updateMatrixWorld()
	});

	var folderSkills = gui.addFolder('skills_left_light');
	folderSkills.add(skillsfloatingLightLeft.position, 'x', -100, 100);
	folderSkills.add(skillsfloatingLightLeft.position, 'y', -100, 100);
	folderSkills.add(skillsfloatingLightLeft.position, 'z', -100, 100);
	folderSkills.add(skillsfloatingLightLeft, 'intensity', 0, 10);
	folderSkills.add(skillsfloatingLightLeft, 'penumbra', 0, 1);
	folderSkills.add(skillsfloatingLightLeft, 'angle', 0, 1);
	folderSkills.add(skillsfloatingLightLeft.target.position, 'x', -100, 100).onChange(()=> {
		skillsfloatingLightLeft.target.updateMatrixWorld()
	});
	folderSkills.add(skillsfloatingLightLeft.target.position, 'y', -100, 100).onChange(()=> {
		skillsfloatingLightLeft.target.updateMatrixWorld()
	});
	folderSkills.add(skillsfloatingLightLeft.target.position, 'z', -100, 100).onChange(()=> {
		skillsfloatingLightLeft.target.updateMatrixWorld()
	});

	var folderSkillsMid = gui.addFolder('skills_mid_light');
	folderSkillsMid.add(skillsfloatingLightMid.position, 'x', -100, 100);
	folderSkillsMid.add(skillsfloatingLightMid.position, 'y', -100, 100);
	folderSkillsMid.add(skillsfloatingLightMid.position, 'z', -100, 100);
	folderSkillsMid.add(skillsfloatingLightMid, 'intensity', 0, 10);
	folderSkillsMid.add(skillsfloatingLightMid, 'penumbra', 0, 1);
	folderSkillsMid.add(skillsfloatingLightMid, 'angle', 0, 1);
	folderSkillsMid.add(skillsfloatingLightMid.target.position, 'x', -100, 100).onChange(()=> {
		skillsfloatingLightMid.target.updateMatrixWorld()
	});
	folderSkillsMid.add(skillsfloatingLightMid.target.position, 'y', -100, 100).onChange(()=> {
		skillsfloatingLightMid.target.updateMatrixWorld()
	});
	folderSkillsMid.add(skillsfloatingLightMid.target.position, 'z', -100, 100).onChange(()=> {
		skillsfloatingLightMid.target.updateMatrixWorld()
	});


	var folder4 = gui.addFolder('test_light2');
	folder4.add(dirLight.position, 'x', -100, 100);
	folder4.add(dirLight.position, 'y', -100, 100);
	folder4.add(dirLight.position, 'z', -100, 100);
	folder4.add(dirLight, 'intensity', 0, 10);

	var folder2 = gui.addFolder('center_light');
	folder2.add(centerStageLight.position, 'x', -100, 100);
	folder2.add(centerStageLight.position, 'y', -100, 100);
	folder2.add(centerStageLight.position, 'z', -100, 100);
	folder2.add(centerStageLight, 'intensity', 0, 10);

	// folder1.add(lightIndicator.position, 'x', -100, 100);
	// folder1.add(lightIndicator.position, 'y', -100, 100);
	// folder1.add(lightIndicator.position, 'z', -100, 100);
	// folder1.add(aboutStageStandingLight, 'intensity', 0, 10);
	// folder1.add(lightIndicator.rotation, 'x', -(Math.PI/2) * 4, Math.PI/2);
	// folder1.add(lightIndicator.rotation, 'y', -(Math.PI/2) * 4, Math.PI/2);
	// folder1.add(lightIndicator.rotation, 'z', -(Math.PI/2) * 4, Math.PI/2);

	var folder3 = gui.addFolder('camera');
	folder3.add(camera.position, 'x', -250, 350);
	folder3.add(camera.position, 'y', -250, 350);
	folder3.add(camera.position, 'z', -250, 350);
	folder3.add(camera.rotation, 'y', -(Math.PI/2) * 4, Math.PI/2);
	folder3.add(camera.rotation, 'x', -(Math.PI/2) * 4, Math.PI/2);
	folder3.add(camera.rotation, 'z', -(Math.PI/2) * 4, Math.PI/2);
	// folder3.open();


	/*
		particle system in a sphere
	 */
	var particleGeo = new THREE.Geometry();
	var particleGeo = new THREE.SphereGeometry(100, 100, 100);
	var particleMat = new THREE.PointsMaterial({
		color: '#fff',
		size: 1.5,
		transparent: true,
		map: new THREE.TextureLoader().load(particleImg	),
		blending: THREE.AdditiveBlending,
		depthWrite: false
	});

	var particleSphere = new THREE.Points(
		particleGeo,
		particleMat
	);

	particleSphere.name = 'particles';


	/*
		populate the scene
	 */
	scene.add(dirLight);
	scene.add(ambLight);
	scene.add(particleSphere);
	scene.add(centerStageLight);
	scene.add(aboutLampLightBulb);
	scene.add(aboutfloatingLight);
	scene.add(workLampLightRight);
	scene.add(workLampLightLeft);
	scene.add(skillsfloatingLightLeft);
	scene.add(skillsfloatingLightRight);
	scene.add(skillsfloatingLightMid);

	/*
		init eventlisteners
	 */
	initEventListeners();

	/*
		define renderer
	 */
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	document.getElementById('webgl').appendChild(renderer.domElement);

	// orbiting controls
	// var controls = new THREE.OrbitControls( camera, renderer.domElement );

	// run renderer
	update(renderer, scene, camera);
	return scene;
}

/**
 * [getGeo description]
 * @param  {[type]} type       [description]
 * @param  {Array}  dimensions [description]
 * @param  {[type]} 24         [description]
 * @param  {[type]} 24]        [description]
 * @return {[type]}            [description]
 */
function getGeometry(type, dimensions=[2, 24, 24]) {
	var getGeometry;
	switch (type) {
		case 'box':
			getGeometry = new THREE.BoxGeometry(...dimensions);
			break;
		case 'plane':
			getGeometry = new THREE.PlaneGeometry(...dimensions);
			break;
		case 'sphere':
			getGeometry = new THREE.SphereGeometry(...dimensions);
			break;
		default:
			getGeometry = new THREE.SphereGeometry(...dimensions);
			break;
	}

	return getGeometry;
}

/**
 * build a light object
 * @param  {[string]} type    [the type of light]
 * @param  {[array]} options  [properties passed to the light]
 * @param  {[int]} penumbra   [particularly for spotlight (radius)]
 * @return {[object]}         [returns the light object]
 */
function getLight(type, options, penumbra, helper, scene) {
	var light;
	var lightHelper;

	switch (type) {
		case 'point':
			light = new THREE.PointLight(...options);
			if (helper) lightHelper = new THREE.PointLightHelper( light, 5 );
			break;
		case 'spot':
			light = new THREE.SpotLight(...options);
			if (helper) lightHelper = new THREE.SpotLightHelper( light );
			light.penumbra = penumbra ? penumbra : light.penumbra;
			break;
		case 'directional':
			light = new THREE.DirectionalLight(...options);
			if (helper) lightHelper = new THREE.DirectionalLightHelper( light, 5 );
			break;
		case 'ambient':
			light = new THREE.AmbientLight(...options);
			break;
		case 'rect':
			light = new THREE.RectAreaLight( ...options );
			if (helper) lightHelper = new THREE.RectAreaLightHelper( light )
		default:
			light = new THREE.PointLight(...options);
			break;
	}
	if (type !== 'ambient') {
		light.castShadow = true;
		//Set up shadow properties for the light
		// light.shadow.mapSize.width = 1024;  // default: 512
		// light.shadow.mapSize.height = 1024; // default: 512
		light.shadow.mapSize.width = 2048;  // default: 512
		// light.shadow.mapSize.height = 2048; // default: 512
		light.shadow.bias = 0.001;
	}

	// if enabled add a light helper to the scene
	if (helper) scene.add( lightHelper );
	return light;
}

/**
 * build a material for an object
 * @param  {[string]} type  [type of material]
 * @param  {[string]} color [the colot of the material]
 * @return {[object]}       [returns the material obj]
 */
function getMaterial(type, color) {
	var selectedMaterial;
	var materialOptions = {
		color: color === undefined ? 'rgb(255, 255, 255)' : color,
	};

	switch (type) {
		case 'basic':
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
			break;
		case 'lambert':
			selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
			break;
		case 'phong':
			selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
			break;
		case 'standard':
			selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);
			break;
		default:
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
			break;
	}
	return selectedMaterial;
}

/*
	animation collection
 */

/**
 * animation from the side of the globe to the top of it
 * @param  {Function} callback [pass in function, particularly an animation func]
 * @return {[null]}            [nothing, this is an execution]
 */
function fromGlobeProfileToTop(callback = () => {}) {
	var targetCoords = {x: 0, y: 550, z: 0, rx: -1.6, ry: 0, rz: 0};
	var timing = 1500;

	new TWEEN.Tween(currentCameraCoords)
		.to(targetCoords, timing)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(function() {
			camera.position.x = currentCameraCoords.x
			camera.position.y = currentCameraCoords.y
			camera.position.z = currentCameraCoords.z
		})
		.start();

	new TWEEN.Tween(currentCameraCoords)
		.to(targetCoords, timing)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(function() {
			camera.rotation.x = currentCameraCoords.rx
			camera.rotation.y = currentCameraCoords.ry
			camera.rotation.z = currentCameraCoords.rz
		})
		.onComplete(() => {
			callback();
		})
		.start();
}

function moveToAboutSection(page) {
	let targetCoords = {x: -8.5, y: 24, z: -2, rx: 0, ry: -2.6, rz: 0};
	var timing = 2000;
	var delayVal = 1000;

	// if not coming from the home page, remove the delayed animation
	if(currentPage !== 'home') delayVal = 0;
	currentPage = page;

	new TWEEN.Tween(currentCameraCoords)
	.to(targetCoords, timing)
	.easing(TWEEN.Easing.Quadratic.Out)
	.onUpdate(function() {
		camera.position.x = currentCameraCoords.x
		camera.position.y = currentCameraCoords.y
		camera.position.z = currentCameraCoords.z
	})
	.start();

  new TWEEN.Tween(currentCameraCoords)
	.to(targetCoords, timing + 500)
	.delay(delayVal)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.onUpdate(function() {
		camera.rotation.x = currentCameraCoords.rx
		camera.rotation.y = currentCameraCoords.ry
		camera.rotation.z = currentCameraCoords.rz
	})
	.onComplete(() => {
		updateCurrentCameraCoords(targetCoords);
	})
	.start();
}

function moveToWorkSection(page) {
	let targetCoords = {x: 6.5, y: 6, z: 44, rx: 0.35, ry: 0, rz: -3};
	var timing = 2000;
	currentPage = page;

	new TWEEN.Tween(currentCameraCoords)
	.to(targetCoords, timing)
	.easing(TWEEN.Easing.Quadratic.Out)
	.onUpdate(function() {
		camera.position.x = currentCameraCoords.x
		camera.position.y = currentCameraCoords.y
		camera.position.z = currentCameraCoords.z
	})
	.start();

  new TWEEN.Tween(currentCameraCoords)
	.to(targetCoords, timing)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.onUpdate(function() {
		camera.rotation.x = currentCameraCoords.rx
		camera.rotation.y = currentCameraCoords.ry
		camera.rotation.z = currentCameraCoords.rz
	})
	.onComplete(() => {
		updateCurrentCameraCoords(targetCoords);
	})
	.start();
}

function moveToSkillsSection(page) {
	let targetCoords = {x: 16, y: 10, z: -22, rx: -3, ry: 1.3, rz: -3};
	var timing = 2000;
	currentPage = page;

	new TWEEN.Tween(currentCameraCoords)
	.to(targetCoords, timing)
	.easing(TWEEN.Easing.Quadratic.Out)
	.onUpdate(function() {
		camera.position.x = currentCameraCoords.x
		camera.position.y = currentCameraCoords.y
		camera.position.z = currentCameraCoords.z
	})
	.start();

  new TWEEN.Tween(currentCameraCoords)
	.to(targetCoords, timing)
	// .delay(1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.onUpdate(function() {
		camera.rotation.x = currentCameraCoords.rx
		camera.rotation.y = currentCameraCoords.ry
		camera.rotation.z = currentCameraCoords.rz
	})
	.onComplete(() => {
		updateCurrentCameraCoords(targetCoords);
	})
	.start();
}

function moveToHomeSection() {
	currentPage = 'home';
	var timing = 2000;

	new TWEEN.Tween(currentCameraCoords)
	.to(homePageCoords, timing)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.onUpdate(function() {
		camera.rotation.x = currentCameraCoords.rx
		camera.rotation.y = currentCameraCoords.ry
		camera.rotation.z = currentCameraCoords.rz
	})
	.start();

  new TWEEN.Tween(currentCameraCoords)
	.to(homePageCoords, timing)
	.delay(1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.onUpdate(function() {
		camera.position.x = currentCameraCoords.x
		camera.position.y = currentCameraCoords.y
		camera.position.z = currentCameraCoords.z
	})
	.onComplete(() => {
		updateCurrentCameraCoords();
	})
	.start();
}

function updateCurrentCameraCoords(targetCoords = currentCameraCoords) {
	currentCameraCoords = targetCoords;
	pageIsTransitioning = false;
}

/**
 * controller with rules for handling page transitions
 * @param  {Function} callback [callback, particularly page transitions]
 * @return {[type]}            [description]
 */
function handlePageTransitions(callback, page, option) {
	// disable buttons during page transitions
	console.log('page: ', page);
	console.log('currentPage === page: ', currentPage === page);
	if (pageIsTransitioning || currentPage === page) return;

	pageIsTransitioning = true;

	// if on the home page and propted with option, use special entry animation
	currentPage === 'home' && option ? fromGlobeProfileToTop(callback, page) : callback(page);

}

function initEventListeners() {
	homeButton.addEventListener('click', () => handlePageTransitions(moveToHomeSection, 'home'));
	aboutButton.addEventListener('click', () => handlePageTransitions(moveToAboutSection, 'about', true));
	workButton.addEventListener('click', () => handlePageTransitions(moveToWorkSection, 'work'));
	skillsButton.addEventListener('click', () => handlePageTransitions(moveToSkillsSection, 'skills', true));
}

/**
 * render the world and run animation
 * @param  {[obj]} renderer [webGL renderer]
 * @param  {[obj]} scene    [the webGL scene and all of its elements]
 * @param  {[obj]} camera   [the scene camera]
 * @return {[func call]}    [run requestAnimationFrame]
 */
function update(renderer, scene, camera) {

	// enabling tweening
	TWEEN.update();

	// render the world
	renderer.render(scene, camera);
	requestAnimationFrame(function() {
		update(renderer, scene, camera);
	});
}

// init the 3D world and make its contents available to the console
var scene = init();
