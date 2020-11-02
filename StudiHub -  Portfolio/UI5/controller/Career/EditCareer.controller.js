sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Base, UploadCollectionParameter, MessageBox, MessageToast) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Carrer.EditCareer", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.EditCarrer
		 */
		extendInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("RouteEditCareer").attachPatternMatched(this._onObjectMatched, this);
			this.onLiveChange();
		},

		_onObjectMatched: function (oEvent) {
			var that = this;
			this.xBinary = "";
			this.postId = oEvent.getParameter("arguments").ID;
			this.byId("UploadCollection").removeAllItems();
			this.oModel.read("/CareerSet('" + this.postId.substr(1) + "')", {
				success: function (oData) {
					if(oData.Pdfsource) {
						that.byId("UploadCollection").addItem( new sap.m.UploadCollectionItem({fileName: "DATEI" }));
					}
				}
 			});
			
			this.getView().bindElement("/CareerSet('" + this.postId.substr(1) + "')");
			setTimeout(function (oData, oResponse) {
				that.onLiveChange();
			}, 1500);
			this.xBinary = "";
		},

		pressNavBack: function () {
			this.oRouter.navTo("RouteDetailCareer", {
				ID: this.postId
			});
		},

		onLiveChange: function (oEvent) {
			var sHeader = this.byId("inputHeader").getValue();
			var sSubHeader = this.byId("inputCategory").getValue();
			var sButton = this.byId("ImageType").getSelectedButton();
			var sImgUrl = this.byId("inputImage").getValue();
			if (this.byId("dateRange").getSecondDateValue()) {
				var oEnddate = "Bis: " + this.dateFormatter(this.byId("dateRange").getSecondDateValue());
			}
			var sImageType;
			if (sButton) {
				sImageType = sButton.split("--")[1].split("-")[0];
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
				Postid: this.getView().getBindingContext().getObject().Postid,
				Userid: this.oSession.getData().myUserId,
				Begda: this.removeTimeZoneOffset(this.byId("dateRange").getDateValue()),
				Endda: this.removeTimeZoneOffset(this.byId("dateRange").getSecondDateValue()),
				Title: this.byId("inputHeader").getValue(),
				Category: this.byId("inputCategory").getValue(),
				Imgtype:this.byId("ImageType").getSelectedKey(),
				Imgurl: this.byId("inputImage").getValue(),
				Street: this.byId("inputStreet").getValue(),
				City: this.byId("inputCity").getValue(),
				Postcode: this.byId("inputPostcode").getValue(),
				Descr: this.byId("textArea").getValue(),
				Weblink: this.byId("inputWebsite").getValue(),
				Pdfsource: this.getView().getBindingContext().getObject().Pdfsource,
				Pdfbinary: this.xBinary,
				Uname: ""
			};	
		},

		onSavePress: function () {
			
			var oCareer = this.getCareer();
			
			if(this.fieldsValid(oCareer)) {
				this.saveCareer(oCareer);
			}

		},
		
		onDeletePress: function () {

			var oCareer = this.getCareer();
			var that = this;

			MessageBox.warning("Wollen Sie wirklich das Karriereangebot: '" + oCareer.Title + "' löschen?", {
				actions: ["Löschen", MessageBox.Action.CLOSE],
				emphasizedAction: "Löschen",
				onClose: function (sAction) {
					if (sAction == "Löschen") {
						that.oModel.remove("/CareerSet('" + that.postId.substr(1) + "')", {
							success: function () {
								MessageToast.show("Karriereangebot erfolgreich gelöscht!");
								setTimeout(function () {
									that.navToMaster();
								}, 1500);
							},
							error: function () {
								MessageToast.show("Fehler beim Löschen des Karriereangebots!");
							}
						});
					} else {

					}
				}
			});

		},
		
		fieldsValid: function (oCareer) {
			var bErrorOccured = false;
		
			if(!oCareer.Title) {
				this.byId("inputHeader").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputHeader").setValueState("None");
			}
			
			if(!oCareer.Category) {
				this.byId("inputCategory").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("inputCategory").setValueState("None");
			}
			
			if(!oCareer.Begda || !oCareer.Endda) {
				this.byId("dateRange").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("dateRange").setValueState("None");
			}
			
			if(!oCareer.Descr) {
				this.byId("textArea").setValueState("Error");
				bErrorOccured = true;
			} else {
				this.byId("textArea").setValueState("None");
			}
			
			if(bErrorOccured) {
				MessageToast.show("Bitte fülle alle Pflichtfelder aus!");
			}
			return !bErrorOccured;
		},
		
		saveCareer: function (oCareer) {
			var that = this;
			var sId;
			
			if(this.byId("UploadCollection").getItems().length === 0) {
				oCareer.Pdfsource = "";
			}
			
			this.oModel.update("/CareerSet('" + oCareer.Postid + "')", oCareer, {
				success: function (oData, oReponse) {
					MessageToast.show("Karriereangebot erfolgreich angelegt!");
					sId =  oCareer.Postid;
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
		 * @memberOf Mosbach.StudiHub.view.EditCarrer
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.EditCarrer
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.EditCarrer
		 */
		//	onExit: function() {
		//
		//	}

	});

});