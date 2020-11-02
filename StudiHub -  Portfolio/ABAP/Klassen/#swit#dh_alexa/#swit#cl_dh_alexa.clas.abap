class /SWIT/CL_DH_ALEXA definition
  public
  final
  create public .

public section.

  class-methods GET_ALL_OFFERS
    returning
      value(RV_OFFER) type STRING .
  class-methods GET_ALL_EVENTS
    returning
      value(RV_EVENTS) type STRING .
  class-methods GET_ALL_ACCOMMODATIONS
    returning
      value(RV_ACCOMM) type STRING .
  class-methods GET_ALL_JOBS
    returning
      value(RV_JOBS) type STRING .
  class-methods GET_ALL_CAREERS
    returning
      value(RV_CAREERS) type STRING .
protected section.
private section.
ENDCLASS.



CLASS /SWIT/CL_DH_ALEXA IMPLEMENTATION.


  method GET_ALL_ACCOMMODATIONS.
    DATA: lt_accomm TYPE TABLE OF /swit/dh_accom.

    /swit/cl_dh_accom=>new( )->get_all(
      IMPORTING
        et_data = lt_accomm
    ).

    LOOP AT lt_accomm ASSIGNING FIELD-SYMBOL(<fs_accomm>).
      rv_accomm = rv_accomm && ', ' && <fs_accomm>-title.
      IF sy-tabix EQ 5.
        EXIT.
      ENDIF.
    ENDLOOP.

  endmethod.


  method GET_ALL_CAREERS.
    DATA: lt_careers TYPE TABLE OF /swit/dh_career.

    /swit/cl_dh_career=>new( )->get_all(
      IMPORTING
        et_data = lt_careers
    ).

    LOOP AT lt_careers ASSIGNING FIELD-SYMBOL(<fs_careers>).
      rv_careers = rv_careers && ', ' && <fs_careers>-title.
      IF sy-tabix EQ 5.
        EXIT.
      ENDIF.
    ENDLOOP.
  endmethod.


  METHOD get_all_events.
    DATA: lt_events TYPE TABLE OF /swit/dh_events.

    /swit/cl_dh_event=>new( )->get_all(
      IMPORTING
        et_data = lt_events
    ).

    LOOP AT lt_events ASSIGNING FIELD-SYMBOL(<fs_events>).
      rv_events = rv_events && ', ' && <fs_events>-title.
      IF sy-tabix EQ 5.
        EXIT.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.


  method GET_ALL_JOBS.
    DATA: lt_jobs TYPE TABLE OF /swit/dh_jobs.

    /swit/cl_dh_job=>new( )->get_all(
      IMPORTING
        et_data = lt_jobs
    ).

    LOOP AT lt_jobs ASSIGNING FIELD-SYMBOL(<fs_jobs>).
      rv_jobs = rv_jobs && ', ' && <fs_jobs>-title.
      IF sy-tabix EQ 5.
        EXIT.
      ENDIF.
    ENDLOOP.
  endmethod.


  METHOD get_all_offers.
    DATA: lt_offers TYPE TABLE OF /swit/dh_offers.

    /swit/cl_dh_offer=>new( )->get_all(
      IMPORTING
        et_data = lt_offers
    ).

    LOOP AT lt_offers ASSIGNING FIELD-SYMBOL(<fs_offers>).
      rv_offer = rv_offer && ', ' && <fs_offers>-shorttitle.
      IF sy-tabix EQ 5.
        EXIT.
      ENDIF.
    ENDLOOP.

  ENDMETHOD.
ENDCLASS.
