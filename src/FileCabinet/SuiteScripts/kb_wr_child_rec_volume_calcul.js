/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */

define(["N/runtime", "N/format","N/search"], function (runtime, format,search) {

   function pageInit(context) {
     var currentRecord = context.currentRecord;

     var whtype = currentRecord.getValue({
        fieldId: "custrecord_sa_wr_type",
      });
     var whPrentLink = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_receipt_link",
      });

     var whNumber = currentRecord.getValue({
        fieldId: "custrecord_kb_chld_number",
      });
     var crNumber = currentRecord.getValue({
        fieldId: "custrecord_sa_cr_no",
      });
     
     
     var warehouseChild_CustomSearchList = search.create({
        type: "customrecord_kb_warehouse_re",
        filters: [
          ["internalid", "anyof", whPrentLink],
        ],
        columns: [
          { name: "custrecord_kb_wr_number" },
        ],
      });
      var warehouseChild_CustomSearchResult = warehouseChild_CustomSearchList.runPaged({ pageSize: 10 });
      var warehouseChild_CustomSearchCount = warehouseChild_CustomSearchResult.count;
      var warehouseChild_CustomSearchListResult = warehouseChild_CustomSearchList.run().getRange({ start: 0, end: 10 });


  
   var warehouse_List = search.create({
        type: "customrecord_kb_warehouse_custom_item_re",
     filters: [
          ["custrecord_kb_wh_receipt_link", "anyof", whPrentLink],
        ],
      });
      var warehouse_Result = warehouse_List.runPaged({ pageSize: 1000 });
      var warehouse_Count = warehouse_Result.count;
      
    
     
     var wrNumber = warehouseChild_CustomSearchListResult[0].getValue({ name: "custrecord_kb_wr_number" })
if(!whNumber && crNumber=='')
{
      currentRecord.setValue({
        fieldId: "custrecord_kb_chld_number",
        // value: "WR-" + wrNumber + "#" + (warehouse_Count + 1)
        value: "WR-" + wrNumber + "-" + (warehouse_Count + 1)
      });
}


     
  }

  function saveRecord(context) {
    var currentRecord = context.currentRecord;

    // Get the internal ID of the field that triggered the change event
    var fieldId = context.fieldId;

  
      var whQuantity = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_quantity",
      });
      var whLength = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_length",
      });
      var whWidth = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_width",
      });
      var whHeight = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_height",
      });

      var whVolume = whLength * whWidth * whHeight;
var whExtendVolume = whVolume * whQuantity
      currentRecord.setValue({
        fieldId: "custrecord_kb_wh_volume",
        value: whVolume,
      });

      currentRecord.setValue({
        fieldId: "custrecord_kb_wh_extended_volume",
        value: whExtendVolume,
      });
    return true;
  }
  
  function fieldChanged(context) {
    
    var currentRecord = context.currentRecord;

    // Get the internal ID of the field that triggered the change event
    var fieldId = context.fieldId;

    if (
      fieldId === "custrecord_kb_wh_length" ||
      fieldId === "custrecord_kb_wh_width" ||
      fieldId === "custrecord_kb_wh_height" ||
      fieldId === "custrecord_kb_wh_quantity"
    ) {
      var whQuantity = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_quantity",
      });
      var whLength = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_length",
      });
      var whWidth = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_width",
      });
      var whHeight = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_height",
      });

      var whVolume = whLength * whWidth * whHeight;
var whExtendVolume = whVolume * whQuantity
      currentRecord.setValue({
        fieldId: "custrecord_kb_wh_volume",
        value: whVolume,
      });

      currentRecord.setValue({
        fieldId: "custrecord_kb_wh_extended_volume",
        value: whExtendVolume,
      });
    }
//////REC FEE BILLED CHECK //////////////

 else if (fieldId === "custrecord_kb_wh_item" ) {

var lengths = [];
var widths = [];
var heights = [];
   
    var whPrentLink = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_receipt_link",
      });

    var whItemName = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_item",
      });
   
   var warehouse_List_field = search.create({
      type: "customrecord_kb_warehouse_custom_item_re",
     filters: [
          ["custrecord_kb_wh_receipt_link", "anyof", whPrentLink],
       "AND",
  [
    ["custrecord_kb_wh_item", "is", whItemName],
  ],
        ],
        columns: [
          { name: "custrecord_kb_wh_length" },
          { name: "custrecord_kb_wh_width" },
          { name: "custrecord_kb_wh_height" },
        ],
      });
      var warehouse_Result_field = warehouse_List_field.runPaged({ pageSize: 1000 });
      var warehouse_Count_field = warehouse_Result_field.count;
      var warehouse_List_Result_field = warehouse_List_field.run().getRange({ start: 0, end: 10 });

   
warehouse_Result_field.pageRanges.forEach(function(pageRange) {
  var page = warehouse_Result_field.fetch({ index: pageRange.index });
  page.data.forEach(function(result) {
    // Get the values from the result
    var length = result.getValue({ name: "custrecord_kb_wh_length" });
    var width = result.getValue({ name: "custrecord_kb_wh_width" });
    var height = result.getValue({ name: "custrecord_kb_wh_height" });

    // Push the values to the arrays
    lengths.push(length);
    widths.push(width);
    heights.push(height);
  });
});
   
   if (warehouse_Count_field === 0) {
  // Do something if the array is empty
  
     
} else {
  // Do something if the array is not empty
 
  console.log('should not fee billed and take L W H value ');
     console.log(length[0] + ' ' + widths[0])
               currentRecord.setValue({
        fieldId: "custrecord_kb_wh_length",
        value: lengths[0],
      });
     currentRecord.setValue({
        fieldId: "custrecord_kb_wh_width",
        value: widths[0],
      });
     currentRecord.setValue({
        fieldId: "custrecord_kb_wh_height",
        value: heights[0],
      });
     currentRecord.setValue({
        fieldId: "custrecord_kb_receiving_fee_billed",
        value: 2,
      });
  // Further processing with warehouse_List_Result_field
}

  
    }
///////NUmbring///////////////////////////////////////////////////////////////////////
   else if (context.fieldId === 'custrecord_sa_wr_type') {

     
      var whtype = currentRecord.getValue({
        fieldId: "custrecord_sa_wr_type",
      });

     var whPrentLink = currentRecord.getValue({
        fieldId: "custrecord_kb_wh_receipt_link",
      });
     var warehouseChild_CustomSearchList = search.create({
        type: "customrecord_kb_warehouse_re",
        filters: [
          ["internalid", "anyof", whPrentLink],
        ],
        columns: [
          { name: "custrecord_kb_wr_number" },
        ],
      });
      var warehouseChild_CustomSearchResult = warehouseChild_CustomSearchList.runPaged({ pageSize: 10 });
      var warehouseChild_CustomSearchCount = warehouseChild_CustomSearchResult.count;
      var warehouseChild_CustomSearchListResult = warehouseChild_CustomSearchList.run().getRange({ start: 0, end: 10 });


   var warehouse_List = search.create({
        type: "customrecord_kb_warehouse_custom_item_re",
     filters: [
          ["custrecord_kb_wh_receipt_link", "anyof", whPrentLink],
        ],
      });
      var warehouse_Result = warehouse_List.runPaged({ pageSize: 1000 });
      var warehouse_Count = warehouse_Result.count;
    
     
     var wrNumber = warehouseChild_CustomSearchListResult[0].getValue({ name: "custrecord_kb_wr_number" })

    }
   }


  return {
    fieldChanged: fieldChanged,
    pageInit : pageInit,
   saveRecord: saveRecord

  };
});
