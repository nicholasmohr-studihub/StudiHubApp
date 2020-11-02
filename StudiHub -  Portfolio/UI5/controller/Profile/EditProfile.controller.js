sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
], function (Base, MessageToast, MessageBox) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Profile.EditProfile", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.EditProfile
		 */
		extendInit: function () {
			this.oRouter.getRoute("RouteEditProfile").attachPatternMatched(this._onObjectMatched, this);
		},
		pressNavBack: function () {
			this.oRouter.navTo("RouteDetailProfile", {
				userId: this.userId
			});
		},
		_onObjectMatched: function (oEvent) {
			this.userId = oEvent.getParameter("arguments").userId;
			this.getView().bindElement("/UserSet('" + this.userId.substr(1) + "')");
		},

		onPasswordPress: function () {
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("PasswordDialog", "Mosbach.StudiHub.view.fragments.NewPassword", this);
			}
			this.oDialog.open();
		},

		onDialogClose: function () {
			this.oDialog.close();
		},

		onSavePress: function () {
			var that = this;
			MessageBox.show("Möchten Sie die Daten wirklich ändern?", {
				icon: MessageBox.Icon.WARNING,
				title: "Profil ändern",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {
					if (oAction == "YES") {
						var userType = that.getView().getBindingContext().getObject().Usertype.substr(0, 1);
						if (userType === "A") userType = "U";
						if (userType === "C") userType = "U";
						var oUser = {
							Userid: that.userId.substr(1),
							Expires: that.byId("userExpires" + userType).getDateValue(),
							Gender: that.byId("comboBoxGender").getSelectedKey(),
							Usertype: that.getView().getBindingContext().getObject().Usertype,
							Company: that.byId("inputCompany").getValue(),
							Website: that.byId("inputWeblink").getValue(),
							Logo: "",
							Street: that.byId("inputStreet" + userType).getValue(),
							City: that.byId("inputCity" + userType).getValue(),
							Postcode: that.byId("inputPostcode" + userType).getValue(),
							Beschreibung: that.byId("textArea").getValue(),
							Email: that.byId("inputEmail" + userType).getValue(),
							Firstname: that.byId("inputFirstname").getValue(),
							Lastname: that.byId("inputLastname").getValue(),
							Lastlogin: that.getView().getBindingContext().getObject().Lastlogin
						};

						that.oModel.update("/UserSet('" + that.userId.substr(1) + "')", oUser, {
							success: function (oData, oResponse) {
								sap.ui.core.BusyIndicator.hide();
								MessageToast.show("Das Speichern der Änderungen war erfolgreich!");
								setTimeout(function () {
									that.pressNavBack();
								}, 3000);
							},
							error: function (oResponse) {
								sap.ui.core.BusyIndicator.hide();
								MessageToast.show("Fehler beim Speichern der Änderungen!");
							}
						});
					} else {
						return;
					}

				}
			});
		},

		onDeletePress: function () {
			var sPath = this.getView().getBindingContext().getPath();
			var that = this;
			MessageBox.show("Möchten Sie dieses Profil wirklich löschen?", {
				icon: MessageBox.Icon.WARNING,
				title: "Profil löschen",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {
					if (oAction == "YES") {
						sap.ui.core.BusyIndicator.show();
						that.oModel.remove(sPath, {
							success: function (oData) {
								sap.ui.core.BusyIndicator.hide();
								MessageToast.show("Profil wurde erfolgreich gelöscht.");
								setTimeout(function () {
									that.oRouter.navTo("RouteAdminPanel");
								}, 3000);
								if(that.getView().getBindingContext().getPath().includes(that.oSession.getData().myUserId)) window.location.reload();
							},
							error: function (oError) {
								sap.ui.core.BusyIndicator.hide();
								MessageToast.show("Ein Fehler ist aufgetreten. Profil konnte nicht gelöscht werden.");
							}
						});
					} else {
						return;
					}
				}
			});
		},

		onValidatePress: function () {
			var that = this;
			var sOldPw = sap.ui.core.Fragment.byId("PasswordDialog", "inputOldPw").getValue();
			var sNewPw = sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw").getValue();
			var sNewPw2 = sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw2").getValue();
			var bErrorOccured = false;
			var oAuth = {
				email: this.getView().getBindingContext().getObject().Email,
				password: sNewPw,
				authorized: "",
				userid: this.getView().getBindingContext().getObject().Userid,
				usertype: ""
			};

			if (!sOldPw) {
				sap.ui.core.Fragment.byId("PasswordDialog", "inputOldPw").setValueState("Error");

				bErrorOccured = true;
			} else {
				sap.ui.core.Fragment.byId("PasswordDialog", "inputOldPw").setValueState("None");
			}
			if (!sNewPw) {
				sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw").setValueState("Error");
				bErrorOccured = true;
			} else {
				sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw").setValueState("None");
			}

			if (!sNewPw2) {
				sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw2").setValueState("Error");
				bErrorOccured = true;
			} else {
				sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw2").setValueState("None");
			}

			if (!bErrorOccured) {

				if (sNewPw !== sNewPw2) {
					MessageToast.show("Das neuen Passwörter stimmen nicht überein");
					sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw").setValueState("Error");
					sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw2").setValueState("Error");
				} else {
					sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw").setValueState("None");
					sap.ui.core.Fragment.byId("PasswordDialog", "inputNewPw2").setValueState("None");

					this.oModel.read("/AuthSet(email='" + this.getView().getBindingContext().getObject().Email + "',password='" + sOldPw +"')", {
						success: function (oData, oResponse) {
							that.oModel.update("/AuthSet(email='" + that.getView().getBindingContext().getObject().Email + "',password='" + sOldPw +"')", oAuth, {
								success: function () {
									MessageToast.show("Passwort erfolgreich gespeichert!");
									that.oDialog.close();
								
								}
							});
						},
						error: function (oError) {
							MessageToast.show("Das angegebene Passwort war falsch! Probiere es nochmal!");
						}
					});

				}

			} else {
				MessageToast.show("Fülle bitte alle Felder aus!");
			}

		},

		/*	onSafePress: function () {
				var that = this;
				MessageBox.show("Möchten Sie die Daten wirklich ändern?", {
					icon: MessageBox.Icon.WARNING,
					title: "Daten ändern",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction == "YES") {
							sap.ui.core.BusyIndicator.show();
							that.oModel.submitChanges({
								success: function () {
									sap.ui.core.BusyIndicator.hide();
									MessageToast.show("Änderungen wurden erfolgreich gespeichert!");
								},
								error: function () {
									sap.ui.core.BusyIndicator.hide();
									MessageToast.show("Ein Fehler ist aufgetreten. Änderungen konnten nicht gepseichert werden.");
								}
							});
						} else {
							return;
						}
					}
				});
			} */

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Mosbach.StudiHub.view.EditProfile
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.EditProfile
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.EditProfile
		 */
		//	onExit: function() {
		//
		//	}

	});

});