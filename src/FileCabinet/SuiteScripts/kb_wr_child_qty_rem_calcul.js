/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', 'N/format'], function (log, record, search, format) {

  function beforeSubmit(context) {
     if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {

 var currentRecord = context.newRecord;

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
  }


  return {
    beforeSubmit: beforeSubmit
  };

});
