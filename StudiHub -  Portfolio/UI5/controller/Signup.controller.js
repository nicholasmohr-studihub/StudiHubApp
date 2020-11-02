sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("Mosbach.StudiHub.controller.Signup", {

		onInit: function () {
			this.oModel = this.getOwnerComponent().getModel();
			this.getView().setModel(this.oModel);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("RouteSignup").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function () {
			this.byId("inputFirstname").setValue("");
			this.byId("inputLastname").setValue("");
			this.byId("inputMail").setValue("");
			this.byId("inputStreet").setValue("");
			this.byId("inputZipcode").setValue("");
			this.byId("inputCity").setValue("");
			this.byId("inputMail").setValue("");
			this.byId("inputPw").setValue("");
		},

		navToLogin: function () {
			this.oRouter.navTo("RouteLoginView");
		},

		getUserInput: function () {
			var oEntryUser = {};
			var oEntryAuth = {};
			var oEntry = {};
			oEntryUser.Gender = this.byId("multiBoxStatus").getValue();
			oEntryUser.Firstname = this.byId("inputFirstname").getValue();
			oEntryUser.Lastname = this.byId("inputLastname").getValue();
			oEntryUser.Email = this.byId("inputMail").getValue();
			oEntryUser.Street = this.byId("inputStreet").getValue();
			oEntryUser.Postcode = this.byId("inputZipcode").getValue();
			oEntryUser.City = this.byId("inputCity").getValue();
			oEntryUser.Usertype = "STDT";

			oEntryAuth.email = this.byId("inputMail").getValue();
			oEntryAuth.password = this.byId("inputPw").getValue();
			oEntryAuth.authorized = "";

			oEntry.auth = oEntryAuth;
			oEntry.user = oEntryUser;
			return oEntry;
		},

		checkInput: function () {
			var bNoError = true;
			var mailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			var postcodeRegex = /^([0]{1}[1-9]{1}|[1-9]{1}[0-9]{1})[0-9]{3}$/;
		//	var postcodeRegex = /[0-9]{5}/;

			if (this.byId("multiBoxStatus").getValue() === "") {
				this.byId("multiBoxStatus").setValueState("Error");
				bNoError = false;
			} else {
				this.byId("multiBoxStatus").setValueState("Success");
			}
			if (this.byId("inputFirstname").getValue() === "") {
				this.byId("inputFirstname").setValueState("Error");
				bNoError = false;
			} else {
				this.byId("inputFirstname").setValueState("Success");
			}
			if (this.byId("inputLastname").getValue() === "") {
				this.byId("inputLastname").setValueState("Error");
				bNoError = false;
			} else {
				this.byId("inputLastname").setValueState("Success");
			}
			if ((this.byId("inputMail").getValue() === "" || this.byId("inputMail").getValue() !== this.byId("confirmMail").getValue()) && !
				mailRegex.test(this.byId("inputMail").getValue())) {
				this.byId("inputMail").setValueState("Error");
				this.byId("confirmMail").setValueState("Error");
				bNoError = false;
			} else {
				this.byId("inputMail").setValueState("Success");
				this.byId("confirmMail").setValueState("Success");
			}
			if (this.byId("inputStreet").getValue() === "") {
				this.byId("inputStreet").setValueState("Error");
				bNoError = false;
			} else {
				this.byId("inputStreet").setValueState("Success");
			}
			if (this.byId("inputZipcode").getValue() === "" && !postcodeRegex.test(this.byId("inputZipcode"))) {
				this.byId("inputZipcode").setValueState("Error");
				bNoError = false;
			} else {
				this.byId("inputZipcode").setValueState("Success");
			}
			if (this.byId("inputCity").getValue() === "") {
				this.byId("inputCity").setValueState("Error");
				bNoError = false;
			} else {
				this.byId("inputCity").setValueState("Success");
			}
			if (this.byId("inputPw").getValue() === "" || this.byId("inputPw").getValue() !== this.byId("confirmPw").getValue()) {
				this.byId("inputPw").setValueState("Error");
				this.byId("confirmPw").setValueState("Error");
				bNoError = false;
			} else {
				this.byId("inputPw").setValueState("Success");
				this.byId("confirmPw").setValueState("Success");
			}

			return bNoError;

		},

		onCreateUser: function () {
				if (this.checkInput()) {
					var that = this;
					var oEntry = this.getUserInput();
					// if (this.checkExistingMail()) {
					this.oModel.create("/UserSet", oEntry.user, {
						success: function (oData, oResponse) {
							oEntry.auth.userid = oData.Userid;
							that.oModel.create("/AuthSet", oEntry.auth, {
								success: function () {
									MessageBox.show("Sie wurden erfolgreich Registriert. Bite melden Sie sich an.", {
										icon: MessageBox.Icon.SUCCESS,
										title: "Registrierung.",
										onClose: function (oAction) {
											that.oRouter.navTo("RouteLoginView");
										}
									});
								},
								error: function (oError) {
									MessageBox.show("Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut", {
										icon: MessageBox.Icon.ERROR,
										title: "Registrierung.",
										onClose: function (oAction) {
											 //eslint-disable-next-line 
											window.location.reload();
										}
									});
								}
							});

						},
						error: function (oError) {
							MessageBox.show("Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut", {
								icon: MessageBox.Icon.ERROR,
								title: "Registrierung.",
								onClose: function (oAction) {
								   //eslint-disable-next-line 
									window.location.reload();
								}
							});
						}
					});
				//	} 
				} else {
					MessageBox.show("Eingabe ungültig. Bitte überprüfen.", {
						icon: MessageBox.Icon.ERROR,
						title: "Eingabe ungültig.",
						emphasizedAction: MessageBox.Action.YES
					});
				}
			},
			
		/*	checkExistingMail: function() {
				this.oModel.read("/UserSet(email='" + this.byId("inputMail").getValue() + "',password='" + this.getView().byId("inputPw")
				.getValue() + "')", {
					success: function (oData, oResponse) {
						if (oData.Email === "") {
							return true;
						} else {
							MessageBox.show("E-Mail berets registriert", {
								icon: MessageBox.Icon.ERROR,
								title: "Registrierung"
							});
							return false;
						}
					},
					error: function (oError) {
						MessageBox.show("Ups! etwas ist falsch gelaufen. Bitte versuchen sie es später erneut.");
						return false;
					}
				});
			}*/
			
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf Mosbach.StudiHub.view.Signup
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.Signup
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.Signup
		 */
		//	onExit: function() {
		//
		//	}

	});

});