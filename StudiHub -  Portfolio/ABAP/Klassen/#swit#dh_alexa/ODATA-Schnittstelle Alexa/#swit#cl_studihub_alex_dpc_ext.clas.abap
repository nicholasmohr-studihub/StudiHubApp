class /SWIT/CL_STUDIHUB_ALEX_DPC_EXT definition
  public
  inheriting from /SWIT/CL_STUDIHUB_ALEX_DPC
  create public .

public section.
protected section.

  methods EVENTSET_GET_ENTITYSET
    redefinition .
  methods POSTSET_GET_ENTITYSET
    redefinition .
private section.
ENDCLASS.



CLASS /SWIT/CL_STUDIHUB_ALEX_DPC_EXT IMPLEMENTATION.


  METHOD eventset_get_entityset.
    DATA: lt_filters        TYPE /iwbep/t_mgw_select_option,
          ls_filter         TYPE /iwbep/s_mgw_select_option,
          ls_so             TYPE /iwbep/s_cod_select_option,
          ls_consumerestset TYPE /swit/cl_studihub_alex_mpc=>ts_event.

    DATA: lv_restsrvurl  TYPE string,                     "Var for Http REST Service Url
          lv_http_client TYPE REF TO if_http_client,      "Var for Rest Http Client
          lv_request     TYPE string,
          lv_response    TYPE string.


    lv_response = /swit/cl_dh_alexa=>get_all_offers( ).
*     lv_response = /swit/cl_dh_alexa=>get_all_events( ).
    lt_filters = io_tech_request_context->get_filter( )->get_filter_select_options( ).

    ls_consumerestset-response = lv_response.

    APPEND ls_consumerestset TO et_entityset.

** Initiating filter to Read input from EnitySet of ODataService
*    lt_filters = io_tech_request_context->get_filter( )->get_filter_select_options( ).
*
** Extract input from Property 'REQUEST' of EntitySet 'CONSUMERESTSet'
*    CLEAR ls_filter.
*    READ TABLE lt_filters WITH TABLE KEY property = 'REQUEST' INTO ls_filter.
*    IF sy-subrc EQ 0.
*      READ TABLE ls_filter-select_options INTO ls_so INDEX 1.
*      IF sy-subrc EQ 0.
*        lv_request = ls_so-low.
*      ENDIF.
*    ENDIF.
*
** REST Service URL
*    lv_restsrvurl = 'http://sapnxswt/sap/opu/odata/swit/studihub_alexa_srv'.
*
**Steps to Call REST Service ===================================
**STEP-1 : CREATE HTTP CLIENT
*    CALL METHOD cl_http_client=>create_by_url
*      EXPORTING
*        url                = lv_restsrvurl
*      IMPORTING
*        client             = lv_http_client
*      EXCEPTIONS
*        argument_not_found = 1
*        plugin_not_active  = 2
*        internal_error     = 3
*        OTHERS             = 4.
*
**STEP-2 :  AUTHENTICATE HTTP CLIENT
*    CALL METHOD lv_http_client->authenticate
*      EXPORTING
*        username = 'nexus'
*        password = 'YetAnotherEra'.
*
**STEP-3 : Set headers for REST Service Request Call
*    CALL METHOD lv_http_client->request->set_header_field
*      EXPORTING
*        name  = '~request_method'
*        value = 'POST'.
*
*    CALL METHOD lv_http_client->request->set_header_field
*      EXPORTING
*        name  = 'Content-Type'
*        value = 'application/json; charset=utf-8'.
*
*    CALL METHOD lv_http_client->request->set_header_field
*      EXPORTING
*        name  = 'Accept'
*        value = 'application/json, text/html'.
*
** STEP-3.1 : Attach Request Message
*    CALL METHOD lv_http_client->request->set_cdata
*      EXPORTING
*        data   = lv_request
*        offset = 0.
*
**STEP-4 :  SEND HTTP REQUEST
*    CALL METHOD lv_http_client->send
*      EXCEPTIONS
*        http_communication_failure = 1
*        http_invalid_state         = 2.
*
**STEP-5 :  GET HTTP RESPONSE
*    CALL METHOD lv_http_client->receive
*      EXCEPTIONS
*        http_communication_failure = 1
*        http_invalid_state         = 2
*        http_processing_failed     = 3.
*
**STEP-6 :  Extract Rest-Service-Response
*    CLEAR lv_response.
*    lv_response = lv_http_client->response->get_cdata( ).
*
**STEP-7 : Appending Rest-Service-Response to EntitySet of ODataService
*    CLEAR ls_consumerestset.
*    ls_consumerestset-request  = lv_request.  "Append Sent Request
*    ls_consumerestset-response = lv_response. "Append Receievd Response
*
*    APPEND ls_consumerestset TO et_entityset.
*    CLEAR ls_consumerestset.

  ENDMETHOD.


  METHOD postset_get_entityset.
    DATA: lt_filters        TYPE /iwbep/t_mgw_select_option,
          ls_filter         TYPE /iwbep/s_mgw_select_option,
          ls_so             TYPE /iwbep/s_cod_select_option,
          ls_consumerestset TYPE /swit/cl_studihub_alex_mpc=>ts_post.

    DATA: lv_request  TYPE string,
          lv_response TYPE string.

    "Get Filter Table
    lt_filters = io_tech_request_context->get_filter( )->get_filter_select_options( ).

    "Extract input from Property 'Request'
    READ TABLE  lt_filters WITH TABLE KEY property = 'REQUEST' INTO ls_filter.
    IF sy-subrc EQ 0.
      READ TABLE ls_filter-select_options INTO ls_so INDEX 1.
      IF sy-subrc EQ 0.
        lv_request = ls_so-low.
      ENDIF.
    ENDIF.

    "Get response String according to Intent
    CASE lv_request.
      WHEN 'readEvents'.
        lv_response = /swit/cl_dh_alexa=>get_all_events( ).
      WHEN 'readOffers'.
        lv_response = /swit/cl_dh_alexa=>get_all_offers( ).
      WHEN 'readAccom'.
        lv_response = /swit/cl_dh_alexa=>get_all_accommodations( ).
      WHEN 'readJobs'.
        lv_response = /swit/cl_dh_alexa=>get_all_jobs( ).
      WHEN 'readCareers'.
        lv_response = /swit/cl_dh_alexa=>get_all_careers( ).

    ENDCASE.

    "fill structure
    ls_consumerestset-request = lv_request.
    ls_consumerestset-response = lv_response.

    "fill et_entityset
    APPEND ls_consumerestset TO et_entityset.
  ENDMETHOD.
ENDCLASS.
