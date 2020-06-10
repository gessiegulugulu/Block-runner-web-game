var canvas = document.getElementById("renderCanvas");
// 第二个选项是是否开启平滑（anti-alias）
var engine = new BABYLON.Engine(canvas, true);
// engine.enableOfflineSupport = false;
// 除非想做离线体验，这里可以设为 false

var notPicked = false;
var hasBeenPicked = false;
var advancedTexture, level, levelNumber, rect,scoreBoard, scoreNumber, highScoreNumber, highScore, score;
var hardLevel = 0.07;//0,0.07,0.13
var moveSpeed = 0.3;
var currentLevel = 1;
var currentScore = 0;
var currentHighScore = 0;
var skyboxPath = "textures/skybox4/skybox4";
var textColor = "white";
var blockColors = [];
blockColors[0] = new BABYLON.Color3(0.02, 0.15, 0.69);
blockColors[1] = new BABYLON.Color3(0.02, 0.15, 0.69);
blockColors[2] = BABYLON.Color3.Red();
blockColors[3] = BABYLON.Color3.Yellow();
blockColors[4] = BABYLON.Color3.Green();
blockColors[5] = BABYLON.Color3.Yellow();

//创建场景
var createScene = function () {

    var scene = new BABYLON.Scene(engine); //创建场景
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0); //定义重力，可以应用在相机

    //创建相机
    var camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 2.5, 28), scene);
    // camera.setTarget(BABYLON.Vector3.Zero())
    camera.setTarget(new BABYLON.Vector3(0, 0, -40), scene);
    camera.speed = 0.5;
    camera.applyGravity = true; //应用重力
    camera.checkCollisions = true; //相机发生碰撞
    //后面需要声明与相机发生碰撞的物体

    //创建光源
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-10, 40, 40), scene);//-10,40,40
    // var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(-10, -40, 40), scene);
    var light3 = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(-10, -40, 40), scene);


    //实例化模型交互
    var inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    // scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function(evt) {
    //     inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    // }));
    // scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function(evt) {
    //     inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    // }));
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction( //按下方向键
            BABYLON.ActionManager.OnKeyDownTrigger,
            function (e) {
                // console.log("keydown");
                if (e.sourceEvent.type == "keydown")
                    inputMap[e.sourceEvent.key] = true;
                else
                    inputMap[e.sourceEvent.key] = false;
            })
    );
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction( //按下方向键
            BABYLON.ActionManager.OnKeyUpTrigger,
            function (e) {
                // console.log("keyup");
                if (e.sourceEvent.type == "keydown")
                    inputMap[e.sourceEvent.key] = true;
                else
                    inputMap[e.sourceEvent.key] = false;
            })
    );
    // console.log("inputMap", inputMap);

    playGame(scene, camera);
    displayScore(scene);

    scene.registerBeforeRender(function (scene) {
        //If picked start the scene
        if (notPicked) {
            // console.log("currentScore" + currentScore);
            hasBeenPicked = true;
            camera.position.z -= moveSpeed;//0.3
            cameraPositionVariable -= moveSpeed;
            if (cameraPositionVariable < -20) {
                currentScore += 1;
                scoreNumber.text = currentScore.toString();

                if (currentScore > currentHighScore) {
                    currentHighScore = currentScore;
                    highScoreNumber.text = currentHighScore.toString();
                }

                if (currentScore % 10 == 0) {
                    // camera.speed=0.5+0.2*(currentScore/10);
                    moveSpeed += hardLevel * (currentScore / 10);
                    // level=currentScore/10+1;
                    currentLevel += 1;
                    levelNumber.text = currentLevel.toString();
                    var texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI3");

                    levelup = new BABYLON.GUI.TextBlock();
                    levelup.fontFamily = "Neuropol";
                    levelup.text = "Level" + " " + currentLevel.toString();
                    levelup.fontSize = 30;
                    levelup.color = "#dcc04c";
                    levelup.top = "-300px";
                    // speedup.left = "250px";
                    texture.addControl(levelup);

                    console.log("level+hardLevel+ moveSpeed", currentLevel, hardLevel, moveSpeed);
                    console.log("hardLevel?0",hardLevel != 0);
                    if (hardLevel != 0) {
                        speedup = new BABYLON.GUI.TextBlock();
                        speedup.text = "Speed Up!";
                        speedup.fontFamily = "Neuropol";
                        speedup.fontSize = 25;
                        speedup.color = "#dcc04c";
                        speedup.top = "-250px";
                        // speedup.left = "250px";
                        texture.addControl(speedup);
                    }


                    setTimeout(function () {
                        if (hardLevel != 0) {
                            speedup.dispose();
                        }
                        levelup.dispose()
                    }, 1000);
                }

                cameraPositionVariable = cameraPositionVariable + 20;
                if (count > 30) {
                    transformMesh(zTranslation, scene);
                }
                count++;
            }
            notPicked = castRay(scene, camera); //false说明撞到
        } else if (hasBeenPicked) {
            disposeItems();
            playGame(scene, camera);
            displayScore(scene);
            hasBeenPicked = false;
        }
    });


    scene.onBeforeRenderObservable.add(function () {
        if (inputMap["d"] || inputMap["ArrowRight"]) {
            if (camera.position.x >= -9 && notPicked) {
                // console.log("左移");
                camera.position.x -= 0.33;
            }
        }
        if (inputMap["a"] || inputMap["ArrowLeft"]) {
            if (camera.position.x <= 9 && notPicked) {
                // console.log("右移");
                camera.position.x += 0.33;
            }
        }
    });
    return scene;
};

