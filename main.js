import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

// Create the scene
const scene = new THREE.Scene();

// Create the sphere geometry and material
const geometry = new THREE.SphereGeometry(3, 64, 64);  // Sphere radius is 3 units
const material = new THREE.MeshStandardMaterial({
    color: "#00FF83",
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Add a point light to illuminate the scene
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10); // Ensure the light is close enough to illuminate the object
scene.add(pointLight);

// Add ambient light for softer general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);  // Ambient light ensures basic illumination
scene.add(ambientLight);

// Set up the camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 10);  // Camera is closer to the object for better visibility
scene.add(camera);

// Set up the renderer and link it to the canvas
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Handle window resizing
window.addEventListener('resize', () => {
    // Update sizes
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Update camera aspect ratio
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Add orbit controls for mouse interaction (3D view)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Smooth controls

// Animation loop to render the scene
const animate = () => {
    // Rotate the sphere for a simple animation effect
    mesh.rotation.y += 0.01;  // Slow rotation around the Y-axis

    // Update the controls for damping effect
    controls.update();

    // Render the scene
    renderer.render(scene, camera);

    // Request the next animation frame
    requestAnimationFrame(animate);
};

// Start the animation
animate();
