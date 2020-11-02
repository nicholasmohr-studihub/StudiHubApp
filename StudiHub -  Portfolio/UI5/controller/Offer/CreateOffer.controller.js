sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast"
], function (Base, UploadCollectionParameter, MessageToast) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Offer.CreateOffer", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.CreateOffer
		 */
		extendInit: function () {
			this.onLiveChange();
			this.oRouter.getRoute("RouteCreateOffer").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function () {
			this.byId("panelData").bindElement("/UserSet('" + this.oSession.getData().myUserId + "')");
			this.byId("inputHeader").setValue("");
			this.byId("inputShortHeader").setValue("");
			this.byId("inputNumber").setValue("");
			this.byId("textArea").setValue("");
			this.byId("selectIcon").setValue("");
			
			this.byId("dateRange").setDateValue();
			this.byId("dateRange").setSecondDateValue();
			this.byId("UploadCollection").removeAllItems();
			this.xBinary = "";
		},

		onLiveChange: function () {
			var sHeader = this.byId("inputShortHeader").getValue();
			var sPublishedBy = this.byId("inputCompany").getValue();
			var sIcon = this.byId("selectIcon").getSelectedKey();
			var fNumber = this.byId("inputNumber").getValue();
			if (this.byId("dateRange").getSecondDateValue()) {
				var oEnddate = "Bis: " + this.dateFormatter(this.byId("dateRange").getSecondDateValue());
			}
			this.generateOfferTile(sHeader, sPublishedBy, sIcon, fNumber, oEnddate);
		},

		pressNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteMasterView");
		},

		generateOfferTile: function (sHeader, sPublishedBy, sIcon, fNumber, oEnddate) {
			var oGenericTile = new sap.m.GenericTile();
			var oTileContent = new sap.m.TileContent();
			var oContent = this.getTileContent(fNumber, sIcon);

			//Setting GenericTile Data
			oGenericTile.setHeader(sHeader);
			oGenericTile.setSubheader(sPublishedBy);
			oGenericTile.setMode();
			// oGenericTile.setFrameType();

			oGenericTile.addStyleClass("sapUiTinyMargin");
			oGenericTile.addStyleClass("sapUiTinyMargin");
			//Setting TileContent Data
			oTileContent.setFooter(oEnddate);

			oTileContent.setContent(oContent);
			oGenericTile.addTileContent(oTileContent);
			this.byId("flexBoxPreview").destroyItems();
			this.byId("flexBoxPreview").addItem(oGenericTile);
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

		getOffer: function () {
			return {
				Postid: "0",
				Userid: this.oSession.getData().myUserId,
				Begda: this.removeTimeZoneOffset(this.byId("dateRange").getDateValue()),
				Endda: this.removeTimeZoneOffset(this.byId("dateRange").getSecondDateValue()),
				Title: this.byId("inputHeader").getValue(),
				ShortTitle: this.byId("inputShortHeader").getValue(),
				OfferValue: this.byId("inputNumber").getValue(),
				Icon: this.byId("selectIcon").getSelectedKey(),
				Street: this.byId("inputStreet").getValue(),
				City: this.byId("inputCity").getValue(),
				Postcode: this.byId("inputPostcode").getValue(),
				Descr: this.byId("textArea").getValue(),
				Weblink: this.byId("inputWebsite").getValue(),
				Pdfsource: "",
				Pdfbinary: this.xBinary,
				Uname: ""
			};
		},

		onSavePress: function () {

			var oOffer = this.getOffer();

			if (this.fieldsValid(oOffer)) {
				this.saveOffer(oOffer);
			}

		},

		fieldsValid: function (oOffer) {
			var bErrorOccured = false;

			if (!oOffer.Title) {
				this.byId("inputHeader").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputHeader").setValueState("None");
			}

			if (!oOffer.ShortTitle) {
				this.byId("inputShortHeader").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputShortHeader").setValueState("None");
			}

			if (!oOffer.Begda || !oOffer.Endda) {
				this.byId("dateRange").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("dateRange").setValueState("None");
			}

			if (!oOffer.Descr) {
				this.byId("textArea").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("textArea").setValueState("None");
			}

			if (bErrorOccured) {
				MessageToast.show("Bitte fülle alle Pflichtfelder aus!");
			}
			return !bErrorOccured;
		},

		saveOffer: function (oOffer) {
			var that = this;
			var sId;
			this.oModel.create("/OfferSet", oOffer, {
				success: function (oData, oReponse) {
					MessageToast.show("Angebot erfolgreich angelegt!");
					sId = oData.Postid;
					setTimeout(function () {
						that.oRouter.navTo("RouteDetailOffer", {
							ID: "O" + sId
						});
					}, 1500);
				},
				error: function () {
					MessageToast.show("Fehler beim Speichern des Angebots!");
				}
			});
		},

		onFileSelected: function (oEvent) {
			var oUploadCollection = oEvent.getSource();
			oUploadCollection.removeAllItems();

			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: this.oModel.getSecurityToken()
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			this.saveFileTemporary(oEvent.getParameter("files")[0]);
		},

		saveFileTemporary: function (oFile) {
			var sBinaryData;
			var reader = new FileReader();
			var that = this;
			reader.onload = function (readerEvt) {
				var binaryString = readerEvt.target.result;
				// var fName = oFile.name; // 1st time file get updated. but 2nd time 2nd file came but ".item(name)" didn't get updated.
				// var fType = oFile.type; // same here 2nd file item(name) didn't get updated.
				// var fSize = oFile.size;
				var base64;

				if (btoa(binaryString)) {
					base64 = btoa(binaryString);
				} else {
					base64 = btoa(encodeURIComponent(binaryString));
				}
				/* eslint-disable */
				if (typeof base64file === "undefined" || typeof base64file === null) { //error has to be ignored
					sBinaryData = base64;
				} else {
					sBinaryData = sBinaryData + "new" + base64;
				}
				that.xBinary = sBinaryData;
			};

			reader.readAsBinaryString(oFile);

		},

	});

});