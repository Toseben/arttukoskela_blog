// Decal Component
AFRAME.registerComponent('decal', {
    dependencies: ['raycaster'],
    schema: { 
        scale: {default: 1},
        rotation: {default: 0}
    },
    
    init: function () {
        
        // Change Image
        $("#userImage").change(function () {
            // IMAGE
            var image = document.createElement( 'img' );
            var texture = new THREE.Texture( image );
            image.onload = function()  {
                    texture.needsUpdate = true;
                    console.log("Loaded!");
                    decalMaterial.map = texture;
                    decalMaterial.map.NeedsUpdate = true;
                };

            userImage = $("#userImage")[0];
            if (userImage.files && userImage.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    image.src = e.target.result;
                };

                reader.readAsDataURL(userImage.files[0]);
            }
        });
        
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
            specular: 0xffffff,
            shininess: 10,
            map: loader.load( 'img/ink_color.png' ), 
            normalMap: loader.load( 'img/ink_normal.jpg' ),
            normalScale: new THREE.Vector2( .15, .15 ),
            transparent: true, 
            depthTest: true, 
            depthWrite: false, 
            polygonOffset: true,
            polygonOffsetFactor: -4, 
            wireframe: false 
        });
        
        /*// NORMAL MATERIAL
        decalMaterial = new THREE.MeshNormalMaterial( { 
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
        scene.add( mouseHelper );
        mouseHelper.visible = true;
        
        // Raycasting
        var raycaster = document.querySelector("#raycaster_create");
        raycaster.addEventListener('raycaster-intersection', function (evt) {
            // Position
            var p = evt.detail.intersections[0].point;
            mouseHelper.position.copy( p );
            intersection.point.copy( p );
            // Normal
            var n = evt.detail.intersections[0].face.normal.clone();
            n.add( p );
            mouseHelper.lookAt( n );
            mouseHelper.rotation.z = params.rotation * (Math.PI / 180);
            intersection.normal.copy( evt.detail.intersections[0].face.normal );
            // Mesh
            ray_entity = evt.detail.els[0];
        });
        
        // Decal Button
        var button = document.querySelector('#decal');
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
            ray_entity_group.updateMatrixWorld();
            p = ray_entity_group.worldToLocal(p);
            
            r.copy( mouseHelper.rotation );
            
            var scale = params.scale;
            s.set( scale, scale, scale );
            
            var m = new THREE.Mesh( new THREE.DecalGeometry( mesh, p, r, s, check ), decalMaterial );
            var entity = document.createElement('a-entity');
            entity.setAttribute('id', 'decal');
            entity.setObject3D('mesh', m);
            entity.setAttribute('remove', true);
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