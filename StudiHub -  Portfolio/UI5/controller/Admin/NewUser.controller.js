sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"sap/m/MessageBox"
], function (Base, MessageBox) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Admin.NewUser", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.NewUser
		 */
		extendInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("RouteNewUser").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function () {
			this.byId("inputMail").setValue("");
			this.byId("areaMailPw").setValue("");
		},

		generateDefault: function () {
			return Math.random().toString(36).substring(7);
		},

		getUserInput: function () {
			var oEntryUser = {};
			var oEntryAuth = {};
			var oEntry = {};
			oEntryUser.Email = this.byId("inputMail").getValue();
			oEntryUser.Usertype = this.byId("userType").getSelectedKey();

			oEntryAuth.email = oEntryUser.Email;
			oEntryAuth.password = this.generateDefault();
			oEntryAuth.authorized = "";

			oEntry.auth = oEntryAuth;
			oEntry.user = oEntryUser;
			return oEntry;
		},

		onCreateUser: function () {
			var that = this;
			var oEntry = this.getUserInput();
			if (this.checkMail(oEntry.user.Email)) {
				this.oModel.create("/UserSet", oEntry.user, {
					success: function (oData, oResponse) {
						oEntry.auth.userid = oData.Userid;
						that.oModel.create("/AuthSet", oEntry.auth, {
							success: function () {
								that.byId("areaMailPw").setValue("Das generierte Default Passwort zum Einloggen des Angelegten Users ist: " + oEntry.auth
									.password + "\nBitten weißen Sie ihn darauf hin, dies zu ändern.");
								MessageBox.show("User wurden erfolgreich Registriert.", {
									icon: MessageBox.Icon.SUCCESS,
									title: "Registrierung."
								});
							},
							error: function (oError) {
								MessageBox.show("Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut", {
									icon: MessageBox.Icon.ERROR,
									title: "Registrierung."
								});
							}
						});

					},
					error: function (oError) {
						MessageBox.show("Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut", {
							icon: MessageBox.Icon.ERROR,
							title: "Registrierung."
						});
					}
				});
			}
		},
		
		checkMail: function(sMail) {
			 return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(sMail);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Mosbach.StudiHub.view.NewUser
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.NewUser
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.NewUser
		 */
		//	onExit: function() {
		//
		//	}

	});

});