sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller"
], function (Base) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Profile.DetailProfile", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.MyProfile
		 */
		extendInit: function () {
			this.oRouter.getRoute("RouteDetailProfile").attachPatternMatched(this._onObjectMatched, this);
		},
		pressNavBack: function () {
			if(this.oSession.getData().myUserId !== this.userId && this.oSession.getData().myUserType === "ADMN" ) {
				this.oRouter.navTo("RouteAdminPanel");
			} else {
				this.oRouter.navTo("RouteMasterView");
			}
		},
		_onObjectMatched: function (oEvent) {
			this.userId = oEvent.getParameter("arguments").userId;
			this.getView().bindElement("/UserSet('" + this.userId.substr(1) + "')");
		},
		
		onWeblinkPress: function (oEvent) {
			var sLink = oEvent.getSource().getTooltip();
			if (sLink.substr(4) !== "http") sLink = "https://" + sLink;
			window.open(sLink, '_blank');
		},
		
		onEditPress: function () {
			this.oRouter.navTo("RouteEditProfile", {
				userId: this.userId
			});
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Mosbach.StudiHub.view.MyProfile
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.MyProfile
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.MyProfile
		 */
		//	onExit: function() {
		//
		//	}

	});

});