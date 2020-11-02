interface /SWIT/IF_DH_POSTTYPE
  public .


  data MV_DB type STRING read-only .

  methods GET_BY_ID
    importing
      !IV_POSTID type NUM08
    exporting
      value(ES_DATA) type DATA .
  methods GET_ALL
    importing
      !IT_FILTER type /IWBEP/T_MGW_SELECT_OPTION optional
    exporting
      !ET_DATA type ANY TABLE .
  methods CREATE
    importing
      !IS_DATA type DATA
    exporting
      !ES_DATA type DATA .
  methods UPDATE
    importing
      !IS_DATA type DATA
    exporting
      !ES_DATA type DATA .
  methods DELETE
    importing
      !IV_POSTID type NUM08 .
endinterface.
