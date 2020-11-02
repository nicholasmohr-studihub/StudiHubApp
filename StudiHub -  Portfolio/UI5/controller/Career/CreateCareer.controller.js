sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter"
], function (Base, MessageToast, UploadCollectionParameter) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Carrer.CreateCareer", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.CreateCarrer
		 */
		extendInit: function () {
			this.onLiveChange();
			this.oRouter.getRoute("RouteCreateCareer").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function () {
			this.byId("panelData").bindElement("/UserSet('" + this.oSession.getData().myUserId + "')");

			this.byId("inputHeader").setValue("");
			this.byId("inputCategory").setValue("");
			this.byId("inputImage").setValue("");
			this.byId("textArea").setValue("");

			this.byId("dateRange").setDateValue();
			this.byId("dateRange").setSecondDateValue();
			this.byId("UploadCollection").removeAllItems();
			this.xBinary = "";
		},

		onLiveChange: function (oEvent) {
			var sHeader = this.byId("inputHeader").getValue();
			var sSubHeader = this.byId("inputCategory").getValue();
			var sButton = this.byId("ImageType").getSelectedKey();
			var sImgUrl = this.byId("inputImage").getValue();
			if (this.byId("dateRange").getSecondDateValue()) {
				var oEnddate = "Bis: " + this.dateFormatter(this.byId("dateRange").getSecondDateValue());
			}
			var sImageType;
			if (sButton === "SIMG") {
				sImageType = "HeaderImage";
			} else {
				sImageType = "BackgroundImage";
			}

			this.generateCareerTile(sHeader, sSubHeader, oEnddate, sImageType, sImgUrl);
		},

		generateCareerTile: function (sHeader, sSubHeader, oEnddate, sImageType, sImgUrl) {

			var oGenericTile = new sap.m.GenericTile();
			var oTileContent = new sap.m.TileContent();
			var oNewsContent = new sap.m.NewsContent();

			oGenericTile["set" + sImageType](sImgUrl);
			oGenericTile.setFrameType("TwoByOne");

			oTileContent.setFooter(oEnddate);

			oNewsContent.setContentText(sHeader);
			oNewsContent.setSubheader(sSubHeader);

			oTileContent.setContent(oNewsContent);
			oGenericTile.addTileContent(oTileContent);
			this.byId("flexBoxPreview").destroyItems();
			this.byId("flexBoxPreview").addItem(oGenericTile);
		},

		getCareer: function () {
			return {
				Postid: "0",
				Userid: this.oSession.getData().myUserId,
				Begda: this.removeTimeZoneOffset(this.byId("dateRange").getDateValue()),
				Endda: this.removeTimeZoneOffset(this.byId("dateRange").getSecondDateValue()),
				Title: this.byId("inputHeader").getValue(),
				Category: this.byId("inputCategory").getValue(),
				Imgtype: this.byId("ImageType").getSelectedKey(),
				Imgurl: this.byId("inputImage").getValue(),
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

			var oCareer = this.getCareer();

			if (this.fieldsValid(oCareer)) {
				this.saveCareer(oCareer);
			}

		},

		fieldsValid: function (oCareer) {
			var bErrorOccured = false;

			if (!oCareer.Title) {
				this.byId("inputHeader").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputHeader").setValueState("None");
			}

			if (!oCareer.Category) {
				this.byId("inputCategory").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputCategory").setValueState("None");
			}

			if (!oCareer.Begda || !oCareer.Endda) {
				this.byId("dateRange").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("dateRange").setValueState("None");
			}

			if (!oCareer.Descr) {
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

		saveCareer: function (oCareer) {
			var that = this;
			var sId;
			this.oModel.create("/CareerSet", oCareer, {
				success: function (oData, oReponse) {
					MessageToast.show("Karriereangebot erfolgreich angelegt!");
					sId = oData.Postid;
					setTimeout(function () {
						that.oRouter.navTo("RouteDetailCareer", {
							ID: "K" + sId
						});
					}, 1500);
				},
				error: function () {
					MessageToast.show("Fehler beim Speichern des Karriereangebots!");
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

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Mosbach.StudiHub.view.CreateCarrer
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.CreateCarrer
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.CreateCarrer
		 */
		//	onExit: function() {
		//
		//	}

	});

});