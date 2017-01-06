// Decal Component
AFRAME.registerComponent('decal', {
    dependencies: ['raycaster'],
    schema: { 
        scale: {type: 'number', default: 1} 
    },
    
    init: function () {
        
        // Variables
        var mesh;
        var decals = [];
        var decalHelper, mouseHelper;
        var p = new THREE.Vector3( 0, 0, 0 );
        var r = new THREE.Vector3( 0, 0, 0 );
        var s = new THREE.Vector3( 1, 1, 1 );
        var up = new THREE.Vector3( 0, 1, 0 );
        var check = new THREE.Vector3( 1, 1, 1 );
        
        /*var params = {
            scale: this.data.scale,
            rotate: false
        };*/
        
        var data = this.data;
        var manager = new THREE.LoadingManager();
        var loader = new THREE.TextureLoader(manager);
        
        // Decal Material
        var decalMaterial = new THREE.MeshPhongMaterial( { 
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
        
        // Normal Materiel
        /*decalMaterial = new THREE.MeshNormalMaterial( { 
            transparent: true, 
            depthTest: true, 
            depthWrite: false, 
            polygonOffset: true,
            polygonOffsetFactor: -4, 
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide,
            wireframe: false
        });*/
        
        // Intersection
        var intersection = {
            point: new THREE.Vector3(),
            normal: new THREE.Vector3()
        };
        
        // Mouse Helper
        var scene = this.el.sceneEl.object3D;
        mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 0.1, 0.1, 1 ), new THREE.MeshNormalMaterial() );
        scene.add( mouseHelper );
        mouseHelper.visible = true;
        
        // Raycasting
        var raycaster = document.querySelector("#raycaster");
        raycaster.addEventListener('raycaster-intersection', function (evt) {
            // Position
            var p = evt.detail.intersections[0].point;
            mouseHelper.position.copy( p );
            intersection.point.copy( p );
            // Normal
            var n = evt.detail.intersections[0].face.normal.clone();
            n.add( p );
            mouseHelper.lookAt( n );
            intersection.normal.copy( evt.detail.intersections[0].face.normal );
            // Mesh
            mesh = evt.detail.els[0].getObject3D('mesh');
        });
        
        // Decal Button
        var button = document.querySelector('button');
        button.addEventListener('click', function() {
            p = intersection.point;
            r.copy( mouseHelper.rotation );
            
            var scale = data.scale;
            s.set( scale, scale, scale );

            //if( params.rotate) r.z = Math.random() * 2 * Math.PI;
            
            var m = new THREE.Mesh( new THREE.DecalGeometry( mesh, p, r, s, check ), decalMaterial );
            scene.add( m );
        });
    }
});