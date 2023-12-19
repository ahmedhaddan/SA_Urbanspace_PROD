/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define([
  "N/currentRecord",
  "N/record",
  "N/search",
  "N/format",
  "N/runtime",
  "N/runtime",
], function (currentRecord, record, search, format, runtime) {


  function beforeLoad(context) {
    var itemArry = [];
    var script = runtime.getCurrentScript();

    var warehouseReceipt_Record = context.newRecord;
    var warehouseReceipt_Record_Id = warehouseReceipt_Record.id;
    var warehouseReceipt_Record_type = warehouseReceipt_Record.type;
    var ProcessStatus = warehouseReceipt_Record.getValue({
      fieldId: "custrecord_kb_receipt_processing_status",
    });

    var form = context.form;
    var contextType = context.type;

    
    var nameField = form.getField('name');   
      nameField.updateDisplayType({displayType: 'hidden'});


    if (contextType == 'create' || contextType == 'edit') {
          var receiptSublist = form.getSublist('recmachcustrecord_kb_wh_receipt_link');
    receiptSublist.displayType = 'hidden';

      warehouseReceipt_Record.setValue({
    fieldId: 'customform',
    value: 201,
    ignoreFieldChange: true
});
      
      log.debug({
    title: 'Debug Entry', 
    details: 'velue  seted: '
});
      
    }
    if(contextType == 'view')
    {
      
    var recordSubmit = record.submitFields({
    type: 'customrecord_kb_warehouse_re',
    id: warehouseReceipt_Record_Id,
    values: {
        'customform': 196
    }
});
   
    }

     

  }

  function beforeSubmit(context) {
try{
    var warehouseReceipt_Record = context.newRecord;

var wrProjectFieldID = warehouseReceipt_Record.getValue({
      fieldId: "custrecord_kb_wr_project",
    });
    var wrCustomerId = warehouseReceipt_Record.getValue({
      fieldId: "custrecord_kb_warehouse_customer",
    });
    var projectCustField = record.submitFields({
    type: 'customrecord_cseg_kb_projects',
    id: wrProjectFieldID,
    values: {
        'custrecord_kb_projects_customer': wrCustomerId
    }
});
}
    
   catch (error) {
 

}
  }
  

  return {
    beforeLoad: beforeLoad,
    beforeSubmit : beforeSubmit,
  };
});
