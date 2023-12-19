/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define([
  "N/currentRecord",
  "N/ui/dialog",
  "N/record",
  "N/ui/message",
  "N/search",
  'N/format',
  'N/runtime',
], function (currentRecord, dialog, record, message, search, format,runtime) {

 function convertDateStringToDate(dateString) {
  var dateParts = dateString.split('/');
  var month = parseInt(dateParts[0], 10);
  var day = parseInt(dateParts[1], 10);
  var year = parseInt(dateParts[2], 10);

  return new Date(year, month - 1, day);
}

  function addOneDay(date) {
  var newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}
 
  function afterSubmit(context) {
    var warehouseReceipt_Record = context.newRecord;
    var warehouseReceipt_Record_Id = warehouseReceipt_Record.id;
    var warehouseReceipt_Record_type = warehouseReceipt_Record.type;
    var userCreator = runtime.getCurrentUser();
    var AllitemArry = [] ;
    var Wr_ItemArray = [];
    var Cr_ItemArray = [];
    var Closed_ItemArray = [];
    var closed = false;
    
    var ProcessStatus = warehouseReceipt_Record.getValue({ fieldId: "custrecord_kb_receipt_processing_status", });
    var wrSalesRep = warehouseReceipt_Record.getValue({ fieldId: "custrecord_sa_fld_wr_rec_sales_rep", });
    var wrNumber = warehouseReceipt_Record.getValue({ fieldId: "custrecord_kb_wr_number", });
    
    if (ProcessStatus == 4) {
      

       
      log.debug({
        title: 'Debug Entry', 
        details: 'initiated corecttly  ' 
    });

           var warehouseChild_CustomSearchList_InWr_toCount = search.create({
        type: "customrecord_kb_warehouse_custom_item_re",
    filters: [
  ["custrecord_kb_wh_receipt_link", "anyof", warehouseReceipt_Record_Id],
],
      columns: [        
          { name: "custrecord_kb_wh_item" },
        
        
        ],
        
      });
var searchResult = warehouseChild_CustomSearchList_InWr_toCount.runPaged({ pageSize: 1000 });
var itemCount = searchResult.count;


     var warehouseChild_CustomSearchList_InWr = search.create({
        type: "customrecord_kb_warehouse_custom_item_re",
    filters: [
  ["custrecord_kb_wh_receipt_link", "anyof", warehouseReceipt_Record_Id],
  "AND",
  [
    ["custrecord_kb_progress_status", "anyof", 1],
    "OR",
    ["custrecord_kb_progress_status", "anyof", 2],
    "OR",
    ["custrecord_kb_progress_status", "anyof", 4]
    
  ],
],
      columns: [
        { name: "custrecord_kb_progress_status" },
          { name: "custrecord_kb_wh_item" },
          { name: "custrecord_kb_wh_quantity" },
          { name: "custrecord_kb_associated_fee_item" },
          { name: "custrecord_kb_wh_description" },
          { name: "custrecord_kb_bin" },
          { name: "custrecord_kb_wh_length" },
          { name: "custrecord_kb_wh_width" },
          { name: "custrecord_kb_wh_height" },
          { name: "custrecord_kb_wh_volume" },
          { name: "custrecord_kb_wh_extended_volume" },
           { name: "custrecord_kb_receiving_fee_billed" },
           { name: "custrecord_kb_wh_rush" },
        { name: "internalid" },
        { name: "custrecord_kb_wh_receipt_removed" },
        { name: "custrecord_kb_action_date" },
        
        ],
        
      });

      var warehouseChild_CustomSearchResult_InWr = warehouseChild_CustomSearchList_InWr.runPaged({ pageSize: 1000 });

warehouseChild_CustomSearchResult_InWr.pageRanges.forEach(function(pageRange) {
  var page = warehouseChild_CustomSearchResult_InWr.fetch({ index: pageRange.index });
  page.data.forEach(function(result) {
    var warehouseReceipt_ProgressStatus = result.getValue({ name: "custrecord_kb_progress_status" });
    var warehouseReceipt_ItemName = result.getValue({ name: "custrecord_kb_wh_item" });
    var warehouseReceipt_RecQty = result.getValue({ name: "custrecord_kb_wh_quantity" });
    var warehouseReceipt_Itemfee = result.getValue({ name: "custrecord_kb_associated_fee_item" });
    var warehouseReceipt_Description = result.getValue({ name: "custrecord_kb_wh_description" });
    var warehouseReceipt_Bin = result.getValue({ name: "custrecord_kb_bin" });
    var warehouseReceipt_Length = result.getValue({ name: "custrecord_kb_wh_length" });
    var warehouseReceipt_Width = result.getValue({ name: "custrecord_kb_wh_width" });
    var warehouseReceipt_Height = result.getValue({ name: "custrecord_kb_wh_height" });
    var warehouseReceipt_RecVolume = result.getValue({ name: "custrecord_kb_wh_volume" });
    var warehouseReceipt_ExtVolume = result.getValue({ name: "custrecord_kb_wh_extended_volume" });
    var warehouseReceipt_FeeBilled = result.getValue({ name: "custrecord_kb_receiving_fee_billed" });
    var warehouseReceipt_Rush = result.getValue({ name: "custrecord_kb_wh_rush" });
    var warehouseReceipt_InternalId = result.getValue({ name: "internalid" });
     var warehouseReceipt_Removed = result.getValue({ name: "custrecord_kb_wh_receipt_removed" });
var warehouseReceipt_Date = result.getValue({ name: "custrecord_kb_action_date" });
    var AllitemObj = {
      Status: warehouseReceipt_ProgressStatus,
      ItemName: warehouseReceipt_ItemName,
      Qty: warehouseReceipt_RecQty,
      Itemfee: warehouseReceipt_Itemfee,
      Description: warehouseReceipt_Description,
      Bin: warehouseReceipt_Bin,
      Length: warehouseReceipt_Length,
      Width: warehouseReceipt_Width,
      Height: warehouseReceipt_Height,
      Vol: warehouseReceipt_RecVolume,
      ExtVol: warehouseReceipt_ExtVolume,
      FeeBilled: warehouseReceipt_FeeBilled,
      Rush: warehouseReceipt_Rush,
      id:warehouseReceipt_InternalId,
      removed : warehouseReceipt_Removed,
      Date : warehouseReceipt_Date
    };

    AllitemArry.push(AllitemObj);
  });
});
 
// 
AllitemArry.forEach(function(item) {
  if (item.Status === "1") {
    Wr_ItemArray.push(item);
  } else if (item.Status === "2" && item.removed == false ) {
    Cr_ItemArray.push(item);
  }
});
///////////////MERGE ITEMS IN WAREHOUSE ///////////////////////////
      var Wr_ItemArrayMerged = [];

Wr_ItemArray.forEach(function(item) {
  var found = false;

  for (var i = 0; i < Wr_ItemArrayMerged.length; i++) {
    var mergedItem = Wr_ItemArrayMerged[i];

    if (mergedItem.ItemName === item.ItemName && mergedItem.Bin === item.Bin) {
      mergedItem.Qty = String(Number(mergedItem.Qty) + Number(item.Qty));
      found = true;
      break;
    }
  }

  if (!found) {
    Wr_ItemArrayMerged.push(item);
  }
});


////////////////////////////////////////////////////////////////////////////
       var allItemInWareHouseArray = [];

        for (var i = 0; i < AllitemArry.length; i++) {
            if (AllitemArry[i].Status === "1") {
                allItemInWareHouseArray.push(AllitemArry[i]);
            }
        }


      ///////////////////////////////////////////////////////////////////////////////

      var ItemResultArrayPartiallyRemoved = [];


        for (var i = 0; i < allItemInWareHouseArray.length; i++) {
            var itemName1 = allItemInWareHouseArray[i].ItemName;
            var bin1 = allItemInWareHouseArray[i].Bin;

            for (var j = 0; j < Cr_ItemArray.length; j++) {
                var itemName2 = Cr_ItemArray[j].ItemName;
                var bin2 = Cr_ItemArray[j].Bin;

                if (itemName1 === itemName2 && bin1 === bin2) {
                    ItemResultArrayPartiallyRemoved.push(allItemInWareHouseArray[i].id);
                    break; // Skip to next iteration of outer loop
                }
            }
        }
///////////////////////////////////////////////////////////////////////////////////////

      log.debug({
        title: 'Debug Entry', 
        details: 'All closed items :   ' + JSON.stringify(Closed_ItemArray) 
    });

      log.debug({
        title: 'Debug Entry', 
        details: 'All item partially removed id  :   ' + JSON.stringify(ItemResultArrayPartiallyRemoved) 
    });

        log.debug({
        title: 'Debug Entry', 
        details: 'All items in Warehouse :   ' + JSON.stringify(Wr_ItemArrayMerged) 
    });

          log.debug({
        title: 'Debug Entry', 
        details: 'All items in Warehouse :   ' + JSON.stringify(Cr_ItemArray) 
    });


      
for (var i = 0; i < Cr_ItemArray.length; i++) {
  var releasedItem = Cr_ItemArray[i];
  for (var j = 0; j < Wr_ItemArrayMerged.length; j++) {
    var warehouseItem = Wr_ItemArrayMerged[j];
    if (releasedItem.ItemName === warehouseItem.ItemName && releasedItem.Bin === warehouseItem.Bin) {
      warehouseItem.Qty = String(Number(warehouseItem.Qty) + Number(releasedItem.Qty));
      warehouseItem.released = true; // Add this line
      break;
    }
  }
}
      
//      for (var i = 0; i < Cr_ItemArray.length; i++) {
//   var releasedItem = Cr_ItemArray[i];
//   for (var j = 0; j < Wr_ItemArrayMerged.length; j++) {
//     var warehouseItem = Wr_ItemArrayMerged[j];
//     if (releasedItem.ItemName === warehouseItem.ItemName && releasedItem.Bin === warehouseItem.Bin) {
//       warehouseItem.Qty = String(Number(warehouseItem.Qty) + Number(releasedItem.Qty));
//       break;
//     }
//   }
// }
var warehouseUpdatedFiltered = [];
      
for (var i = 0; i < Wr_ItemArrayMerged.length; i++) {
  if (Number(Wr_ItemArrayMerged[i].Qty) >= 0 && Wr_ItemArrayMerged[i].released) { // Add the released condition
    warehouseUpdatedFiltered.push(Wr_ItemArrayMerged[i]);
  }
}

// var warehouseUpdatedFiltered = [];
      
// for (var i = 0; i < Wr_ItemArrayMerged.length; i++) {
//   if (Number(Wr_ItemArrayMerged[i].Qty) > 0 ) {
//     warehouseUpdatedFiltered.push(Wr_ItemArrayMerged[i]);
//   }
// }

    



log.debug({
  title: 'Debug Entry',
  details: 'All items in Warehouse after processing: ' + JSON.stringify(warehouseUpdatedFiltered) 
});

         var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to the current date

        // Format the date to a string in 'MM/DD/YYYY' format, which is what NetSuite expects
        var formattedDate = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' +  currentDate.getFullYear();

     var closedItem = []

      for (var i = 0 ; i < warehouseUpdatedFiltered.length ; i++ )
        {
     
 var whRecordChild = record.create({
    type: 'customrecord_kb_warehouse_custom_item_re',
    isDynamic: true ,                    
})
           if  (warehouseUpdatedFiltered[i].Qty == 0 )
      {
          closed = true;
        
        var closedItemObj = {
          itemName : warehouseUpdatedFiltered[i].ItemName ,
          Bin : warehouseUpdatedFiltered[i].Bin,
          id : warehouseUpdatedFiltered[i].id,
        }
closedItem.push(closedItemObj)

         whRecordChild.setValue({
    fieldId: 'custrecord_kb_progress_status',
    value: '3',
    ignoreFieldChange: true
});
      
        
      }


           whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_receipt_link',
    value:  warehouseReceipt_Record_Id,
    ignoreFieldChange: true
});
         if  (warehouseUpdatedFiltered[i].Qty > 0 )
      {  
           whRecordChild.setValue({
    fieldId: 'custrecord_kb_progress_status',
    value: '1' ,
    ignoreFieldChange: true
});
      }
            whRecordChild.setValue({
    fieldId: 'custrecord_kb_action_date',
    value: convertDateStringToDate(formattedDate) ,
    ignoreFieldChange: true
});
          

            whRecordChild.setValue({
    fieldId: 'custrecord_kb_chld_number',
    value: 'WR-' + wrNumber + '-' + (itemCount + i),
    ignoreFieldChange: true
});

   


              whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_item',
    value: warehouseUpdatedFiltered[i].ItemName , //ItemName
    ignoreFieldChange: true
});

          whRecordChild.setValue({
    fieldId: 'custrecord_kb_bin',
    value: warehouseUpdatedFiltered[i].Bin ,//Bin
    ignoreFieldChange: true
});

      whRecordChild.setValue({
    fieldId: 'custrecord_kb_associated_fee_item',
    value: warehouseUpdatedFiltered[i].Itemfee,//Itemfee
    ignoreFieldChange: true
});
          

          whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_description',
    value: warehouseUpdatedFiltered[i].Description,//Description
    ignoreFieldChange: true
});

          


          whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_quantity',
    value:warehouseUpdatedFiltered[i].Qty ,//Qty
    ignoreFieldChange: true
});


              whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_length',
    value: warehouseUpdatedFiltered[i].Length ,//Length
    ignoreFieldChange: true
});

              whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_width',
    value: warehouseUpdatedFiltered[i].Width ,//Width
    ignoreFieldChange: true
});

              whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_height',
    value: warehouseUpdatedFiltered[i].Height ,//Height
    ignoreFieldChange: true
});

               whRecordChild.setValue({
    fieldId: 'custrecord_kb_receiving_fee_billed',
    value: warehouseUpdatedFiltered[i].FeeBilled ,//FeeBilled
    ignoreFieldChange: true
});

            whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_rush',
    value: warehouseUpdatedFiltered[i].Rush,//Rush
    ignoreFieldChange: true
});
var volume = warehouseUpdatedFiltered[i].Length * warehouseUpdatedFiltered[i].Width * warehouseUpdatedFiltered[i].Height
           whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_volume',
    value: volume,//Volume Claculation
    ignoreFieldChange: true
});

