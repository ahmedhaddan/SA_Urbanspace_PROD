/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define([
  "N/currentRecord",
  "N/record",
  "N/search",
  "N/runtime",
  "N/format",
], function (currentRecord, record, search, runtime, format) {
  
 
  function pageInit(context) {
      var currentRecord = context.currentRecord;
      var vbtriggerFieldName = context.fieldId;

      var vbFormField = currentRecord.getValue({
      fieldId: "customform",
    });

     log.debug({
    title: 'Debug Entry', 
    details: 'Done here: '
});
    if (vbFormField === "244") {

  log.debug({
    title: 'Debug Entry', 
    details: 'Done here: '
});
    const salesRepField = currentRecord.getField({
      fieldId: "salesrep",
    });
salesRepField.isDisabled = true;
    var currentUser = runtime.getCurrentUser();
    var userId = currentUser.id;
      
      currentRecord.setValue({
        fieldId: "salesrep",
        value: userId,
      });
    }
  }
  

  return {
  
    pageInit : pageInit
  };
});
