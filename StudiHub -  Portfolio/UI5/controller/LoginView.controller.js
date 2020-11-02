sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (Controller, MessageBox, JSONModel, Device) {
	"use strict";
	return Controller.extend("Mosbach.StudiHub.controller.LoginView", {
		onInit: function () {
			this.oSession = this.getOwnerComponent().getModel("SessionModel");
			this.getView().setModel(this.oSession, "SessionModel");
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oModel = this.getOwnerComponent().getModel();
			this.getView().setModel(this.oModel);
			this.setDeviceModel();
			
			this.oTest = this.getOwnerComponent().getModel("TestMod");
			this.getView().setModel(this.oTest, "TestMod");
		},
		
		setDeviceModel: function() {
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oDeviceModel, "device");
		},
		onLoginPress: function () {
			var that = this;
			
			this.oModel.read("/AuthSet(email='" + this.getView().byId("inputEmail").getValue().toLowerCase() + "',password='" + this.getView().byId("inputPw")
				.getValue() + "')", {
					success: function (oData, oResponse) {
						if (oData.authorized == "X") {
							that.oSession.getData().password = that.getView().byId("inputPw").getValue();
							that.oSession.getData().email = that.getView().byId("inputEmail").getValue().toLowerCase();
							that.oSession.getData().authed = oData.authorized;
							that.oSession.getData().myUserId = oData.userid;
							that.oSession.getData().myUserType= oData.usertype;
							//	that.checkSession();
							that.oRouter.navTo("RouteMasterView");
						} else {
							MessageBox.show("Falsche Account Daten - Username oder Passwort falsch");
							that.oRouter.navTo("RouteLogniView");
						}
					},
					error: function (oError) {
						MessageBox.show("Ups! etwas ist falsch gelaufen. Bitte versuchen sie es später erneut.");
						that.oRouter.navTo("RouteLogniView");
					}
				});
		},
/*			checkSession: function() {
				var that = this;
					setTimeout(function () {
						if (that.oSession.getData().authed === ""){
						MessageBox.show("Session ungültig. Bitte melden Sie sich erneut an.", {
						icon: MessageBox.Icon.ERROR,
						title: "Session ungültig.",
						emphasizedAction: MessageBox.Action.YES,
						onClose: function(oAction){
							that.oRouter.navTo("RouteLoginView");
						}
					});
						} else {
							that.checkSession();
						}
						}, 20000);
					},	*/
		onRegisterPress: function () {
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("registerDialog", "Mosbach.StudiHub.view.fragments.ConfirmStudentStatus", this);
			}
			this.oDialog.open();
		},
		onDialogClose: function () {
			this.oDialog.close();
		},
		onValidatePress: function () {
			var mtrklInput = sap.ui.core.Fragment.byId("registerDialog", "inputStudId").getValue();
			var regex = /^\d+$/;
			if ( mtrklInput.length == 8 && regex.test(mtrklInput)){
			this.oDialog.close();
			this.oRouter.navTo("RouteSignup");
			} else {
				 sap.ui.core.Fragment.byId("registerDialog", "inputStudId").setValueState("Error");
				 sap.ui.core.Fragment.byId("registerDialog", "studMsgStripe").setText("Ihre Eingabe war fehlerhaft. Bitte überpfüfen Sie diese");
				 sap.ui.core.Fragment.byId("registerDialog", "studMsgStripe").setType("Warning");
			}
		}
	});
});