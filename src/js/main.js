'use strict';

document.addEventListener('DOMContentLoaded', () => {
	ymaps.ready( () => {
		App.init();
	});
});

const App = {
	init () {
		this.markersStorage.init();
		this.map.init();
		this.listMarkers.init(this.markersStorage.aMarkers);
		this.preloader.hide();
	},

	map: {
		init () {
			this.ymap = new ymaps.Map('map', {
				center: App.markersStorage.aMarkers[0] ? App.markersStorage.aMarkers[0].coord : [59.93772, 30.313622],
				zoom: 8,
				controls: ['zoomControl', 'geolocationControl']
			}, {
				searchControlProvider: 'yandex#search'
			});
			
			this.ymap.behaviors.disable('scrollZoom');

			if (App.markersStorage.iNextIndex > 0) {
				App.markersStorage.aMarkers.forEach( (oItem) => {
					this.addMarker(oItem);
				});
			}
		},

		addMarker (oItem) {
			this.getGenerateMarker(oItem, (oPlacemark) => {
				this.ymap.geoObjects.add(oPlacemark, oItem.ind);
			});
			this.updatePath();
		},

		deleteMarker (iInd) {
			this.ymap.geoObjects.remove(this.ymap.geoObjects.get(iInd));
			this.updatePath();
		},

		getGenerateMarker (oItem, fCallback) {
			this.getAddress(oItem.coord, (sAddress) => {
				const oPlacemark = new ymaps.Placemark(oItem.coord, {
					balloonContentHeader: oItem.title,
					balloonContentBody: sAddress
				}, {
					iconLayout: 'default#image',
					iconImageHref: '../img/placemark.svg',
					iconImageSize: [48, 48],
					iconImageOffset: [-24, -48],
					draggable: true
				});

				oPlacemark.events.add(['dragend'], (event) => {
					oItem.coord = oPlacemark.geometry.getCoordinates()
					App.markersStorage.update(oItem.ind, oItem);
					this.updatePath();
				});

				fCallback(oPlacemark);
			});
		},

		updatePath () {
			const aCoords = new Array();
			App.markersStorage.aMarkers.forEach( (oItem) => {
				aCoords.push(oItem.coord)
			});

			if (this.oPath) 
				this.ymap.geoObjects.remove(this.oPath);

			this.oPath = new ymaps.Polyline(aCoords, {}, {
				strokeColor: '#dc3545',
				strokeWidth: 2,
				strokeOpacity: 1
			});
			this.ymap.geoObjects.add(this.oPath);
		},

		getAddress (aCoord, fCallback) {
			ymaps.geocode(aCoord).then( (res) => {
				const firstGeoObject = res.geoObjects.get(0);
				fCallback(firstGeoObject.getAddressLine());
			});
		},

		setBounds () {
			this.ymap.setBounds(this.ymap.geoObjects.getBounds(), {
				checkZoomRange: true,
				zoomMargin: 60
			});
		}
	},
	
	listMarkers: {
		init () {
			this.eInputTitleMarker = document.getElementById('inputTitleMarker');
			this.eBtnAddMarker = document.getElementById('btnAddMark');
			this.eListMarkers = document.getElementById('listMarks');
			this.eListMarkerWarning = this.eListMarkers.querySelector('.list-group-item-warning');

			if (App.markersStorage.iNextIndex > 0) {
				this.eBtnAddMarker.classList.remove('light-help');
				App.markersStorage.aMarkers.forEach( (oItem) => {
					this.createElem(oItem);
				});
			}

			this.eBtnAddMarker.addEventListener('click', (event) => {
				this.addItem(this.eInputTitleMarker.value);
			});

			this.eInputTitleMarker.addEventListener('keydown', (event) => {
				if (event.keyCode == 13) {
					this.addItem(this.eInputTitleMarker.value);
				}
			});

			this.sortable();
		},

		addItem (val) {
			const label = val.toString().trim();

			this.eBtnAddMarker.classList.remove('light-help');

			if (label.length > 0) {
				this.eInputTitleMarker.classList.remove('is-invalid');
				const oItem = {
					ind: App.markersStorage.iNextIndex,
					title: label,
					coord: App.map.ymap.getCenter()
				}

				App.markersStorage.add(oItem);
				this.createElem(oItem);
				App.map.addMarker(oItem);

			} else {
				this.eInputTitleMarker.classList.add('is-invalid');
				this.eInputTitleMarker.value = '';
				return false;
			}
		},

		deleteItem (iInd) {
			const eRemove = this.eListMarkers.querySelector(`[data-ind="${iInd}"]`) || null;
			
			if (eRemove) {
				eRemove.classList.add('removed');
				App.markersStorage.delete(iInd);

				setTimeout( () => {
					eRemove.remove();

					if (this.eListMarkers.children.length > 1) {
						this.reorderElems();

					} else {
						this.eListMarkerWarning.style.display = 'block';
						this.eBtnAddMarker.classList.add('light-help');
					}
				}, 300)
			}
		},

		createElem (oItem) {
			const eItem = document.createElement('div');
			const eItemDel = document.createElement('span');
			const classItem = 'list-group-item';

			eItem.innerHTML = oItem.title;
			eItem.className = classItem;
			eItem.setAttribute('data-ind', oItem.ind);

			eItemDel.innerHTML = '&times;';
			eItemDel.className = 'i-delete';
			eItemDel.setAttribute('role', 'button');

			eItemDel.addEventListener('click', (event) => {
				event.stopPropagation();
				const eParent = event.target.closest('.'+ classItem);
				const iInd = parseInt(eParent.getAttribute('data-ind'));
				
				this.deleteItem(iInd);
				App.map.deleteMarker(iInd);
			});

			eItem.appendChild(eItemDel);
			this.eListMarkers.appendChild(eItem);

			this.eInputTitleMarker.value = '';
			this.eListMarkerWarning.style.display = 'none';
		},

		sortable () {
			const oSortable = Sortable.create(this.eListMarkers, {
				filter: '.list-group-item-warning',
				forceFallback: true,
				animation: 20,
				onEnd: (event) => {
					this.reorderElems(event.oldIndex - 1, event.newIndex - 1);
				}
			});
		},

		reorderElems (iOldInd, iNewInd) {
			let iInd = 0;
			this.eListMarkers.childNodes.forEach( (eElem, i) => {
				if (eElem.getAttribute('data-ind')) {
					eElem.setAttribute('data-ind', iInd);
					iInd++;	
				}
			})

			App.markersStorage.getReorderArray(iOldInd, iNewInd);
		}
	},

	markersStorage: {
		init () {
			this.aMarkers = App.storage.get();
			this.updNextIndex();
		},

		getByInd (iInd) {
			return this.aMarkers.filter( (oItem) => {
				return oItem.ind === iInd;
			})[0];
		},

		updNextIndex () {
			this.iNextIndex = Object.keys(this.aMarkers).length;
		},

		update (iInd, oItemUpd) {
			const oItem = this.aMarkers.findIndex((obj => obj.ind == iInd));
			this.aMarkers[oItem] = oItemUpd;
			this.save();
		},

		add (oItem) {
			this.aMarkers.push(oItem);
			this.save();
			this.updNextIndex();
		},

		delete (iInd) {
			const aReMarkers = new Array();
			let niNewInd = 0;

			this.aMarkers.forEach( (oItem) => {
				if (oItem.ind !== iInd) {
					oItem.ind = niNewInd;
					aReMarkers.push(oItem);
					niNewInd++;
				}
			});

			this.aMarkers = aReMarkers;
			this.save();
			this.updNextIndex();
		},

		getReorderArray (iOldInd, iNewInd, aArr = this.aMarkers) {
			if (iNewInd >= aArr.length) {
				var k = iNewInd - aArr.length + 1;
				while (k--) {
					aArr.push(undefined);
				}
			}
			aArr.splice(iNewInd, 0, aArr.splice(iOldInd, 1)[0]);

			this.aMarkers = aArr;
			App.markersStorage.save();
			App.map.updatePath();
			return aArr;
		},

		save () {
			App.storage.set(this.aMarkers);
		}
	},

	storage: {
		nameArray: 'markersMap',

		get () {
			return JSON.parse(localStorage.getItem(this.nameArray)) || new Array();
		},

		set (aNewMarkers) {
			localStorage.setItem(this.nameArray, JSON.stringify(aNewMarkers));
		},

		clear () {
			localStorage.setItem(this.nameArray, JSON.stringify(new Array()));
		}
	},

	preloader: {
		elem: document.getElementById('preloader'),

		show () {
			document.body.classList.add('loading');
			this.elem.classList.remove('complete');
		},

		hide () {
			this.elem.classList.add('complete');
			document.body.classList.remove('loading');
			document.body.classList.add('loaded');
		}
	}
}
