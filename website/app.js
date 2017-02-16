
var container;

var positions = [
					{x:-1.8, y: 0, z: -8},
					{x:23, y: 3.72, z: 42},
					{x:-27, y: 3.72, z: 48},
					{x:-5, y: 3.72, z: -13},
					{x:0, y: 3.72, z: -34},
					{x:5.3, y: 3.72, z: -66},
				]

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var groundRaycaster;
var movementRaycaster;
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

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function getArtModels(scene){

	var files = [];

	$.get("api/models?type=randomrated;l=3", function(data){

		files = files.concat(data);

		$.get("api/models?type=randomnew;l=3", function(data){

			files = files.concat(data);
			shuffle(files);
			

			var loader = new THREE.ObjectLoader();

			for(var file in files){
				var getModel = function(file, index){
					loader.load( "/api/models/" + file.model_id + "/data", function ( object ) {
						object.position.x = positions[index].x;
						object.position.y = positions[index].y;
						object.position.z = positions[index].z;

						object.children[0].name = file.title;
						object.children[0].rating = file.rating;
						object.children[0].objectId = file.model_id;
						object.children[0].date = file.created_at;

						artModels.push(object);
						scene.add( object );
					});
				}
				getModel(files[file], file);
			}
		});
	});


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

	var ambient = new THREE.AmbientLight( 0x303030 );
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 );
	scene.add( directionalLight );

	getArtModels(scene);

	var loader = new THREE.JSONLoader();
	loader.load( 'campus_model/centralLobby.json', function ( geometry, materials ) {
		var material = new THREE.MultiMaterial( materials );
		var object = new THREE.Mesh( geometry, material );
		object.rotateX(Math.PI / 2);
		objects.push(object);
		scene.add( object );
	});

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
				if ( canJump === true ) velocity.y += 10;
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

	groundRaycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -1, 0 ), 0, 2);
	movementRaycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(), 0, 2);

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
		groundRaycaster.ray.origin.copy( controls.getObject().position );

		var groundIntersections = groundRaycaster.intersectObjects( objects , true );
		var isOnObject = groundIntersections.length > 0;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 1 * delta;

		if ( moveForward ) velocity.z -= 400.0 * delta;
		if ( moveBackward ) velocity.z += 400.0 * delta;

		if ( moveLeft ) velocity.x -= 400.0 * delta;
		if ( moveRight ) velocity.x += 400.0 * delta;

		if ( isOnObject === true ) {
			velocity.y = Math.max( 0, velocity.y );

			canJump = true;
		}

		var origin = controls.getObject().position;
		var direction = new THREE.Vector3(velocity.x, 0, velocity.z);

		direction.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, controls.getObject().rotation.y, 0)));
		direction.normalize();

		movementRaycaster.set(origin, direction);

		var movementIntersections = movementRaycaster.intersectObjects(objects, true);

		if(!(movementIntersections.length > 0)){
			controls.getObject().translateX( velocity.x * delta );
			controls.getObject().translateY( velocity.y * delta );
			controls.getObject().translateZ( velocity.z * delta );
		}
	}
	prevTime = time;
	renderer.render(scene, camera);
}
