class /SWIT/CL_STUDI_HUB_DPC_EXT definition
  public
  inheriting from /SWIT/CL_STUDI_HUB_DPC
  create public .

public section.

  methods /IWBEP/IF_MGW_APPL_SRV_RUNTIME~GET_STREAM
    redefinition .
protected section.

  methods ACCOMSET_CREATE_ENTITY
    redefinition .
  methods ACCOMSET_DELETE_ENTITY
    redefinition .
  methods ACCOMSET_GET_ENTITY
    redefinition .
  methods ACCOMSET_GET_ENTITYSET
    redefinition .
  methods ACCOMSET_UPDATE_ENTITY
    redefinition .
  methods AUTHSET_CREATE_ENTITY
    redefinition .
  methods AUTHSET_DELETE_ENTITY
    redefinition .
  methods AUTHSET_GET_ENTITY
    redefinition .
  methods CAREERSET_CREATE_ENTITY
    redefinition .
  methods CAREERSET_DELETE_ENTITY
    redefinition .
  methods CAREERSET_GET_ENTITY
    redefinition .
  methods CAREERSET_GET_ENTITYSET
    redefinition .
  methods CAREERSET_UPDATE_ENTITY
    redefinition .
  methods COMMENTSET_CREATE_ENTITY
    redefinition .
  methods COMMENTSET_GET_ENTITYSET
    redefinition .
  methods EVENTSET_CREATE_ENTITY
    redefinition .
  methods EVENTSET_DELETE_ENTITY
    redefinition .
  methods EVENTSET_GET_ENTITY
    redefinition .
  methods EVENTSET_GET_ENTITYSET
    redefinition .
  methods EVENTSET_UPDATE_ENTITY
    redefinition .
  methods ICONSET_GET_ENTITYSET
    redefinition .
  methods JOBSET_CREATE_ENTITY
    redefinition .
  methods JOBSET_DELETE_ENTITY
    redefinition .
  methods JOBSET_GET_ENTITY
    redefinition .
  methods JOBSET_GET_ENTITYSET
    redefinition .
  methods JOBSET_UPDATE_ENTITY
    redefinition .
  methods OFFERSET_CREATE_ENTITY
    redefinition .
  methods OFFERSET_DELETE_ENTITY
    redefinition .
  methods OFFERSET_GET_ENTITY
    redefinition .
  methods OFFERSET_GET_ENTITYSET
    redefinition .
  methods OFFERSET_UPDATE_ENTITY
    redefinition .
  methods USERSET_CREATE_ENTITY
    redefinition .
  methods USERSET_DELETE_ENTITY
    redefinition .
  methods USERSET_GET_ENTITY
    redefinition .
  methods USERSET_GET_ENTITYSET
    redefinition .
  methods USERSET_UPDATE_ENTITY
    redefinition .
  methods AUTHSET_UPDATE_ENTITY
    redefinition .
private section.
ENDCLASS.



CLASS /SWIT/CL_STUDI_HUB_DPC_EXT IMPLEMENTATION.


  METHOD /iwbep/if_mgw_appl_srv_runtime~get_stream.
    DATA lv_postid TYPE num08.
    DATA ls_stream TYPE ty_s_media_resource.
    DATA ls_header  TYPE ihttpnvp.

    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_keys>).
      IF <ls_keys>-name EQ 'Postid'.
        lv_postid = <ls_keys>-value.
      ENDIF.
    ENDLOOP.

    ls_stream-mime_type = 'application/pdf'.
    ls_stream-value     = /swit/cl_dh_pdf=>display( iv_postid = lv_postid ).

    ls_header-name = 'content-disposition'.
    ls_header-value = 'filename="DATEI.pdf"'.

    /iwbep/if_mgw_conv_srv_runtime~set_header( ls_header ).

    copy_data_to_ref( EXPORTING is_data = ls_stream
                      CHANGING  cr_data = er_stream ).

  ENDMETHOD.


  METHOD accomset_create_entity.

    DATA ls_accom LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_accom
    ).

    /swit/cl_dh_accom=>new( )->create(
      EXPORTING
        is_data = ls_accom                " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                 " Posttype Data after Create
    ).


  ENDMETHOD.


  METHOD accomset_delete_entity.

    DATA lv_postid TYPE num08.
    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_accom=>new( )->delete( lv_postid ).

  ENDMETHOD.


  METHOD accomset_get_entity.

    DATA lv_postid TYPE num08.
    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_accom=>new( )->get_by_id(
      EXPORTING
        iv_postid = lv_postid                 " Postid of target
      IMPORTING
        es_data   = er_entity                 " requested Data of post
    ).

  ENDMETHOD.


  METHOD accomset_get_entityset.

    /swit/cl_dh_accom=>new( )->get_all(
      EXPORTING
        it_filter = it_filter_select_options
      IMPORTING
        et_data = et_entityset
    ).

  ENDMETHOD.


  METHOD accomset_update_entity.

    DATA ls_accom LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_accom
    ).

    /swit/cl_dh_accom=>new( )->update(
      EXPORTING
        is_data = ls_accom                 " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                " Posttype Data after Update
    ).

  ENDMETHOD.


  METHOD authset_create_entity.
    DATA: ls_data LIKE er_entity,
          ls_auth TYPE /swit/dh_pw,
          lv_userid TYPE NUM08.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_data
    ).
