window.onload = function() {
  var density = 1/5;
  var interaction = true;
  document.getElementById("switchOn").style.backgroundColor="red";
  document.getElementById("density5").style.backgroundColor="red";
  document.getElementById("camera1").style.backgroundColor="red";
  document.getElementById("switchOn2").style.backgroundColor="red";
  document.getElementById("instantly").style.backgroundColor="red";
  var cameraType = 1;
  var cage = 10;
  var size = 2000;
  var smoothness = true;
  var teleport = true;
  var activity = true


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
  var objPlane, geometryPlane, materialPlane
  createPlane();

  function absToRel(coord) {
    return size/cage*coord-1000+size/cage/2
  }
  function relToAbs(coord) {
    return parseInt((coord+1000)*cage/size,10)
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
  
  function getIntersectionPoint(mouseX, mouseY) {
    var vec = new THREE.Vector3(mouseX, mouseY, 0.5);
    var pos = new THREE.Vector3();
    vec.unproject(objCamera).sub(objCamera.position).normalize();
    var distance = - objCamera.position.z / vec.z;
    pos.copy(objCamera.position).add(vec.multiplyScalar(distance));
    return pos
    /*http://qaru.site/questions/127326/mouse-canvas-x-y-to-threejs-world-x-y-z*/
  }
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
    /*console.log(`(x0;y0)=(${objCube.position.x};${objCube.position.y})`)
    console.log(`(x;y)=(${cube.positionX};${cube.positionY})`)*/
    objCube.position.x=cube.positionX;
    objCube.position.y=cube.positionY;
  }
  //плавное перемещение куба
  function initMovementSmoothly(coord, n) {
    switch(coord) {
      case 'y': {
        beginY=cube.positionY
        endY=beginY+200*Math.sign(n)
        stepY=n
        stepX=0
        break
      }
      case 'x': {
        beginX=cube.positionX
        endX=beginX+200*Math.sign(n)
        stepX=n
        stepY=0
        break
      }
    }
  }
  function moveSmoothly() {
    beginX+=stepX
    beginY+=stepY
    cube.positionX=beginX
    cube.positionY=beginY
    if (cameraType==3) {
      chooseCamera()
    }
  }
  //обработка клавиш клавиатуры
  function handlekeyboardKey() {
    var x = cube.CUBEpositionX
    var y = cube.CUBEpositionY
    var f = false
    var step = 10
    if (activity) {
      switch (event.keyCode) {
        case 38:
        case 87: { //'w'
          if (y!=9) {
            if (matrixOfCubes[x][y+1]!=2 || !interaction) {
              if (smoothness) {
                activity=false
                initMovementSmoothly('y',step)
              } else {
                cube.CUBEpositionY++
              }
              f = true
            }  
          } 
          break
        }
        case 40:
        case 83: { //'s'
          if (y!=0) {
            if (matrixOfCubes[x][y-1]!=2 || !interaction) {
              if (smoothness) {
                activity=false
                initMovementSmoothly('y',-step)
              } else {
                cube.CUBEpositionY--
              }
              f = true
            }
          } 
          break
        }
        case 37:
        case 65: { //'a'
          if (x!=0) {
            if (matrixOfCubes[x-1][y]!=2 || !interaction) {
              if (smoothness) {
                activity=false
                initMovementSmoothly('x',-step)
              } else {
                cube.CUBEpositionX--
              }
              f = true
            }  
          } 
          break
        }
        case 39:
        case 68: { //'d'
          if (x!=9) {
            if (matrixOfCubes[x+1][y]!=2 || !interaction) {
              if (smoothness) {
                activity=false
                initMovementSmoothly('x',step)
              } else {
                cube.CUBEpositionX++
              }
              f = true
            }
          }
          break
        }
      }
      if (f) {
        matrixOfCubes[x][y]-- 
        matrixOfCubes[cube.CUBEpositionX][cube.CUBEpositionY]++
        if (!smoothness) {
          cube.positionX=absToRel(cube.CUBEpositionX)
          cube.positionY=absToRel(cube.CUBEpositionY)
        }
        if (cameraType=='3') chooseCamera()
      }
    }
  }
  //обработка нажатия ПКМ
  function clickMouse() {
    if (event.which==3) {
      var x=event.clientX/canvas.getAttribute("width")*2-1
      var y=-event.clientY/canvas.getAttribute("height")*2+1
      var vec = getIntersectionPoint(x, y)
      console.log("posX="+vec.x+" posY="+vec.y+" posZ="+vec.z)
      if (vec.x>=-1000 && vec.x<=1000 && vec.y>=-1000 && vec.y<=1000) {
        clearPlane()
        var cellX = relToAbs(vec.x)
        var cellY = relToAbs(vec.y)
        selectCellPlane(cellX, cellY,2)
      }
    }
  }
  //обработка движения мыши
  function moveMouse() {
    var x=event.clientX/canvas.getAttribute("width")*2-1
    var y=-event.clientY/canvas.getAttribute("height")*2+1
    var vec = getIntersectionPoint(x, y)
    if (vec.x>=-1000 && vec.x<=1000 && vec.y>=-1000 && vec.y<=1000) {
      clearPlane()
      var cellX = relToAbs(vec.x)
      var cellY = relToAbs(vec.y)
      selectCellPlane(cellX, cellY,1)
    }
  }
  //плоскость имеет цвет по умолчанию (шахматная доска)
  function clearPlane() {
    debugger
    materialPlane = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});
    for (var i=0; i<geometryPlane.faces.length; i++) {
      var color1 = new THREE.Color("rgb(245, 245, 220)");
      var color2 = new THREE.Color("rgb(255, 255, 255)");
      (((i/(cage*2)|0)%2)+(i%4<2))%2 ? geometryPlane.faces[i].color=color1 : geometryPlane.faces[i].color=color2
    }
    objPlane=new THREE.Mesh(geometryPlane, materialPlane)
    //deletePlane()
    //createPlane()
  }
  //выделить ячейку розовым/красным цветом
  function selectCellPlane(x, y, t) {
    debugger
    var color
    t == 1 ? color =  new THREE.Color("rgb(250, 128, 114)") : color = new THREE.Color("rgb(220, 20, 60)")
    var arr = getCellPlane(x, y)
    arr.forEach((item, i)=>{geometryPlane.faces[i].color=color})
    objPlane=new THREE.Mesh(geometryPlane, materialPlane)
    //deletePlane()
    //createPlane()
  }
  function createPlane() {
    geometryPlane = new THREE.PlaneGeometry(size, size, cage, cage);
    clearPlane();
    objPlane = new THREE.Mesh(geometryPlane, materialPlane);
    scene.add(objPlane);
  }
  function deletePlane() {
    scene.children.forEach(item=>{
      if (item.type=="Mesh" && item.geometry.type=="PlaneGeometry")
        scene.remove(item)
    })
  }
  function getCellPlane(x, y) {
    var newY = 9 - y
    var cell = 2*(10*newY+x)
    return [cell, cell+1]
  }
  var beginX = cube.positionX, beginY = cube.positionY, endX = cube.positionX, endY = cube.positionY, stepX = 0, stepY = 0
  //анимация
  function loop() {
    
    if (beginX!=endX || beginY!=endY) moveSmoothly();
    else {
      cube.CUBEpositionY=relToAbs(cube.positionY);
      cube.CUBEpositionX=relToAbs(cube.positionX);
      activity=true
    }
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
        var id = item.getAttribute("id")
        if (id=="camera"+cameraType)
          item.style.backgroundColor="red"
        else
          item.style.backgroundColor="gray"
        if (item.style.backgroundColor=="red") {
          /*if (id=="camera2") {
            //реакция на нажатие камеры 2
            document.getElementById("tableSettings").style.height="90%"
            document.getElementById("settings").style.height="150px"
            document.getElementById("adding").style.display="table-row"
          } else {
            document.getElementById("tableSettings").style.height="90%"
            document.getElementById("settings").style.height="120px"
            document.getElementById("adding").style.display="none"
          }*/
        }
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
  document.querySelectorAll(".smoothness").forEach(item=>{
    item.onclick = function(){
      smoothness=(this.innerText=='вкл' ? true : false)
      if (smoothness) {
        document.getElementById("switchOn2").style.backgroundColor="red"
        document.getElementById("switchOff2").style.backgroundColor="gray"
      } else {
        document.getElementById("switchOff2").style.backgroundColor="red"
        document.getElementById("switchOn2").style.backgroundColor="gray"
      }
    };
  })
  document.querySelectorAll(".moving").forEach(item=>{
    item.onclick = function(){
      teleport=(this.innerText=='сразу' ? true : false)
      if (teleport) {
        document.getElementById("instantly").style.backgroundColor="red"
        document.getElementById("route").style.backgroundColor="gray"
      } else {
        document.getElementById("route").style.backgroundColor="red"
        document.getElementById("instantly").style.backgroundColor="gray"
      }
      /*при условии, что выбрана ячейка и известны ее координаты, сработает некоторый код*/
    };
  })
  addEventListener("keydown", handlekeyboardKey);
  addEventListener("click", clickMouse);
  addEventListener("mousemove", moveMouse);
  loop();
}