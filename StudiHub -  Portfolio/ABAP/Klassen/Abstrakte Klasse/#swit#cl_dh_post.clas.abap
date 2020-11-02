class /SWIT/CL_DH_POST definition
  public
  abstract
  create public .

public section.

  interfaces /SWIT/IF_DH_POSTTYPE .

  aliases CREATE
    for /SWIT/IF_DH_POSTTYPE~CREATE .
  aliases DELETE
    for /SWIT/IF_DH_POSTTYPE~DELETE .
  aliases GET_ALL
    for /SWIT/IF_DH_POSTTYPE~GET_ALL .
  aliases GET_BY_ID
    for /SWIT/IF_DH_POSTTYPE~GET_BY_ID .
  aliases UPDATE
    for /SWIT/IF_DH_POSTTYPE~UPDATE .
protected section.

  aliases MV_DB
    for /SWIT/IF_DH_POSTTYPE~MV_DB .

  class-methods GET_NEXT_POSTID
    returning
      value(RV_POSTID) type NUM08 .
  methods GET_PDF_DATA
    importing
      !IS_DATA type DATA
    exporting
      !ES_DATA type DATA .
  methods IS_IN_DATA
    importing
      !IT_FILTER type /IWBEP/T_MGW_SELECT_OPTION
      !IS_DATA type DATA
    returning
      value(RV_IS_IN_DATA) type BOOL .
  methods FILTER
    importing
      !IT_FILTER type /IWBEP/T_MGW_SELECT_OPTION
    changing
      !CT_DATA type ANY TABLE .
  methods HAS_ACCESS
    importing
      !IV_ME type NUM08
      !IV_OTHER_USERID type NUM08
    returning
      value(RV_ACCESS) type BOOL .
private section.
ENDCLASS.



