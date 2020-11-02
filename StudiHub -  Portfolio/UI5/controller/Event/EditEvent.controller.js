sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Base, UploadCollectionParameter,MessageToast, MessageBox) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Event.EditEvent", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.EditEvent
		 */
		extendInit: function () {
			this.oRouter.getRoute("RouteEditEvent").attachPatternMatched(this._onObjectMatched, this);
			this.onLiveChange();
		},
		
		_onObjectMatched: function (oEvent) {
			var that = this;
			this.xBinary = "";
			this.postId = oEvent.getParameter("arguments").ID;
			this.byId("UploadCollection").removeAllItems();
			this.oModel.read("/EventSet('" + this.postId.substr(1) + "')", {
				success: function (oData) {
					if(oData.Pdfsource) {
						that.byId("UploadCollection").addItem( new sap.m.UploadCollectionItem({fileName: "DATEI" }));
					}
				}
 			});
			
			this.getView().bindElement("/EventSet('" + this.postId.substr(1) + "')");
			setTimeout(function (oData, oResponse) {
				that.onLiveChange();
			}, 1500);
			this.xBinary = "";
		},

		pressNavBack: function () {
			this.oRouter.navTo("RouteDetailEvent", {
				ID: this.postId
			});
		},
		
		onLiveChange: function () {
			var sHeader = this.byId("inputHeader").getValue();
			var sPublishedBy = this.byId("inputCompany").getValue();
			if (this.byId("dateRange").getSecondDateValue()) {
			var oEnddate = "Bis: " + this.dateFormatter(this.byId("dateRange").getSecondDateValue());    
			}
			this.generateEventTile(sHeader, sPublishedBy, oEnddate);
		},
		
		generateEventTile: function (sHeader, sPublishedBy, oEnddate) {
			
			var oGenericTile = new sap.m.GenericTile();
			var oTileContent = new sap.m.TileContent();
			
			oGenericTile.addStyleClass("sapUiTinyMarginBegin");
			oGenericTile.addStyleClass("sapUiTinyMarginTop");
			oGenericTile.setFrameType("OneByOne");
			
			oGenericTile.setHeader(sHeader);
			oGenericTile.setSubheader(sPublishedBy);
			oGenericTile.setMode("HeaderMode");
			
			oTileContent.setFooter(oEnddate);
			
			oGenericTile.addTileContent(oTileContent);
			this.byId("flexBoxPreview").destroyItems();
			this.byId("flexBoxPreview").addItem(oGenericTile);
		},
		
		getEvent: function () {
		return {
				Postid: this.getView().getBindingContext().getObject().Postid,
				Userid: this.getView().getBindingContext().getObject().Userid,
				Begda: this.removeTimeZoneOffset(this.byId("dateRange").getDateValue()),
				Endda: this.removeTimeZoneOffset(this.byId("dateRange").getSecondDateValue()),
				Title: this.byId("inputHeader").getValue(),
				Street: this.byId("inputStreet").getValue(),
				City: this.byId("inputCity").getValue(),
				Postcode: this.byId("inputPostcode").getValue(),
				Descr: this.byId("textArea").getValue(),
				Weblink: this.byId("inputWebsite").getValue(),
				Uname: "",
				Pdfsource: this.getView().getBindingContext().getObject().Pdfsource,
				Pdfbinary: this.xBinary
			};
	
		},
		
		onSavePress: function () {

			var oEvent = this.getEvent();

			if (this.fieldsValid(oEvent)) {
				this.updateEvent(oEvent);
			}

		},

		onDeletePress: function () {

			var oEvent = this.getEvent();
			var that = this;

			MessageBox.warning("Wollen Sie wirklich das Event: '" + oEvent.Title + "' löschen?", {
				actions: ["Löschen", MessageBox.Action.CLOSE],
				emphasizedAction: "Löschen",
				onClose: function (sAction) {
					if (sAction == "Löschen") {
						that.oModel.remove("/EventSet('" + that.postId.substr(1) + "')", {
							success: function () {
								MessageToast.show("Event erfolgreich gelöscht!");
								setTimeout(function () {
									that.navToMaster();
								}, 1500);
							},
							error: function () {
								MessageToast.show("Fehler beim Löschen des Events!");
							}
						});
					} else {

					}
				}
			});

		},

		fieldsValid: function (oEvent) {
			var bErrorOccured = false;

			if (!oEvent.Title) {
				this.byId("inputHeader").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputHeader").setValueState("None");
			}
			if (!oEvent.Begda || !oEvent.Endda) {
				this.byId("dateRange").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("dateRange").setValueState("None");
			}

			if (!oEvent.Descr) {
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

		updateEvent: function (oEvent) {
			var that = this;
			
			if(this.byId("UploadCollection").getItems().length === 0) {
				oEvent.Pdfsource = "";
			}
			
			this.oModel.update("/EventSet('" + this.postId.substr(1) + "')", oEvent, {
				success: function (oData, oReponse) {
					MessageToast.show("Event erfolgreich angelegt!");
					setTimeout(function () {
						that.oRouter.navTo("RouteDetailEvent", {
							ID: that.postId
						});
					}, 1500);
				},
				error: function () {
					MessageToast.show("Fehler beim Speichern des Events!");
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
		 * @memberOf Mosbach.StudiHub.view.EditEvent
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.EditEvent
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.EditEvent
		 */
		//	onExit: function() {
		//
		//	}

	});

});