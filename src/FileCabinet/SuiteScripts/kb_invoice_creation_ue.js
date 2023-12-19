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

  
  function findRate(priceLevels, priceLevelName, qty) {
  var applicableRate = 0; // Default value

  for (var i = 0; i < priceLevels.length; i++) {
    if (priceLevels[i].priceLevel === priceLevelName) {
      if (priceLevels[i].qtyBreak <= qty) {
        applicableRate = priceLevels[i].rate; // Update the applicable rate
      } else {
        break; // We've found the first qtyBreak greater than qty
      }
    }
  }

  return applicableRate;
}
  
  function findCalcuRate(extVol, priceName, priceArr) {
  var calcu = extVol / 500; // 15,136
  var rem = extVol % 500; // 68

  var floorCalcu = Math.floor(calcu);
  var rate1 = findRate(priceArr, priceName, extVol);
  var rate2 = findRate(priceArr, priceName, rem);

  var result = (floorCalcu * rate1) + rate2;

  // Creating the string representation of the calculation
  var resultString = '(' + Math.floor(calcu) + ' x ' + '$'+rate1 + ') + ' +  '(1 x ' + '$'+rate2 + ')';

  // Returning both the result and the string representation in an array
  return [result, resultString];
}
  
  function convertDateStringToDate(dateString) {
  var dateParts = dateString.split('/');
  var month = parseInt(dateParts[0], 10);
  var day = parseInt(dateParts[1], 10);
  var year = parseInt(dateParts[2], 10);

  return new Date(year, month - 1, day);
}
  function afterSubmit(context) {
    log.debug({
    title: 'Debug Entry', 
    details: 'start script '
});
    var warehouseReceipt_Record = context.newRecord;
    var warehouseReceipt_Record_Id = warehouseReceipt_Record.id;
    var warehouseReceipt_Record_type = warehouseReceipt_Record.type;
    var userCreator = runtime.getCurrentUser();

    var ProcessStatus = warehouseReceipt_Record.getValue({ fieldId: "custrecord_kb_receipt_processing_status", });
    var wrSalesRep = warehouseReceipt_Record.getValue({ fieldId: "custrecord_sa_fld_wr_rec_sales_rep", });

    if (ProcessStatus == 3) {
      
      var itemArry = [];
       var basePrice = [];
      var itemRecFee = [];
      var uniqueItems = [];
      var quantityfee = [];
      var quantityFeeSum = 0;
      var totalQuantity = 0;
      var feeReceivingQuantity = 0;
      var warehouseReceipt_fieldLookUp = search.lookupFields({
        type: warehouseReceipt_Record_type,
        id: warehouseReceipt_Record_Id,
        columns: [
          "custrecord_kb_warehouse_customer",
          "custrecord_kb_wr_project",
          "custrecord_kb_warehouse_received_by",
          "custrecord_kb_wr_action_date",
          "custrecord_kb_receipt_status",
          "custrecord_kb_warehosue_memo",
          "custrecord_kb_date_to_bill",
        ],
      });

      var billingDateFor = warehouseReceipt_fieldLookUp["custrecord_kb_date_to_bill"];
 var convertedDate = convertDateStringToDate(billingDateFor);
 

      
      var warehouseReceipt_customer = warehouseReceipt_fieldLookUp["custrecord_kb_warehouse_customer"][0].value;

      var warehouseReceipt_receivedBy = warehouseReceipt_fieldLookUp["custrecord_kb_warehouse_received_by"];
      var warehouseReceipt_receiptDate = warehouseReceipt_fieldLookUp["custrecord_kb_wr_action_date"];
      var warehouseReceipt_receiptStatus = warehouseReceipt_fieldLookUp["custrecord_kb_receipt_status"][0].value;
      var warehouseReceipt_memo = warehouseReceipt_fieldLookUp["custrecord_kb_warehosue_memo"];

      var warehouseChild_CustomSearchList = search.create({
  type: "customrecord_kb_warehouse_custom_item_re",
  filters: [
    ["custrecord_kb_wh_receipt_link", "anyof", warehouseReceipt_Record_Id], "AND",
    [
      ["custrecord_kb_progress_status", "anyof", 1],
    ]
  ],
  columns: [
    { name: "custrecord_kb_progress_status" },
    { name: "custrecord_kb_wh_item" },
    { name: "custrecord_kb_wh_quantity" },
    { name: "custrecord_kb_qty_remaining" },
    { name: "custrecord_kb_action_date" },
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
    { name: "custrecord_sa_wr_type" },
  ],
});

var warehouseChild_CustomSearchResult = warehouseChild_CustomSearchList.runPaged({ pageSize: 10 });
var itemArry = [];

warehouseChild_CustomSearchResult.pageRanges.forEach(function(pageRange) {
  var page = warehouseChild_CustomSearchResult.fetch({ index: pageRange.index });
  page.data.forEach(function(result) {
    var warehouseReceipt_getitemName = result.getValue({ name: "custrecord_kb_wh_item" });
    var warehouseReceipt_getRecDate = result.getValue({ name: "custrecord_kb_action_date" });
    var warehouseReceipt_getRecQty = result.getValue({ name: "custrecord_kb_wh_quantity" });
    var warehouseReceipt_getRecRemQty = result.getValue({ name: "custrecord_kb_qty_remaining" });
    var warehouseReceipt_getRecVolume = result.getValue({ name: "custrecord_kb_wh_volume" });
    var warehouseReceipt_getExtVolume = result.getValue({ name: "custrecord_kb_wh_extended_volume" });
    var warehouseReceipt_getitemList = result.getValue({ name: "custrecord_kb_associated_fee_item" });
    var warehouseReceipt_getDescription = result.getValue({ name: "custrecord_kb_wh_description" });
    var warehouseReceipt_getProgressStatus = result.getValue({ name: "custrecord_kb_progress_status" });
    var warehouseReceipt_getReceivingFee = result.getValue({ name: "custrecord_kb_receiving_fee_billed" });
    var warehouseReceipt_getRush = result.getValue({ name: "custrecord_kb_wh_rush" });
    var warehouseReceipt_getInternalid = result.getValue({ name: "internalid" });
    var warehouseReceipt_gettype = result.getValue({ name: "custrecord_sa_wr_type" });

    var itemObj = {
      item: warehouseReceipt_getitemName,
      date: warehouseReceipt_getRecDate,
      volume: warehouseReceipt_getRecVolume,
      extvolume: warehouseReceipt_getExtVolume,
      quantity: warehouseReceipt_getRecQty,
      remaningQty: warehouseReceipt_getRecRemQty,
      itemlist: warehouseReceipt_getitemList,
      description: warehouseReceipt_getDescription,
      status: warehouseReceipt_getProgressStatus,
      receivingfee: warehouseReceipt_getReceivingFee,
      rush: warehouseReceipt_getRush,
      id: warehouseReceipt_getInternalid,
      type: warehouseReceipt_gettype
    };
    
    itemArry.push(itemObj);
  });
});

    //   var warehouseChild_CustomSearchList = search.create({
    //     type: "customrecord_kb_warehouse_custom_item_re",
    //     filters: [
    //       ["custrecord_kb_wh_receipt_link", "anyof", warehouseReceipt_Record_Id],"AND",
    // [
    //   ["custrecord_kb_progress_status", "anyof", 1],
    // ]
    //              ],
    //     columns: [
    //       { name: "custrecord_kb_progress_status" },
    //       { name: "custrecord_kb_wh_item" },
    //       { name: "custrecord_kb_wh_quantity" },
    //       { name: "custrecord_kb_qty_remaining" },
    //       { name: "custrecord_kb_action_date" },
    //       { name: "custrecord_kb_associated_fee_item" },
    //       { name: "custrecord_kb_wh_description" },
    //       { name: "custrecord_kb_bin" },
    //       { name: "custrecord_kb_wh_length" },
    //       { name: "custrecord_kb_wh_width" },
    //       { name: "custrecord_kb_wh_height" },
    //       { name: "custrecord_kb_wh_volume" },
    //       { name: "custrecord_kb_wh_extended_volume" },
    //       { name: "custrecord_kb_receiving_fee_billed" },
    //       { name: "custrecord_kb_wh_rush" },
    //       { name: "internalid" },
    //       { name: "custrecord_sa_wr_type" },
    //     ],
    //   });
    //   var warehouseChild_CustomSearchResult =
    //     warehouseChild_CustomSearchList.runPaged({ pageSize: 10 });
    //   var warehouseChild_CustomSearchCount =
    //     warehouseChild_CustomSearchResult.count;
    //   var warehouseChild_CustomSearchListResult =
    //     warehouseChild_CustomSearchList.run().getRange({
    //       start: 0,
    //       end: 10,
    //     });
     
    //   for (var i = 0; i < warehouseChild_CustomSearchCount; i++) {
    //     var warehouseReceipt_getitemName = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_wh_item", });
    //     var warehouseReceipt_getRecDate = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_action_date", });
    //     var warehouseReceipt_getRecQty = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_wh_quantity", });
    //     var warehouseReceipt_getRecRemQty = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_qty_remaining", });
    //     var warehouseReceipt_getRecVolume = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_wh_volume", });
    //     var warehouseReceipt_getExtVolume = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_wh_extended_volume", });
    //     var warehouseReceipt_getitemList = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_associated_fee_item", });
    //     var warehouseReceipt_getDescription = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_wh_description", });
    //     var warehouseReceipt_getProgressStatus = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_progress_status", });
    //     var warehouseReceipt_getReceivingFee = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_receiving_fee_billed", });
    //     var warehouseReceipt_getRush = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_kb_wh_rush", });
    //     var warehouseReceipt_getInternalid = warehouseChild_CustomSearchListResult[i].getValue({ name: "internalid", });
    //     var warehouseReceipt_gettype = warehouseChild_CustomSearchListResult[i].getValue({ name: "custrecord_sa_wr_type", });

    //     var itemObj = {
    //       item: warehouseReceipt_getitemName,
    //       date: warehouseReceipt_getRecDate,
    //       volume: warehouseReceipt_getRecVolume,
    //       extvolume: warehouseReceipt_getExtVolume,
    //       quantity: warehouseReceipt_getRecQty,
    //       remaningQty: warehouseReceipt_getRecRemQty,
    //       itemlist: warehouseReceipt_getitemList,
    //       description: warehouseReceipt_getDescription,
    //       status: warehouseReceipt_getProgressStatus,
    //       receivingfee :warehouseReceipt_getReceivingFee,
    //       rush :warehouseReceipt_getRush,
    //       id:warehouseReceipt_getInternalid,
    //       type:warehouseReceipt_gettype
    //     };
        
    //     itemArry.push(itemObj);
    //   }

      
      for (var i = 0; i < itemArry.length; i++) {
        
        var isDuplicate = false;
        
      if(itemArry[i].receivingfee == '2'  && itemArry[i].status == '1' && convertedDate > convertDateStringToDate(itemArry[i].date))
        {
          
          var receivingFeeObj = {
           extVolume : itemArry[i].extvolume,
           itemName : itemArry[i].item,
           recFee : itemArry[i].receivingfee,
           rush : itemArry[i].rush,
           itemDate: itemArry[i].date
            
        }
      

            quantityfee.push(receivingFeeObj);
            itemRecFee.push( itemArry[i].id)
  
         }


        
     log.debug({
    title: 'Debug Entry', 
    details: 'array receiving fee is ' + itemRecFee
});

        log.debug({
    title: 'Debug Entry', 
    details: 'item date: ' + convertDateStringToDate(itemArry[0].date) + typeof convertDateStringToDate(itemArry[0].date) + 'billing date' + convertedDate + typeof convertedDate
});

        if (convertedDate > convertDateStringToDate(itemArry[i].date)) {

          
        
          if (itemArry[i].status == 2 && itemArry[i].date.substring(0, 2) == billingDateFor.substring(0, 2)) {
            continue;
            
          }

          for (var j = 0; j < uniqueItems.length; j++) {
            if (itemArry[i].item == uniqueItems[j].item) {


              var firstQuantity = format.parse({ value: uniqueItems[j].quantity, type: format.Type.INTEGER, });
              var secondeQuantity = format.parse({ value: itemArry[i].quantity, type: format.Type.INTEGER, });

              itemArry[i].quantity = firstQuantity + secondeQuantity
              uniqueItems[j].quantity = itemArry[i].quantity

              var firstVolume = format.parse({ value: uniqueItems[j].extvolume, type: format.Type.INTEGER, });
              var secondeVolume = format.parse({ value: itemArry[i].extvolume, type: format.Type.INTEGER, });

              itemArry[i].extvolume = firstVolume + secondeVolume
              uniqueItems[j].extvolume = itemArry[i].extvolume

           
              
              
              isDuplicate = true;

              break;

            }
          }
        }
        else { continue }

        if (!isDuplicate) {

          uniqueItems.push(itemArry[i]);


        }

      }

     

      if(quantityfee.length > 0)
      {
        for (i=0 ; i<quantityfee.length ; i++)
          {
             
            quantityFeeSum +=   format.parse({ value: quantityfee[i], type: format.Type.INTEGER, });
          }
      }

       ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      var serviceItem = record.load({
    type: record.Type.SERVICE_ITEM,
    id: '857' // Your specific service item ID
});

// Get the line count for the price sublist
var lineCount = serviceItem.getLineCount({
    sublistId: 'price'
});

      for (var i = 0; i < lineCount; i++) {

        var priceLevel = serviceItem.getSublistValue({
        sublistId: 'price',
        fieldId: 'pricelevelname',
        line: i
    });

    // Log all the available price fields
    for (var j = 1; j <= 6; j++) { // Adjust the loop depending on the number of price fields
        var rate = serviceItem.getSublistValue({
            sublistId: 'price',
            fieldId: 'price_' + j + '_',
            line: i
        });
      var qtyBreak = serviceItem.getValue({
            fieldId: 'pricequantity' + j,
            line: i
        });

      
      

      var basePriceObj = {
         priceLevel : priceLevel,
           qtyBreak : qtyBreak,
         rate : rate,   
        }

       basePrice.push(basePriceObj);

    }  
        
}
var priceLevelName = "Base Price";
var qty = 9500;

var rate = findCalcuRate(qty,priceLevelName, basePrice)
      
              log.debug({
    title: 'Debug Entry', 
    details: 'Rate for qty ' + qty + ': ' + rate 
});
             log.debug({
    title: 'Debug Entry', 
    details: ' Based Price : ' +  JSON.stringify(basePrice)
});


      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

 log.debug({
    title: 'Debug Entry', 
    details: 'start creation '
});

      var invoice_newRecord = record.create({
        type: record.Type.INVOICE,
        defaultValues: {
          customform: 238,
        },
        isDynamic: true,
      });

        invoice_newRecord.setValue({
        fieldId: "entity",
        value: warehouseReceipt_customer,
      });

      invoice_newRecord.setValue({
        fieldId: "subsidiary",
        value: 9,     // Urbanspace Logistics
      });

      invoice_newRecord.setValue({
        fieldId: "trandate",
        value: convertedDate,
      });

      invoice_newRecord.setValue({
        fieldId: "custbody_sa_trns_fld_wr",
        value: warehouseReceipt_Record_Id,
      });

      // invoice_newRecord.setValue({
      //   fieldId: "location",
      //   value: 314,
      // });



      for (var i = 0; i < uniqueItems.length; i++) {

        
    var warehouseReceipt_getReceiptDate =itemArry[i].date ;
      
        var warehouseReceipt_getQuantity =itemArry[i].extvolume;
        
        // var warehouseReceipt_getReceiptDate =
        //   warehouseChild_CustomSearchListResult[i].getValue({
        //     name: "custrecord_kb_action_date",
        //   });
      
        // var warehouseReceipt_getQuantity =
        //   warehouseChild_CustomSearchListResult[i].getValue({
        //     name: "custrecord_kb_wh_extended_volume",
        //   });

        invoice_newRecord.selectNewLine({ sublistId: "item" });

        invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
          value: uniqueItems[i].itemlist,
        });

        invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "description",
          value: uniqueItems[i].item,
        });

        invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "price",
          value: "1",
        });

        invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
          value: uniqueItems[i].extvolume,
        });

        invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcolcustrecord_kb_wh_item_volume",
          value: uniqueItems[i].volume,
        });
        invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcol_kb_whitem_extended_volume",
          value: uniqueItems[i].extvolume,
        });

        invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "isclosed",
          value: true,
        });

        invoice_newRecord.commitLine({ sublistId: "item" });
        var intQuantity = format.parse({ value: warehouseReceipt_getQuantity, type: format.Type.INTEGER })

        totalQuantity = totalQuantity + intQuantity;


     
      }

      if (invoice_newRecord.getLineCount({ sublistId: 'item' }) == 0) {

        return false


      }

       
