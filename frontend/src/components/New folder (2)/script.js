// 1. Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true // allows background to show through if needed
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 30);

// 2. Create the "Characters" (Spheres)
const geometry = new THREE.SphereGeometry(3, 32, 32);

// Pink Sphere (Character A)
const materialPink = new THREE.MeshStandardMaterial({ color: 0xff69b4, wireframe: true });
const spherePink = new THREE.Mesh(geometry, materialPink);
scene.add(spherePink);

// Blue Sphere (Character B)
const materialBlue = new THREE.MeshStandardMaterial({ color: 0x4169e1, wireframe: true });
const sphereBlue = new THREE.Mesh(geometry, materialBlue);
scene.add(sphereBlue);

// Initial Positions (Far apart)
spherePink.position.set(-20, 10, -10);
sphereBlue.position.set(20, -10, -10);

// 3. Lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(pointLight, ambientLight);

// 4. Create the Starry Background
function addStar() {
    const starGeo = new THREE.SphereGeometry(0.25, 24, 24);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(starGeo, starMat);

    // Randomly place stars
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
}
// Generate 200 stars
Array(200).fill().forEach(addStar);

// 5. Scroll Animation Logic
function moveCameraAndCharacters() {
    // Calculate how far down the user has scrolled (0 to 1)
    const scrollTop = document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / maxScroll;

    // Linearly interpolate (lerp) positions based on scroll percentage
    // As scroll goes from 0 to 1, spheres move from start positions to center (0,0,0)
    
    // Pink Sphere Path
    spherePink.position.x = -20 + (20 * scrollPercent);
    spherePink.position.y = 10 - (10 * scrollPercent);
    
    // Blue Sphere Path
    sphereBlue.position.x = 20 - (20 * scrollPercent);
    sphereBlue.position.y = -10 + (10 * scrollPercent);

    // Camera movement to make it dynamic
    camera.position.z = 30 - (10 * scrollPercent);
    camera.rotation.z = scrollPercent * 0.5;

    // Visual flare: make them solid and glowing when they meet
    if (scrollPercent > 0.8) {
        materialPink.wireframe = false;
        materialBlue.wireframe = false;
        materialPink.emissive.setHex(0xff69b4);
        materialBlue.emissive.setHex(0x4169e1);
    } else {
        materialPink.wireframe = true;
        materialBlue.wireframe = true;
        materialPink.emissive.setHex(0x000000);
        materialBlue.emissive.setHex(0x000000);
    }
}

// Listen for the scroll event
document.body.onscroll = moveCameraAndCharacters;
moveCameraAndCharacters(); // Call once to set initial positions

// 6. Animation Loop (Keeps the scene rendering and objects rotating naturally)
function animate() {
    requestAnimationFrame(animate);

    // Gently rotate the spheres continuously
    spherePink.rotation.x += 0.01;
    spherePink.rotation.y += 0.005;

    sphereBlue.rotation.x -= 0.01;
    sphereBlue.rotation.y -= 0.005;

    renderer.render(scene, camera);
}

animate();

// 7. Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});