/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/search'], function(search) {
  function pageInit(context) {

    var currentRecord = context.currentRecord;

    // Example: Accessing and displaying the Customer Deposit ID on the console.
    var deposit_customer_field = currentRecord.getValue({
        fieldId: "customer",
      });
  try{

var fieldLookUp = search.lookupFields({
    type: search.Type.CUSTOMER,
    id: deposit_customer_field,
    columns: ['custentity_salesrep_dept']
});

    var salesRep_value = fieldLookUp.custentity_salesrep_dept[0].value;
    
console.log(fieldLookUp.custentity_salesrep_dept[0].value)
    
    

currentRecord.setValue({
    fieldId: 'department',
    value: salesRep_value,
    ignoreFieldChange: true
});
    
  }
    catch(error){
      
    }

  }

  return {
    pageInit: pageInit
  };
});
