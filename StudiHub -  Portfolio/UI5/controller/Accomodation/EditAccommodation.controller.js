sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Base, UploadCollectionParameter, MessageToast, MessageBox) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Accomodation.EditAccommodation", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.EditAccommodation
		 */
		extendInit: function () {
			this.oRouter.getRoute("RouteEditAccommodation").attachPatternMatched(this._onObjectMatched, this);
			// this.onLiveChange();
		},
		
		_onObjectMatched: function (oEvent) {
			var that = this;
			this.xBinary = "";
			this.postId = oEvent.getParameter("arguments").ID;
			this.byId("UploadCollection").removeAllItems();
			this.oModel.read("/AccomSet('" + this.postId.substr(1) + "')", {
				success: function (oData) {
					if(oData.Pdfsource) {
						that.byId("UploadCollection").addItem( new sap.m.UploadCollectionItem({fileName: "DATEI" }));
					}
				}
 			});
			
			this.getView().bindElement("/AccomSet('" + this.postId.substr(1) + "')");
			setTimeout(function (oData, oResponse) {
				that.onLiveChange();
			}, 1500);
		},

		pressNavBack: function () {
			this.oRouter.navTo("RouteDetailAccommodation", {
				ID: this.postId
			});
		},

		onLiveChange: function (oEvent) {
			var sHeader =   this.byId("inputHeader").getValue();
			var sStreet =   this.byId("inputStreet").getValue();
			var sType =		this.byId("inputRooms").getValue() + " Zimmer " + this.byId("inputNumber").getValue() + "qm";
			var sValue =   this.byId("inputPrice").getValue();
			if (this.byId("dateRange").getSecondDateValue()) {
				var oEnddate = "Bis: " + this.dateFormatter(this.byId("dateRange").getSecondDateValue());    
			}
			
			
			this.generateAccommodationTile(sHeader, sStreet, sType, sValue, oEnddate);
		},
		
		generateAccommodationTile: function (sHeader, sStreet, sType, sValue, oEnddate) {
			
			var oGenericTile = new sap.m.GenericTile();
			var oTileContent = new sap.m.TileContent();
			var oAccomContent = new sap.m.FeedContent();
			
			oGenericTile.addStyleClass("sapUiTinyMarginBegin");
			oGenericTile.addStyleClass("sapUiTinyMarginTop");
			oGenericTile.setFrameType("TwoByOne");
			
			oGenericTile.setHeader(sHeader);
			
			oTileContent.setFooter(oEnddate);
			
			oAccomContent.setValue(sValue);
			oAccomContent.setSubheader(sType);
			oAccomContent.setContentText(sStreet);
			
			oTileContent.setContent(oAccomContent);
			oGenericTile.addTileContent(oTileContent);
			this.byId("flexBoxPreview").destroyItems();
			this.byId("flexBoxPreview").addItem(oGenericTile);
		},
		
		getAccom: function ()  {
		
			return {
				Postid: this.getView().getBindingContext().getObject().Postid,
				Userid: this.getView().getBindingContext().getObject().Userid,
				Begda: this.removeTimeZoneOffset(this.byId("dateRange").getDateValue()),
				Endda: this.removeTimeZoneOffset(this.byId("dateRange").getSecondDateValue()),
				Title: this.byId("inputHeader").getValue(),
				Cost: this.byId("inputPrice").getValue(),
				Rooms: this.byId("inputRooms").getValue() + "",
				Area: this.byId("inputNumber").getValue(),
				Street: this.byId("inputStreet").getValue(),
				City: this.byId("inputCity").getValue(),
				Postcode: this.byId("inputPostcode").getValue(),
				Descr: this.byId("textArea").getValue(),
				Weblink: this.byId("inputWebsite").getValue(),
				Pdfbinary: this.xBinary,
				Pdfsource: "",
				Uname: ""
			};
			
				// return this.getView().getBindingContext().getObject();
			
		},
		
		onSavePress: function () {

			var oAccom = this.getAccom();

			if (this.fieldsValid(oAccom)) {
				this.saveAccom(oAccom);
			}

		},

		fieldsValid: function (oAccom) {
			var bErrorOccured = false;

			if (!oAccom.Title) {
				this.byId("inputHeader").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputHeader").setValueState("None");
			}

			if (!oAccom.Street) {
				this.byId("inputStreet").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputStreet").setValueState("None");
			}
			
			if (!oAccom.Postcode) {
				this.byId("inputPostcode").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputPostcode").setValueState("None");
			}
			
			if (!oAccom.City) {
				this.byId("inputCity").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputCity").setValueState("None");
			}
			
			if (!oAccom.Rooms) {
				this.byId("inputRooms").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputRooms").setValueState("None");
			}
			
			if (!oAccom.Cost) {
				this.byId("inputPrice").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputPrice").setValueState("None");
			}
			
			if (!oAccom.Area) {
				this.byId("inputNumber").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputNumber").setValueState("None");
			}

			if (!oAccom.Begda || !oAccom.Endda) {
				this.byId("dateRange").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("dateRange").setValueState("None");
			}

			if (!oAccom.Descr) {
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

		onDeletePress: function () {

			var oAccom = this.getAccom();
			var that = this;

			MessageBox.warning("Wollen Sie wirklich das Inserat: '" + oAccom.Title + "' löschen?", {
				actions: ["Löschen", MessageBox.Action.CLOSE],
				emphasizedAction: "Löschen",
				onClose: function (sAction) {
					if (sAction == "Löschen") {
						that.oModel.remove("/AccomSet('" + that.postId.substr(1) + "')", {
							success: function () {
								MessageToast.show("Inserat erfolgreich gelöscht!");
								setTimeout(function () {
									that.navToMaster();
								}, 1500);
							},
							error: function () {
								MessageToast.show("Fehler beim Löschen des Inserats!");
							}
						});
					} else {

					}
				}
			});

		},
	
		saveAccom: function (oAccom) {
			var that = this;
			var sId;
			
			if(this.byId("UploadCollection").getItems().length === 0) {
				oAccom.Pdfsource = "";
			}
			
			this.oModel.update("/AccomSet('" + oAccom.Postid + "')", oAccom, {
				success: function (oData, oReponse) {
					MessageToast.show("Inserat erfolgreich angelegt!");
					sId = oAccom.Postid;
					setTimeout(function () {
						that.oRouter.navTo("RouteDetailAccommodation", {
							ID: "A" + sId
						});
					}, 1500);
				},
				error: function () {
					MessageToast.show("Fehler beim Speichern des Inserats!");
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

		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Mosbach.StudiHub.view.EditAccommodation
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.EditAccommodation
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.EditAccommodation
		 */
		//	onExit: function() {
		//
		//	}

	});

});