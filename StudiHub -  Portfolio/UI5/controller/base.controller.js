sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("Mosbach.StudiHub.controller.base", {
		onInit: function () {
			this.oModel = this.getOwnerComponent().getModel();
			this.getView().setModel(this.oModel);
			this.oSession = this.getOwnerComponent().getModel("SessionModel");
			this.getView().setModel(this.oSession, "SessionModel");
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (this.checkAuth()) {
				this.setupInactive();
				this.extendInit();
			}
		},

		/*
		 *	Begin: Routes
		 */

		navToMaster: function () {
			this.oRouter.navTo("RouteMasterView");
		},
		navToProfile: function (userId) {
			this.oRouter.navTo("RouteDetailProfile", {
				userId: userId
			});
		},
		/*
		 *	End: Routes
		 */
		onMyProfilePress: function (oEvent) {
			this.navToProfile(this.oSession.getData().myUserType.substr(0, 1) + this.oSession.getData().myUserId);
		},

		onAdminPanelPress: function () {
			this.oRouter.navTo("RouteAdminPanel");
		},

		removeTimeZoneOffset: function (oDate) {
			return oDate;
			//return oDate.setTime(oDate.getTime() - oDate.getTimezoneOffset() * 60 * 1000);
		},

		dateFormatter: function (oDate) {
			this.removeTimeZoneOffset(oDate);
			return oDate.getDate() + "." + (oDate.getMonth() + 1) + "." + oDate.getFullYear();
		},

		firstLetter: function (str) {
			if (str !== undefined) return str.substr(0, 1);
		},
		setupInactive: function () {
			window.addEventListener("mousemove", this.resetTimer(), false);
			window.addEventListener("mousedown", this.resetTimer(), false);
			window.addEventListener("keypress", this.resetTimer(), false);
			window.addEventListener("DOMMouseScroll", this.resetTimer(), false);
			window.addEventListener("mousewheel", this.resetTimer(), false);
			window.addEventListener("touchmove", this.resetTimer(), false);
			window.addEventListener("MSPointerMove", this.resetTimer(), false);

			this.startTimer();
		},
		startTimer: function () {
			var that = this;
			this.timeoutID = window.setTimeout(function () {
				MessageBox.show("Session ist abgelaufen. Bitte melden Sie sich erneut an", {
					icon: MessageBox.Icon.ERROR,
					title: "Session abgelaufen.",
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						that.oRouter.navTo("RouteLoginView");
					}
				});
			}, 600000); //Session Timeout after 10min if user is inactive
		},
		resetTimer: function () {
			window.clearTimeout(this.timeoutID);
			this.goActive();
		},
		goActive: function () {
			this.startTimer();
		},
		checkAuth: function () {
			var that = this;
			if (this.oSession.getData().authed === "") {
				MessageBox.show("Session ungültig. Bitte melden Sie sich erneut an.", {
					icon: MessageBox.Icon.ERROR,
					title: "Session ungültig.",
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						that.oRouter.navTo("RouteLoginView");
					}

				});
				return false;

			} else {
				return true;
			}
		}

	});
});