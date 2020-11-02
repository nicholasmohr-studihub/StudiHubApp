sap.ui.define([
	"Mosbach/StudiHub/controller/base.controller",
	"Mosbach/StudiHub/assets/js/maps/MapsClass",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (Base, Maps, JSONModel, Device) {
	"use strict";

	return Base.extend("Mosbach.StudiHub.controller.Offer.DetailOffer", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Mosbach.StudiHub.view.OfferDetail
		 */
		extendInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("RouteDetailOffer").attachPatternMatched(this._onObjectMatched, this);
			this.oMaps = new Maps(this.getView().byId(this.getVisibleMapId()));
			this.setDeviceModel();
		},
		_onObjectMatched: function (oEvent) {
			var that = this;
			this.postId = oEvent.getParameter("arguments").ID;
			var sSet = "/OfferSet('" + this.postId.substr(1) + "')";
			var sLocation;

			this.oModel.read(sSet, {
				success: function (oData) {
					that.byId("userProfileButton").bindElement("/UserSet('" + oData.Userid + "')");
					sLocation = oData.Postcode + ", " + oData.City + ", " + oData.Street;
					that.oMaps.setLocation(oData.Postcode + ", " + oData.City + ", " + oData.Street);
					that.byId("userProfileButton").bindElement("/UserSet('" + oData.Userid + "')");
				}
			});

			this.loadComments();
			this.getView().bindElement(sSet);

		},
		getVisibleMapId: function () {
			if (sap.ui.Device.system.desktop === true) {
				return "vbi";
			} else {
				return "vbiMobile";
			}
		},
		setDeviceModel: function () {
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oDeviceModel, "device");
		},
		loadComments: function () {
			var oTemplate = new sap.m.FeedListItem({
				sender: "{Uname}",
				icon: "",
				senderPress: "onSenderPress",
				iconPress: "onIconPress",
				iconDensityAware: false,
				info: "",
				timestamp: "{Createddate}, {Createdtime}",
				text: "{Text}",
				convertLinksToAnchorTags: "All"
			});
			this.byId("commentList").bindAggregation("items", {
				path: '/CommentSet',
				template: oTemplate,
				filters: [new sap.ui.model.Filter("Postid", sap.ui.model.FilterOperator.EQ, this.postId.substr(1))]
			});
		},

		onEditOfferPress: function () {
			this.oRouter.navTo("RouteEditOffer", {
				ID: this.postId
			});
		},

		onProfilePress: function (oEvent) {
			var oBinding = oEvent.getSource().getBindingContext().getObject();

			if (oBinding.Usertype !== 'STDT') {
				this.navToProfile(oBinding.Usertype.substr(0, 1) + oBinding.Userid);
			}

		},

		onWeblinkPress: function (oEvent) {
			var sLink = oEvent.getSource().getTooltip();
			if (sLink.substr(4) !== "http") sLink = "https://" + sLink;
			window.open(sLink, '_blank');
		},
		onComment: function (oEvent) {
			var oComment = {
				Postid: this.postId.substr(1),
				Userid: this.oSession.getData().myUserId,
				Createddate: "",
				Createdtime: "",
				Text: oEvent.getSource().getValue(),
				Uname: "",
				Usertype: ""
			};

			this.oModel.create("/CommentSet", oComment, {
				success: function (oData, oResponse) {

				},
				error: function (oResponse) {

				}
			});

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Mosbach.StudiHub.view.OfferDetail
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Mosbach.StudiHub.view.OfferDetail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Mosbach.StudiHub.view.OfferDetail
		 */
		//	onExit: function() {
		//
		//	}

	});

});