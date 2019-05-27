/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

THREE.DragControls = function ( _objects, _camera, _domElement ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}
	var _this = this;

	var _plane = new THREE.Plane();
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();
	var _worldPosition = new THREE.Vector3();
	var _inverseMatrix = new THREE.Matrix4();
	var _objectRotation = new THREE.Quaternion();

	var _selected = null, _hovered = null;
	var _moving = true;

	var _movePrev = new THREE.Vector2();
	var _moveCurr = new THREE.Vector2();
	var _selectedBackup = null;

	var _rotateStart = new THREE.Vector2();
	var _rotateEnd = new THREE.Vector2();
	var _rotateDelta = new THREE.Vector2();

	var _sphericalDelta = new THREE.Spherical();


	//

	var scope = this;



	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'dblclick', onDocumentDblClick, false );
	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'dblclick', onDocumentDblClick, false );
	}

	function dispose() {

		deactivate();

	}

	function handleMouseDownRotate( event ) {


		_rotateStart.set( event.clientX, event.clientY );

	}

	function rotateLeft( _angle ) {

		_sphericalDelta.theta -= _angle;

	}

	function rotateUp( _angle ) {

		_sphericalDelta.phi -= _angle;

	}


	function onDocumentMouseMove( event ) {

		event.preventDefault();

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				if ( _moving ) {

					//_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

				}

				else {

					_rotateEnd.set( event.clientX, event.clientY );
					_rotateDelta.subVectors( _rotateEnd, _rotateStart );


					rotateLeft( 2 * Math.PI * _rotateDelta.x ); // yes, height

					rotateUp( 2 * Math.PI * _rotateDelta.y );
					

					_rotateStart.copy( _rotateEnd );

				

				}
				

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;


			if ( _moving )
			{

				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

					_inverseMatrix.getInverse( _selected.parent.matrixWorld );
					_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

				}

				_domElement.style.cursor = 'move';

			}

			else {

				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

					_inverseMatrix.getInverse( _selected.parent.matrixWorld );
					_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );
					_objectRotation.copy( _selected.quaternion )
					handleMouseDownRotate( event );

				}

				_domElement.style.cursor = 'crosshair';

			}


			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentMouseCancel( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

	}

	function onDocumentDblClick( event ) {

		event.preventDefault();

		if ( _moving ) {

			_moving = false;

		}

		else {

			_moving =  true;

		}

	}

	


	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

	this.on = function ( type, listener ) {

		console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
		scope.addEventListener( type, listener );

	};

	this.off = function ( type, listener ) {

		console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
		scope.removeEventListener( type, listener );

	};

	this.notify = function ( type ) {

		console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		scope.dispatchEvent( { type: type } );

	};

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;
