/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/search','N/currentRecord'], function(search,currentRecord) {

    function fieldChanged(context) {
        // This function is executed when a field value changes on the Suitelet form.
        if (context.fieldId === 'custpage_customer') {
          var suitelet_record = context.currentRecord; 
            var warehouseReceipt_suitelet_customer = suitelet_record.getValue({
            fieldId: "custpage_customer",
        });
var warehouseChild_CustomSearchList = search.create({
            type: "customrecord_kb_warehouse_re",
            filters: [["custrecord_kb_warehouse_customer", "anyof", warehouseReceipt_suitelet_customer]],
            columns: ['internalid', 'custrecord_kb_wr_number'],
        });

        var warehouseChild_CustomSearchResult = warehouseChild_CustomSearchList.runPaged({ pageSize: 1000 });
        var customerInternalId = [];

        warehouseChild_CustomSearchResult.pageRanges.forEach(function (pageRange) {
            var page = warehouseChild_CustomSearchResult.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
        
              var internalId = result.getValue({ name: "internalid" });
        var wrNumber = result.getValue({ name: "custrecord_kb_wr_number" });

        customerInternalId.push({
            internalId: internalId,
            custrecord_kb_wr_number: wrNumber
        });
                
            });
        });

          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

          ////Extract 
var internalIdValues = customerInternalId.map(function(item) {
    return item.internalId;
});
        // Create a search on the customer record with the specified internal ID
        var customerSearch = search.create({
            type: 'customrecord_kb_warehouse_custom_item_re',
            filters: [
                // Filter for custrecord_kb_wh_receipt_link field values
                ['custrecord_kb_wh_receipt_link', 'anyof', internalIdValues],
                'AND',
                // Filter for custrecord_sa_wr_type field value
                ['custrecord_kb_progress_status', 'is', '1']
            ],
            columns: [
                'custrecord_kb_wh_item',
                'custrecord_kb_wh_quantity',
              'custrecord_kb_wh_receipt_link',
              'custrecord_kb_wh_length',
              'custrecord_kb_wh_width',
              'custrecord_kb_wh_height',
              'custrecord_kb_progress_status',
              'custrecord_kb_bin'
            ]
        });

          var internalIdToWrNumberMap = {};
customerInternalId.forEach(function(item) {
    internalIdToWrNumberMap[item.internalId] = item.custrecord_kb_wr_number;
});

        // Execute the search and process results
        var searchResults = [];
        customerSearch.run().each(function(result) {
            // Get the required values from the search result
              var internalIdValue = result.getValue({ name: 'custrecord_kb_wh_receipt_link' });

            var itemValue = result.getValue({
                name: 'custrecord_kb_wh_item'
            });
            var quantityValue = result.getValue({
                name: 'custrecord_kb_wh_quantity'
            });

          var linkValue = result.getValue({
                name: 'custrecord_kb_wh_receipt_link'
            });
          var lengthValue = result.getValue({
                name: 'custrecord_kb_wh_length'
            });
          var widthValue = result.getValue({
                name: 'custrecord_kb_wh_width'
            });
          var heightValue = result.getValue({
                name: 'custrecord_kb_wh_height'
            });

           var ProgressStatusValue = result.getValue({
                name: 'custrecord_kb_progress_status'
            });
           var BinValue = result.getValue({
                name: 'custrecord_kb_bin'
            });
           var wrNumber = internalIdToWrNumberMap[internalIdValue];

            // Push the result as an object to the searchResults array
            searchResults.push({
                item: itemValue,
                quantity: quantityValue,
               link : linkValue,
              length : lengthValue,
              width : widthValue,
              height: heightValue ,
              status : ProgressStatusValue,
              bin : BinValue,
              wrNumber: wrNumber,
            });

            return true;  // Continue processing additional search results, if available
        });


          console.log(JSON.stringify(searchResults))
        // var sublist = context.currentRecord.getSublist({ sublistId: 'custpage_cargo_sublist' });

          var lineCount = suitelet_record.getLineCount({ sublistId: 'custpage_cargo_sublist' });
        for (var i = lineCount - 1; i >= 0; i--) {
            suitelet_record.removeLine({
                sublistId: 'custpage_cargo_sublist',
                line: i,
                ignoreRecalc: true // Optional, set to true for performance improvement if recalculation is not needed
            });
        }
          
          for (var i = 0; i < searchResults.length ; i++) {
               suitelet_record.selectLine({ sublistId: 'custpage_cargo_sublist', line: i });
            suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_item',
                value: searchResults[i].item
            });
            suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_wrnumber',
                value: searchResults[i].wrNumber
            });
            

            suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_qty',
                value: searchResults[i].quantity
            });

             suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_release_status',
                value: searchResults[i].status
            });

             suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_link',
                value: searchResults[i].link
            });

              suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_length',
                value: searchResults[i].length
            });

              suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_width',
                value: searchResults[i].width
            });

              suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_heigth',
                value: searchResults[i].height
            });

            suitelet_record.setCurrentSublistValue({
                sublistId: 'custpage_cargo_sublist',
                fieldId: 'custpage_bin',
                value: searchResults[i].bin
            });
            
            
            suitelet_record.commitLine({ sublistId: 'custpage_cargo_sublist' });
            
            }

           




          
        }
    }


    return {

        fieldChanged: fieldChanged,
      
    };
});
