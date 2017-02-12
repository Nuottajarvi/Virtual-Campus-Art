
var container;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var raycaster;
var mouseRaycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var objects = [];
var artModels = [];

var movementEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

init();
animate();

function pointerLock(bool){
	if(bool){
		// Ask the browser to lock the pointer
		UI.close();
		document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
		document.body.requestPointerLock();
		movementEnabled = true;
		controls.enabled = true;
		
	}else{
		document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
		// Attempt to unlock
		document.exitPointerLock();
	}
}

function getArtModels(scene){

	var files = [
		{name: "Teapot", rating: 58, url: "example_models/teapot.obj"},
		{name: "Cow", rating: 240, url: "example_models/cow.obj"},
		{name: "Pumpkin", rating: 158, url: "example_models/pumpkin.obj"},
		{name: "Teddy", rating: 5, url: "example_models/teddy.obj"}
	];

	var objLoader = new THREE.OBJLoader();
	objLoader.setPath( '' );

	for(var file in files){
		var getModel = function(file){
			objLoader.load( file.url, function ( object ) {

				object.position.x = Math.floor(Math.random() * 100 - 50);
				object.position.z = Math.floor(Math.random() * 100 - 50);
				object.position.y = 0;

				object.children[0].name = file.name;
				object.children[0].rating = file.rating;

				artModels.push(object);
				scene.add( object );
			});
		}
		getModel(files[file]);
	}
}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	container.className = "";

	container.addEventListener( 'click', function ( event ) {
		pointerLock(true);
	}, false );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );

	// scene

	scene = new THREE.Scene();

	var ambient = new THREE.AmbientLight( 0x101030 );
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 );
	scene.add( directionalLight );

	getArtModels(scene);


/*	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath( '' );
	mtlLoader.load( 'centralLobby.mtl', function( materials ) {

		materials.preload();

		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( '' );
		objLoader.load( 'centralLobby.obj', function ( object ) {

			object.position.y = 0;
			scene.add( object );

		});

	});*/

	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += 350;
				canJump = false;
				break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	var onMouseDown = function(event){
		if(!UI.opened){
			event.preventDefault();

			mouseRaycaster.setFromCamera( {x:0, y:0}, camera );

			var intersects = mouseRaycaster.intersectObjects( artModels, true );

			if ( intersects.length > 0 ) {
				UI.open(intersects[0].object);
				pointerLock(false);
				movementEnabled = false;
				controls.enabled = false;
			}
		}
	}

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	document.addEventListener( 'mousedown', onMouseDown, false );
	window.addEventListener( 'resize', onWindowResize, false );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -1, 0 ), 0, 10 );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();	

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
	render();
	requestAnimationFrame( animate );
}

function render() {
	var time = performance.now();
	var delta = ( time - prevTime ) / 1000;

	if ( movementEnabled ) {
		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y -= 10;

		var intersections = raycaster.intersectObjects( scene.children , true );
		var isOnObject = intersections.length > 0;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		//velocity.y -= 9.8 * 0.1 * delta;

		if ( moveForward ) velocity.z -= 400.0 * delta;
		if ( moveBackward ) velocity.z += 400.0 * delta;

		if ( moveLeft ) velocity.x -= 400.0 * delta;
		if ( moveRight ) velocity.x += 400.0 * delta;

		if ( isOnObject === true ) {
			velocity.y = Math.max( 0, velocity.y );

			canJump = true;
		}

		controls.getObject().translateX( velocity.x * delta );
		controls.getObject().translateY( velocity.y * delta );
		controls.getObject().translateZ( velocity.z * delta );

		/*if ( controls.getObject().position.y < 10 ) {

			velocity.y = 0;
			controls.getObject().position.y = 10;

			canJump = true;

		}*/
	}
	prevTime = time;
	renderer.render(scene, camera);
}