var playGame = function (scene, camera) {
    meshes = [];
    meshes.length = 30;
    arrayPosition = 0;

    animations = [];
    animations.length = 30;
    animationKeys = [];
    animationKeys.length = 30;
    nextAnimation = [];
    nextAnimation.length = 30;

    spriteManager = [];
    spriteManager.length = 10;
    spriteArrayPosition = 0;

    pathMeshes = [];
    pathMeshes.length = 84; //36
    pathArrayPosition = 0;

    zTranslation = -20;
    cameraPositionVariable = 28;
    count = 30;

    spriteDirection = [];
    spriteDirection.length = 10;

    camera.position.z = 28;
    camera.position.x = 0;

    currentScore = 0;
    moveSpeed = 0.3;
    currentLevel = 1;
    // hardLevel = 0.07;
    // skyboxPath="textures/skybox4/skybox4";
    gui(scene);
    skyBox(scene);
    initializeScene(scene);
    // displayScore(scene);
};

//游戏开始按钮
var gui = function (scene) {
    var newTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    //天空盒选择
    var rect2 = new BABYLON.GUI.Rectangle();
    rect2.width = "230px";
    rect2.height = "180px";
    rect2.top = "-235px";
    rect2.left = "570px";
    rect2.cornerRadius = 10;
    rect2.color = "white";
    rect2.thickness = 3;
    rect2.background = "#dcc04c";
    rect2.alpha=0.8;
    newTexture.addControl(rect2);

    var panelSkybox = new BABYLON.GUI.StackPanel();
    // panelSkybox.top = "-255px";
    // panelSkybox.left = "600px";//600px
    // panelSkybox.width = "200px";
    rect2.addControl(panelSkybox);

    var textblockSkybox = new BABYLON.GUI.TextBlock();
    textblockSkybox.fontSize=20;
    textblockSkybox.color = textColor;
    textblockSkybox.text = "Select the Scene";
    textblockSkybox.height = "30px";
    panelSkybox.addControl(textblockSkybox);

    var addRadioSkybox = function (text, parent) {

        var button = new BABYLON.GUI.RadioButton();
        button.width = "15px";
        button.height = "15px";
        button.color = "#dcc04c";
        button.background = "white";
        button.checkSizeRatio = "0.7";

        button.onIsCheckedChangedObservable.add(function (state) {
            if (state) {
                textblockSkybox.text = "You Selected " + text;
                if (text == "Sky") {
                    skyboxPath = "textures/skybox/skybox";
                }
                if (text == "Black") {
                    skyboxPath = "textures/skyboxBlack/skyboxBlack";
                }
                if (text == "Suburban") {
                    skyboxPath = "textures/skybox3/skybox3";
                }
                if (text == "Night Sky") {
                    skyboxPath = "textures/skybox4/skybox4";
                }
                if (text == "Nonegaga") {
                    skyboxPath = "textures/TropicalSunnyDay/TropicalSunnyDay";
                }
                skyBox(scene);
            }
        });

        var header = BABYLON.GUI.Control.AddHeader(button, text, "100px", {isHorizontal: true, controlFirst: true});
        header.color = "White";
        header.height = "30px";

        parent.addControl(header);
    }


    addRadioSkybox("Sky", panelSkybox,textColor);
    // addRadioSkybox("Nonegaga", panelSkybox);
    addRadioSkybox("Black", panelSkybox);
    addRadioSkybox("Suburban", panelSkybox);
    addRadioSkybox("Night Sky", panelSkybox);

    //难度选择
    var rect1 = new BABYLON.GUI.Rectangle();
    rect1.width = "230px";
    rect1.height = "150px";
    rect1.top = "-60px";//250px
    rect1.left = "570px";//330px
    rect1.cornerRadius = 10;
    rect1.color = "white";
    rect1.thickness = 3;
    rect1.background = "#dcc04c";
    rect1.alpha=0.8;
    newTexture.addControl(rect1);

    var panelLevel = new BABYLON.GUI.StackPanel();
    panelLevel.height="120px";
    panelLevel.thickness= 4;
    // panelLevel.color = "#dcc04c";
    // panelLevel.background="#4d4d4d";
    // panelLevel.top = "-270px";
    // panelLevel.left = "350px";
    panelLevel.width = "190px";
    panelLevel.thickness = 2;
    // newTexture.addControl(panelLevel);
    rect1.addControl(panelLevel);


    var textblock = new BABYLON.GUI.TextBlock();
    textblock.color = "white";
    // textblock.fontFamily="Monaco";
    textblock.fontSize=20;
    textblock.fontWeight=3;
    textblock.text = "Select the Difficulty";
    textblock.height = "30px";
    panelLevel.addControl(textblock);

    var addRadio = function (text, parent) {

        var button = new BABYLON.GUI.RadioButton();
        button.width = "15px";
        button.height = "15px";
        button.color = "#dcc04c";
        button.background = "white";
        button.checkSizeRatio = "0.7";

        button.onIsCheckedChangedObservable.add(function (state) {
            if (state) {
                textblock.text = "You Selected " + text;
                if (text == "Easy") {
                    hardLevel = 0;
                }
                if (text == "Normal") {
                    hardLevel = 0.07;
                }
                if (text == "Hard") {
                    hardLevel = 0.10;
                }
                console.log("hardLevel", hardLevel);
            }
        });

        var header = BABYLON.GUI.Control.AddHeader(button, text, "100px", {isHorizontal: true, controlFirst: true});
        header.color = "white";
        header.height = "30px";

        parent.addControl(header);
    };


    addRadio("Easy", panelLevel);
    addRadio("Normal", panelLevel);
    addRadio("Hard", panelLevel);


    //开始按钮
    var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", 'Click to Begin');
    button1.fontFamily="Neuropol";
    button1.width = "300px"
    button1.height = "80px";
    button1.color = "#dcc04c";
    button1.fontSize = 25;
    button1.cornerRadius = 100;
    button1.background = "#f2f2f2";
    // button1.background = "black"
    button1.thickness = 5;
    button1.onPointerUpObservable.add(function () {
        notPicked = true;
        rect1.dispose();
        rect2.dispose();
        button1.dispose(); //失效

    });
    newTexture.addControl(button1);
}

