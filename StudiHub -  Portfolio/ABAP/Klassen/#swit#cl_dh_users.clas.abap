class /SWIT/CL_DH_USERS definition
  public
  final
  create public .

public section.

  class-methods CREATE_USER
    importing
      !IS_USER type /SWIT/DH_USER
    returning
      value(RS_USER) type /SWIT/DH_USER .
  class-methods GET_USER_BY_USERID
    importing
      !IV_USERID type NUM08
    returning
      value(RS_USER) type /SWIT/DH_USER .
  class-methods GET_ALL
    returning
      value(RT_USER) type /SWIT/DH_TT_USERS .
  class-methods UPDATE_USER
    importing
      !IS_USER type /SWIT/DH_USER
    returning
      value(RS_USER) type /SWIT/DH_USER .
  class-methods GET_NEXT_USERID
    returning
      value(RV_USERID) type NUM08 .
  class-methods GET_UNAME
    importing
      !IV_USERID type NUM08
    returning
      value(RV_UNAME) type CHAR50 .
  class-methods GET_USERTYPE
    importing
      !IV_USERID type NUM08
    returning
      value(RV_USERTYPE) type CHAR4 .
  class-methods GET_USERID_BY_FILTER
    importing
      !IT_FILTER type /IWBEP/T_MGW_SELECT_OPTION
    returning
      value(RV_USERID) type NUM08 .
  class-methods DELETE_USER
    importing
      !IV_USERID type STRING
    returning
      value(EV_DELETED) type BOOLEAN .
  class-methods GET_CMPN_USERIDS
    returning
      value(RT_FILTER) type /IWBEP/T_COD_SELECT_OPTIONS .
protected section.
private section.
ENDCLASS.



CLASS /SWIT/CL_DH_USERS IMPLEMENTATION.


  METHOD create_user.
    DATA ls_user TYPE /swit/dh_user.
    DATA ls_pw   TYPE /swit/dh_pw.
    DATA lv_expires TYPE P1001-BEGDA.

    ls_user        = is_user.
    ls_user-userid = get_next_userid( ).
    ls_user-lastlogin = sy-datum.

    CALL FUNCTION 'RHPP_HALFVALUE_WORKFLOW_DATE'
      EXPORTING
        date            = sy-datum
        days            = 0
        months          = 0
*       SIGNUM          = '+'
        years           = 3
     IMPORTING
       CALC_DATE       = lv_expires
              .
    ls_user-expires = lv_expires.

    "ls_pw-userid    = ls_user-userid.
    "   ls_pw-password  = generate_init_password( ).


    INSERT INTO /swit/dh_user VALUES ls_user.

    IF sy-subrc EQ 0.
      COMMIT WORK.
    ELSE.
      ROLLBACK WORK.
    ENDIF.


*    IF sy-subrc EQ 0.
*
*      INSERT INTO /swit/dh_pw VALUES ls_pw.
*
*      IF sy-subrc EQ 0.
*        COMMIT WORK.
*      ELSE.
*        ROLLBACK WORK.
*      ENDIF.
*    ELSE.
*      ROLLBACK WORK.
*    ENDIF.

    rs_user = ls_user.

  ENDMETHOD.


  METHOD delete_user.

    DELETE FROM /swit/dh_user WHERE userid EQ iv_userid.
    IF sy-subrc EQ 0.
      COMMIT WORK.
      ev_deleted = 'X'.
    ELSE.
      ROLLBACK WORK.
      ev_deleted = ''.
    ENDIF.

  ENDMETHOD.


  METHOD get_all.

    SELECT * FROM /swit/dh_user INTO TABLE @rt_user.

  ENDMETHOD.


  METHOD GET_CMPN_USERIDS.

    DATA ls_filter LIKE LINE OF rt_filter.

    ls_filter-option = 'EQ'.
    ls_filter-sign   = 'I'.

    SELECT userid FROM /swit/dh_user INTO ls_filter-low  WHERE usertype EQ 'CMPN'.
      APPEND ls_filter TO rt_filter.
    ENDSELECT.


  ENDMETHOD.


  method GET_NEXT_USERID.

     CALL FUNCTION 'NUMBER_GET_NEXT'
      EXPORTING
        nr_range_nr = '01'
        object      = '/SWIT/UHUB'
        quantity    = '1'
      IMPORTING
        number      = rv_userid.

  endmethod.


  method GET_UNAME.

     SELECT SINGLE ( firstname && ' ' && lastname && ' ' &&  company ) FROM /swit/dh_user INTO @rv_uname WHERE userid EQ @iv_userid.

  endmethod.


  method GET_USERID_BY_FILTER.

    LOOP AT it_filter ASSIGNING FIELD-SYMBOL(<ls_filter>).
      IF <ls_filter>-property EQ 'Userid'.
         READ TABLE <ls_filter>-select_options INDEX 1 ASSIGNING FIELD-SYMBOL(<ls_fso>).
         rv_userid = <ls_fso>-low.
      ENDIF.
    ENDLOOP.

  endmethod.


  METHOD get_usertype.

    SELECT SINGLE usertype FROM /swit/dh_user WHERE userid EQ @iv_userid INTO @rv_usertype.

  ENDMETHOD.


  METHOD get_user_by_userid.

    SELECT SINGLE * FROM /swit/dh_user WHERE userid EQ @iv_userid INTO @rs_user.

  ENDMETHOD.


  METHOD update_user.
    DATA ls_user LIKE is_user.

    SELECT SINGLE * FROM /swit/dh_user INTO ls_user WHERE userid EQ is_user-userid.

    ls_user-beschreibung = is_user-beschreibung.
    ls_user-city         = is_user-city.
    ls_user-company      = is_user-company.
    ls_user-email        = is_user-email.
    ls_user-expires      = is_user-expires.
    ls_user-firstname    = is_user-firstname.
    ls_user-gender       = is_user-gender.
    ls_user-lastname     = is_user-lastname.
    ls_user-logo         = is_user-logo.
    ls_user-postcode     = is_user-postcode.
    ls_user-street       = is_user-street.
    ls_user-usertype     = is_user-usertype.
    ls_user-website      = is_user-website.

    UPDATE /swit/dh_user FROM ls_user.

    rs_user = ls_user.

  ENDMETHOD.
ENDCLASS.
