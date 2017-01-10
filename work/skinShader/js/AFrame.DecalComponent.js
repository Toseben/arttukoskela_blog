// Decal Component
AFRAME.registerComponent('decal', {
    dependencies: [],
    schema: { 
        scale: {default: 0.25},
        rotation: {default: 0}
    },
    
    init: function () {
        // Variables
        var mesh, ray_entity;
        var decals = [];
        var decalHelper, mouseHelper;
        var p = new THREE.Vector3( 0, 0, 0 );
        var r = new THREE.Vector3( 0, 0, 0 );
        var s = new THREE.Vector3( 1, 1, 1 );
        var up = new THREE.Vector3( 0, 1, 0 );
        var check = new THREE.Vector3( 1, 1, 1 );
        var container = this.el;
        var aframe_scene = container.sceneEl;
        
        var params = this.params = {
            scale: this.data.scale,
            rotation: this.data.rotation,
            rotate: true
        };
        
        // Loaders
        var manager = new THREE.LoadingManager();
        var loader = new THREE.TextureLoader(manager);
        
        // Decal Material
        var decalMaterial = this.decalMaterial = new THREE.MeshPhongMaterial( { 
            specular: 0x3e444c,
            shininess: 10,
            map: loader.load( 'img/ink_color.png' ), 
            normalMap: loader.load( 'img/ink_normal.jpg' ),
            normalScale: new THREE.Vector2( 0.25, 0.25 ),
            transparent: true, 
            depthTest: true, 
            depthWrite: false, 
            polygonOffset: true,
            polygonOffsetFactor: -4, 
            wireframe: false 
        });
        
        // NORMAL MATERIAL
        /*decalMaterial = new THREE.MeshNormalMaterial( { 
            transparent: true, 
            depthTest: true, 
            depthWrite: false, 
            polygonOffset: true,
            polygonOffsetFactor: -4, 
            shading: THREE.SmoothShading
        });*/
        
        // Intersection
        var intersection = {
            point: new THREE.Vector3(),
            normal: new THREE.Vector3()
        };
        
        // Mouse Helper
        var scene = this.el.sceneEl.object3D;
        mouseHelper = this.mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 0.01, 0.01, 0.1 ), new THREE.MeshNormalMaterial() );
        var help_mat = mouseHelper.material;
        help_mat.transparent = true;
        help_mat.opacity = 0.5;
        
        var helper_entity = document.createElement('a-entity');
        helper_entity.setAttribute('id', 'decal');
        helper_entity.setObject3D('mesh', mouseHelper);
        container.appendChild(helper_entity);
        
        var raycaster = document.getElementById("raycaster_add");
        raycaster.addEventListener('raycaster-intersection', function (evt) {
            // Mesh
            ray_entity = evt.detail.els[0];
            var ray_entity_group = ray_entity.object3D;
            var ray_entity_group_pos = ray_entity_group.position;
            ray_entity_group.updateMatrixWorld();
            // Position
            var p = evt.detail.intersections[0].point;
            intersection.point.copy( p );
            p = ray_entity_group.worldToLocal(p);
            p.add(ray_entity_group_pos);
            mouseHelper.position.copy( p );
            // Normal
            var n = evt.detail.intersections[0].face.normal.clone();
            n.add( p );
            mouseHelper.lookAt( n );
            mouseHelper.rotation.z = params.rotation * (Math.PI / 180);
            intersection.normal.copy( evt.detail.intersections[0].face.normal );
        });
        
        // Decal Button
        var button = document.getElementById('add');
        button.addEventListener('click', addDecal);
        
        function addDecal() {
            mesh = ray_entity.getObject3D('mesh');
            
            if (mesh.type === 'Group') {
                mesh = mesh.children[0];
            }
            
            if (mesh.geometry.type === 'BufferGeometry') {
                mesh.geometry = new THREE.Geometry().fromBufferGeometry( mesh.geometry );
            }
            
            p = intersection.point;
            var ray_entity_group = ray_entity.object3D;
            var ray_entity_group_pos = ray_entity_group.position;
            ray_entity_group.updateMatrixWorld();
            p = ray_entity_group.worldToLocal(p);

            r.copy( mouseHelper.rotation );
            
            var scale = params.scale;
            s.set( scale, scale, scale );
            
            var m = new THREE.Mesh( new THREE.DecalGeometry( mesh, p, r, s, check ), decalMaterial );
            m.position.add(ray_entity_group_pos);
            var entity = document.createElement('a-entity');
            entity.setAttribute('id', 'decal');
            entity.setObject3D('mesh', m);
            entity.setAttribute('remove', true);
            entity.setAttribute('class', "removable");
            container.appendChild(entity);
        };
    },
    
    update: function (oldData) {
        
        // Variables
        var data = this.data;
        var params = this.params;
        params.scale = data.scale;
        params.rotation = data.rotation;
        
    }
});