//创建天空盒
var skyBox = function (scene) {
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {
        size: 10000.0
    }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxPath, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    // skyboxMaterial.disableLighting = true;
};

//创建游戏场景
var initializeScene = function (scene) {
    initializeScenePath();
    initializeMeshesArray(scene);
};

//生成障碍物
var initializeMeshesArray = function (scene) {
    initializeSpritesArray(scene);
    var obstaclesMaterial = new BABYLON.StandardMaterial("obstaclesMaterial", scene);
    obstaclesMaterial.diffuseColor = new BABYLON.Color3(0.33, 0.52, 0.62);
    //科技蓝0.02, 0.15, 0.69//0.19, 0.62, 0.78
    // obstaclesMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.15, 0.69);
    // obstaclesMaterial.specularColor = new BABYLON.Color3(0.58, 0.50, 0.29);
    obstaclesMaterial.alpha = 0.7;

    for (var i = 0; i < 30; i++) {
        var iToString = i.toString();
        meshes[i] = BABYLON.MeshBuilder.CreateBox(iToString, {
            length: 3,
            width: 1,
            height: 3,
            depth: 0.15,
            // faceColors:blockColors
        }, scene);
        meshes[i].material = obstaclesMaterial;
        meshes[i].position.z = 40;
        meshes[i].position.x += i;
        meshes[i].position.y += i;
        // meshes[i].position.y = 1.5;

        //创建animationdui对象，参数：名称，移动的属性，每秒请求的帧数，修改值的类型，行为类型（从初始值重新启动）
        animations[i] = new BABYLON.Animation("myAnimation", "position.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        //动画数组
        animationKeys[i] = [];
        animationKeys[i].push({
            frame: 0,
            value: 0
        });
        //将动画数组添加到动画对象
        animations[i].setKeys(animationKeys[i]);
        //将动画对象链接到动画主体物品上
        meshes[i].animations = [];
        meshes[i].animations.push(animations[i]);
        //启动动画
        nextAnimation[i] = scene.beginAnimation(meshes[i], 0, 100, true);
    }

    for (var i = 0; i < 9; i++) {
        generate(scene);
        arrayPosition = arrayPosition + 3
    }
};

//赛道
var initializeScenePath = function () {

    var roadMaterial = new BABYLON.StandardMaterial("BlackMaterial", scene);
    //漫反射材质，在光线下观察的材料的基本颜色或质地
    roadMaterial.diffuseColor = new BABYLON.Color3(0.50, 0.51, 0.55);
    //镜面材质，光线给材质的亮点
    // roadMaterial.specularColor = new BABYLON.Color3(0.58, 0.50, 0.29);
    // roadMaterial.alpha = 0.9;

    var blockMaterial = new BABYLON.StandardMaterial("blockMaterial", scene);
    blockMaterial.diffuseColor = new BABYLON.Color3(0.96, 0.73, 0.25);
    //0.98, 0.76, 0.35
    //1, 0.64, 0.24
    blockMaterial.alpha = 0.8;

    var decorateMaterial = new BABYLON.StandardMaterial("blockMaterial", scene);
    decorateMaterial.diffuseColor = new BABYLON.Color3(0.96, 0.95, 0.96);
    decorateMaterial.alpha = 1;

    for (var i = 0; i <= 84; i += 7) {
        //路面
        // var sourcePlane = new BABYLON.Plane(0, 10, -1, 0);
        // sourcePlane.normalize();
        pathMeshes[i] = BABYLON.MeshBuilder.CreateGround("ground", {
            width: 20,
            height: 20,
            // sourcePlane:sourcePlane
        }, scene);
        pathMeshes[i].material = roadMaterial;
        pathMeshes[i].checkCollisions = true; //开启碰撞
        pathMeshes[i].position.z = 40;
        // pathMeshes[i].position.z = 20;
        // pathMeshes[i].position=new BABYLON.Vector3(0, 0, 40)

        // 左侧路障
        pathMeshes[i + 1] = BABYLON.MeshBuilder.CreateBox("box1", {
            length: 0.4, //1
            width: 20,
            height: 1,
            // faceColors:blockColors,
        }, scene);
        pathMeshes[i + 1].material = blockMaterial;
        pathMeshes[i + 1].rotation.y = Math.PI / 2; //立起来
        pathMeshes[i + 1].position.x = 10;
        pathMeshes[i + 1].position.z = 40;
        // pathMeshes[i + 1].position.z = 20;
        pathMeshes[i + 1].position.y = 0.9; //0.5
        // pathMeshes[i + 1].position=new BABYLON.Vector3(10, 0, 20);

        //右侧路障
        pathMeshes[i + 2] = BABYLON.MeshBuilder.CreateBox("box2", {
            length: 0.4,
            width: 20,
            height: 1,
        }, scene);
        pathMeshes[i + 2].material = blockMaterial;
        pathMeshes[i + 2].rotation.y = Math.PI / 2;
        pathMeshes[i + 2].position.x = -10;
        pathMeshes[i + 2].position.z = 40;
        // pathMeshes[i + 2].position.z = 20;
        pathMeshes[i + 2].position.y = 0.9;
        // pathMeshes[i + 2].position=new BABYLON.Vector3(-10, 0, 20);

        //装饰
        pathMeshes[i + 3] = BABYLON.MeshBuilder.CreateBox("box2-1", {
            length: 0.5,
            width: 20,
            height: 0.4,
        }, scene);
        pathMeshes[i + 3].material = decorateMaterial;
        pathMeshes[i + 3].rotation.y = Math.PI / 2;
        pathMeshes[i + 3].position.x = -10;
        pathMeshes[i + 3].position.z = 40;
        // pathMeshes[i + 2].position.z = 20;
        pathMeshes[i + 3].position.y = 0.2;

        pathMeshes[i + 4] = BABYLON.MeshBuilder.CreateBox("box2-2", {
            length: 0.5,
            width: 20,
            height: 0.4,
        }, scene);
        pathMeshes[i + 4].material = decorateMaterial;
        pathMeshes[i + 4].rotation.y = Math.PI / 2;
        pathMeshes[i + 4].position.x = -10;
        pathMeshes[i + 4].position.z = 40;
        // pathMeshes[i + 2].position.z = 20;
        pathMeshes[i + 4].position.y = 1.6;

        pathMeshes[i + 5] = BABYLON.MeshBuilder.CreateBox("box1-1", {
            length: 0.5,
            width: 20,
            height: 0.4,
        }, scene);
        pathMeshes[i + 5].material = decorateMaterial;
        pathMeshes[i + 5].rotation.y = Math.PI / 2;
        pathMeshes[i + 5].position.x = 10;
        pathMeshes[i + 5].position.z = 40;
        // pathMeshes[i + 2].position.z = 20;
        pathMeshes[i + 5].position.y = 0.2;

        pathMeshes[i + 6] = BABYLON.MeshBuilder.CreateBox("box1-2", {
            length: 0.5,
            width: 20,
            height: 0.4,
        }, scene);
        pathMeshes[i + 6].material = decorateMaterial;
        pathMeshes[i + 6].rotation.y = Math.PI / 2;
        pathMeshes[i + 6].position.x = 10;
        pathMeshes[i + 6].position.z = 40;
        // pathMeshes[i + 2].position.z = 20;
        pathMeshes[i + 6].position.y = 1.6;

        pathArrayPosition += 7;
    }

    scenePath(20);
    scenePath(0);
};

//前进时不断构建路径
var scenePath = function (zTranslation) {
    pathArrayPosition += 7; //3
    if (pathArrayPosition >= 84) {
        pathArrayPosition = 0;
    }
    pathMeshes[pathArrayPosition].position.z = zTranslation;
    pathMeshes[pathArrayPosition + 1].position.z = zTranslation;
    pathMeshes[pathArrayPosition + 2].position.z = zTranslation;

    pathMeshes[pathArrayPosition + 3].position.z = zTranslation;
    pathMeshes[pathArrayPosition + 4].position.z = zTranslation;
    pathMeshes[pathArrayPosition + 5].position.z = zTranslation;
    pathMeshes[pathArrayPosition + 6].position.z = zTranslation;
};

//精灵特朗普~~~
var initializeSpritesArray = function (scene) {

    var spriteManagerTrump = new BABYLON.SpriteManager(
        "TrumpManager",
        "./textures/trump_run.png",
        24, {
            width: 100,
            height: 100
        }, scene);

    for (var i = 0; i < 10; i++) {
        spriteManager[i] = new BABYLON.Sprite("trump"+i.toString(), spriteManagerTrump);
        spriteManager[i].position = new BABYLON.Vector3(9, 1.5, 40);
        // spriteManager[i].position.z=40*i;
        spriteManager[i].size = 4;//3
        spriteManager[i].cellIndex = 8;
        spriteDirection[i] = true;
        // spriteManager.checkCollisions = true;
        // spriteArrayPosition+=1;
    }
    // spriteBuild(40);
    var intervalID = window.setInterval(runTrump, 200);//行走
};

// var spriteBuild=function(zTranslation){
//     spriteArrayPosition+=1;
//     if(spriteArrayPosition>10){spriteArrayPosition=0;}
//     spriteManager[spriteArrayPosition].position.z=zTranslation;
// }

var runTrump = function () {

    for (var i = 0; i < 10; i++) {
        if (spriteDirection[i]) {
            if (spriteManager[i].cellIndex < 8) {
                spriteManager[i].cellIndex = 8;
            } else if (spriteManager[i].cellIndex > 10) {
                spriteManager[i].cellIndex = 8;
            } else {
                spriteManager[i].cellIndex++;
            }

            spriteManager[i].position.x -= 0.3;

            if (spriteManager[i].position.x < -8.7) {
                spriteDirection[i] = false;
            }
        } else {
            if (spriteManager[i].cellIndex < 18) {
                spriteManager[i].cellIndex = 18;
            } else if (spriteManager[i].cellIndex > 20) {
                spriteManager[i].cellIndex = 18;
            } else {
                spriteManager[i].cellIndex++;
            }

            spriteManager[i].position.x += 0.3;

            if (spriteManager[i].position.x > 8.7) {
                spriteDirection[i] = true;
            }
        }
    }
};

var changeColor = function (color) {
    level.color = color;
    levelNumber.color = color;
    score.color = color;
    scoreNumber.color = color;
    highScore.color = color;
    highScoreNumber.color = color;
};

//分数
var displayScore = function (scene) {
    console.log("hi from displayscore");

    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI2");

    rect = new BABYLON.GUI.Rectangle();
    rect.width = "280px";
    rect.height = "150px";
    rect.top = "-247px";
    rect.left = "-555px";
    rect.cornerRadius = 10;
    rect.color = "white";
    rect.thickness = 3;
    rect.background = "#dcc04c";
    // rect.alpha=0.8;
    advancedTexture.addControl(rect);

    //level Text
    level = new BABYLON.GUI.TextBlock();
    level.fontFamily="Neuropol";
    level.text = "LEVEL";
    level.fontSize = 20;
    level.color = textColor;
    level.top = "-290px";
    level.left = "-620px";
    advancedTexture.addControl(level);

    //Level
    levelNumber = new BABYLON.GUI.TextBlock();
    levelNumber.text = currentLevel.toString();
    levelNumber.fontSize = 20;//100
    levelNumber.color = textColor;
    levelNumber.top = "-290px";
    levelNumber.left = "-450px";
    advancedTexture.addControl(levelNumber);


    //Score Text
    score = new BABYLON.GUI.TextBlock();
    score.fontFamily="Neuropol";
    score.text = "SCORE";
    score.fontSize = 20;
    score.color = textColor;
    score.top = "-250px";
    score.left = "-620px";
    advancedTexture.addControl(score);

    //Score
    scoreNumber = new BABYLON.GUI.TextBlock();
    scoreNumber.text = currentScore.toString();
    scoreNumber.fontSize = 20;//100
    scoreNumber.color = textColor;
    scoreNumber.top = "-250px";
    scoreNumber.left = "-450px";
    advancedTexture.addControl(scoreNumber);

    //Highscore Text
    highScore = new BABYLON.GUI.TextBlock();
    highScore.fontFamily="Neuropol";
    highScore.text = "HIGH SCORE";
    highScore.fontSize = 20;
    highScore.color = textColor;
    highScore.top = "-210px";
    highScore.left = "-585px";
    advancedTexture.addControl(highScore);

    //Highscore Number
    highScoreNumber = new BABYLON.GUI.TextBlock();
    highScoreNumber.text = currentHighScore.toString();
    highScoreNumber.fontSize = 20;//100
    highScoreNumber.color = textColor;
    highScoreNumber.top = "-210px";
    highScoreNumber.left = "-450px";
    advancedTexture.addControl(highScoreNumber);

    // alert("hi from displayscore");
};

//检查是否有撞击事件
var castRay = function (scene, camera) {
    var origin = camera.position;

    var forward = new BABYLON.Vector3(0, 0, 1);
    var m = camera.getWorldMatrix();
    forward = BABYLON.Vector3.TransformCoordinates(forward, m);

    var direction = forward.subtract(origin);
    direction = BABYLON.Vector3.Normalize(direction);

    var length = 1.3;

    var ray = new BABYLON.Ray(origin, direction, length);

    var hit = scene.pickWithRay(ray);

    if (hit.pickedMesh) {
        console.log("Picked");
        return false;
    }
    return true;
};


//改变障碍
var transformMesh = function (zTranslation, scene) {
    if (arrayPosition >= 28) {
        arrayPosition = 0;
    }
    if (spriteArrayPosition > 9) {
        spriteArrayPosition = 0;
    }
    generate(scene);
    arrayPosition += 3;

};


//随机布置障碍
var generate = function (scene) {

    scenePath(zTranslation);
    // spriteBuild(zTranslation);

    if ((-zTranslation)%200 == 0) {
        scene9(zTranslation, scene);
    } else {
        var randomNumber = Math.floor(Math.random() * 10);
        switch (randomNumber) {
            case 1:
                scene1(zTranslation, scene);
                break;
            case 2:
                scene2(zTranslation, scene);
                break;
            case 3:
                scene3(zTranslation, scene);
                break;
            case 4:
                scene4(zTranslation, scene);
                break;
            case 5:
                scene5(zTranslation, scene);
                break;
            case 6:
                scene6(zTranslation, scene);
                break;
            case 7:
                scene7(zTranslation, scene);
                break;
            case 8:
                scene8(zTranslation, scene);
                break;
            case 9:
                scene3(zTranslation, scene);
                break;
            case 10:
                scene2(zTranslation, scene);
                break;
            default:
                scene1(zTranslation, scene);
                break;
        }
    }
    zTranslation = zTranslation - 20;
};


//障碍场景
var scene1 = function (zTranslation) {

    nextAnimation[arrayPosition].pause();

    meshes[arrayPosition].scaling.x = 14; //在x轴上缩放对象
    meshes[arrayPosition].position.x = 0;
    meshes[arrayPosition].position.y = 1.5; //0.2
    meshes[arrayPosition].position.z = zTranslation;
};

var scene2 = function (zTranslation) {

    nextAnimation[arrayPosition].pause();
    nextAnimation[arrayPosition + 1].pause();

    meshes[arrayPosition].scaling.x = 8.3;
    meshes[arrayPosition].position.y = 1.5;
    meshes[arrayPosition].position.x = -5.4;
    meshes[arrayPosition].position.z = zTranslation;

    meshes[arrayPosition + 1].scaling.x = 8.3;
    meshes[arrayPosition + 1].position.y = 1.5;
    meshes[arrayPosition + 1].position.x = 5.4;
    meshes[arrayPosition + 1].position.z = zTranslation;

    meshes[arrayPosition].checkCollisions = true;
    meshes[arrayPosition + 1].checkCollisions = true;

};

var scene3 = function (zTranslation) {

    nextAnimation[arrayPosition].pause();
    nextAnimation[arrayPosition + 1].pause();
    nextAnimation[arrayPosition + 2].pause();

    meshes[arrayPosition].scaling.x = 6;
    meshes[arrayPosition].position.y = 1.5;
    meshes[arrayPosition].position.x = -6.5;
    meshes[arrayPosition].position.z = zTranslation;


    meshes[arrayPosition + 1].scaling.x = 6;
    meshes[arrayPosition + 1].position.y = 1.5;
    meshes[arrayPosition + 1].position.x = 6.5;
    meshes[arrayPosition + 1].position.z = zTranslation;

    meshes[arrayPosition + 2].scaling.x = 2;
    meshes[arrayPosition + 2].position.y = 1.5;
    meshes[arrayPosition + 2].position.x = 0;
    meshes[arrayPosition + 2].position.z = zTranslation;

    meshes[arrayPosition].checkCollisions = true;
    meshes[arrayPosition + 1].checkCollisions = true;
    meshes[arrayPosition + 2].checkCollisions = true;

};

var scene4 = function (zTranslation) {

    nextAnimation[arrayPosition].pause();

    meshes[arrayPosition].scaling.x = 16.5;
    meshes[arrayPosition].position.y = 1.5;
    meshes[arrayPosition].position.x = -1.25;
    meshes[arrayPosition].position.z = zTranslation;

    meshes[arrayPosition].checkCollisions = true;

};

var scene5 = function (zTranslation) {

    nextAnimation[arrayPosition].pause();

    meshes[arrayPosition].scaling.x = 17;
    meshes[arrayPosition].position.y = 1.5;
    meshes[arrayPosition].position.x = 1;
    meshes[arrayPosition].position.z = zTranslation;

    meshes[arrayPosition].checkCollisions = true;

};

var scene6 = function (zTranslation, scene) {

    meshes[arrayPosition].scaling.x = 4;
    meshes[arrayPosition].position.y = 1.5;
    meshes[arrayPosition].position.x = -7.5;
    meshes[arrayPosition].position.z = zTranslation;

    animationKeys[arrayPosition] = [];
    animationKeys[arrayPosition].push({
        frame: 0,
        value: -7.5
    });
    animationKeys[arrayPosition].push({
        frame: 20,
        value: 7.5
    });
    animationKeys[arrayPosition].push({
        frame: 100,
        value: -7.5
    });

    animations[arrayPosition].setKeys(animationKeys[arrayPosition]);
    meshes[arrayPosition].animations.pop();
    meshes[arrayPosition].animations.push(animations[arrayPosition]);
    nextAnimation[arrayPosition] = scene.beginAnimation(meshes[arrayPosition], 100, 0, true);
};

var scene7 = function (zTranslation, scene) {
    //Box1
    meshes[arrayPosition].scaling.x = 4;
    meshes[arrayPosition].position.y = 1.5;
    meshes[arrayPosition].position.x = -7.5;
    meshes[arrayPosition].position.z = zTranslation;

    animationKeys[arrayPosition] = [];
    animationKeys[arrayPosition].push({
        frame: 0,
        value: -7.5
    });
    animationKeys[arrayPosition].push({
        frame: 50,
        value: -2
    });
    animationKeys[arrayPosition].push({
        frame: 100,
        value: -7.5
    });
    animations[arrayPosition].setKeys(animationKeys[arrayPosition]);
    meshes[arrayPosition].animations.pop();
    meshes[arrayPosition].animations.push(animations[arrayPosition]);
    nextAnimation[arrayPosition] = scene.beginAnimation(meshes[arrayPosition], 0, 100, true);
    nextAnimation[arrayPosition].restart();
    //Box2
    meshes[arrayPosition + 1].scaling.x = 4;
    meshes[arrayPosition + 1].position.y = 1.5;
    meshes[arrayPosition + 1].position.x = 7.5;
    meshes[arrayPosition + 1].position.z = zTranslation;

    animationKeys[arrayPosition + 1] = [];
    animationKeys[arrayPosition + 1].push({
        frame: 0,
        value: 7.5
    });
    animationKeys[arrayPosition + 1].push({
        frame: 50,
        value: 2
    });
    animationKeys[arrayPosition + 1].push({
        frame: 100,
        value: 7.5
    });
    animations[arrayPosition + 1].setKeys(animationKeys[arrayPosition + 1]);
    meshes[arrayPosition + 1].animations.pop();
    meshes[arrayPosition + 1].animations.push(animations[arrayPosition + 1]);
    nextAnimation[arrayPosition + 1] = scene.beginAnimation(meshes[arrayPosition + 1], 0, 100, true);
    nextAnimation[arrayPosition + 1].restart();
};

var scene8 = function (zTranslation, scene) {
    meshes[arrayPosition].scaling.x = 8;
    meshes[arrayPosition].position.y = 1.5;
    meshes[arrayPosition].position.x = -5.5;
    meshes[arrayPosition].position.z = zTranslation;

    animationKeys[arrayPosition] = [];
    animationKeys[arrayPosition].push({
        frame: 0,
        value: -5.5
    });
    animationKeys[arrayPosition].push({
        frame: 50,
        value: 5.5
    });
    animationKeys[arrayPosition].push({
        frame: 100,
        value: -5.5
    });

    animations[arrayPosition].setKeys(animationKeys[arrayPosition]);
    meshes[arrayPosition].animations.pop();
    meshes[arrayPosition].animations.push(animations[arrayPosition]);
    nextAnimation[arrayPosition] = scene.beginAnimation(meshes[arrayPosition], 0, 100, true);
    nextAnimation[arrayPosition].restart();
};

var scene9 = function (zTranslation, scene) {
    spriteManager[spriteArrayPosition].position.z = zTranslation;
    spriteArrayPosition += 1;

};


var disposeItems = function () {

    for (var i = 0; i < 84; i++) {
        pathMeshes[i].dispose();
    }
    for (var i = 0; i < 30; i++) {
        meshes[i].dispose();
    }
    for (var i = 0; i < 10; i++) {
        spriteManager[i].dispose();
    }

    score.dispose();
    scoreNumber.dispose();
    highScoreNumber.dispose();
    highScore.dispose();
    level.dispose();
    levelNumber.dispose();

}

// //backgroundSong
// var playCornFieldChase = function (scene){
//     var playCornField = new BABYLON.Sound(
//         "CornField", "sounds/CornfieldChase.mp3",
//         scene, null, {loop: false, autoplay: true}
//     );
// }


var scene = createScene();


engine.runRenderLoop(function () {
    scene.render();
});


window.addEventListener("resize", function () {
    engine.resize();
});