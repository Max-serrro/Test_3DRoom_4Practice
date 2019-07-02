function setCookie (name, value, expires, path, domain, secure) {
  document.cookie = name + "=" + escape(value) +
    ((expires) ? "; expires=" + expires : "") +
    ((path) ? "; path=" + path : "") +
    ((domain) ? "; domain=" + domain : "") +
    ((secure) ? "; secure" : "");
}
function getCookie(name) {
	var cookie = " " + document.cookie;
	var search = " " + name + "=";
	var setStr = null;
	var offset = 0;
	var end = 0;
	if (cookie.length > 0) {
		offset = cookie.indexOf(search);
		if (offset != -1) {
			offset += search.length;
			end = cookie.indexOf(";", offset)
			if (end == -1) {
				end = cookie.length;
			}
			setStr = unescape(cookie.substring(offset, end));
		}
	}
	return(setStr);
}
window.onload = function() {
  var density = 1/5;
  var interaction = true;
  document.getElementById("switchOn").style.backgroundColor="red";
  document.getElementById("density5").style.backgroundColor="red";
  document.getElementById("camera1").style.backgroundColor="red";
  var cameraType = 1;
  var cage = 10;
  var size = 2000;
  /*var url = window.location
  url.search = `?density=${density}`
  window.history.pushState({path:url},'',url)*/
  setCookie("density",`${density}`);
  
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  function check(arr, x, y, l) {
    var f = false
    for (i=0; i<l; i++) {
        if (arr[i][0]==x && arr[i][1]==y)
          f=true
    }
    return f
  }
  //x, y - координаты на плоскости, z - высота (в данной программе практически не играет роли)
  function initMatrix(callback) {
    debugger
    amountOfCubes=(cage*cage*density)|0
    var coords = []
    var matrix = []
    for (i=0; i<cage; i++) {
        matrix[i]=[]
        for (j=0; j<cage; j++) {
          matrix[i][j]=0
          }
    }
    for (i=0; i<amountOfCubes; i++) {
      coords[i] = []
      while (true) {
          coords[i][0]=getRandomInt(0, cage)
          coords[i][1]=getRandomInt(0, cage)
          if (!check(coords, coords[i][0], coords[i][1], i)) {
            matrix[coords[i][0]][coords[i][1]]=(i==0 ? 1 : 2)
            break
          }    
        }
    }
    return callback(amountOfCubes, matrix)
  }
  //инициализация канваса
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvas = document.getElementById('canvas');

  canvas.setAttribute('width',width); 
  canvas.setAttribute('height',height); 

  //рендерер
  var renderer = new THREE.WebGLRenderer({canvas: canvas});
  renderer.setClearColor(0x000000);

  //сцена
  var scene = new THREE.Scene();

  //камера
  var camera = {
    positionX: 0,
    positionY: -2000,
    positionZ: 718, 
    fov: 50,
    aspect: width/height,
    near: 0.1,
    far: 5000,
    lookX: 0,
    lookY: 1360,
    lookZ: 0
  }
  objCamera = new THREE.PerspectiveCamera(camera.fov, camera.aspect, camera.near, camera.far);
  objCamera.position.set(camera.positionX, camera.positionY, camera.positionZ);
  objCamera.lookAt(new THREE.Vector3(camera.lookX,camera.lookY,camera.lookZ));
  //изменение состояния камеры
  /*var gui = new dat.GUI();
  gui.add(camera, 'positionX').min(-2000).max(2000).step(2);
  gui.add(camera, 'positionY').min(-2000).max(2000).step(2);
  gui.add(camera, 'positionZ').min(-3000).max(3000).step(3);
  gui.add(camera, 'lookX').min(-2000).max(2000).step(2);
  gui.add(camera, 'lookY').min(-4000).max(4000).step(4);
  gui.add(camera, 'lookZ').min(-2000).max(2000).step(2);*/

  //освещение
  var light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  //плоскость
  var geometryPlane = new THREE.PlaneGeometry(size, size, cage, cage);
  var materialPlane = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});
  for (var i=0; i<geometryPlane.faces.length; i++) {
    var color1 = new THREE.Color("rgb(245, 245, 220)");
    var color2 = new THREE.Color("rgb(255, 255, 255)");
    (((i/(cage*2)|0)%2)+(i%4<2))%2 ? geometryPlane.faces[i].color=color1 : geometryPlane.faces[i].color=color2
  }
  var objPlane = new THREE.Mesh(geometryPlane, materialPlane);
  scene.add(objPlane);

  function absToRel(coord) {
    return size/cage*coord-1000+size/cage/2
  }

  var objCube, objCubes
  var cubeSize = size/cage
  var cube = {
    positionX: 0,
    positionY: 0,
    positionZ: cubeSize/2,
    CUBEpositionX: 0,
    CUBEpositionY: 0
  }
  var matrixOfCubes
  var geometryCube = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  var materialCube1 = new THREE.MeshBasicMaterial({color: 0x007BA7, wireFrame: false});
  var materialCube2 = new THREE.MeshBasicMaterial({color: 0x7FFF00, vertexColors: THREE.FaceColors});
  //изменение состояния куба
  /*gui.add(cube, 'CUBEpositionX').min(0).max(9).step(1);
  gui.add(cube, 'CUBEpositionY').min(0).max(9).step(1);*/
  
  function initCubes() {
    initMatrix(function(amountOfCubes, matrix) {
      matrixOfCubes = matrix
  
      //основной куб
      objCube = new THREE.Mesh(geometryCube, materialCube1);
      
      //прочие кубы
      objCubes = []
      for (var i=0; i<amountOfCubes-1; i++) {
        for (var j=0; j<geometryCube.faces.length; j++) {
          geometryCube.faces[j].color.setRGB(Math.random(),Math.random(),Math.random());
        }
        objCubes[i] = new THREE.Mesh(geometryCube, materialCube2);
      }
   
      //установка кубов на плоскость   
      var n = 0
      for (var x=0; x<matrix.length; x++) {
        for (var y=0; y<matrix[x].length; y++) {        
          if (matrix[x][y]!==0) {
            //перевод координат
            var newX = absToRel(x)
            var newY = absToRel(y)
            if (matrix[x][y]==1) { //основной куб
              cube.positionX=newX
              cube.positionY=newY
              cube.CUBEpositionX=x
              cube.CUBEpositionY=y
              objCube.position.set(newX, newY, cube.positionZ);
            } else { //прочие кубы
              objCubes[n].position.set(newX, newY, cube.positionZ);
              n++
            }
          }
        } 
      } 
  
      scene.add(objCube);
      objCubes.forEach(item=>scene.add(item));
    })
  }
  initCubes()

  //обновление состояния камеры
  function updateCameraState() {
    objCamera.position.x=camera.positionX;
    objCamera.position.y=camera.positionY;
    objCamera.position.z=camera.positionZ;
    objCamera.lookAt(new THREE.Vector3(camera.lookX,camera.lookY,camera.lookZ));
  }
  function chooseCamera() {
    switch (cameraType) {
      case '1': {
        camera.positionX=0
        camera.positionY=-2000
        camera.positionZ=718
        camera.lookX=0
        camera.lookY=1360
        camera.lookZ=0
        break
      }
      case '2': {
        camera.positionX=0
        camera.positionY=0
        camera.positionZ=2400
        camera.lookX=0
        camera.lookY=0
        camera.lookZ=0
        break
      }
      case '3': {
        camera.positionX=cube.positionX
        camera.positionY=cube.positionY
        camera.positionZ=1000
        camera.lookX=cube.positionX
        camera.lookY=cube.positionY
        camera.lookZ=0
        break
      }
    }
  }
  //обновление координат куба
  function updateCubeCoords() {
    objCube.position.x=cube.positionX;
    objCube.position.y=cube.positionY;
  }
  //обработка клавиш клавиатуры
  function handlekeyboardKey() {
    var x = cube.CUBEpositionX
    var y = cube.CUBEpositionY
    var f = false
    switch (event.keyCode) {
      case 38:
      case 87: { 'w'
        if (y!=9) {
          if (matrixOfCubes[x][y+1]!=2 || !interaction) {
            cube.CUBEpositionY++
            f = true
          }  
        } 
        break
      }
      case 40:
      case 83: { 's'
        if (y!=0) {
          if (matrixOfCubes[x][y-1]!=2 || !interaction) {
            cube.CUBEpositionY--
            f = true
          }
        } 
        break
      }
      case 37:
      case 65: { 'a'
        if (x!=0) {
          if (matrixOfCubes[x-1][y]!=2 || !interaction) {
            cube.CUBEpositionX--
            f = true
          }  
        } 
        break
      }
      case 39:
      case 68: { 'd'
        if (x!=9) {
          if (matrixOfCubes[x+1][y]!=2 || !interaction) {
            cube.CUBEpositionX++
            f = true
          }
        }
        break
      }
    }
    if (f) {
      matrixOfCubes[x][y]-- 
      matrixOfCubes[cube.CUBEpositionX][cube.CUBEpositionY]++
      cube.positionX=absToRel(cube.CUBEpositionX)
      cube.positionY=absToRel(cube.CUBEpositionY)
      if (cameraType=='3') chooseCamera()
    }
  }
  //анимация
  function loop() {
    updateCubeCoords();
    updateCameraState();

    renderer.render(scene, objCamera);
    requestAnimationFrame(function() {loop();});
  }
  function deleteAllCubes(callback) {
    for (let i = scene.children.length - 1; i >= 0; i--) {
      if(scene.children[i].type === "Mesh" && scene.children[i].geometry.type=="BoxGeometry")
          scene.remove(scene.children[i]);
    }
    callback()
  }
  document.querySelectorAll(".camera").forEach(item=>{
    item.onclick = function(){
      cameraType=this.innerText
      Array.from(document.getElementsByClassName("camera")).forEach(item=>{
        if (item.getAttribute("id")=="camera"+cameraType)
          item.style.backgroundColor="red"
        else
          item.style.backgroundColor="gray"
      })
      chooseCamera()
    };
  })
  document.querySelectorAll(".interaction").forEach(item=>{
    item.onclick = function(){
      interaction=(this.innerText=='вкл' ? true : false)
      if (interaction) {
        document.getElementById("switchOn").style.backgroundColor="red"
        document.getElementById("switchOff").style.backgroundColor="gray"
      } else {
        document.getElementById("switchOff").style.backgroundColor="red"
        document.getElementById("switchOn").style.backgroundColor="gray"
      }
    };
  })
  document.querySelectorAll(".density").forEach(item=>{
    item.onclick = function(){
      density=1/Number((this.innerText)[this.innerText.length-1])
      Array.from(document.getElementsByClassName("density")).forEach(item=>{
        var str = item.getAttribute("id")
        if (1/Number(str[str.length-1])==density) {
          item.style.backgroundColor="red"
        }
        else
          item.style.backgroundColor="gray"
      })
      deleteAllCubes(function() {
        initCubes()
      })
    };
  })
  addEventListener("keydown", handlekeyboardKey);
  loop();
}