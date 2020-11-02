interface /SWIT/IF_DH_FACTORY
  public .


  class-data MO_INSTANCE type ref to /SWIT/IF_DH_POSTTYPE .

  class-methods NEW
    returning
      value(RO_INSTANCE) type ref to /SWIT/IF_DH_POSTTYPE .
endinterface.
