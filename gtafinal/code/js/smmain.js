 /* modify by sysu 113311136 hxn in 2014.1.17
 */
var camera, scene, renderer;
var geometry, material, mesh;
var controls, time = Date.now();
var objects = [];
var ray;
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
var myFps = 0;//统计刷新率
var videoShutdown = false;
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if (havePointerLock) {
	var element = document.body;
	var pointerlockchange = function (event) {
		if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
			controls.enabled = true;
			blocker.style.display = 'none';
		} else {
			controls.enabled = false;
			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';
			instructions.style.display = '';
		}
	}
	var pointerlockerror = function (event) {
		instructions.style.display = '';
	}
	document.addEventListener('pointerlockchange', pointerlockchange, false);
	document.addEventListener('mozpointerlockchange', pointerlockchange, false);
	document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
	document.addEventListener('pointerlockerror', pointerlockerror, false);
	document.addEventListener('mozpointerlockerror', pointerlockerror, false);
	document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
	instructions.addEventListener('click', function (event) {
		instructions.style.display = 'none';
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
		if (/Firefox/i.test(navigator.userAgent)) {
			var fullscreenchange = function (event) {
				if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
					document.removeEventListener('fullscreenchange', fullscreenchange);
					document.removeEventListener('mozfullscreenchange', fullscreenchange);
					element.requestPointerLock();
				}
			}
			document.addEventListener('fullscreenchange', fullscreenchange, false);
			document.addEventListener('mozfullscreenchange', fullscreenchange, false);
			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
			element.requestFullscreen();
		} else {
			element.requestPointerLock();
		}
	}, false);
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}
init();
animate();
function init() {
	//初始化场景
	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);//透视相机
	scene = new THREE.Scene();//创建场景
/*	var spotLight = new THREE.SpotLight( 0xffffff ,1);
	spotLight.position.set( 3, 3, -4 );

	spotLight.castShadow = true;

	spotLight.shadowMapWidth = 1024;
	spotLight.shadowMapHeight = 1024;

	spotLight.shadowCameraNear = 500;
	spotLight.shadowCameraFar = 4000;
	spotLight.shadowCameraFov = 30;

	scene.add( spotLight );
	scene.fog = new THREE.Fog(0xffffff, 0, 750);//线性雾
	var light = new THREE.DirectionalLight(0xffffff, 0.8);
	light.position.set(3, 3, -3);
	scene.add(light);
	var light = new THREE.DirectionalLight(0xffffff, 1.5);//灯光创建和添加
	light.position.set(1, 1, 1);
	scene.add(light);



*/
	var light = new THREE.AmbientLight( 0xf6f6f6 ); // soft white light
	scene.add( light );

	var light = new THREE.DirectionalLight(0x999999, 1.5);//灯光创建和添加
	light.position.set(1, 2, 1);
	scene.add(light);	

	controls = new THREE.PointerLockControls(camera);//添加控制器
	scene.add(controls.getObject());
	controls.setPosition(2,2,-5);


	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);

    var loader = new THREE.JSONLoader();
    var deskLoc=[0.5,3,4,6];
	loader.load("model/wallv102/wallv102.js", function (geometry, materials) {
		for(var j = -2;j<2;j++){
		    var ground = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		    ground.position.z = j * 11;
		    ground.castShadow = true;
		    ground.receiveShadow = true;
		    objects.push(ground);
		    scene.add(ground);

		    for(var ro=2;ro<9;ro++){
			    for(var i =0;i<deskLoc.length;i++){
					loadJsToScene("model/desk/deskAndhair.js",deskLoc[i],0,-(ro + 0.3));
				}
			}
		}

	});

    var loader01 = new THREE.JSONLoader();//corridor.js
    
	loader.load("model/corridor1.1/corridor1.1.js", function (geometry, materials) {

	    var frontWall = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

	    frontWall.castShadow = true;

	    frontWall.receiveShadow = true;
	    objects.push(frontWall);
	    scene.add(frontWall);

	});
	var desktop = loadDesktopToScene("model/desktop/desktop.js",5.5,0.9,-1.7);





}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
function loadJsToScene(jsPath,x,y,z){
    var loader = new THREE.JSONLoader();
    
	loader.load(jsPath, function (geometry, materials) {

	    var part = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

	    part.castShadow = true;

	    part.receiveShadow = true;
		part.position.z = z;
		part.position.x = x;
		part.position.y = y;
	    objects.push(part);
	    scene.add(part);
	   	return part;

	});	


}
function loadDesktopToScene(jsPath,x,y,z){
	//专门给笔记本电脑建立 单击监听
    var loader = new THREE.JSONLoader();
    
	loader.load(jsPath, function (geometry, materials) {

	    var part = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

	    part.castShadow = true;

	    part.receiveShadow = true;
		part.position.z = z;
		part.position.x = x;
		part.position.y = y;
		controls.getDesktop(part);
	    objects.push(part);
	    scene.add(part);
	   	return part;

	});	


}
function playVideo(){

 	if(controls.gotDesktop){
 		if(videoShutdown == false){
	 		$("#myVideo").html("<video id='vGo' src='video/test.mp4'  width='100%' controls='controls'>Your browser does not support the video tag.</video>");
	 		document.getElementById("vGo").play();
	 		videoShutdown = true;
 		}
 		else{
 			videoShutdown = false;
 		}

 	}
 	//$("#myVideo").text(controls.gotDesktop);video/test.mp460/myFps

}
function niceVideo(){
	var op = $("#myVideo").css('opacity');
	var t = 1;
	if(videoShutdown == true)
		op = Number(op) + 0.03;
	else{
		op = Number(op) - 0.05;
	}
	if(op > 1)
		op =1;
	else if(op < 0.05){
		op = 0.05;
		$("#myVideo").text('');
	}
	$("#myVideo").css('opacity',op);
}
function animate() {//渲染
	requestAnimationFrame(animate);
	controls.physic(objects);//启动物理引擎模块
	controls.update(Date.now() - time);//更新状态
	renderer.render(scene, camera);
	var myFps = Math.ceil(600/(Date.now() - time));
	if(Date.now()%30 == 0)$("#fpsInfo").text("FPS:" + myFps);

	var notice;
	if(myFps < 8)
	{
		notice = null;
		$("#Notice").text('fps比较低，配置低于渲染要求，画面卡顿是正常的');

	}

	time = Date.now();
	niceVideo();

}