*    CATCH /iwbep/cx_mgw_tech_exception.
    lv_userid = ls_data-userid.
    if ls_data is not INITIAL.
     /SWIT/CL_DH_AUTH=>save_user(
        EXPORTING
          iv_password  = ls_data-password                 " String
          iv_userid    = lv_userid                 " Numerisches Feld Länge 8
        IMPORTING
          es_user_info = ls_auth                 " Datenbank für Nutzerpasswörter
      ).


      endif.

      MOVE-CORRESPONDING ls_auth TO er_entity.
  ENDMETHOD.


  method AUTHSET_DELETE_ENTITY.
  LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      CASE <ls_key>-name.
        WHEN 'Userid'.
          DATA(lv_userid) = <ls_key>-value.
      ENDCASE.
    ENDLOOP.
    IF lv_userid IS NOT INITIAL.
      /swit/cl_dh_auth=>delete_user( iv_userid = lv_userid ).
    ENDIF.
  endmethod.


  METHOD authset_get_entity.
    DATA ls_entity like er_entity.

    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      CASE <ls_key>-name.
        WHEN 'email'.
          DATA(lv_email) = <ls_key>-value.
        WHEN 'password'.
          DATA(lv_pw) = <ls_key>-value.
      ENDCASE.
      ENDLOOP.

      IF lv_email IS NOT INITIAL AND lv_pw IS NOT INITIAL.
         /SWIT/CL_DH_AUTH=>auth_user(
           EXPORTING
             iv_email  = lv_email
             iv_pw     = lv_pw
           IMPORTING
             ev_authed = DATA(lv_authed)               " boolsche Variable (X=true, -=false, space=unknown)
             ev_userid = DATA(lv_userid)
             ev_usertyp = DATA(lv_usertype)
         ).
      ENDIF.

      er_entity-email = lv_email.
      er_entity-password = 'XXXXXXX'.
      er_entity-authorized = lv_authed.
      er_entity-userid = lv_userid.
      er_entity-usertype = lv_usertype.

  ENDMETHOD.


  method AUTHSET_UPDATE_ENTITY.
      DATA: ls_pw LIKE er_entity.
      DATA: lv_userid TYPE Num8.

        io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_pw
    ).
    lv_userid = ls_pw-userid.

    /swit/cl_dh_auth=>update_password(
      EXPORTING
        iv_userid       = lv_userid                " 8-stelliger numerischer Wert
        iv_password_new = ls_pw-password
*      IMPORTING
*        ev_changed      =  DATA(lv_success)                " boolsche Variable (X=true, -=false, space=unknown)
    ).

  endmethod.


  METHOD careerset_create_entity.

    DATA ls_career LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_career
    ).

    /swit/cl_dh_career=>new( )->create(
      EXPORTING
        is_data = ls_career                " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                 " Posttype Data after Create
    ).

  ENDMETHOD.


  method CAREERSET_DELETE_ENTITY.

    DATA lv_postid TYPE num08.
    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_career=>new( )->delete( lv_postid ).


  endmethod.


  METHOD careerset_get_entity.

    DATA lv_postid TYPE num08.
    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_career=>new( )->get_by_id(
      EXPORTING
        iv_postid = lv_postid                 " Postid of target
      IMPORTING
        es_data   = er_entity                 " requested Data of post
    ).


  ENDMETHOD.


  METHOD careerset_get_entityset.

    /swit/cl_dh_career=>new( )->get_all(
      EXPORTING
        it_filter = it_filter_select_options
      IMPORTING
        et_data = et_entityset
    ).

  ENDMETHOD.


  METHOD careerset_update_entity.

    DATA ls_career LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_career
    ).

    /swit/cl_dh_career=>new( )->update(
      EXPORTING
        is_data = ls_career                 " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                " Posttype Data after Update
    ).


  ENDMETHOD.


  METHOD commentset_create_entity.
    DATA ls_comment LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_comment
    ).

    er_entity = /swit/cl_dh_comment=>post_comment( is_comment = ls_comment ).

  ENDMETHOD.


  METHOD commentset_get_entityset.

    et_entityset = /swit/cl_dh_comment=>get_comments( it_filter = it_filter_select_options ).

  ENDMETHOD.


  METHOD eventset_create_entity.
    DATA ls_event LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_event
    ).

    /swit/cl_dh_event=>new( )->create(
      EXPORTING
        is_data = ls_event                 " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                 " Posttype Data after Create
    ).




  ENDMETHOD.


  METHOD eventset_delete_entity.

    DATA lv_postid TYPE num08.

    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_event=>new( )->delete( lv_postid ).

  ENDMETHOD.


  METHOD eventset_get_entity.

    DATA lv_postid TYPE num08.
    DATA test like er_entity.

    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_event=>new( )->get_by_id(
      EXPORTING
        iv_postid = lv_postid                 " Postid of target
      IMPORTING
        es_data   = er_entity                " requested Data of post
    ).

  ENDMETHOD.


  METHOD eventset_get_entityset.

    /swit/cl_dh_event=>new( )->get_all(
      EXPORTING
        it_filter = it_filter_select_options
      IMPORTING
        et_data = et_entityset
    ).

  ENDMETHOD.


  METHOD eventset_update_entity.

    DATA ls_event LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_event
    ).

    /swit/cl_dh_event=>new( )->update(
      EXPORTING
        is_data = ls_event                 " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                " Posttype Data after Update
    ).

  ENDMETHOD.


  method ICONSET_GET_ENTITYSET.

    Select * From /swit/dh_icon INTO CORRESPONDING FIELDS OF TABLE et_entityset.

  endmethod.


  method JOBSET_CREATE_ENTITY.

   DATA ls_job LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_job
    ).

    /swit/cl_dh_job=>new( )->create(
      EXPORTING
        is_data = ls_job                 " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                 " Posttype Data after Create
    ).

  endmethod.


  method JOBSET_DELETE_ENTITY.


    DATA lv_postid TYPE num08.
    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_job=>new( )->delete( lv_postid ).

  endmethod.


  METHOD jobset_get_entity.

    DATA lv_postid TYPE num08.

    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_job=>new( )->get_by_id(
      EXPORTING
        iv_postid = lv_postid                 " Postid of target
      IMPORTING
        es_data   = er_entity                " requested Data of post
    ).

  ENDMETHOD.


  METHOD jobset_get_entityset.

    /swit/cl_dh_job=>new( )->get_all(
      EXPORTING
        it_filter = it_filter_select_options
      IMPORTING
        et_data = et_entityset
    ).

  ENDMETHOD.


  METHOD jobset_update_entity.

    DATA ls_job LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_job
    ).

    /swit/cl_dh_job=>new( )->update(
      EXPORTING
        is_data = ls_job                " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                " Posttype Data after Update
    ).

  ENDMETHOD.


  METHOD offerset_create_entity.

    DATA ls_offer LIKE er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_offer
    ).

    /swit/cl_dh_offer=>new( )->create(
      EXPORTING
        is_data = ls_offer                 " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                 " Posttype Data after Create
    ).

  ENDMETHOD.


  METHOD offerset_delete_entity.

    DATA lv_postid TYPE num08.
    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_offer=>new( )->delete( lv_postid ).

  ENDMETHOD.


  METHOD offerset_get_entity.

    DATA lv_postid TYPE num08.
    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Postid'.
        lv_postid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    /swit/cl_dh_offer=>new( )->get_by_id(
      EXPORTING
        iv_postid = lv_postid                 " Postid of target
      IMPORTING
        es_data   = er_entity                 " requested Data of post
    ).

  ENDMETHOD.


  METHOD offerset_get_entityset.

    /swit/cl_dh_offer=>new( )->get_all(
      EXPORTING
        it_filter = it_filter_select_options
      IMPORTING
        et_data = et_entityset
    ).


  ENDMETHOD.


  METHOD offerset_update_entity.
    DATA ls_offer LIKE er_entity.

    io_data_provider->read_entry_data(
        IMPORTING
          es_data = ls_offer
      ).

    /swit/cl_dh_offer=>new( )->update(
      EXPORTING
        is_data = ls_offer                 " Incoming Posttype Data
      IMPORTING
        es_data = er_entity                 " Posttype Data after Update
    ).
  ENDMETHOD.


  method USERSET_CREATE_ENTITY.
    DATA: ls_data like er_entity.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_data
    ).
    "CATCH /iwbep/cx_mgw_tech_exception.

    IF ls_data IS NOT INITIAL.
    er_entity = /swit/cl_dh_users=>create_user( is_user = ls_data ).
    ENDIF.

  endmethod.


  METHOD userset_delete_entity.

    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      CASE <ls_key>-name.
        WHEN 'Userid'.
          DATA(lv_userid) = <ls_key>-value.
      ENDCASE.
    ENDLOOP.
    IF lv_userid IS NOT INITIAL.
      /swit/cl_dh_users=>delete_user( iv_userid = lv_userid ).
    ENDIF.
  ENDMETHOD.


  METHOD userset_get_entity.
    DATA lv_userid TYPE num08.

    LOOP AT it_key_tab ASSIGNING FIELD-SYMBOL(<ls_key>).
      IF <ls_key>-name EQ 'Userid'.
        lv_userid = <ls_key>-value.
      ENDIF.
    ENDLOOP.

    er_entity = /swit/cl_dh_users=>get_user_by_userid( lv_userid ).

  ENDMETHOD.


  METHOD userset_get_entityset.

    et_entityset = /swit/cl_dh_users=>get_all( ).

  ENDMETHOD.


  METHOD userset_update_entity.
    DATA ls_user TYPE /swit/dh_user.

    io_data_provider->read_entry_data(
      IMPORTING
        es_data = ls_user
    ).

    er_entity = /swit/cl_dh_users=>update_user( is_user =  ls_user ).

  ENDMETHOD.
ENDCLASS.
