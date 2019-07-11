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
  var clickedOnce = false
  var lastX, lastY
  var goTR = false
  var route = []
  var moved = true
  var clickedMouseWhenGoTR = false
  var pressedKeyWhenGoTR = false
  var copyEvent
  var playAudio = false //true
  /*var promise1 = document.querySelector('#audio2037')
  if (promise1 !== undefined) {
	promise1.then(_ => {
		playAudio = playAudio && true
	}).catch(error => {
		playAudio = playAudio && false
	});
  }
  var promise2 = document.querySelector('#audio2362')
  if (promise2 !== undefined) {
	promise2.then(_ => {
		playAudio = playAudio && true
	}).catch(error => {
		playAudio = playAudio && false
	});
  }*/
  var sound2037 = document.getElementById("audio2037")
  var sound2362 = document.getElementById("audio2362")
  sound2037.loop=true
  sound2362.loop=true
  /*if (playAudio) {
	document.getElementById("switchOn3").style.backgroundColor="red";
	sound2037.play();
	sound2362.play();
  } else {
	document.getElementById("switchOff3").style.backgroundColor="red";
  }*/
  document.getElementById("switchOff3").style.backgroundColor="red";
	
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

  var objCube, objCubes, objMarker1, objMarker2
  var cubeSize = size/cage
  var cube = {
    positionX: 0,
    positionY: 0,
    positionZ: cubeSize/2,
    CUBEpositionX: 0,
    CUBEpositionY: 0
  }

  var cube2037 = {
    positionX: 0,
    positionY: 0,
    positionZ: cubeSize/2
  }
  var cube2362 = {
    positionX: 0,
    positionY: 0,
    positionZ: cubeSize/2
  }
  //sound2037 издает оранжевый кубик
  
  /*var sound2037 = new Howl({
    autoplay: true,
    buffer: true,
    loop: true,
    volume: 0.0,
    src: ['/audio/2037.mp3']
  })*/
  //sound2362 издает малиновый кубик
  /*var sound2362 = new Howl({
    autoplay: true,
    buffer: true,
    loop: true,
    volume: 0.0,
    src: ['/audio/2362.mp3']
  })*/

  var matrixOfCubes
  var geometryCube = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  var geometryMarker = new THREE.BoxGeometry(cubeSize, cubeSize, 10);
  var materialCube1 = new THREE.MeshBasicMaterial({color: 0x007BA7, wireFrame: false});
  var materialCube2 = new THREE.MeshBasicMaterial({color: 0x7FFF00, vertexColors: THREE.FaceColors});
  var materialCube2037 = new THREE.MeshBasicMaterial({color: 0xFF8C00, wireFrame: false});
  var materialCube2362 = new THREE.MeshBasicMaterial({color: 0xE30B5C, wireFrame: false});
  var materialMarker1 = new THREE.MeshBasicMaterial({color: new THREE.Color("rgb(250, 128, 114)"), wireFrame: false});
  var materialMarker2 = new THREE.MeshBasicMaterial({color: new THREE.Color("rgb(220, 20, 60)"), wireFrame: false});
  var objMarker1 = new THREE.Mesh(geometryMarker, materialMarker1);
  var objMarker2 = new THREE.Mesh(geometryMarker, materialMarker2);
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
  function initCubes(callback) {
    initMatrix(function(amountOfCubes, matrix) {
      matrixOfCubes = matrix
  
      //основной куб
      objCube = new THREE.Mesh(geometryCube, materialCube1);
      
      //прочие кубы
      objCubes = []
      objCubes[0] = new THREE.Mesh(geometryCube, materialCube2037); //оранжевый
      objCubes[1] = new THREE.Mesh(geometryCube, materialCube2362); //малиновый
      for (var i=2; i<amountOfCubes-1; i++) {
        for (var j=0; j<geometryCube.faces.length; j++) {
          geometryCube.faces[j].color.setRGB(Math.random(),Math.random(),Math.random());
        }
        objCubes[i] = new THREE.Mesh(geometryCube, materialCube2); //золотистый
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
              if (n==0) {
                cube2037.positionX=newX
                cube2037.positionY=newY
              } else if (n==1) {
                cube2362.positionX=newX
                cube2362.positionY=newY
              }
              objCubes[n].position.set(newX, newY, cube.positionZ);
              n++
            }
          }
        } 
      } 
  
      scene.add(objCube);
      objCubes.forEach(item=>scene.add(item));
      initMarker1()
      initMarker2()
      scene.add(objMarker1, objMarker2);
      return callback()
    })
  }
  initCubes(function() {
    initMoving()
  })

  function initMarker1() {
    objMarker1.position.x=0
    objMarker1.position.y=0
    objMarker1.position.z=-10
  }
  function initMarker2() {
    objMarker2.position.x=0
    objMarker2.position.y=0
    objMarker2.position.z=-10
  }
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
    if (goTR) {
      pressedKeyWhenGoTR = true
      goTR=false
      copyEvent = event
    } else if (activity) {
      switch (event.keyCode) {
        case 38:
        case 87: { //'w'
          if (y!=9) {
            if (matrixOfCubes[x][y+1]!=2 || !interaction) {
              if (smoothness) {
                activity=false
                initMoving()
                initMovementSmoothly('y',step)
              } //else {
                cube.CUBEpositionY++
              //}
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
                initMoving()
                initMovementSmoothly('y',-step)
              } //else {
                cube.CUBEpositionY--
              //}
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
                initMoving()
                initMovementSmoothly('x',-step)
              } //else {
                cube.CUBEpositionX--
              //}
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
                initMoving()
                initMovementSmoothly('x',step)
              } //else {
                cube.CUBEpositionX++
              //}
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
        console.log("handlekeyboardKey()")
        console.log("cube.CUBEpositionX=",cube.CUBEpositionX)
        console.log("cube.CUBEpositionY=",cube.CUBEpositionY)
        /*for (var x=0; x<matrixOfCubes.length; x++) {
          var str = ''
          for (var y=0; y<matrixOfCubes[x].length; y++) {        
            str+=(matrixOfCubes[x][y]+' ')
          } 
          console.log(str)
        }*/
      }
    }
  }
  //инициализация полей
  function setFieldsNearby(mat, x, y, n) {
    var f = false
    var isChanged = false
    if (x-1>=0) { //три клетки слева
      /*if (y-1>=0) { //клетка сверху
        if (mat[x-1][y-1]=='F')
          f = true
        else if (mat[x-1][y-1]=='-')
          mat[x-1][y-1]=n
      }*/
      /*if (y+1<=mat.length) { //клетка снизу
        if (mat[x-1][y+1]=='F')
          f = true
        else if (mat[x-1][y+1]=='-')
          mat[x-1][y+1]=n
      }*/
      if (mat[x-1][y]=='F')
          f = true
      else if (mat[x-1][y]=='-') //клетка по центру 
      {
        mat[x-1][y]=n
        isChanged = true
      }
        
    }
    if (x+1<=mat[x].length-1) { //три клетки справа
      /*if (y-1>=0) { //клетка сверху
        if (mat[x+1][y-1]=='F')
          f = true
        else if (mat[x+1][y-1]=='-')
          mat[x+1][y-1]=n
      }*/
      /*if (y+1<=mat.length) { //клетка снизу
        if (mat[x+1][y+1]=='F')
          f = true
        else if (mat[x+1][y+1]=='-')
          mat[x+1][y+1]=n
      }*/
      if (mat[x+1][y]=='F')
          f = true
      else if (mat[x+1][y]=='-') //клетка по центру
      {
        mat[x+1][y]=n
        isChanged = true
      }
    } //клетка сверху и клетка снизу
    if (y-1>=0) { //клетка сверху
      if (mat[x][y-1]=='F')
          f = true
      else if (mat[x][y-1]=='-')
      {
        mat[x][y-1]=n
        isChanged = true
      }  
    } 
    if (y+1<=mat.length) { //клетка снизу
      if (mat[x][y+1]=='F')
        f = true
      else if (mat[x][y+1]=='-') 
      {
        mat[x][y+1]=n
        isChanged = true
      }
    }
    return [f, isChanged]
  }
  //получить координаты F
  function Fcoords(mat) {
    for (var x=0; x<mat.length; x++) {
      for (var y=0; y<mat[x].length; y++) {        
        if (mat[x][y]=='F') return [x,y]
      } 
    } 
  }
  //получить минимальное поле рядом
  function getMinCell(mat, x, y) {
    var xmin, ymin
    var existsMin = false
    var min = parseInt(mat[x][y], 10)
    if (x-1>=0) { //три клетки слева
      if (mat[x-1][y]!='x' && mat[x-1][y]!='-' && mat[x-1][y]<min) //клетка по центру 
      {
        min=mat[x-1][y]
        xmin=x-1
        ymin=y
        existsMin = true
      }
    }
    if (x+1<=mat[x].length-1) { //три клетки справа
      if (mat[x+1][y]!='x' && mat[x+1][y]!='-' && mat[x+1][y]<min) //клетка по центру 
      {
        min=mat[x+1][y]
        xmin=x+1
        ymin=y
        existsMin = true
      }
    } //клетка сверху и клетка снизу
    if (y-1>=0) { //клетка сверху
      if (mat[x][y-1]!='x' && mat[x][y-1]!='-' && mat[x][y-1]<min) //клетка по центру 
      {
        min=mat[x][y-1]
        xmin=x
        ymin=y-1
        existsMin = true
      }
    } 
    if (y+1<=mat.length) { //клетка снизу
      if (mat[x][y+1]!='x' && mat[x][y+1]!='-' && mat[x][y+1]<min) //клетка по центру 
      {
        min=mat[x][y+1]
        xmin=x
        ymin=y+1
        existsMin = true
      }
    }
    return [xmin, ymin, existsMin]
  }
  //движение по маршруту
  function goTheRoute() {
    if (route.length>1) {
      var firstX = route[route.length-1][0]
      var secondX = route[route.length-2][0]
      var firstY = route[route.length-1][1]
      var secondY = route[route.length-2][1]
      var step = 10
      if (firstX-secondX>0) { //влево
        initMovementSmoothly('x',-step)
        cube.CUBEpositionX--
      } else if (firstX-secondX<0) { //вправо
        initMovementSmoothly('x',step)
        cube.CUBEpositionX++
      } else if (firstY-secondY<0) { //вниз
        initMovementSmoothly('y',step)
        cube.CUBEpositionY++
      } else { //вверх
        initMovementSmoothly('y',-step)
        cube.CUBEpositionY--
      }
      route.splice(route.length-1, 1);
      matrixOfCubes[firstX][firstY]-- 
      matrixOfCubes[cube.CUBEpositionX][cube.CUBEpositionY]++
    } else {
      route=[]
      goTR=false
    }
    moved=false
  }
  //работа алгоритма Ли
  function executeAlgorithm() {
    var f = false
    var isChanged = true
    if (matrixOfCubes[lastX][lastY]==2) isChanged = false
    var algMatrix = []
    for (var x=0; x<matrixOfCubes.length; x++) {
      algMatrix[x] = []
      for (var y=0; y<matrixOfCubes[x].length; y++) {        
        algMatrix[x][y] = matrixOfCubes[x][y]
        if (algMatrix[x][y]==1 || algMatrix[x][y]==3)  algMatrix[x][y]='0' //точка отсчета
        else if (algMatrix[x][y]==2 && interaction) algMatrix[x][y]='х' //препятствие
        else algMatrix[x][y]='-' //пустота
      } 
    } 
    algMatrix[lastX][lastY]='F' //конечная
    var count = 0
    while (!f && isChanged) {
      var isChanged1 = false
      for (var x=0; x<matrixOfCubes.length; x++) {
        for (var y=0; y<matrixOfCubes[x].length; y++) {        
          if (algMatrix[x][y]==count+'') {
            var arr = setFieldsNearby(algMatrix, x, y, (count+1)+'')
            f1 = arr[0] //найдена ли конечная рядом
            isChanged2 = arr[1] //произошла ли инициализация рядом
            f = f || f1
            isChanged1 = isChanged1 || isChanged2
          }
        } 
      } 
      isChanged = isChanged && isChanged1
      count++
    }
    for (var x=0; x<matrixOfCubes.length; x++) {
      var str = ''
      for (var y=0; y<matrixOfCubes[x].length; y++) {        
        str+=(algMatrix[x][y]+' ')
      } 
      console.log(str)
    }
    if (f) {
      route = []
      route[0]=Fcoords(algMatrix)
      algMatrix[route[0][0]][route[0][1]]=count+''
      var length = 0
      var s = false
      while (!s) {
        var arr = getMinCell(algMatrix, route[length][0], route[length][1])
        s = !arr[2]
        if (arr[2]) {
          route[length+1]=[]
          route[length+1][0]=arr[0]
          route[length+1][1]=arr[1]
          length++
        }
      }
      goTR=true
      console.log(route)
    } else {
      alert("Препятствие мешает добраться до выбранной позиции")
    }
  }
  //обработка нажатия ЛКМ
  function clickMouse() {
    if (event.which==1 && activity) {
      var x=event.clientX/canvas.getAttribute("width")*2-1
      var y=-event.clientY/canvas.getAttribute("height")*2+1
      var vec = getIntersectionPoint(x, y)
      //console.log("posX="+vec.x+" posY="+vec.y+" posZ="+vec.z)
      if (vec.x>=-1000 && vec.x<=1000 && vec.y>=-1000 && vec.y<=1000) {
        //clearPlane()
        
        var cellX = relToAbs(vec.x)
        var cellY = relToAbs(vec.y)
        if (!clickedOnce) {
          clickedOnce = true
          selectCellPlane(cellX, cellY,2)
        } else {
          if (lastX==cellX && lastY==cellY) { 
            if (teleport) {
              matrixOfCubes[cube.CUBEpositionX][cube.CUBEpositionY]-- 
              matrixOfCubes[cellX][cellY]++
              cube.CUBEpositionX=cellX
              cube.CUBEpositionY=cellY
              cube.positionX=absToRel(cube.CUBEpositionX)
              cube.positionY=absToRel(cube.CUBEpositionY)
              console.log("clickMouse()")
              console.log("cube.CUBEpositionX=",cube.CUBEpositionX)
              console.log("cube.CUBEpositionY=",cube.CUBEpositionY)
            } else { //вызов алгоритма
              //activity = false        
              if (!goTR) {
                initMoving()
                executeAlgorithm()
              } else {
                clickedMouseWhenGoTR = true
              }
            }
          } 
          clickedOnce = false
        }      
        lastX = cellX
        lastY = cellY  
      }
    }
  }
  //обработка движения мыши
  function moveMouse() {
    var x=event.clientX/canvas.getAttribute("width")*2-1
    var y=-event.clientY/canvas.getAttribute("height")*2+1
    var vec = getIntersectionPoint(x, y)
    if (vec.x>=-1000 && vec.x<=1000 && vec.y>=-1000 && vec.y<=1000) {
      //clearPlane()
      var cellX = relToAbs(vec.x)
      var cellY = relToAbs(vec.y)
      selectCellPlane(cellX, cellY,1)
      if (cellX!=lastX && cellY!=lastY) clickedOnce=false
    } else {
      initMarker1()
    }
  }
  //плоскость имеет цвет по умолчанию (шахматная доска)
  function clearPlane() {
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
    x = absToRel(x)
    y = absToRel(y)
    switch (t) {
      case 1: {
        if (!activity && x!=absToRel(lastX) && y!=absToRel(lastY) || activity) {
          objMarker1.position.x=x
          objMarker1.position.y=y
          objMarker1.position.z=0
          initMarker2()
        }
        break
      }
      case 2: {
        objMarker2.position.x=x
        objMarker2.position.y=y
        objMarker2.position.z=0
        initMarker1()
        break
      }
    }
    //var arr = getCellPlane(x, y)
    //arr.forEach((item, i)=>{geometryPlane.faces[i].color=color})
    ///objPlane=new THREE.Mesh(geometryPlane, materialPlane)
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
  var beginX, beginY, endX, endY, stepX = 0, stepY = 0
  function initMoving() {
    beginX = cube.positionX
    beginY = cube.positionY
    endX = cube.positionX
    endY = cube.positionY
  }
  //определение расстояния от точки до точки по координатам в 2/3-хмерном пространстве 
  function distance2D(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))
  }
  function distance3D(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2)+Math.pow(z2-z1,2))
  }
  //аудио
  function updateAudio() {
    var dis2037 = distance2D(cube.positionX, cube.positionY, cube2037.positionX, cube2037.positionY)
    var dis2362 = distance2D(cube.positionX, cube.positionY, cube2362.positionX, cube2362.positionY)
    dis2037=Math.round(dis2037*100)/100
    dis2362=Math.round(dis2362*100)/100
    var vol2037, vol2362
    if (dis2037>1000) {
      vol2037=0
    } else {
      vol2037=1-dis2037/1000
    }
    if (dis2362>1000) {
      vol2362=0
    } else {
      vol2362=1-dis2362/1000
    }
    sound2037.volume=vol2037
    sound2362.volume=vol2362
  }
  //анимация
  function loop() {
    /*if (clickedMouseWhenGoTR && moved) {
      
      //executeAlgorithm()
    } else*/ if (goTR && moved) goTheRoute()
    if (beginX!=endX || beginY!=endY) {
      moveSmoothly();
    } else {
      /*cube.CUBEpositionY=relToAbs(cube.positionY);
      cube.CUBEpositionX=relToAbs(cube.positionX);*/
      if (clickedMouseWhenGoTR) {
        //if (((endX-100)%200==0) && ((endY-100)%200==0)) {
          goTR = false
          route=[]
          executeAlgorithm()
          clickedMouseWhenGoTR = false 
        //}
      }
      if (pressedKeyWhenGoTR) {
        debugger
        route=[]
        pressedKeyWhenGoTR = false
        dispatchEvent(copyEvent)
      }
      moved=true
      activity=true
    }
    
    updateCubeCoords();
    updateCameraState();
    updateAudio();
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
      goTR = false
      moved = false
      route = []
      deleteAllCubes(function() {
        initCubes(function() {
          initMoving()
        })
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
      teleport=(this.innerText=='телепорт' ? true : false)
      if (teleport) {
        document.getElementById("instantly").style.backgroundColor="red"
        document.getElementById("route").style.backgroundColor="gray"
        if (goTR) {
          var x = route[0][0]
          var y = route[0][1]
          var curX, curY
          for (var i=0; i<matrixOfCubes.length; i++) {
            for (var j=0; j<matrixOfCubes[i].length; j++) {
              if (matrixOfCubes[i][j]==1 || matrixOfCubes[i][j]==3) {
                curX = i
                curY = j
              }
            }
          }
          matrixOfCubes[curX][curY]-- 
          matrixOfCubes[x][y]++
          cube.CUBEpositionX=x
          cube.CUBEpositionY=y
          cube.positionX=absToRel(cube.CUBEpositionX)
          cube.positionY=absToRel(cube.CUBEpositionY)
          goTR=false
          route=[]
          initMoving()
        }
      } else {
        document.getElementById("route").style.backgroundColor="red"
        document.getElementById("instantly").style.backgroundColor="gray"
      }
      /*при условии, что выбрана ячейка и известны ее координаты, сработает некоторый код*/
    };
  })
  document.querySelectorAll(".audio").forEach(item=>{
    item.onclick = function(){
		debugger
      playAudio=(this.innerText=='вкл' ? true : false)
      if (playAudio) {
        document.getElementById("switchOn3").style.backgroundColor="red"
        document.getElementById("switchOff3").style.backgroundColor="gray"
		sound2037.play()
		sound2362.play()
      } else {
        document.getElementById("switchOff3").style.backgroundColor="red"
        document.getElementById("switchOn3").style.backgroundColor="gray"
		sound2037.pause()
		sound2362.pause()
      }
    };
  })
  addEventListener("keydown", handlekeyboardKey);
  addEventListener("click", clickMouse);
  addEventListener("mousemove", moveMouse);
  loop();
}