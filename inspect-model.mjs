// Quick script to inspect GLB model mesh hierarchy
import { NodeIO } from '@gltf-transform/core';

const io = new NodeIO();
const doc = await io.read('public/3D-model.glb');
const root = doc.getRoot();

console.log('\n=== MESHES ===');
root.listMeshes().forEach(mesh => {
  console.log(`Mesh: "${mesh.getName()}"`);
  mesh.listPrimitives().forEach((prim, i) => {
    const mat = prim.getMaterial();
    console.log(`  Primitive ${i}: material="${mat?.getName()}" `);
    if (mat) {
      const baseColor = mat.getBaseColorFactor();
      console.log(`    baseColor: [${baseColor.map(v => v.toFixed(2)).join(', ')}]`);
      console.log(`    metallic: ${mat.getMetallicFactor()}`);
      console.log(`    roughness: ${mat.getRoughnessFactor()}`);
    }
  });
});

console.log('\n=== NODES (Scene Graph) ===');
root.listNodes().forEach(node => {
  const mesh = node.getMesh();
  const children = node.listChildren();
  console.log(`Node: "${node.getName()}" ${mesh ? `→ mesh "${mesh.getName()}"` : ''} ${children.length ? `(${children.length} children)` : ''}`);
});
