//importowanie niezbednych bibliotek
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

//deklaracja zmiennych dla sceny, kamery, renderera, ładowanego model, mixera dla animacji oraz zegara, kontrolera dla obsługi kamery, oraz deklaracja obiektów dla każdej planety
let scene, camera, renderer;
let model;
let mixer;
let clock;
let controls;
let mercuryObject, venusObject, earthObject, moonObject, marsObject, jupiterObject, saturnObject, uranusObject, neptuneObject,  saturnRingsObject, uranusRingsObject, neptuneRingsObject;
const canvas = document.getElementsByTagName("canvas")[0]; //inicjalizacja elementu <canvas>
let planetsInfo = {}; //tablica przechowujaca informacje o planetach, pobierane z API

//funkcja asynchroniczna dla pobierania danych z API
async function fetchData(name) {
    const url = 'https://api.api-ninjas.com/v1/planets?name=' + name;
    const options = {
        method: 'GET',
        headers: {
            'X-API-Key': 'API-KEY-TUTAJ'
        }
    };    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        planetsInfo = {...planetsInfo, [name]: result[0]}
        // console.log(planetsInfo);
        // console.log(planetsInfo[name]);
        // console.log(name + ' : ' + planetsInfo[name]['radius']);
    } catch (error) {
        console.error(error);
    }
}

