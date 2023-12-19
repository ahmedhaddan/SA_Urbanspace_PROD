/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["N/ui/serverWidget", "N/record", "N/format", "N/url"], function (serverWidget, record, format,url) {
function convertDateStringToDate(dateString) {
  var dateParts = dateString.split('/');
  var month = parseInt(dateParts[0], 10);
  var day = parseInt(dateParts[1], 10);
  var year = parseInt(dateParts[2], 10);

  return new Date(year, month - 1, day);
}
  
  function onRequest(context) {
    if (context.request.method === "GET") {
      // Retrieve the record ID from the URL parameters
      var recordId = context.request.parameters.param1;
      var recordtype = context.request.parameters.param2;
      var recordProcessing = context.request.parameters.param3;
      var oldDate = context.request.parameters.param4;

      

            var form = serverWidget.createForm({ title: "Please Enter Proforma Invoice Date : " , hideNavBar: true});

            var dateField = form.addField({
              id: "custpage_date",
              type: serverWidget.FieldType.DATE,
              label: "Select Date",
            });

   
   /////UPDATE /////////////////////////////////////////
      var oldDateField = form.addField({
              id: "custpage_olddate",
              type: serverWidget.FieldType.TEXT,
              label: "Old Date",
            });
            oldDateField.updateDisplayType({
          displayType : serverWidget.FieldDisplayType.HIDDEN
      });
      
      oldDateField.defaultValue = oldDate ;
           var recordIdField = form.addField({
              id: "custpage_recordid",
              type: serverWidget.FieldType.TEXT,
              label: "Record ID",
            });
            recordIdField.updateDisplayType({
          displayType : serverWidget.FieldDisplayType.HIDDEN
      });

         /////END UPDATE /////////////////////////////////////////
           var recordTypeField = form.addField({
              id: "custpage_recordtype",
              type: serverWidget.FieldType.TEXT,
              label: "Record Type",
            });
            recordTypeField.updateDisplayType({
          displayType : serverWidget.FieldDisplayType.HIDDEN
      });
      var recordProcessingField = form.addField({
              id: "custpage_recordprocess",
              type: serverWidget.FieldType.INTEGER,
              label: "Record Processing",
            });
            recordProcessingField.updateDisplayType({
          displayType : serverWidget.FieldDisplayType.HIDDEN
      });

            recordIdField.defaultValue = recordId ;
            recordTypeField.defaultValue = recordtype;
      recordProcessingField.defaultValue = recordProcessing;

           form.addSubmitButton({ label: "Submit", container: 'billdate' });

     context.response.writePage(form);

    } else {
      // POST request  
      var recordId = context.request.parameters.custpage_recordid;
      var recordtype = context.request.parameters.custpage_recordtype;
      var recordProcess = context.request.parameters.custpage_recordprocess
      var date = context.request.parameters.custpage_date;
      ///UPDATE //////////////
      var olddate = context.request.parameters.custpage_olddate; 



      if (convertDateStringToDate(date) < convertDateStringToDate(olddate)) {
    var errorMessage = "No item avalaible on this date, Please select a valid date";

    var html = '<script>alert("' + errorMessage + '"); window.history.back();</script>';
    context.response.write({ output: html });
    return; 
   }
      ///END UPDATE //////////////

        log.debug({
    title: 'Debug Entry', 
    details: 'date is :' + date
});
  var parsedDate = format.parse({
        value: date,
        type: format.Type.DATE,
      });

      var formattedDate = format.format({
        value: parsedDate,
        type: format.Type.DATE,
      });
      
      // Load the record
      var loadedRecord = record.load({
        type: recordtype,
        id: recordId,
      });
      
   loadedRecord.setValue({
         fieldId: "custrecord_kb_date_to_bill", 
         value: formattedDate.toString(),
       });
      // Set the field value
      loadedRecord.setValue({
        fieldId: "custrecord_kb_receipt_processing_status", 
        value: "3",
      });


      var html =  '<script> opener.location.reload(); window.close() </script>';

      context.response.write({ output: html });

      // Save the record
      var savedRecordId = loadedRecord.save();
 var SavedloadedRecord = record.load({
        type: recordtype,
        id: savedRecordId,
      });
      
   SavedloadedRecord.setValue({
        fieldId : 'custrecord_kb_receipt_processing_status',
        value:'',
      })
      SavedloadedRecord.save();

     

    }
  }

  return {
    onRequest: onRequest,
  };
});
