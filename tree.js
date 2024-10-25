import * as THREE from 'three';

class Plant {
    constructor(scene) {
        // L-system parameters
        this.axiom = "S";  // Initial axiom
        this.len = 2;  // Initial length of each segment
        this.angle = 25 * (Math.PI / 180);  // Rotation angle in radians (25 degrees)
        this.scene = scene;  // Three.js scene reference

        // Position and rotation stacks to handle branching
        this.positionStack = [];
        this.rotationStack = [];

        // Initial position and orientation
        this.currentPosition = new THREE.Vector3(0, 0, 0);  // Start at origin
        this.currentRotation = 0;  // Initial rotation (angle in radians)

        this.maxSteps = 5;  // Limit the number of expansions for the axiom
        this.currentStep = 0;  // Track the current step of the tree growth
    }

    // Method to expand the axiom using L-system rules
    generateNextStep() {
        let newString = '';  // To hold the expanded axiom

        // Iterate over the current axiom
        for (let i = 0; i < this.axiom.length; i++) {
            const char = this.axiom[i];

            // L-system rules
            switch (char) {
                case 'S':
                    newString += 'F[+F][-F]';  // Start growth with branching
                    break;
                case 'F':
                    newString += 'FF';  // Each 'F' grows forward
                    break;
                default:
                    newString += char;  // Keep any other characters (like +, -, [, ])
                    break;
            }
        }

        // Update the axiom with the expanded string
        this.axiom = newString;
    }

    // Method to display the L-system in the Three.js scene
    display() {
        // Clear the previous scene to avoid re-rendering the entire scene every frame
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        // Iterate over the axiom string
        for (let i = 0; i < this.axiom.length; i++) {
            const char = this.axiom[i];

            // Handle each character in the L-system
            switch (char) {
                case 'F':  // Move forward and draw a branch
                    this.drawLine();
                    break;
                case '+':  // Rotate right
                    this.currentRotation -= this.angle;
                    break;
                case '-':  // Rotate left
                    this.currentRotation += this.angle;
                    break;
                case '[':  // Save current position and rotation
                    this.positionStack.push(this.currentPosition.clone());
                    this.rotationStack.push(this.currentRotation);
                    break;
                case ']':  // Restore position and rotation
                    if (this.positionStack.length > 0 && this.rotationStack.length > 0) {
                        this.currentPosition = this.positionStack.pop();
                        this.currentRotation = this.rotationStack.pop();
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // Method to draw a line segment in the Three.js scene
    drawLine() {
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });  // Green line
        const points = [];

        // Starting point of the line (current position)
        points.push(this.currentPosition.clone());

        // Calculate the new position based on current rotation and segment length
        const newX = this.currentPosition.x + this.len * Math.cos(this.currentRotation);
        const newY = this.currentPosition.y + this.len * Math.sin(this.currentRotation);

        // Update current position to the new point
        this.currentPosition.set(newX, newY, 0);
        points.push(this.currentPosition.clone());

        // Create geometry for the line
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create the line and add it to the scene
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
    }

    // Continuously grow the tree
    growTree() {
        if (this.currentStep < this.maxSteps) {
            this.generateNextStep();
            this.display();
            this.currentStep += 1;
        }
    }
}

export default Plant;