log.debug({
    title: 'Debug Entry', 
    details: 'QUANTITY array is: ' + quantityfee
});

       if (quantityfee.length > 0) {
         
         for(var i=0 ; i<quantityfee.length ; i++)
           {
             if(convertedDate > convertDateStringToDate(quantityfee[i].itemDate))
             {
       invoice_newRecord.selectNewLine({ sublistId: "item" });
        invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
          value: 857, ///////////////HERE ////////////////////////////////////////////////////77
        });


                if(quantityfee[i].extVolume > 500)
               {
                 if(quantityfee[i].rush == true)
                 {
                   var priceLevelName =  'Rush'
                  var [result, calculationString] = findCalcuRate(quantityfee[i].extVolume, priceLevelName, basePrice);

                     invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "price",
          value:"-1",
        });
                     invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
          value: 1,
        });
                         invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "amount",
          value: Math.abs(result) ,
        });
                   invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "description",
          value: calculationString + ' ' + '  Receiving Fee ' + '+ ' + 'Rush' + 'Added for '+ '"' + quantityfee[i].itemName + '"',
        });
                 }

                    if(quantityfee[i].rush == false)
                 {
                  var priceLevelName = 'Base Price'
                 var [result, calculationString] = findCalcuRate(quantityfee[i].extVolume, priceLevelName, basePrice);
                   
            invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "price",
          value:"-1",
        });
                     invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
          value: 1,
        });
                         invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "amount",
          value: Math.abs(result) ,
        });
                           invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "description",
          value: calculationString + ' ' + ': Receiving Fee Added for '+ '"' + quantityfee[i].itemName + '"',
        });
                 }
        
                 
               }
    else if (quantityfee[i].extVolume <= 500) {  
      
    if(quantityfee[i].rush == true)
     {
       var priceLevelName = 'Rush'
       feeAmount = findRate(basePrice, priceLevelName, quantityfee[i].extVolume);
       invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "description",
          value: '(1 x ' + feeAmount + ')' + ' ' + ': Receiving Fee Added for '+ '"' + quantityfee[i].itemName + '"',
        });
     }
      else if(quantityfee[i].rush == false)
     {
       var priceLevelName = 'Base Price'
       feeAmount = findRate(basePrice, priceLevelName, quantityfee[i].extVolume);
       invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "description",
          value: '(1 x ' + feeAmount + ')' + ' ' + ': Receiving Fee Added for '+ '"' + quantityfee[i].itemName + '"',
        });
     }
       
      invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "price",
          value:"-1",
        });

       invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
          value: 1,
        });
      
      invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "amount",
          value:  Math.abs(feeAmount),
        });

    // if(quantityfee[i].rush == true)
    //          {
    //             invoice_newRecord.setCurrentSublistValue({
    //       sublistId: "item",
    //       fieldId: "price",
    //       value:"24",
    //     });      
    //          }
              invoice_newRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "isclosed",
          value: true,
        });
      
         }
    

               

            

        invoice_newRecord.commitLine({ sublistId: "item" });
             }
     }
           }
    
      var invoice_newRecord_save = invoice_newRecord.save();
      
log.debug({
                title: 'Debug Entry', 
                details: 'created : ' + itemRecFee
            });

///////////////CHANGING RECIEVING FEE ///////////////

      for(var i=0 ; i < itemRecFee.length ; i++)
        {
          record.submitFields({
    type: 'customrecord_kb_warehouse_custom_item_re',
    id: itemRecFee[i],
    values: {
        'custrecord_kb_receiving_fee_billed': '1'
    }
});
        }
      
 
    }
  }






  return {
    afterSubmit: afterSubmit,
  
  };
});