CLASS /SWIT/CL_DH_POST IMPLEMENTATION.


  METHOD /swit/if_dh_posttype~create.

    DATA ls_post_data TYPE REF TO data.
    DATA lo_struc TYPE REF TO cl_abap_structdescr.

    lo_struc ?= cl_abap_structdescr=>describe_by_name( me->mv_db ).

    CREATE DATA ls_post_data TYPE HANDLE lo_struc.
    ASSIGN ls_post_data->* TO FIELD-SYMBOL(<ls_post_data>).

    MOVE-CORRESPONDING is_data to <ls_post_data>.

    ASSIGN COMPONENT 'POSTID' OF STRUCTURE <ls_post_data> TO FIELD-SYMBOL(<postid>).
    ASSIGN COMPONENT 'PDFBINARY' OF STRUCTURE is_data TO FIELD-SYMBOL(<pdfbinary>).
    ASSIGN COMPONENT 'PDFSOURCE' OF STRUCTURE es_data TO FIELD-SYMBOL(<pdfsource>).

    <postid> = get_next_postid( ).

    INSERT INTO (me->mv_db) VALUES <ls_post_data>.

    IF sy-subrc EQ 0.

     <pdfsource> =  /swit/cl_dh_pdf=>save(
        EXPORTING
          iv_postid = <postid>
          iv_pdf    = <pdfbinary>
      ).

    ENDIF.

    MOVE-CORRESPONDING <ls_post_data> to es_data.

  ENDMETHOD.


  method /SWIT/IF_DH_POSTTYPE~DELETE.

    DELETE FROM (me->mv_db) WHERE postid eq iv_postid.

    /swit/cl_dh_pdf=>delete( iv_postid ).

  endmethod.


  METHOD /swit/if_dh_posttype~get_all.

    DATA lv_userid TYPE num08.

    lv_userid = /swit/cl_dh_users=>get_userid_by_filter( it_filter = it_filter ).

    SELECT * FROM (me->mv_db) INTO CORRESPONDING FIELDS OF TABLE @et_data
      WHERE ( endda  GE @sy-datum AND begda  LE @sy-datum )
         OR ( userid EQ @lv_userid ) ORDER BY endda DESCENDING.

    LOOP AT et_data ASSIGNING FIELD-SYMBOL(<ls_data>).

      ASSIGN COMPONENT 'POSTID' OF STRUCTURE  <ls_data> TO FIELD-SYMBOL(<postid>).
      ASSIGN COMPONENT 'UNAME' OF STRUCTURE  <ls_data> TO FIELD-SYMBOL(<uname>).
      ASSIGN COMPONENT 'USERID' OF STRUCTURE <ls_data> TO FIELD-SYMBOL(<userid>).
      ASSIGN COMPONENT 'PDFSOURCE' OF STRUCTURE <ls_data> TO FIELD-SYMBOL(<pdfsource>).


      IF <uname> IS ASSIGNED AND <userid> IS ASSIGNED.

        <uname>     = /swit/cl_dh_users=>get_uname( <userid> ).
        <pdfsource> = /swit/cl_dh_pdf=>get_source( <postid> ).

      ENDIF.

    ENDLOOP.

    me->filter(
      EXPORTING
        it_filter = it_filter
      CHANGING
        ct_data   = et_data
    ).

  ENDMETHOD.


  METHOD /swit/if_dh_posttype~get_by_id.

    SELECT SINGLE * FROM (me->mv_db) INTO CORRESPONDING FIELDS OF es_data WHERE postid EQ iv_postid.

    ASSIGN COMPONENT 'UNAME' OF STRUCTURE  es_data TO FIELD-SYMBOL(<uname>).
    ASSIGN COMPONENT 'USERID' OF STRUCTURE es_data TO FIELD-SYMBOL(<userid>).
    ASSIGN COMPONENT 'PDFSOURCE' OF STRUCTURE es_data TO FIELD-SYMBOL(<pdfsource>).

    IF <uname> IS ASSIGNED AND <userid> IS ASSIGNED.

      <uname> = /swit/cl_dh_users=>get_uname( <userid> ).
      <pdfsource> = /swit/cl_dh_pdf=>get_source( iv_postid ).

    ENDIF.

  ENDMETHOD.


  METHOD /swit/if_dh_posttype~update.

    DATA ls_post_data TYPE REF TO data.
    DATA lo_struc TYPE REF TO cl_abap_structdescr.

    lo_struc ?= cl_abap_structdescr=>describe_by_name( me->mv_db ).

    CREATE DATA ls_post_data TYPE HANDLE lo_struc.
    ASSIGN ls_post_data->* TO FIELD-SYMBOL(<ls_post_data>).

    MOVE-CORRESPONDING is_data TO <ls_post_data>.
    "Präventiv userid vom überschreiben schützen
    ASSIGN COMPONENT 'POSTID' OF STRUCTURE is_data TO FIELD-SYMBOL(<postid>).
    ASSIGN COMPONENT 'USERID' OF STRUCTURE <ls_post_data> TO FIELD-SYMBOL(<userid>).
    ASSIGN COMPONENT 'PDFBINARY' OF STRUCTURE is_data TO FIELD-SYMBOL(<pdfbinary>).
    ASSIGN COMPONENT 'PDFSOURCE' OF STRUCTURE es_data TO FIELD-SYMBOL(<pdfsource>).

    SELECT SINGLE userid FROM (me->mv_db) INTO <userid> WHERE postid EQ <postid>.

    UPDATE (me->mv_db) FROM <ls_post_data>.

    ASSIGN COMPONENT 'PDFSOURCE' OF STRUCTURE is_data TO FIELD-SYMBOL(<is_pdf_src>).
    IF <is_pdf_src> IS INITIAL AND <pdfbinary> IS INITIAL.

      /swit/cl_dh_pdf=>delete( <postid> ).

    ELSE.

      <pdfsource> = /swit/cl_dh_pdf=>edit(
                    iv_postid = <postid>
                    iv_pdf    = <pdfbinary>
                  ).

    ENDIF.



    es_data = is_data.

  ENDMETHOD.


  METHOD filter.

    DATA lt_data TYPE REF TO data.
    DATA lo_tab_descr TYPE REF TO cl_abap_tabledescr.
    DATA: lv_begin_of_selection TYPE begda,
          lv_end_of_selection   TYPE endda.

    FIELD-SYMBOLS <lt_data> TYPE ANY TABLE.

    IF it_filter IS NOT INITIAL.

      LOOP AT it_filter ASSIGNING FIELD-SYMBOL(<ls_filter>).

        CASE <ls_filter>-property.
          WHEN 'Begda'.
            READ TABLE <ls_filter>-select_options INDEX 1 ASSIGNING FIELD-SYMBOL(<ls_fso>).
            lv_begin_of_selection = <ls_fso>-low.
            lv_end_of_selection   = <ls_fso>-high.
        ENDCASE.

      ENDLOOP.

      lo_tab_descr ?= cl_abap_tabledescr=>describe_by_data( p_data = ct_data ).

      CREATE DATA lt_data TYPE HANDLE lo_tab_descr.
      ASSIGN lt_data->* TO <lt_data>.

      <lt_data> = ct_data.
      CLEAR ct_data.

      LOOP AT <lt_data> ASSIGNING FIELD-SYMBOL(<ls_data>).

        ASSIGN COMPONENT 'BEGDA' OF STRUCTURE <ls_data> TO FIELD-SYMBOL(<lv_begda>).
        ASSIGN COMPONENT 'ENDDA' OF STRUCTURE <ls_data> TO FIELD-SYMBOL(<lv_endda>).

        IF ( ( <lv_endda> GE lv_begin_of_selection AND <lv_begda> LE lv_end_of_selection ) OR ( lv_begin_of_selection IS INITIAL AND lv_end_of_selection IS INITIAL ) ) AND me->is_in_data( EXPORTING it_filter = it_filter is_data = <ls_data> ) EQ abap_true.
          INSERT <ls_data> INTO TABLE ct_data.
        ENDIF.

      ENDLOOP.


    ENDIF.

  ENDMETHOD.


  method GET_NEXT_POSTID.

    CALL FUNCTION 'NUMBER_GET_NEXT'
      EXPORTING
        nr_range_nr = '01'
        object      = '/SWIT/HUBS'
        quantity    = '1'
      IMPORTING
        number      = rv_postid.

  endmethod.


  method GET_PDF_DATA.
  endmethod.


  method HAS_ACCESS.

    rv_access = abap_true.

  endmethod.


  METHOD is_in_data.

  ENDMETHOD.
ENDCLASS.
