class /SWIT/CL_DH_PDF definition
  public
  final
  create public .

public section.

  class-methods SAVE
    importing
      !IV_POSTID type NUM08
      value(IV_PDF) type XSTRING
    returning
      value(RV_PATH) type STRING .
  class-methods DISPLAY
    importing
      !IV_POSTID type NUM08
    returning
      value(RV_PDF) type XSTRING .
  class-methods EDIT
    importing
      !IV_POSTID type NUM08
      !IV_PDF type XSTRING
    returning
      value(RV_PATH) type STRING .
  class-methods DELETE
    importing
      !IV_POSTID type NUM08 .
  class-methods GET_SOURCE
    importing
      !IV_POSTID type NUM08
    returning
      value(RV_SRC) type STRING .
protected section.
private section.

  constants MC_SERVICE_PATH type STRING value '/sap/opu/odata/swit/studi_hub_srv/PdfSet(''' ##NO_TEXT.
  class-data MV_PATH_SUFFIX type STRING value ''')/$value' ##NO_TEXT.
  constants MC_LOCAL_DIR type STRING value 'D:\USR\SAP\SWT\D00\WORK' ##NO_TEXT.

  class-methods GET_EXTERNAL_PATH
    importing
      !IV_POSTID type NUM08
    returning
      value(RV_PATH) type STRING .
  class-methods GET_PATH
    importing
      !IV_POSTID type NUM08
    returning
      value(RV_PATH) type STRING .
  class-methods GET_PATH_DELIMITER
    returning
      value(RV_DELIMITER) type CHAR1 .
  class-methods CREATE_DIR
    importing
      !IV_POSTID type NUM08
    returning
      value(RV_DIR) type TEXT180 .
ENDCLASS.



CLASS /SWIT/CL_DH_PDF IMPLEMENTATION.


  METHOD create_dir.

    DATA(lv_del) = get_path_delimiter( ).
    CONCATENATE mc_local_dir lv_del iv_postid into rv_dir.

    CALL FUNCTION '/SWIT/FUNC_BRAN_DIR_CREATE'
      EXPORTING
        dirname        = rv_dir
      EXCEPTIONS
        already_exists = 1
        cant_create    = 2
        OTHERS         = 3.

  ENDMETHOD.


  method DELETE.

    DATA(lv_path) = get_path( iv_postid = iv_postid ).
    DELETE DATASET lv_path.
    DELETE FROM /swit/dh_pdf_src WHERE postid eq iv_postid.

  endmethod.


  METHOD display.

    DATA(lv_path) = get_path( iv_postid = iv_postid ).

    OPEN DATASET lv_path FOR INPUT IN BINARY MODE.

     READ DATASET lv_path INTO rv_pdf.

    CLOSE DATASET lv_path.

  ENDMETHOD.


  method EDIT.

    rv_path = save( iv_postid = iv_postid  iv_pdf = iv_pdf ).

  endmethod.


  method GET_EXTERNAL_PATH.

    rv_path = mc_service_path && iv_postid && mv_path_suffix.

  endmethod.


  method GET_PATH.

    DATA(lv_del) = get_path_delimiter( ).
    CONCATENATE mc_local_dir lv_del iv_postid lv_del 'FILE' into rv_path.

  endmethod.


  METHOD get_path_delimiter.

    DATA lv_opsys TYPE syopsys.

    lv_opsys = sy-opsys.

    TRANSLATE lv_opsys TO UPPER CASE.
    IF lv_opsys+0(3) EQ 'WIN'.
      rv_delimiter = '\'.
    ELSE.
      " Unix-/Linuxschreibweise mit Slash
      rv_delimiter = '/'.
    ENDIF.

  ENDMETHOD.


  METHOD get_source.

    SELECT SINGLE source FROM /swit/dh_pdf_src into rv_src WHERE postid EQ iv_postid.

  ENDMETHOD.


  METHOD save.

    DATA ls_pdf TYPE /swit/dh_pdf_src.
    DATA(lv_dir)  = create_dir( iv_postid ).
    DATA(lv_path) = get_path( iv_postid  ).

    rv_path = get_external_path( iv_postid = iv_postid ).

    IF iv_pdf IS NOT INITIAL.

      OPEN DATASET lv_path FOR OUTPUT IN BINARY MODE.

      TRANSFER iv_pdf TO lv_path.

      CLOSE DATASET lv_path.

      ls_pdf-postid = iv_postid.
      ls_pdf-source = rv_path.


      MODIFY /swit/dh_pdf_src FROM ls_pdf.


    ENDIF.



  ENDMETHOD.
ENDCLASS.
