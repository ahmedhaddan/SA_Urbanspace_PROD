define([
  "N/currentRecord",
  "N/ui/dialog",
  "N/record",
  "N/ui/message",
  "N/search",
], function (currentRecord, dialog, record, message, search) {
  function myFunc() {
    var confirmMsg = confirm("Are you sure you want to delete related records?");
    if (confirmMsg) {
      window.location.reload();

      var warehouseReceipt_Record = currentRecord.get();
      var warehouseReceipt_Record_Id = warehouseReceipt_Record.id;
      var warehouseReceipt_Record_type = warehouseReceipt_Record.type;

      log.debug({
        title: "Debug Entry",
        details: "launched",
      });

      // SALES ORDER SEARCH
      var salesOrderSearch = search.create({
        type: search.Type.SALES_ORDER,
        filters: [
          ["custbody_sa_trns_fld_wr", "anyof", warehouseReceipt_Record_Id],
        ],
        columns: [{ name: "internalid" }],
      });

      console.log(salesOrderSearch);

      salesOrderSearch.run().each(function (result) {
        var internalId = result.getValue({ name: "internalid" });
        deleteRecord(record.Type.SALES_ORDER, internalId);
        return true; // Continue iteration
      });

    }
  }

  function deleteRecord(recordType, internalId) {
    return new Promise(function (resolve, reject) {
      record.delete({
        type: recordType,
        id: internalId,
        success: function () {
          console.log(internalId + " deleted");
          resolve();
        },
        error: function (e) {
          console.log("Error deleting record: " + internalId);
          reject(e);
        },
      });
    });
  }

  return {
    onButtonClick: myFunc,
  };
});
