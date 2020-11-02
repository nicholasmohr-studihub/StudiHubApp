class /SWIT/CL_DH_AUTH definition
  public
  final
  create public .

public section.

  class-methods SAVE_USER
    importing
      !IV_PASSWORD type STRING
      !IV_USERID type NUM08
    exporting
      !ES_USER_INFO type /SWIT/DH_PW .
  class-methods AUTH_USER
    importing
      !IV_EMAIL type STRING
      !IV_PW type STRING
    exporting
      !EV_AUTHED type BOOLEAN
      !EV_USERID type NUM8
      !EV_USERTYP type STRING .
  class-methods DELETE_USER
    importing
      !IV_USERID type STRING
    returning
      value(RV_DELETED) type BOOLEAN .
  class-methods UPDATE_PASSWORD
    importing
      !IV_USERID type NUM8
      !IV_PASSWORD_NEW type STRING
    exporting
      !EV_CHANGED type BOOLEAN .
protected section.
private section.

  class-methods ENCRYPT_STRING
    importing
      !IV_PASSWORD type STRING
    exporting
      !EV_HASH type XSTRING .
  class-methods DECRYPT_STRING
    importing
      !IV_PASSWORD type XSTRING
    exporting
      !EV_PASSWORD type STRING .
  class-methods SET_LAST_LOGIN
    importing
      !IV_USERID type NUM8 .
ENDCLASS.



CLASS /SWIT/CL_DH_AUTH IMPLEMENTATION.


  METHOD AUTH_USER.
    DATA: lt_user TYPE TABLE OF /swit/dh_user,
          lt_pw   TYPE TABLE OF /swit/dh_pw.

    IF iv_email IS NOT INITIAL AND iv_pw IS NOT INITIAL.
      DATA(lv_email) = iv_email.
      DATA(lv_pw) = iv_pw.

      SELECT pw~password, pw~userid, user~usertype FROM /swit/dh_pw as pw INNER JOIN /swit/dh_user as user on user~userid = pw~userid AND user~email = @iv_email INTO TABLE @DATA(lt_password).
      IF sy-subrc EQ 0.
        READ TABLE lt_password INTO DATA(ls_data) INDEX 1.
        DATA(lv_pw_encrypt) = ls_data-password.
        /SWIT/CL_DH_AUTH=>decrypt_string(
          EXPORTING
            iv_password = lv_pw_encrypt
          IMPORTING
            ev_password = DATA(lv_pw_clear)
        ).
        IF lv_pw_clear EQ iv_pw.
          ev_authed = 'X'.
          ev_userid = ls_data-userid.
          ev_usertyp = ls_data-usertype.
          /swit/cl_dh_auth=>set_last_login( iv_userid = ls_data-userid ).
        ELSE.
          ev_authed = ' '.
        ENDIF.
      ELSE.
        ev_authed = ' '.
      ENDIF.
    ENDIF.
  ENDMETHOD.


  method DECRYPT_STRING.

    Data lw_pw_clear TYPE String.

    CALL FUNCTION 'ECATT_CONV_XSTRING_TO_STRING'
      EXPORTING
        im_xstring        = iv_password
       IM_ENCODING       = 'UTF-8'
     IMPORTING
       EX_STRING         = lw_pw_clear
              .



        SPLIT lw_pw_clear AT '#' INTO lw_pw_clear DATA(lv_unnec).
        ev_password = lw_pw_clear.
  endmethod.


  METHOD delete_user.

    DELETE FROM /swit/dh_pw WHERE userid EQ iv_userid.
    IF sy-subrc EQ 0.
      COMMIT WORK.
      rv_deleted = 'X'.
    ELSE.
      ROLLBACK WORK.
      rv_deleted = ''.
    ENDIF.

  ENDMETHOD.


  method ENCRYPT_STRING.


  DATA(lo_r) = cl_abap_random_int=>create(
              seed = CONV i( sy-uzeit )
              min  = -2147483648
              max  = 2147483647
            )
*            CATCH cx_abap_random. " Exception for CL_ABAP_RANDOM*
    .

  CALL METHOD cl_abap_message_digest=>string_to_xstring
    EXPORTING
      if_input  = iv_password && '#' && CONV string( lo_r->get_next( ) )               " Eingabewert
    RECEIVING
      er_output =  ev_hash                " Ausgabewert
    .
*  CATCH cx_abap_message_digest. " Ausnahmeklasse für Message Digest

  endmethod.


  METHOD SAVE_USER.
    DATA: ls_user_info TYPE /swit/dh_pw.


    CALL METHOD /SWIT/CL_DH_AUTH=>encrypt_string
      EXPORTING
        iv_password = iv_password            " String to hash
      IMPORTING
        ev_hash     = DATA(lv_hashed).                 " Hashed String
    IF sy-subrc EQ 0.
      ls_user_info-password = lv_hashed.
      ls_user_info-userid = iv_userid.
      INSERT INTO /swit/dh_pw VALUES ls_user_info.
      IF sy-subrc EQ 0.
        COMMIT WORK.
      ELSE.
        ROLLBACK WORK.
      ENDIF.
    ENDIF.

   es_user_info = ls_user_info.


  ENDMETHOD.


  method SET_LAST_LOGIN.

    UPDATE /swit/dh_user SET lastlogin = sy-datum WHERE userid = iv_userid.

  endmethod.


  METHOD UPDATE_PASSWORD.

    IF iv_userid IS NOT INITIAL.
      /swit/cl_dh_auth=>encrypt_string(
        EXPORTING
          iv_password = iv_password_new                 " String to hash
        IMPORTING
          ev_hash     = DATA(lv_pw)                 " Hashed String
      ).
      IF sy-subrc EQ 0.
        UPDATE /swit/dh_pw SET password = lv_pw  WHERE userid EQ iv_userid.
        IF sy-subrc EQ 0.
          COMMIT WORK.
          ev_changed = 'X'.
        ELSE.
          ROLLBACK WORK.
        ENDIF.
      ENDIF.
    ELSE.
      ev_changed = ''.
    ENDIF.

  ENDMETHOD.
ENDCLASS.
