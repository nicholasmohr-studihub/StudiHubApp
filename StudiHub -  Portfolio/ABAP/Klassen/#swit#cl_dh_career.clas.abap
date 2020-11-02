class /SWIT/CL_DH_CAREER definition
  public
  inheriting from /SWIT/CL_DH_POST
  final
  create public .

public section.

  interfaces /SWIT/IF_DH_FACTORY .

  aliases NEW
    for /SWIT/IF_DH_FACTORY~NEW .

  methods CONSTRUCTOR .
protected section.

  methods IS_IN_DATA
    redefinition .
private section.

  aliases MO_INSTANCE
    for /SWIT/IF_DH_FACTORY~MO_INSTANCE .
ENDCLASS.



CLASS /SWIT/CL_DH_CAREER IMPLEMENTATION.


  method /SWIT/IF_DH_FACTORY~NEW.

    ro_instance = new /swit/cl_dh_career( ).

  endmethod.


  method CONSTRUCTOR.

    super->constructor( ).
    me->mv_db = '/SWIT/DH_CAREER'.

  endmethod.


  METHOD is_in_data.

    DATA lv_my_posts_flag TYPE boolean VALUE abap_false.
    DATA lv_basic_search TYPE string.
    DATA lv_userid TYPE num08.

    rv_is_in_data = abap_false.

    LOOP AT it_filter ASSIGNING FIELD-SYMBOL(<ls_filter>).

      CASE <ls_filter>-property.
        WHEN 'Userid'.
          READ TABLE <ls_filter>-select_options INDEX 1 ASSIGNING FIELD-SYMBOL(<ls_user>).
          lv_userid = <ls_user>-low.
          lv_my_posts_flag = <ls_user>-high.
        WHEN 'Title'.
          READ TABLE <ls_filter>-select_options INDEX 1 ASSIGNING FIELD-SYMBOL(<ls_basic_search>).
          lv_basic_search = <ls_basic_search>-low.
      ENDCASE.

    ENDLOOP.

    ASSIGN COMPONENT 'STREET'       OF STRUCTURE is_data TO FIELD-SYMBOL(<street>).
    ASSIGN COMPONENT 'POSTCODE'     OF STRUCTURE is_data TO FIELD-SYMBOL(<postcode>).
    ASSIGN COMPONENT 'CITY'         OF STRUCTURE is_data TO FIELD-SYMBOL(<city>).
    ASSIGN COMPONENT 'USERID'       OF STRUCTURE is_data TO FIELD-SYMBOL(<userid>).
    ASSIGN COMPONENT 'TITLE'        OF STRUCTURE is_data TO FIELD-SYMBOL(<title>).
    ASSIGN COMPONENT 'CATEGORY'     OF STRUCTURE is_data TO FIELD-SYMBOL(<category>).
    ASSIGN COMPONENT 'DESCR'        OF STRUCTURE is_data TO FIELD-SYMBOL(<descr>).
    ASSIGN COMPONENT 'UNAME'        OF STRUCTURE is_data TO FIELD-SYMBOL(<uname>).

    IF ( lv_my_posts_flag EQ abap_true AND lv_userid IS NOT INITIAL AND lv_userid EQ <userid> ) OR lv_my_posts_flag EQ abap_false.

      IF <uname> CS lv_basic_search OR <street> CS  lv_basic_search OR <postcode> CS lv_basic_search OR <city> CS lv_basic_search OR <title> CS lv_basic_search OR <category> CS lv_basic_search OR <descr> CS lv_basic_search OR lv_basic_search IS INITIAL.
        rv_is_in_data = abap_true.
      ENDIF.

    ENDIF.

  ENDMETHOD.
ENDCLASS.