//funkcja inicjalizujaca
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    //parametry kamery
    const xAngle = 0; // kat obrotu wokol osi x
    const yAngle = Math.PI / 3; // kat obrotu wokol osi y
    const zAngle = 0; // kat obrotu wokol osi z
    const radius = 8; // promien orbity kamery

    //obliczenie nowej pozycji kamery na podstawie powyzszych elementu
    const x = radius * Math.sin(yAngle) * Math.cos(xAngle);
    const y = radius * Math.cos(yAngle);
    const z = radius * Math.sin(yAngle) * Math.sin(xAngle);
    camera.position.set(x, y, z);

    //inicjalizacja punktu (srodka ukladu) na ktory skierowana ma byc kamera
    const target = new THREE.Vector3(0, 0, 0);

    //kat przesuniecia dla kazdej planet okreslajacy poruszanie sie planet wokol slonca
    let angle = 0; //earth angle
    let mercuryAngle = 0, venusAngle = 0, moonAngle = 0, marsAngle = 0, jupiterAngle = 0, saturnAngle = 0, uranusAngle = 0, neptuneAngle = 0;

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.autoClear = false;
    renderer.useLegacyLights = true;    
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0.0);
    document.body.appendChild(renderer.domElement);

    //dodatkowe efekty dla slonca
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 2;
    bloomPass.radius = 0;

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    //ladowanie modelu UkladSloneczny.gltf
    let loader = new GLTFLoader();
    
    //div sluzacy do wyswietlenia inf. o planetach po najechaniu na nie kursorem
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('planets-info'); // Dodaj klasę CSS dla stylizacji
    infoDiv.textContent = '';    

    loader.load(
        "UkladSloneczny.gltf", //scieżka do pliku .gltf
        function (gltf) {
            model = gltf.scene;

            scene.add(model);

            mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations;
            clips.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
            model.parent.remove(model.children[0]);
            traverseScene(scene);

            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            const clickedObjects = [];

            function onMouseClick(event) {
                //pobieranie wysokosci paska nawigacji
                let navBar = document.querySelector('#header');
                let navBarHeight =  navBar.offsetHeight;
                //obliczanie wspolrzednych myszy na podstawie pozycji klikniecia
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -((event.clientY - navBarHeight) / window.innerHeight) * 2 + 1; //przesuniecie o szer. navbara

                raycaster.setFromCamera(mouse, camera);

                //sprawdzenie czy promien zderza sie z obiektami
                const intersects = raycaster.intersectObjects(scene.children, true);

                //sprawdzenie czy obiekt zostal klikniety
                intersects.forEach((intersect) => {
                    if (intersect.object.name === 'Mercury' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Mercury.html')
                    }
                    if (intersect.object.name === 'Venus' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Venus.html')
                    }
                    if (intersect.object.name === 'Earth' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Earth.html')
                    }
                    if (intersect.object.name === 'Moon' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('EarthsMoon.html')
                    }
                    if (intersect.object.name === 'Mars' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Mars.html')
                    }
                    if (intersect.object.name === 'Jupiter' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Jupiter.html')
                    }
                    if (intersect.object.name === 'Saturn' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Saturn.html')
                    }
                    if (intersect.object.name === 'Uranus' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Uranus.html')
                    }
                    if (intersect.object.name === 'Neptune' && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Neptune.html')
                    }
                    if (intersect.object === sunSphere && !clickedObjects.includes(intersect.object)) {
                        clickedObjects.push(intersect.object);
                        window.location.replace('Sun.html')
                    }
                });
                clickedObjects.length = 0;
            }
            window.addEventListener('click', onMouseClick, false);

            //inicjalizacja obiektow planet i pobranie ich rozmiarow do zmiennych tymczasowych
            mercuryObject = scene.getObjectByName('Mercury');
            const mercuryDefaultSize = mercuryObject.scale.clone();
            venusObject = scene.getObjectByName('Venus');
            const venusDefaultSize = venusObject.scale.clone();
            earthObject = scene.getObjectByName('Earth');
            const earthDefaultSize = earthObject.scale.clone();
            moonObject = scene.getObjectByName('Moon');
            const moonDefaultSize = moonObject.scale.clone();
            marsObject = scene.getObjectByName('Mars');
            const marsDefaultSize = marsObject.scale.clone();
            jupiterObject = scene.getObjectByName('Jupiter');
            const jupiterDefaultSize = jupiterObject.scale.clone();
            saturnObject = scene.getObjectByName('Saturn');
            const saturnDefaultSize = saturnObject.scale.clone();
            uranusObject = scene.getObjectByName('Uranus');
            const uranusDefaultSize = uranusObject.scale.clone();
            neptuneObject = scene.getObjectByName('Neptune');
            const neptuneDefaultSize = neptuneObject.scale.clone();
            saturnRingsObject = scene.getObjectByName("Saturn_Rings");
            uranusRingsObject = scene.getObjectByName("Uranus_Rings");
            neptuneRingsObject = scene.getObjectByName("Neptune_Rings");

            //tworzenie tymczasowej sfery na czas hoveru
            let sizeRatio = 1.1;

            const highlightSphere = new THREE.Mesh(
                new THREE.SphereGeometry(1, 32, 32),
                new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 })
            );
            let doesDivExist = false;    
            function onMouseOver(event) {
                //pobieranie wysokosci paska nawigacji
                let navBar = document.querySelector('#header');
                let navBarHeight =  navBar.offsetHeight;
                //obliczanie wspolrzednych myszy na podstawie pozycji najechania
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -((event.clientY - navBarHeight) / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);

                const intersects = raycaster.intersectObjects(scene.children, true);                
                let isPlanetHovered = false;

                //ustawienie diva by pojawial sie obok kursora
                infoDiv.style.position = 'fixed';
                infoDiv.style.left = event.pageX + 20 + 'px';
                infoDiv.style.top = event.pageY + 20 + 'px';

                //sprawdzenie czy na obiekt najechano kursorem
                intersects.forEach((intersect) => {
                    if (intersect.object.name === 'Mercury') {
                        isPlanetHovered = true;                        
                        highlightSphere.scale.set(mercuryDefaultSize.x * sizeRatio, mercuryDefaultSize.y * sizeRatio, mercuryDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(mercuryObject.position);
                        scene.add(highlightSphere);
                        
                        doesDivExist = true;
                        //uzupelnienie zawartosci diva o informacje pobrane z API
                        infoDiv.textContent = 'Nazwa: ' + (planetsInfo?.['Mercury']?.['name'] || 'Merkury') + '\n' + 'Masa: ' + planetsInfo?.['Mercury']?.['mass'] + ' masy Jowisza'+ '\n' + 'Promień: ' + planetsInfo?.['Mercury']?.['radius']*69911 + ' km' + '\n' + 'Śr. temperatura : ' + planetsInfo?.['Mercury']?.['temperature'] +' K' + '\n' + 'Okres orbitalny: ' + planetsInfo?.['Mercury']?.['period'] + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + planetsInfo?.['Mercury']?.['distance_light_year'] + ' ly' + '\n' + 'Półoś wielka: ' + planetsInfo?.['Mercury']?.['semi_major_axis'] + ' AU';

                        //dodanie diva
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object.name === 'Venus') {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(venusDefaultSize.x * sizeRatio, venusDefaultSize.y * sizeRatio, venusDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(venusObject.position);
                        scene.add(highlightSphere);

                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + (planetsInfo?.['Venus']?.['name'] || 'Wenus') + '\n' + 'Masa: ' + planetsInfo?.['Venus']?.['mass'] + ' masy Jowisza'+ '\n' + 'Promień: ' + planetsInfo?.['Venus']?.['radius']*69911 + ' km' + '\n' + 'Śr. temperatura : ' + planetsInfo?.['Venus']?.['temperature'] +' K' + '\n' + 'Okres orbitalny: ' + planetsInfo?.['Venus']?.['period'] + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + planetsInfo?.['Venus']?.['distance_light_year'] + ' ly' + '\n' + 'Półoś wielka: ' + planetsInfo?.['Venus']?.['semi_major_axis'] + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object.name === 'Earth') {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(earthDefaultSize.x * sizeRatio, earthDefaultSize.y * sizeRatio, earthDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(earthObject.position);
                        scene.add(highlightSphere);

                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + (planetsInfo?.['Earth']?.['name'] || 'Ziemia') + '\n' + 'Masa: ' + planetsInfo?.['Venus']?.['mass'] + ' masy Jowisza'+ '\n' + 'Promień: ' + planetsInfo?.['Venus']?.['radius']*69911 + ' km' + '\n' + 'Śr. temperatura : ' + planetsInfo?.['Venus']?.['temperature'] +' K' + '\n' + 'Okres orbitalny: ' + planetsInfo?.['Venus']?.['period'] + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + planetsInfo?.['Venus']?.['distance_light_year'] + ' ly' + '\n' + 'Półoś wielka: ' + planetsInfo?.['Venus']?.['semi_major_axis'] + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object.name === 'Moon') {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(moonDefaultSize.x * sizeRatio, moonDefaultSize.y * sizeRatio, moonDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(moonObject.position);
                        scene.add(highlightSphere);

                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + 'Księżyc' + '\n' + 'Masa: ' + '0.0123' + ' masy Jowisza'+ '\n' + 'Promień: ' + '1737.1' + ' km' + '\n' + 'Min. temperatura : ' + '40' +' K' + '\n' + 'Max. temperatura : ' + '396' +' K' + 'Okres orbitalny: ' + '27.3' + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + '0.00257' + ' AU' + '\n' + 'Półoś wielka: ' + '0.00257' + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object.name === 'Mars') {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(marsDefaultSize.x * sizeRatio, marsDefaultSize.y * sizeRatio, marsDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(marsObject.position);
                        scene.add(highlightSphere);

                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + (planetsInfo?.['Mars']?.['name'] || 'Mars') + '\n' + 'Masa: ' + planetsInfo?.['Mars']?.['mass'] + ' masy Jowisza'+ '\n' + 'Promień: ' + planetsInfo?.['Mars']?.['radius']*69911 + ' km' + '\n' + 'Śr. temperatura : ' + planetsInfo?.['Mars']?.['temperature'] +' K' + '\n' + 'Okres orbitalny: ' + planetsInfo?.['Mars']?.['period'] + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + planetsInfo?.['Mars']?.['distance_light_year'] + ' ly' + '\n' + 'Półoś wielka: ' + planetsInfo?.['Mars']?.['semi_major_axis'] + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object.name === 'Jupiter') {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(jupiterDefaultSize.x * sizeRatio, jupiterDefaultSize.y * sizeRatio, jupiterDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(jupiterObject.position);
                        scene.add(highlightSphere);

                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + (planetsInfo?.['Jupiter']?.['name'] || 'Jowisz') + '\n' + 'Masa: ' + planetsInfo?.['Jupiter']?.['mass'] + ' masy Jowisza'+ '\n' + 'Promień: ' + planetsInfo?.['Jupiter']?.['radius']*69911 + ' km' + '\n' + 'Śr. temperatura : ' + planetsInfo?.['Jupiter']?.['temperature'] +' K' + '\n' + 'Okres orbitalny: ' + planetsInfo?.['Jupiter']?.['period'] + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + planetsInfo?.['Jupiter']?.['distance_light_year'] + ' ly' + '\n' + 'Półoś wielka: ' + planetsInfo?.['Jupiter']?.['semi_major_axis'] + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object.name === 'Saturn') {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(saturnDefaultSize.x * sizeRatio, saturnDefaultSize.y * sizeRatio, saturnDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(saturnObject.position);
                        scene.add(highlightSphere);
                        console.log(navBarHeight);
                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + (planetsInfo?.['Saturn']?.['name'] || 'Saturn') + '\n' + 'Masa: ' + planetsInfo?.['Saturn']?.['mass'] + ' masy Jowisza'+ '\n' + 'Promień: ' + planetsInfo?.['Saturn']?.['radius']*69911 + ' km' + '\n' + 'Śr. temperatura : ' + planetsInfo?.['Saturn']?.['temperature'] +' K' + '\n' + 'Okres orbitalny: ' + planetsInfo?.['Saturn']?.['period'] + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + planetsInfo?.['Saturn']?.['distance_light_year'] + ' ly' + '\n' + 'Półoś wielka: ' + planetsInfo?.['Saturn']?.['semi_major_axis'] + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object.name === 'Uranus') {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(uranusDefaultSize.x * sizeRatio, uranusDefaultSize.y * sizeRatio, uranusDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(uranusObject.position);
                        scene.add(highlightSphere);

                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + (planetsInfo?.['Uranus']?.['name'] || 'Uran') + '\n' + 'Masa: ' + planetsInfo?.['Uranus']?.['mass'] + ' masy Jowisza'+ '\n' + 'Promień: ' + planetsInfo?.['Uranus']?.['radius']*69911 + ' km' + '\n' + 'Śr. temperatura : ' + planetsInfo?.['Uranus']?.['temperature'] +' K' + '\n' + 'Okres orbitalny: ' + planetsInfo?.['Uranus']?.['period'] + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + planetsInfo?.['Uranus']?.['distance_light_year'] + ' ly' + '\n' + 'Półoś wielka: ' + planetsInfo?.['Uranus']?.['semi_major_axis'] + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object.name === 'Neptune') {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(neptuneDefaultSize.x * sizeRatio, neptuneDefaultSize.y * sizeRatio, neptuneDefaultSize.z * sizeRatio);
                        highlightSphere.position.copy(neptuneObject.position);
                        scene.add(highlightSphere);

                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + (planetsInfo?.['Neptune']?.['name'] || 'Neptun') + '\n' + 'Masa: ' + planetsInfo?.['Neptune']?.['mass'] + ' masy Jowisza'+ '\n' + 'Promień: ' + planetsInfo?.['Neptune']?.['radius']*69911 + ' km' + '\n' + 'Śr. temperatura : ' + planetsInfo?.['Neptune']?.['temperature'] +' K' + '\n' + 'Okres orbitalny: ' + planetsInfo?.['Neptune']?.['period'] + ' dni ziemskich' + '\n' + 'Odl. od Ziemi: ' + planetsInfo?.['Neptune']?.['distance_light_year'] + ' ly' + '\n' + 'Półoś wielka: ' + planetsInfo?.['Neptune']?.['semi_major_axis'] + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                    if (intersect.object === sunSphere) {
                        isPlanetHovered = true;
                        highlightSphere.scale.set(.4503 * sizeRatio, .4503 * sizeRatio, .4503 * sizeRatio);
                        highlightSphere.position.set(0, 0, 0);
                        scene.add(highlightSphere);

                        doesDivExist = true;
                        infoDiv.textContent = 'Nazwa: ' + 'Słońce' + '\n' + 'Masa: ' + '1047.56' + ' masy Jowisza'+ '\n' + 'Promień: ' + '6966340' + ' km' + '\n' + 'Śr. temperatura : ' + '5778' +' K' + '\n' + 'Odl. od Ziemi: ' + '1' + ' AU';
                        document.body.appendChild(infoDiv);
                    }
                });
                if (!isPlanetHovered) {
                    highlightSphere.removeFromParent(); //usuniecie sfery po usunieciu kursora z planety
                    if(doesDivExist == true){
                        document.body.removeChild(infoDiv); //usuniecie diva po usunieciu kursora z planety
                        doesDivExist = false;
                    }                    
                }

            }
            window.addEventListener('mousemove', onMouseOver, false);

            //funkcja pomocnicza usuwa obiekty slonca oraz plutona oraz wyswietla nazwy obiektow oraz ich koordynaty
            function traverseScene(object) {
                if (object.isMesh) {
                    // console.log('Nazwa obiektu:', object.name);
                    // console.log('Pozycja obiektu:', object.position.x, object.position.y, object.position.z);
                }

                if (object.name === 'Sun') {
                    object.parent.remove(object);
                }
                if (object.name === 'Pluto') {
                    object.parent.remove(object);
                }

                if (object.children) {
                    object.children.forEach((child) => {
                        traverseScene(child);
                    });
                }
            }
            //ze wzgledu na problemy zwiazane z ladowaniem modelu, konieczne bylo usuniecie plutona oraz slonca stworzonych w Blenderze, pluton zostal usuniety, a slonce zostalo dodane na nowo korzystajac z narzedzi three.js

            //funkcja animujaca
            function animate() {
                requestAnimationFrame(animate);
                angle += .0005;
                moonAngle += .01;
                mercuryAngle = angle * 1.24;
                venusAngle = angle * .62;
                marsAngle = angle * .53;
                jupiterAngle = angle * .28;
                saturnAngle = angle * .23;
                uranusAngle = angle * .22;
                neptuneAngle = uranusAngle;

                const mercuryX = 0.4195132851600647;
                const mercuryY = 0;
                const mercuryZ = -0.6278819441795349;
                const mercuryRadius = Math.sqrt(mercuryX * mercuryX + mercuryY * mercuryY + mercuryZ * mercuryZ);
                const newMercuryX = 0 + mercuryRadius * Math.cos(mercuryAngle);
                const newMercuryY = 0;
                const newMercuryZ = 0 + mercuryRadius * Math.sin(mercuryAngle);
                mercuryObject.position.set(newMercuryX, newMercuryY, newMercuryZ);

                const venusX = -0.4890603721141815;
                const venusY = 0;
                const venusZ = -1.062990427017212;
                const venusRadius = Math.sqrt(venusX * venusX + venusY * venusY + venusZ * venusZ);
                const venusOffsetAngle = -1 * Math.PI / 4;
                const newVenusX = 0 + venusRadius * Math.cos(venusAngle + venusOffsetAngle);
                const newVenusY = 0;
                const newVenusZ = 0 + venusRadius * Math.sin(venusAngle + venusOffsetAngle);
                venusObject.position.set(newVenusX, newVenusY, newVenusZ);

                const earthX = -1.5901929140090942;
                const earthY = 0;
                const earthZ = -0.039918649941682816;
                const earthRadius = Math.sqrt(earthX * earthX + earthY * earthY + earthZ * earthZ);
                const newEarthX = 0 + earthRadius * Math.cos(angle);
                const newEarthY = 0;
                const newEarthZ = 0 + earthRadius * Math.sin(angle);
                earthObject.position.set(newEarthX, newEarthY, newEarthZ);

                const moonX = -1.461540699005127;
                const moonY = 0;
                const moonZ = -0.034530024975538254;
                const moonRadius = Math.sqrt(Math.pow(earthX - moonX, 2) + Math.pow(earthY - moonY, 2) + Math.pow(earthZ - moonZ, 2));
                const newMoonX = newEarthX + moonRadius * Math.cos(moonAngle);
                const newMoonY = 0;
                const newMoonZ = newEarthZ + moonRadius * Math.sin(moonAngle);
                moonObject.position.set(newMoonX, newMoonY, newMoonZ);

                const marsX = 1.1129177808761597;
                const marsY = 0;
                const marsZ = -1.629170298576355;
                const marsRadius = Math.sqrt(marsX * marsX + marsY * marsY + marsZ * marsZ);
                const marsOffsetAngle = Math.PI / 2;
                const newMarsX = 0 + marsRadius * Math.cos(marsAngle + marsOffsetAngle);
                const newMarsY = 0;
                const newMarsZ = 0 + marsRadius * Math.sin(marsAngle + marsOffsetAngle);
                marsObject.position.set(newMarsX, newMarsY, newMarsZ);

                const jupiterX = -2.1814005374908447;
                const jupiterY = 0;
                const jupiterZ = -2.6279146671295166;
                const jupiterRadius = Math.sqrt(jupiterX * jupiterX + jupiterY * jupiterY + jupiterZ * jupiterZ);
                const jupiterOffsetAngle = Math.PI / 2;
                const newJupiterX = 0 + jupiterRadius * Math.cos(jupiterAngle + jupiterOffsetAngle);
                const newJupiterY = 0;
                const newJupiterZ = 0 + jupiterRadius * Math.sin(jupiterAngle + jupiterOffsetAngle);
                jupiterObject.position.set(newJupiterX, newJupiterY, newJupiterZ);

                const saturnX = 1.8229155540466309;
                const saturnY = 0;
                const saturnZ = 4.092988967895508;
                const saturnRadius = Math.sqrt(saturnX * saturnX + saturnY * saturnY + saturnZ * saturnZ);
                const saturnOffsetAngle = -2 * Math.PI / 4;
                const newSaturnX = 0 + saturnRadius * Math.cos(saturnAngle + saturnOffsetAngle);
                const newSaturnY = 0;
                const newSaturnZ = 0 + saturnRadius * Math.sin(saturnAngle + saturnOffsetAngle);
                saturnObject.position.set(newSaturnX, newSaturnY, newSaturnZ);
                saturnRingsObject.position.set(newSaturnX, newSaturnY, newSaturnZ);

                const uranusX = 5.3056416511535645;
                const uranusY = 0;
                const uranusZ = 1.3810510635375977;
                const uranusRadius = Math.sqrt(uranusX * uranusX + uranusY * uranusY + uranusZ * uranusZ);
                const uranusOffsetAngle = Math.PI / 3;
                const newUranusX = 0 + uranusRadius * Math.cos(uranusAngle + uranusOffsetAngle);
                const newUranusY = 0;
                const newUranusZ = 0 + uranusRadius * Math.sin(uranusAngle + uranusOffsetAngle);
                uranusObject.position.set(newUranusX, newUranusY, newUranusZ);
                uranusRingsObject.position.set(newUranusX, newUranusY, newUranusZ);

                const neptuneX = -0.9549353718757629;
                const neptuneY = 0;
                const neptuneZ = 6.402467250823975;
                const neptuneRadius = Math.sqrt(neptuneX * neptuneX + neptuneY * neptuneY + neptuneZ * neptuneZ);
                const neptuneOffsetAngle = -4 * Math.PI / 4;
                const newNeptuneX = 0 + neptuneRadius * Math.cos(neptuneAngle + neptuneOffsetAngle);
                const newNeptuneY = 0;
                const newNeptuneZ = 0 + neptuneRadius * Math.sin(neptuneAngle + neptuneOffsetAngle);
                neptuneObject.position.set(newNeptuneX, newNeptuneY, newNeptuneZ);
                neptuneRingsObject.position.set(newNeptuneX, newNeptuneY, newNeptuneZ);
                camera.lookAt(target); //w funkcji animate()
                update();
                bloomComposer.render();
                renderer.render(scene, camera);
            }
            function update() {
                if (mixer) {
                    const delta = clock.getDelta();
                    mixer.update(delta);
                }
            }
            clock = new THREE.Clock();
            animate();

        },
        undefined,
        function (error) {
            console.error(error);
        }

    );

    //tworzenie nowego slonca
    const sunColor = new THREE.Color("#FDB813");
    const sunGeometry = new THREE.IcosahedronGeometry(.4503, 15);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: sunColor });
    const sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
    sunSphere.position.set(0, 0, 0);
    sunSphere.layers.set(0);
    scene.add(sunSphere);

    const sunAmbientLight = new THREE.PointLight(0xffffff, .2, 0, 2);
    scene.add(sunAmbientLight)
    renderer.shadowMap.enabled = true;
    sunSphere.castShadow = true;
    
    //tworzenie tla jako sfery zawierajacej caly uklad wewnatrz z nalozona tekstura rowniez w wewnatrz
    const galaxyGeometry = new THREE.SphereGeometry(80, 64, 64);

    // galaxyTexture.wrapS = THREE.ClampToEdgeWrapping;
    const galaxyTexture = new THREE.TextureLoader().load('starmap_g16k.jpg');
    const galaxyMaterial = new THREE.MeshBasicMaterial({
        map: galaxyTexture,
        side: THREE.DoubleSide,
        mapping: THREE.UVMapping,
        transparent: true,
    });
    galaxyTexture.minFilter = THREE.LinearFilter;
    galaxyTexture.magFilter = THREE.NearestFilter;
    galaxyTexture.encoding = THREE.sRGBEncoding;

    const galaxyMesh = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
    scene.add(galaxyMesh);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.dampingFactor = 0;
    controls.screenSpacePanning = false;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    

    //wywolanie funkcji asynchronicznej dla kazdej z planet
    fetchData('Mercury');
    fetchData('Venus');
    fetchData('Earth');
    fetchData('Mars');
    fetchData('Jupiter');
    fetchData('Saturn');
    fetchData('Uranus');
    fetchData('Neptune');

    //obsluga zmiany rozmiaru okna
    window.addEventListener(
        "resize",
        () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            bloomComposer.setSize(window.innerWidth, window.innerHeight);
        },
        false);        
}
init();