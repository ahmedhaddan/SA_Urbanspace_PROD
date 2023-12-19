define([
    "N/currentRecord",
    "N/ui/dialog",
    "N/record",
    "N/ui/message",
    "N/search",
    "N/runtime"
], function (currentRecord, dialog, record, message, search, runtime) {
    function callSuitelet() {
        // Get current record details
        var warehouseReceipt_Record = currentRecord.get();
        var warehouseReceipt_Record_Id = warehouseReceipt_Record.id;
        var warehouseReceipt_Record_type = warehouseReceipt_Record.type;
        var userId = runtime.getCurrentUser().id;

        // Get processing status value
        var warehouseReceipt_Record_processing = warehouseReceipt_Record.getValue({
            fieldId: "custrecord_kb_receipt_processing_status",
        });

        // Lookup fields from the current record
        var warehouseReceipt_fieldLookUp = search.lookupFields({
            type: warehouseReceipt_Record_type,
            id: warehouseReceipt_Record_Id,
            columns: [
                "custrecord_kb_wr_number",
                "custrecord_kb_warehouse_customer",
                'custrecord_kb_wr_project'
            ],
        });

        console.log(warehouseReceipt_fieldLookUp);

        // Extract values from the lookup results
        try {
            var warehouseReceipt_Record_WR_Num = warehouseReceipt_fieldLookUp["custrecord_kb_wr_number"];
            var warehouseReceipt_Record_Client = warehouseReceipt_fieldLookUp["custrecord_kb_warehouse_customer"][0].value;
            var warehouseReceipt_Record_project = warehouseReceipt_fieldLookUp["custrecord_kb_wr_project"][0].value;
        } catch (error) {
            console.error(error);
        }

        // Search for child records
        var warehouseChild_CustomSearchList = search.create({
            type: "customrecord_kb_warehouse_custom_item_re",
            filters: [["custrecord_kb_wh_receipt_link", "anyof", warehouseReceipt_Record_Id]],
            columns: [
                { name: "custrecord_kb_wh_item" },
                { name: "custrecord_kb_progress_status" },
                { name: "custrecord_kb_wh_quantity" },
                { name: "custrecord_kb_bin" },
                { name: "custrecord_kb_wh_length" },
                { name: "custrecord_kb_wh_width" },
                { name: "custrecord_kb_wh_height" },
            ],
        });

        var warehouseChild_CustomSearchResult = warehouseChild_CustomSearchList.runPaged({ pageSize: 1000 });
        var listItem = [];

        warehouseChild_CustomSearchResult.pageRanges.forEach(function (pageRange) {
            var page = warehouseChild_CustomSearchResult.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                if (result.getValue({ name: "custrecord_kb_progress_status" }) == '1') {
                    var itemObj = {
                        itemName: result.getValue({ name: "custrecord_kb_wh_item" }),
                        itemStatus: result.getValue({ name: "custrecord_kb_progress_status" }),
                        itemQty: result.getValue({ name: "custrecord_kb_wh_quantity" }),
                        itemBin: result.getValue({ name: "custrecord_kb_bin" }),
                        itemRel: false,
                        itemLen: result.getValue({ name: "custrecord_kb_wh_length" }),
                        itemWid: result.getValue({ name: "custrecord_kb_wh_width" }),
                        itemHei: result.getValue({ name: "custrecord_kb_wh_height" }),
                    };

                    listItem.push(itemObj);
                }
            });
        });

        // Convert the listItem array to a string
        var listItemString = JSON.stringify(listItem);
        console.log(listItemString);

        // Construct the Suitelet URL
        var suiteletURL =
            "/app/site/hosting/scriptlet.nl?script=665&deploy=1" +
            "&param1=" + encodeURIComponent(warehouseReceipt_Record_Id) +
            "&param2=" + encodeURIComponent(warehouseReceipt_Record_type) +
            "&param3=" + encodeURIComponent(listItemString) +
            "&param4=" + encodeURIComponent(userId) +
            "&param5=" + encodeURIComponent(warehouseReceipt_Record_WR_Num) +
            "&param6=" + encodeURIComponent(warehouseReceipt_Record_Client) +
            "&param7=" + encodeURIComponent(warehouseReceipt_Record_project);

        // Open the Suitelet in a new window
        window.open(suiteletURL, "_blank", "width=1250,height=850, menubar=no, scrollbars=no,titlebar=no,resizable=no,toolbar=no, top=200, left=150");
    }

    return {
        callSuitelet: callSuitelet,
    };
});
  
  