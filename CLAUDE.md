# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a THREE.js boilerplate project using Vite as the build tool. The project provides a minimal setup for creating 3D graphics applications with THREE.js in a browser environment.

## Development Commands

- `npm run dev` - Start the Vite development server with hot module replacement
- `npm run build` - Build the project for production (output to `dist/`)
- `npm run preview` - Preview the production build locally
- `npx prettier --write .` - Format code using Prettier

## Architecture

### Entry Point
- `index.html` - HTML entry point that loads the THREE.js application
- `src/main.js` - JavaScript entry point that initializes the THREE.js scene, camera, renderer, and animation loop

### THREE.js Setup Pattern
The main.js file follows a standard THREE.js initialization pattern:
1. Scene creation and configuration
2. Camera setup (PerspectiveCamera)
3. WebGL renderer initialization
4. Object creation (geometry + material = mesh)
5. Lighting setup (ambient + point lights)
6. Window resize handling
7. Animation loop using `requestAnimationFrame`

### Styling
- `public/style.css` - Global styles that ensure the canvas takes up the full viewport with no scrollbars
- The canvas is rendered into the `#app` div element

## Code Style

Prettier is configured with:
- Single quotes
- 80 character line width
- 2 space indentation

## Project Structure

- `/public/` - Static assets (fonts, SVG images, CSS)
- `/src/` - Application source code
- Entry point mounts renderer to `#app` element

## Working with THREE.js

When adding new 3D objects or scenes:
1. Create geometry and materials
2. Combine into meshes using `new THREE.Mesh(geometry, material)`
3. Add meshes to the scene with `scene.add(mesh)`
4. Update object properties in the animation loop for animations
5. Remember to handle cleanup and disposal for removed objects to prevent memory leaks
