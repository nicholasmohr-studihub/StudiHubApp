class /SWIT/CL_DH_COMMENT definition
  public
  create public .

public section.

  class-methods POST_COMMENT
    importing
      !IS_COMMENT type /SWIT/DH_TS_COMMENT
    returning
      value(RS_COMMENT) type /SWIT/DH_TS_COMMENT .
  class-methods GET_COMMENTS
    importing
      !IT_FILTER type /IWBEP/T_MGW_SELECT_OPTION
    returning
      value(RT_COMMENTS) type /SWIT/DH_TT_COMMENT .
protected section.
private section.
ENDCLASS.



CLASS /SWIT/CL_DH_COMMENT IMPLEMENTATION.


  METHOD get_comments.
    DATA lv_postid TYPE num08.

    LOOP AT it_filter ASSIGNING FIELD-SYMBOL(<ls_filter>).
      IF <ls_filter>-property EQ 'Postid'.
        LOOP AT <ls_filter>-select_options ASSIGNING FIELD-SYMBOL(<ls_f_so>).
          lv_postid = <ls_f_so>-low.
          EXIT.
        ENDLOOP.
      ENDIF.
    ENDLOOP.

    IF lv_postid IS NOT INITIAL.
      SELECT * FROM /swit/dh_comment WHERE postid EQ @lv_postid ORDER BY createddate,createdtime INTO CORRESPONDING FIELDS OF TABLE @rt_comments .


      LOOP AT rt_comments ASSIGNING FIELD-SYMBOL(<rs_comment>).
        <rs_comment>-uname    = /swit/cl_dh_users=>get_uname( <rs_comment>-userid ).
        <rs_comment>-usertype = /swit/cl_dh_users=>get_usertype( <rs_comment>-userid ).
      ENDLOOP.

    ENDIF.

  ENDMETHOD.


  METHOD post_comment.

    DATA ls_comment TYPE /swit/dh_comment.

    MOVE-CORRESPONDING is_comment TO ls_comment.

    ls_comment-createddate = sy-datum.
    ls_comment-createdtime = sy-uzeit.

    INSERT INTO /swit/dh_comment VALUES ls_comment.

  ENDMETHOD.
ENDCLASS.
