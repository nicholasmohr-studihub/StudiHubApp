sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller"
], function (Base) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Admin.AdminPanel", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.AdminPanel
		 */
		extendInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("RouteAdminPanel").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function() {
				this.byId("userList").getBinding("items").refresh(true);
		},
	
		onUserPress: function (oEvent) {
			this.navToProfile(oEvent.getSource().getDescription());
		},
		
		onNewUserPress: function () {
			this.oRouter.navTo("RouteNewUser");
		},
		
		
		
		
		
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Mosbach.StudiHub.view.AdminPanel
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.AdminPanel
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.AdminPanel
		 */
		//	onExit: function() {
		//
		//	}

	});

});