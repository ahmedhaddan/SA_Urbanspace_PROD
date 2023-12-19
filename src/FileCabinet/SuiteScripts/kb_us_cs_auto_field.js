/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */

define(["N/runtime", "N/format", "N/search"], function (runtime, format,search) {

  function generateTimestampNumber() {
  const timestamp = new Date().getTime(); // Get the current timestamp in milliseconds
  return timestamp;
}

  
  function saveRecord(context) {


    var currentRecord = context.currentRecord;
    
    

    
    var transactionId = currentRecord.getValue({
          fieldId: 'custrecord_sa_fld_wr_rec_orig_trans'
        });

    
    if(transactionId)
    {
      try{ 
    var fieldLookUp = search.lookupFields({
    type: search.Type.ESTIMATE,
    id: transactionId ,
    columns: ['salesrep']
});
var salesRepValue = fieldLookUp["salesrep"][0].value || null;
       if (salesRepValue) {
      log.debug({
    title: 'Debug Entry', 
    details: 'Value of is: ' + fieldLookUp
});
       

    
 currentRecord.setValue({
      fieldId: "custrecord_sa_fld_wr_rec_sales_rep",
      value: salesRepValue,
    });

       }
      }
        catch(error)
{}
    }

    
if(!(currentRecord.getValue({fieldId : 'custrecord_kb_wr_number' })))
{
    // Get user ID
    var userId = runtime.getCurrentUser().id;
  
    // Set field values
    currentRecord.setValue({
      fieldId: "custrecord_kb_warehouse_received_by",
      value: userId,
    });

    
    return true; // Allow record to be saved
}
    else{
      return true;
    }

  
  }

  function pageInit(context) {

   
    var currentRecord = context.currentRecord;
    var uniqueNumber = generateTimestampNumber();

 

    currentRecord.setValue({ fieldId: "custrecord_kb_receipt_processing_status", value: 1, });
    
   if(!(currentRecord.getValue({fieldId : 'custrecord_kb_wr_number' })))
{ 
    var warehouse_CustomSearchList = search.create({
        type: "customrecord_kb_warehouse_re",
      });
      var warehouse_CustomSearchResult = warehouse_CustomSearchList.runPaged({ pageSize: 1000 });
      var warehouse_CustomSearchCount = warehouse_CustomSearchResult.count;
    
 

    currentRecord.setValue({
      fieldId: "custrecord_kb_wr_number",
      value: (uniqueNumber % 100000) +""+ (warehouse_CustomSearchCount + 1),
    });


}
    
  }

  return {
    saveRecord: saveRecord,
      pageInit: pageInit
  };
});
