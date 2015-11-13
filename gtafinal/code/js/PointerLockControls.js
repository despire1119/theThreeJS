/**
 * @author mrdoob / http://mrdoob.com/
 * modify by sysu 113311136 hxn in 2014.1.16
 * complete the physic part in 2014.1.16
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;
	//物理引擎模块变量
	var runTime = Date.now();
    var objects;//场景中所有的物体
   	var ray = new THREE.Raycaster();//射线，用于检测周围物体情况

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 1.7;
	yawObject.add( pitchObject );

	var desktop;
	var gotDesktop = false;

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var isForwardObject = false;
	var isBackwardObject = false;
	var isRightObject = false;
	var isLeftObject = false;
	var isUnderObject = false;
	//是否可以移动的判断变量
	var canJump = false;//是否可以跳
	var canMoveForward = true;
	var canMoveBackward = true;
	var canMoveRight = true;
	var canMoveLeft = true;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {//鼠标移动视野的事件

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;
		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

		/*$("#info3").text("x:" + pitchObject.rotation.x);
		$("#info4").text("y:" + yawObject.rotation.y);
		*/

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				if(canMoveForward == true)moveForward = true;
				break;

			case 37: // left
			case 65: // a
				if(canMoveLeft == true)moveLeft = true;
			    break;

			case 40: // down
			case 83: // s
				if(canMoveBackward == true)moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				if(canMoveRight == true)moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += 0.15;
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
			case 83: // a
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};
	//新加入的物理引擎模块，处理控制器和其他物体的碰撞。
	this.physic = function(objects){
		this.objects = objects;
		this.isOnObject();//下方接触到物体
		this.isForwardObject();//前面接触到物体
		this.isBackwardObject();//后面接触到物体
		this.isRightObject();//右边接触到物体
		this.isLeftObject();//左边接触到物体
		this.isUnderObject();//上方接触到物体
	}
	this.isOnObject = function () {
		ray.ray.direction.set(0, -1, 0);
		ray.ray.origin.copy(yawObject.position);
//		ray.ray.origin.y -= 10;
		var intersections = ray.intersectObjects(this.objects);
		if (intersections.length > 0) {
			var distance = intersections[0].distance;
			if (distance > 0 && distance < 1.7) {
				isOnObject = true;
				canJump = true;
				return;				
			}
		}
		isOnObject = false;
		canJump = false;

	};
	this.isForwardObject = function () {
		var co = -Math.cos(yawObject.rotation.y);
		var si = -Math.sin(yawObject.rotation.y);
		ray.ray.direction.set(si, 0,co);//对正前方进行判断
/*		$("#info6").text("x:" + si);
		$("#info7").text("z:" + co);
*/

//		$("#info3").text("(x:" + si + ",z:" + co + ")");
		ray.ray.origin.copy(yawObject.position);
		//ray.ray.origin.z -= 10;
		var intersections = ray.intersectObjects(this.objects);
		
		if (intersections.length > 0) {
			var distance = intersections[0].distance;
			if (distance > 0 && distance < 1) {
				isForwardObject = true;
				canMoveForward = false;
				moveForward = false;
				return;				
			}
		}
		ray.ray.direction.set(si, -1,co);//对正前方 脚下-45度进行判断
		intersections = ray.intersectObjects(this.objects);		
		if (intersections.length > 0) {
			distance = intersections[0].distance;
			if (distance > 0 && distance < 1.6) {
				isForwardObject = true;
				canMoveForward = false;
				moveForward = false;
				return;				
			}
		}		




		isForwardObject = false;
		canMoveForward = true;

	};	
	this.isBackwardObject = function () {
		var backRotation = yawObject.rotation.y + Math.PI;//偏移180度
		var co = -Math.cos(backRotation);
		var si = -Math.sin(backRotation);
		ray.ray.direction.set(si, 0,co);
		ray.ray.origin.copy(yawObject.position);
		var intersections = ray.intersectObjects(this.objects);
		
		if (intersections.length > 0) {
			var distance = intersections[0].distance;
			if (distance > 0 && distance < 1) {
				isBackwardObject = true;
				canMoveBackward = false;
				moveBackward = false;

				return;				
			}
		}
		ray.ray.direction.set(si, -1,co);
		intersections = ray.intersectObjects(this.objects);
		
		if (intersections.length > 0) {
			distance = intersections[0].distance;
			if (distance > 0 && distance < 1.7) {
				isBackwardObject = true;
				canMoveBackward = false;
				moveBackward = false;

				return;				
			}
		}
		isBackwardObject = false;
		canMoveBackward = true;

	};
	this.isLeftObject = function () {
		var backRotation = yawObject.rotation.y + Math.PI / 2;
		var co = -Math.cos(backRotation);
		var si = -Math.sin(backRotation);
		ray.ray.direction.set(si, 0,co);
		ray.ray.origin.copy(yawObject.position);
		//ray.ray.origin.z -= 10;
		var intersections = ray.intersectObjects(this.objects);
		
		if (intersections.length > 0) {
			var distance = intersections[0].distance;
			if (distance > 0 && distance < 1) {
				isLeftObject = true;
				canMoveLeft = false;
				moveLeft = false;
				return;		
			}
		}
		ray.ray.direction.set(si, -1,co);
		intersections = ray.intersectObjects(this.objects);		
		if (intersections.length > 0) {
			distance = intersections[0].distance;
			if (distance > 0 && distance < 1.7) {
				isLeftObject = true;
				canMoveLeft = false;
				moveLeft = false;
				return;		
			}
		}		
		isLeftObject = false;
		canMoveLeft = true;

	};
	this.isRightObject = function () {
		var backRotation = yawObject.rotation.y - Math.PI / 2;
		var co = -Math.cos(backRotation);
		var si = -Math.sin(backRotation);
		ray.ray.direction.set(si, 0,co);
		ray.ray.origin.copy(yawObject.position);
		//ray.ray.origin.z -= 10;
		var intersections = ray.intersectObjects(this.objects);
		
		if (intersections.length > 0) {
			var distance = intersections[0].distance;
			if (distance > 0 && distance < 1) {
				isRightObject = true;
				canMoveRight = false;
				moveRight = false;
				return;		
			}
		}
		ray.ray.direction.set(si,-1,co);
		intersections = ray.intersectObjects(this.objects);		
		if (intersections.length > 0) {
			distance = intersections[0].distance;
			if (distance > 0 && distance < 1.7) {
				isRightObject = true;
				canMoveRight = false;
				moveRight = false;
				return;		
			}
		}		
		isRightObject = false;
		canMoveRight = true;

	};
	this.isUnderObject = function () {

		ray.ray.direction.set(0, 1,0);
		ray.ray.origin.copy(yawObject.position);
		//ray.ray.origin.z -= 10;
		var intersections = ray.intersectObjects(this.objects);
		
		if (intersections.length > 0) {
			var distance = intersections[0].distance;
			if (distance > 0 && distance < 0.5) {
				velocity.y = -0.6;
				isUnderObject = true;
				return;		
			}
		}
		isUnderObject = false;

	};
	this.getDesktop = function(desktop){
		this.desktop = desktop;
	};		

	this.checkDesktop = function(){//用来检测准星是否对着笔记本电脑
		var y = yawObject.rotation.y;
		var x = pitchObject.rotation.x;

		var dray = new THREE.Raycaster();//射线，用于检测周围物体情况
		var a = -Math.cos(x) * Math.cos(y);
		var b = Math.sin(x);
		var c = -Math.cos(x) * Math.sin(y);
		
		/*$("#info6").text("x:" + c);
		$("#info7").text("y:" + b);
		$("#info8").text("z:" + a);		
*/
		dray.ray.direction.set(c, b,a);
		dray.ray.origin.copy(yawObject.position);
		var intersection = dray.intersectObject(this.desktop);
		if(intersection[0] != undefined)
		{

			var distance = intersection[0].distance;
			if (distance > 0 && distance < 5) {
					this.gotDesktop = true;
					return;		
			}
			else
			{

				this.gotDesktop = false;
				return;
			}
		}
		this.gotDesktop = false;
		return;
	};	

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		}

	}();
	this.updateMoveStatus = function(){

	};
	this.setPosition = function(x,y,z){
		yawObject.position.set(x,y,z);	
	}


	this.update = function ( delta ) {

		if ( scope.enabled === false ) return;

		delta *= 0.1;

		velocity.x += ( - velocity.x ) * 0.1 * delta;
		velocity.z += ( - velocity.z ) * 0.1 * delta;
		velocity.y -= 0.006 * delta;


		if ( moveForward ) velocity.z -= 0.006 * delta;
		if ( moveBackward ) velocity.z += 0.006 * delta;

		if ( moveLeft ) velocity.x -= 0.003 * delta;
		if ( moveRight ) velocity.x += 0.003 * delta;

		if ( isOnObject === true ) {

			velocity.y = Math.max( 0, velocity.y );

		}




		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );
		//$("#info2").text("z:" + velocity.z);
		//坐标显示 z范围是(-1.5,1.5)
		//$("#info1").text("坐标(X:"+ Math.floor(yawObject.position.x) + ",Y:" + Math.floor(yawObject.position.y) + ",z:" + Math.floor(yawObject.position.z) + ")");
		if ( yawObject.position.y < -150 ) {
			velocity.y = 0.1;
			$("#zhunxing").text("返回初始位置");
			setTimeout("zhunxing('+')",3000);
			yawObject.position.set(2,1.5,-5);
			canJump = true;
		}
		this.checkDesktop();

	};

};
function zhunxing(zx){
	$("#zhunxing").text(zx);
}

