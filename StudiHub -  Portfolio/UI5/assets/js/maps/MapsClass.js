sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";
	return Object.extend("Mosbach.Studihub.assets.js.maps.MapsClass", {
		oGeoMap: null,
		sLocation: null,
		oGeoLocation: null,
		oMapConfig: {
			"MapProvider": [{
				"name": "GMAP",
				"Source": [{
					"id": "s1",
					"url": "https://mt.google.com/vt/x={X}&y={Y}&z={LOD}"
				}]
			}],
			"MapLayerStacks": [{
				"name": "DEFAULT",
				"MapLayer": {
					"name": "layer1",
					"refMapProvider": "GMAP",
					"opacity": "1",
					"colBkgnd": "RGB(255,255,255)"
				}
			}]
		},
		constructor: function (oGeoMap, sLocation) {
			this.oGeoMap = oGeoMap;
			this.oGeoMap.setMapConfiguration(this.oMapConfig);
			this.oGeoMap.setRefMapLayerStack("DEFAULT");
			this.oGeoMap.setInitialZoom(15.25);
			if (sLocation) {
				this.setLocation(sLocation);
			}
		},

		setLocation: function (sLocation) {
				this.sLocation = sLocation;
				var oLocation = new Object();

				$.ajax({
					//eslint-disable-next-line
					url: "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURI(sLocation),
					encoding: "UTF-8",
					dataType: "json",
					async: false,
					success: function (jsonData) {
						if(!jsonData[0]) return;
						oLocation.lat = jsonData[0].lat;
						oLocation.lon = jsonData[0].lon;
						oLocation.pos = jsonData[0].lon + ";" + jsonData[0].lat + ";0";
					},
					error: function (oResponse) {
						//eslint-disable-next-line
						console.log("Address customizing is incorrect");
						oLocation.error = true;
					}
				});

			this.oGeoLocation = oLocation;
			if(!oLocation) return;
			this.render();
		},

		getSpots: function (oLocation) {
			var oSpots = new sap.ui.vbm.Spots({
				items: [
					new sap.ui.vbm.Spot({
						position: oLocation.pos,
						tooltip: "Test",
						type: "Error",
						icon: "\ue199"
					})
				]
			});

			return oSpots;
		},

		setInformation: function (oGeoMap, oSpots, oOffidLoc) {
			this.oGeoMap.addVo(oSpots);
			this.oGeoMap.setCenterPosition(oOffidLoc.pos);
			this.oGeoMap.setZoomlevel(17);
			//window.oGeoMap.addVo(Route);
		},

		render: function () {

			this.setInformation(this.oGeoMap, this.getSpots(this.oGeoLocation), this.oGeoLocation);

		}

	});
});