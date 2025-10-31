import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js';
import {MathUtils} from "three";

export function setupSky(scene){
    const sky = new Sky();
    sky.scale.setScalar(450000);

    const phi = MathUtils.degToRad( 90 );
    const theta = MathUtils.degToRad( 180 );
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms.sunPosition.value = sunPosition;

    scene.add(sky);
}