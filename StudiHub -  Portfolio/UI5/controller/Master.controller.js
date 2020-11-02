sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Base, Filter, FilterOperator) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Master", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.Master
		 */
		extendInit: function () {
			this.oSession = this.getOwnerComponent().getModel("SessionModel");
			this.getView().setModel(this.oSession, "SessionModel");
			this.oRouter.getRoute("RouteMasterView").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function () {
			this.getTiles();
		},

		onRefresh: function () {

			this.byId("userSelection").setSelectedButton("__xmlview0--init-button");
			this.byId("dateRange").setDateValue();
			this.byId("dateRange").setSecondDateValue();
			this.byId("searchBar").setValue("");
			this.getTiles();

		},

		onLogoutPress: function () {
			this.oSession.getData().authed = "";
			this.oSession.getData().email = "";
			this.oSession.getData().myUserId = "";
			this.oSession.getData().myUserType = "";
			this.oSession.getData().password = "";

			this.oRouter.navTo("RouteLoginView");
			window.location.reload();
		},

		getFilter: function () {

			var aFilters = [];
			aFilters.push(new Filter("Userid", FilterOperator.BT, this.oSession.getData().myUserId, this.byId("userSelection").getSelectedKey()));
			if (this.byId("dateRange").getDateValue()) {
				aFilters.push(new Filter("Begda", FilterOperator.BT, this.byId("dateRange").getDateValue(), this.byId("dateRange").getSecondDateValue()));
			}
			aFilters.push(new Filter("Title", FilterOperator.EQ, this.byId("searchBar").getValue()));
			return aFilters;

		},

		getTiles: function () {
			this.getOffers(this.getFilter());
			this.getCareers(this.getFilter());
			this.getAccoms(this.getFilter());
			this.getEvents(this.getFilter());
			this.getJobs(this.getFilter());
		},
		getOffers: function (aFilters) {
			var that = this;
			this.byId("flexBoxOffers").destroyItems();
			this.oModel.read("/OfferSet", {
				filters: aFilters,
				success: function (oData, oResponse) {
					if (oData) {
						for (var i = 0; i < oData.results.length; i++) {
							var o = oData.results[i];
							that.generateOfferTile("O" + o.Postid, o.ShortTitle, o.Uname, o.Icon, o.OfferValue, "Bis: " + that.dateFormatter(o.Endda));
						}
					}
				},
				error: function (oResponse) {

				}
			});
		},

		getCareers: function (aFilters) {

			var that = this;
			this.byId("flexBoxCareer").destroyItems();
			this.oModel.read("/CareerSet", {
				filters: aFilters,
				success: function (oData, oReponse) {
					if (oData) {
						for (var i = 0; i < oData.results.length; i++) {
							var o = oData.results[i];
							that.generateCareerTile("C" + o.Postid, o.Title, o.Uname, o.Imgurl, o.Imgtype, that.dateFormatter(o.Endda));
						}
					}
				}
			});

			// this.generateCarrerTile("C0000001", "Handballprofi bei den Löwen werden", "RNLöwen", "https://www.handball-baden.de/wp-content/uploads/2016/02/mohr-1.jpg", "Bis: 12.07.2020");
			// this.generateCarrerTile("C0000002", "Jetzt bei der Schwarzgruppe als Software Engeenier druchstarten", "Schwarz Gruppe", "https://vegconomist.de/wp-content/uploads/sites/2/schwarz-gruppe-logo.jpg", "Bis: 15.09.2020");
			// this.generateCarrerTile("C0000003", "Starten Sie Ihre Karriere bei Wurth als Logistik experte", "Würth", "https://rodavigo.net/datos/logos-marcas-png/wurth.png", "Bis: 12.07.2020");

		},

		getAccoms: function (aFilters) {
			var that = this;
			this.byId("flexBoxAccom").destroyItems();
			this.oModel.read("/AccomSet", {
				filters: aFilters,
				success: function (oData, oReponse) {
					if (oData) {
						for (var i = 0; i < oData.results.length; i++) {
							var o = oData.results[i];
							that.generateAccommodationTile("A" + o.Postid, o.Title, o.Street, o.Rooms + " Zimmer " + o.Area + "qm", o.Cost, "Bis: " +
								that.dateFormatter(o.Endda));
						}
					}
				}
			});

			// this.generateAccommodationTile("A0000001", "Schöne 3,5 Zimmerwohnung in Mosbach - WG geeignet", "Irgendwasstraße 4", "3.5 Zimmer 70qm", "650", "Bis: 06.12.2020");
			// this.generateAccommodationTile("A0000002", "Zimmer zu vermieten - Nur 5min zur DH ", "Kaiserstraße 14", "1 Zimmer 18qm", "300", "Bis: 06.06.2020");
			// this.generateAccommodationTile("A0000003", "Einzimmer Wohnung in der Mosbacher Innenstadt", "Rathhausweg 7", "3.5 Zimmer 100qm", "900", "Bis: 06.12.2020");
			// this.generateAccommodationTile("A0000004", "Penthouse Wohnung in der Nähe des Krankenhauses", "Mosbacherplatz 20", "5 Zimmer 150qm", "1500", "Bis: 06.06.2020");

		},

		getEvents: function (aFilters) {
			var that = this;
			this.byId("flexBoxEvent").destroyItems();
			this.oModel.read("/EventSet", {
				filters: aFilters,
				success: function (oData, oResponse) {
					if (oData) {
						for (var i = 0; i < oData.results.length; i++) {
							var o = oData.results[i];
							that.generateEventTile("E" + o.Postid, o.Title, o.Uname, "Bis: " + that.dateFormatter(o.Endda));
						}
					}
				},
				error: function (oResponse) {

				}
			});
			// this.generateEventTile("E0000001", "Neueröffnung der IrgendwasBar und noch mehr Text um es zu demon", "IrgendwasBar", "Bis: 31.12.2020");
			// this.generateEventTile("E0000002", "Aftershow Party der Bachelor Abschlussfeier - Eintritt Kostenfrei", "DHBW MOS", "Bis: 31.10.2020");
			// this.generateEventTile("E0000003", "Tag der Offenen Tür bei der Schwarz Gruppe", "Schwarz Gruppe", "Bis: 31.01.2021");
			// this.generateEventTile("E0000004", "Live Music der Generischen Band hier im Ludwigs", "Ludwig", "Bis: 01.12.2020");
			// this.generateEventTile("E0000005", "Kostenfreier Eintritt im Clever Fit - Nur in Mosbach", "CleverFit", "Bis: 10.02.2020");
			// this.generateEventTile("E0000006", "Vorstellung der Theatergruppe der DHBW Mosbach - König der Löwen", "DHBW MOS", "Bis: 31.12.2020");
			// this.generateEventTile("E0000007", "Lokale Kunstausstellung im Mosbacher Rathhaus - Kostenfreier Eintritt", "Stadt MOS", "Bis: 31.09.2020");

		},

		getJobs: function (aFilters) {
			var that = this;
			this.byId("flexBoxJob").destroyItems();
			this.oModel.read("/JobSet", {
				filters: aFilters,
				success: function (oData, oResponse) {
					if (oData) {
						for (var i = 0; i < oData.results.length; i++) {
							var o = oData.results[i];
							if (o.Wage <= 0) {
								o.Wage = " ";
							} else {
								o.Wage = o.Wage + "/h";
							}
							that.generateJobTile("J" + o.Postid, o.Title, o.Uname, o.Wage, "Bis: " + that.dateFormatter(o.Endda));
						}
					}
				},
				error: function (oResponse) {

				}
			});
			// this.generateJobTile("J0000001", "Aushilfskraft als Kellner", "Ludwigs", "12/Std", "Bis: 12.12.2020");
			// this.generateJobTile("J0000002", "Teilzeit bei der Post", "DHL", "14/Std", "Bis: 10.05.2020");
			// this.generateJobTile("J0000003", "Pflegekraft im Krankenhaus", "Klinik Mos", "10/Std", "Bis: 12.09.2021");
			// this.generateJobTile("J0000004", "Kassierer beim Rewe", "REWE", "9,96/Std", "Bis: 12.12.2020");
			// this.generateJobTile("J0000005", "Aushilfe im Lager", "Kaufland", "13/Std", "Bis: 07.07.2020");
			// this.generateJobTile("J0000006", "DH Studenten Aufsicht", "DHBW MOS", "10/Std", "Bis: 12.12.2020");

		},

		generateOfferTile: function (sId, sHeader, sPublishedBy, sIcon, fNumber, oEnddate) {
			var oGenericTile = new sap.m.GenericTile(sId);
			var oTileContent = new sap.m.TileContent();
			var oContent = this.getTileContent(fNumber, sIcon);

			//Setting GenericTile Data
			oGenericTile.setHeader(sHeader);
			oGenericTile.setSubheader(sPublishedBy);
			oGenericTile.attachPress(sId, this.onOfferPress, this);
			oGenericTile.addStyleClass("sapUiTinyMarginBegin");
			oGenericTile.addStyleClass("sapUiTinyMarginTop");
			oGenericTile.addStyleClass("tileLayout");

			//Setting TileContent Data
			oTileContent.setFooter(oEnddate);

			oTileContent.setContent(oContent);
			oGenericTile.addTileContent(oTileContent);
			this.byId("flexBoxOffers").addItem(oGenericTile);
		},

		generateCareerTile: function (sId, sHeader, sPublishedBy, sImgUrl, sImagetype, oEnddate) {

			var oGenericTile = new sap.m.GenericTile();
			var oTileContent = new sap.m.TileContent();
			var oNewsContent = new sap.m.NewsContent();

			oGenericTile.addStyleClass("sapUiTinyMarginBegin");
			oGenericTile.addStyleClass("sapUiTinyMarginTop");
			if (sImagetype === "SIMG") {
				oGenericTile.setHeaderImage(sImgUrl);
			} else {
				oGenericTile.setBackgroundImage(sImgUrl);
			}
			oGenericTile.setFrameType("TwoByOne");
			oGenericTile.attachPress(sId, this.onCareerPress, this);

			oTileContent.setFooter(oEnddate);

			oNewsContent.setContentText(sHeader);
			oNewsContent.setSubheader(sPublishedBy);

			oTileContent.setContent(oNewsContent);
			oGenericTile.addTileContent(oTileContent);

			this.byId("flexBoxCareer").addItem(oGenericTile);

		},

		generateAccommodationTile: function (sId, sHeader, sStreet, sType, sValue, oEnddate) {

			var oGenericTile = new sap.m.GenericTile(sId);
			var oTileContent = new sap.m.TileContent();
			var oAccomContent = new sap.m.FeedContent();

			oGenericTile.addStyleClass("sapUiTinyMarginBegin");
			oGenericTile.addStyleClass("sapUiTinyMarginTop");
			oGenericTile.setFrameType("TwoByOne");
			oGenericTile.attachPress(sId, this.onAccomPress, this);

			oGenericTile.setHeader(sHeader);

			oTileContent.setFooter(oEnddate);

			oAccomContent.setValue(sValue);
			oAccomContent.setSubheader(sType);
			oAccomContent.setContentText(sStreet);

			oTileContent.setContent(oAccomContent);
			oGenericTile.addTileContent(oTileContent);
			this.byId("flexBoxAccom").addItem(oGenericTile);
		},

		generateEventTile: function (sId, sHeader, sPublishedBy, oEnddate) {

			var oGenericTile = new sap.m.GenericTile(sId);
			var oTileContent = new sap.m.TileContent();

			oGenericTile.addStyleClass("sapUiTinyMarginBegin");
			oGenericTile.addStyleClass("sapUiTinyMarginTop");
			oGenericTile.setFrameType("OneByOne");
			oGenericTile.attachPress(sId, this.onEventPress, this);

			oGenericTile.setHeader(sHeader);
			oGenericTile.setSubheader(sPublishedBy);
			oGenericTile.setMode("HeaderMode");

			oTileContent.setFooter(oEnddate);

			oGenericTile.addTileContent(oTileContent);
			this.byId("flexBoxEvent").addItem(oGenericTile);
		},

		generateJobTile: function (sId, sHeader, sPublishedBy, fNumber, oEnddate) {
			var oGenericTile = new sap.m.GenericTile(sId);
			var oTileContent = new sap.m.TileContent();
			var oContent = new sap.m.NumericContent();

			//Setting GenericTile Data
			oGenericTile.setHeader(sHeader);
			oGenericTile.setSubheader(sPublishedBy);
			oGenericTile.attachPress(sId, this.onJobPress, this);
			oGenericTile.addStyleClass("sapUiTinyMarginBegin");
			oGenericTile.addStyleClass("sapUiTinyMarginTop");
			oGenericTile.addStyleClass("tileLayout");

			//Setting TileContent Data
			oTileContent.setFooter(oEnddate);
			oContent.setValue(fNumber);
			oTileContent.setContent(oContent);
			oGenericTile.addTileContent(oTileContent);
			this.byId("flexBoxJob").addItem(oGenericTile);
		},

		onOfferPress: function (oEvent, sId) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteDetailOffer", {
				ID: sId
			});
		},

		onCareerPress: function (oEvent, sId) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteDetailCareer", {
				ID: sId
			});
		},

		onAccomPress: function (oEvent, sId) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteDetailAccommodation", {
				ID: sId
			});
		},

		onEventPress: function (oEvent, sId) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteDetailEvent", {
				ID: sId
			});
		},

		onJobPress: function (oEvent, sId) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteDetailJob", {
				ID: sId
			});
		},

		getTileContent: function (fNumber, sIcon) {
			var oContent;
			if (fNumber) {
				oContent = new sap.m.NumericContent();
				oContent.setValue(fNumber);
				oContent.setIcon(sIcon);
				oContent.setWithMargin(false);
			} else {
				oContent = new sap.m.ImageContent();
				oContent.setSrc(sIcon);
			}
			return oContent;
		},

		pressNewOffer: function () {

			this.oRouter.navTo("RouteCreateOffer");

		},
		pressNewCareer: function () {

			this.oRouter.navTo("RouteCreateCareer");

		},

		pressNewAcomm: function () {

			this.oRouter.navTo("RouteCreateAccommodation");

		},

		pressNewEvent: function () {

			this.oRouter.navTo("RouteCreateEvent");

		},

		pressNewJob: function () {

			this.oRouter.navTo("RouteCreateJob");

		},

	});

});