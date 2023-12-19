define([
  "N/currentRecord",
  "N/ui/dialog",
  "N/record",
  "N/ui/message",
  "N/search",
], function (currentRecord, dialog, record, message, search) {


  function callSuitelet() {
    var warehouseReceipt_Record = currentRecord.get();
    var warehouseReceipt_Record_Id = warehouseReceipt_Record.id;
    var warehouseReceipt_Record_type = warehouseReceipt_Record.type;
    var warehouseReceipt_Record_processing = warehouseReceipt_Record.getValue({
      fieldId: "custrecord_kb_receipt_processing_status",
    });;
///// START UPDATE ///////////////////////////////////////////////
    try{
 var listItem = [];

var warehouseChild_CustomSearchList = search.create({
  type: "customrecord_kb_warehouse_custom_item_re",
  filters: [["custrecord_kb_wh_receipt_link", "anyof", warehouseReceipt_Record_Id]],
  columns: [
    { name: "custrecord_kb_action_date" },
  ],
});

var warehouseChild_CustomSearchResult =
  warehouseChild_CustomSearchList.runPaged({ pageSize: 10 });
var warehouseChild_CustomSearchCount =
  warehouseChild_CustomSearchResult.count;
var warehouseChild_CustomSearchListResult =
  warehouseChild_CustomSearchList.run().getRange({
    start: 0,
    end: 10,
  });

for (var i = 0; i < warehouseChild_CustomSearchCount; i++) {
  var itemObj = {
    itemDate: warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_action_date" }),
  };

  listItem.push(itemObj);
}

var oldestDateDate = new Date(listItem[0].itemDate);

for (var i = 0; i < listItem.length; i++) {
  var itemDate = new Date(listItem[i].itemDate);
  if (itemDate <= oldestDateDate) {
    oldestDateDate = oldestDateDate;
  var  oldestDate = i
  }
}

// Convert the date to a string in the desired format if needed

       
console.log("Oldest date:" +  JSON.stringify(listItem) +  listItem[oldestDate].itemDate + typeof listItem[oldestDate].itemDate);

      var oldestDateString = listItem[oldestDate].itemDate;







    }
    
catch(e)
    {
      console.log(e)
    }

    ///// START UPDATE ///////////////////////////////////////////////
    

    var suiteletURL =
      "/app/site/hosting/scriptlet.nl?script=657&deploy=1&param1=" +
      warehouseReceipt_Record_Id +
      "&param2=" +
      warehouseReceipt_Record_type  +
      "&param3=" +
      warehouseReceipt_Record_processing
      +
      "&param4=" +
      oldestDateString;
    window.open(suiteletURL, "_blank", "width=980,height=520, menubar=no, scrollbars=no,titlebar=no,resizable=no,toolbar=no, top=200, left=450");
  }

  return {
    callSuitelet: callSuitelet,
  };
});