var extVolume = volume * warehouseUpdatedFiltered[i].Qty
           whRecordChild.setValue({
    fieldId: 'custrecord_kb_wh_extended_volume',
    value: extVolume,//Ext Volume Claculation
    ignoreFieldChange: true
});

          
childsaved = whRecordChild.save()
      
          
        }








      
      for(var i=0 ; i<ItemResultArrayPartiallyRemoved.length ;i++)
  {

record.submitFields({
    type: 'customrecord_kb_warehouse_custom_item_re',
    id: ItemResultArrayPartiallyRemoved[i],
    values: {
        'custrecord_kb_progress_status': '4'
    }
});

    
  }



      for(var i=0 ; i<Cr_ItemArray.length ;i++)
  {

record.submitFields({
    type: 'customrecord_kb_warehouse_custom_item_re',
    id: Cr_ItemArray[i].id,
    values: {
        'custrecord_kb_wh_receipt_removed': true
    }
});

    
 }

      ///////////LOGIC TO CLOSE ITEMS QTY 0 /////////////////////////////////
if(closed == true )
{



     var warehouseChild_CustomSearchList_closed = search.create({
        type: "customrecord_kb_warehouse_custom_item_re",
    filters: [
  ["custrecord_kb_wh_receipt_link", "anyof", warehouseReceipt_Record_Id],
  "AND",
  [
    ["custrecord_kb_progress_status", "anyof", 4]
  ],
],
      columns: [
        { name: "custrecord_kb_progress_status" },
          { name: "custrecord_kb_wh_item" },
          { name: "custrecord_kb_bin" },
        { name: "internalid" },
        ],
        
      });

      var warehouseChild_CustomSearchResult_closed = warehouseChild_CustomSearchList_closed.runPaged({ pageSize: 1000 });

warehouseChild_CustomSearchResult_closed.pageRanges.forEach(function(pageRange) {
  var page = warehouseChild_CustomSearchResult_closed.fetch({ index: pageRange.index });
  page.data.forEach(function(result) {
    var warehouseReceipt_ProgressStatus = result.getValue({ name: "custrecord_kb_progress_status" });
    var warehouseReceipt_ItemName = result.getValue({ name: "custrecord_kb_wh_item" });
    var warehouseReceipt_Bin = result.getValue({ name: "custrecord_kb_bin" });
    var warehouseReceipt_InternalId = result.getValue({ name: "internalid" });
    var AllitemObj = {
      Status: warehouseReceipt_ProgressStatus,
      ItemName: warehouseReceipt_ItemName,
      Bin: warehouseReceipt_Bin,
      id:warehouseReceipt_InternalId,
    };

    Closed_ItemArray.push(AllitemObj);
  });
});



      log.debug({
  title: 'Debug Entry',
  details: 'closed item : ' + JSON.stringify(closedItem) 
});

  
      log.debug({
  title: 'Debug Entry',
  details: 'all partialy  need to be closed item : ' + JSON.stringify(Closed_ItemArray) 
});

var newArrayNeedToBeClosed = [];

Closed_ItemArray.forEach(function(obj1) {
  closedItem.forEach(function(obj2) {
    if (obj1.ItemName === obj2.itemName && obj1.Bin === obj2.Bin) {
      newArrayNeedToBeClosed.push(obj1.id);
    }
  });
});
     log.debug({
  title: 'Debug Entry',
  details: 'all partialy  need to be turned to closed status: ' + JSON.stringify(newArrayNeedToBeClosed) 
});

 for(var i=0 ; i<newArrayNeedToBeClosed.length ;i++)
  {

record.submitFields({
    type: 'customrecord_kb_warehouse_custom_item_re',
    id: newArrayNeedToBeClosed[i],
    values: {
        'custrecord_kb_progress_status': '3'
    }
});

    
  }

  
}
      







      







   
   }
  }






  return {
    afterSubmit: afterSubmit,
  
  };
});