// Import Three.js and OrbitControls
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Add smooth damping to controls

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// L-system rules and parameters for progressive growth
let axiom = "F";  // Start with a small trunk
const rules = { "F": "F[+F][-F][^F][&F]" };  // Branching rules for tree growth
let sentence = axiom;  // Store the expanded sentence from L-system rules
let currentIteration = 0;  // Start with 0 iterations

// Small initial branch length and thickness for a growing tree
let baseBranchLength = .5;  // Small initial length for trunk
let baseBranchThickness = 0.02;  // Small initial thickness for trunk
const growthFactor = 1.5;  // Gradual growth factor for length and thickness per iteration
const maxIterations = 5;  // Number of iterations for L-system expansion
const angle = Math.PI / 6;  // 30 degrees for branch rotations

// Store all branches
let allBranches = [];

// Branch class to store individual branch properties
class Branch {
    constructor(startPos, direction, length, thickness) {
        this.startPos = startPos.clone();
        this.direction = direction.clone();
        this.length = length;
        this.thickness = thickness;
        this.mesh = null;  // Store the branch mesh for rendering
    }

    // Function to grow the branch by a certain growth factor
    grow() {
        this.length *= growthFactor;
        this.thickness *= growthFactor;

        // If a mesh already exists, remove it and recreate with new dimensions
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        // Recreate the branch with updated length and thickness
        this.createBranch();
    }

    // Function to create a visual branch in the scene
    createBranch() {
        const geometry = new THREE.CylinderGeometry(this.thickness / 2, this.thickness, this.length, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        this.mesh = new THREE.Mesh(geometry, material);

        // Calculate midpoint and position the branch accordingly
        const midPoint = this.startPos.clone().add(this.direction.clone().multiplyScalar(this.length / 2));
        this.mesh.position.copy(midPoint);

        // Set orientation and rotation of the branch
        this.mesh.lookAt(this.startPos.clone().add(this.direction.clone().multiplyScalar(this.length)));
        this.mesh.rotateX(Math.PI / 2);  // Align vertically for correct orientation

        scene.add(this.mesh);
    }
}

// Function to expand the axiom according to the rules (one step at a time)
function expandAxiomOnce(axiom) {
    let newAxiom = "";
    for (let char of axiom) {
        newAxiom += rules[char] || char;  // Apply rules or keep character if no rule is found
    }
    return newAxiom;
}

// Function to interpret the expanded axiom and generate branches
function interpretAxiom(axiom) {
    const stack = [];  // Stack to store position and direction for branching
    let currentPosition = new THREE.Vector3(0, 0, 0);  // Start at the base (center of the scene)
    let currentDirection = new THREE.Vector3(0, 1, 0);  // Start growing upward

    for (let char of axiom) {
        if (char === "F") {
            // Create a new branch and add it to the list of all branches
            let newBranch = new Branch(currentPosition.clone(), currentDirection.clone(), baseBranchLength, baseBranchThickness);
            allBranches.push(newBranch);

            // Update current position for the next branch
            currentPosition.add(currentDirection.clone().multiplyScalar(newBranch.length));

        } else if (char === "+") {
            // Rotate branch to the right (clockwise)
            currentDirection.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);

        } else if (char === "-") {
            // Rotate branch to the left (counter-clockwise)
            currentDirection.applyAxisAngle(new THREE.Vector3(0, 0, 1), -angle);

        } else if (char === "^") {
            // Rotate branch upward
            currentDirection.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);

        } else if (char === "&") {
            // Rotate branch downward
            currentDirection.applyAxisAngle(new THREE.Vector3(1, 0, 0), -angle);

        } else if (char === "[") {
            // Push the current position and direction onto the stack
            stack.push({ position: currentPosition.clone(), direction: currentDirection.clone() });

        } else if (char === "]") {
            // Pop the last position and direction from the stack
            const saved = stack.pop();
            currentPosition = saved.position;
            currentDirection = saved.direction;
        }
    }
}

// Function to grow all branches that are already created (after each depth)
function growAllBranches() {
    for (let branch of allBranches) {
        branch.grow();  // Grow each branch
    }
}

// Function to create all branches after growth
function createAllBranches() {
    for (let branch of allBranches) {
        branch.createBranch();  // Create branch visuals with new size and position
    }
}

// Set camera position and adjust for a better view of the growing tree
camera.position.set(0, 3, 10);  // Set the camera further back to capture the entire tree
camera.lookAt(0, 1, 0);  // Look at the center where the tree is growing

// Animate and render the scene
function animate() {
    requestAnimationFrame(animate);

    // If there are still iterations left, grow after each depth
    if (currentIteration < maxIterations) {
        // Expand the L-system and generate the branches structure for this depth
        sentence = expandAxiomOnce(sentence);
        interpretAxiom(sentence);

        // After the depth is fully generated, grow all branches
        growAllBranches();

        // Once the growth is complete, create the visual representation of the tree
        createAllBranches();

        currentIteration++;  // Move to the next depth level
    }

    // Render the scene with the controls updated
    controls.update();  // Update OrbitControls for smooth interaction
    renderer.render(scene, camera);  // Render the scene
}

// Start the animation loop
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
