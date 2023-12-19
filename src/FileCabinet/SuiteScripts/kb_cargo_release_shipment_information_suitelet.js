/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["N/ui/serverWidget", "N/record", "N/format", "N/log", "N/runtime", "N/search", "N/cache"], function (
    serverWidget,
    record,
    format,
    log,
    runtime,
    search,
  cache
) {

    function convertDateStringToDate(dateString) {
        var dateParts = dateString.split('/');
        var month = parseInt(dateParts[0], 10);
        var day = parseInt(dateParts[1], 10);
        var year = parseInt(dateParts[2], 10);

        return new Date(year, month - 1, day);
    }

    function onRequest(context) {
        if (context.request.method === "GET") {
            var ClientId = context.request.parameters.param1;
            var WrNum = context.request.parameters.param2;
          //  var getAllitemString = context.request.parameters.param4;
            var recordId = context.request.parameters.param5;
            var projectName = context.request.parameters.param6;
          // var getAllitemObj = JSON.parse(getAllitemString);

           var cacheKey = 'sublistDataKey';
            var myCache = cache.getCache({
                name: 'myLargeDataCache',
                scope: cache.Scope.PUBLIC
            });
            var cachedValue = myCache.get({
                key: cacheKey
            });
            var getAllitemObj = JSON.parse(cachedValue);
            var getAllitemObjReleased = [];

          myCache.remove({
    key: cacheKey
});

         
log.debug({
                title: 'Debug Entry',
                details: 'cache is: ' + cachedValue
            });
          /////////////////////////////////////////////////////

            // Filter by true released item
            getAllitemObj.forEach(function (item) {
                if (item.itemReleaseCheck === "T") {
                    var found = false;
                    for (var i = 0; i < getAllitemObjReleased.length; i++) {
                        if (getAllitemObjReleased[i].itemName === item.itemName && getAllitemObjReleased[i].itemBin === item.itemBin) {
                            found = true;
                            getAllitemObjReleased[i].itemRelQty = String(Number(getAllitemObjReleased[i].itemRelQty) + Number(item.itemRelQty));
                            break;
                        }
                    }

                    if (!found) {
                        getAllitemObjReleased.push(item);
                    }
                }
            });

            log.debug({
                title: 'Debug Entry',
                details: 'item obj is: ' + JSON.stringify(getAllitemObjReleased)
            });

            var form = serverWidget.createForm({ title: "Shipment Information ", hideNavBar: true });

            var cargoRecordIdField = form.addField({
                id: "custpage_recordid",
                type: serverWidget.FieldType.TEXT,
                label: "Record ID",
            });

            cargoRecordIdField.defaultValue = recordId;
            cargoRecordIdField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            var cargoClientField = form.addField({
                id: "custpage_client",
                type: serverWidget.FieldType.SELECT,
                label: "Client",
                source: "Customer"
            });

            cargoClientField.defaultValue = ClientId;
            cargoClientField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var cargoProjectField = form.addField({
                id: "custpage_project",
                type: serverWidget.FieldType.SELECT,
                label: "Project",
                source: 'customrecord_cseg_kb_projects'
            });

            cargoProjectField.defaultValue = projectName;

            var cargoWrNumField = form.addField({
                id: "custpage_wr_num",
                type: serverWidget.FieldType.TEXT,
                label: "WR#",
            });

            cargoWrNumField.defaultValue = WrNum;
            cargoWrNumField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var cargoReleasByField = form.addField({
                id: "custpage_charge",
                type: serverWidget.FieldType.CURRENCY,
                label: "Charge",
            });

            var cargoTrackNum = form.addField({
                id: 'custpage_track_quote',
                type: serverWidget.FieldType.TEXT,
                label: 'Tracking # / Quote #'
            });

            var cargoTruckComp = form.addField({
                id: 'custpage_truck_company',
                type: serverWidget.FieldType.SELECT,
                label: 'Truck Company',
                source: 'customlist_sa_cr_trck_co_lst'
            });

            var cargoEmployee = form.addField({
                id: 'custpage_employee_list',
                type: serverWidget.FieldType.SELECT,
                label: 'Release By',
                source: 'employee'
            });

            cargoEmployee.defaultValue = runtime.getCurrentUser().id;

            var currentDate = new Date();

            var releaseDate = form.addField({
                id: 'custpage_release_date',
                type: serverWidget.FieldType.DATE,
                label: 'Release Date',
            });

            releaseDate.defaultValue = currentDate;

            var sublist = form.addSublist({
                id: 'custpage_cargo_sublist',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Client Items'
            });

            sublist.addField({
                id: 'custpage_item',
                type: serverWidget.FieldType.TEXT,
                label: 'Item'
            });

            var cargoQtyRelease = sublist.addField({
                id: 'custpage_qty_release',
                type: serverWidget.FieldType.INTEGER,
                label: 'Qty to Release'
            });

            var ArrayStringField = form.addField({
                id: "custpage_itemarry",
                type: serverWidget.FieldType.RICHTEXT,
                label: "Item Array",
            });

            ArrayStringField.defaultValue = JSON.stringify(getAllitemObjReleased);
            ArrayStringField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            for (var i = 0; i < getAllitemObjReleased.length; i++) {
                log.debug({
                    title: 'Debug Entry',
                    details: 'my array is: ' + getAllitemObjReleased[i].itemRelQty
                });

                sublist.setSublistValue({
                    id: 'custpage_item',
                    line: i,
                    value: getAllitemObjReleased[i].itemName,
                });

                sublist.setSublistValue({
                    id: 'custpage_qty_release',
                    line: i,
                    value: parseInt(getAllitemObjReleased[i].itemRelQty).toString().split('.')[0],
                });
            }

            form.addSubmitButton({ label: "Submit", container: 'billdate' });

            form.addButton({
                id: 'custpage_back',
                label: 'Back',
                functionName: 'onBackClick'
            });
            form.addButton({
                id: 'custpage_cancel',
                label: 'Cancel',
                functionName: 'onCancelClick'
            });

            var inlineScript = form.addField({
                id: 'custpage_inline_script',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Inline Script'
            });

            inlineScript.defaultValue = '<script>function onCancelClick() { window.close(); }</script>';

            var inlineScriptBack = form.addField({
                id: 'custpage_inline_script_back',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Inline Script Back'
            });

            inlineScriptBack.defaultValue = '<script>function onBackClick() { window.history.back(); }</script>';

            context.response.writePage(form);

        } else {
            var postRecordID = context.request.parameters.custpage_recordid;
            var releaseditemArrayString = context.request.parameters.custpage_itemarry;
            var shipCharge = context.request.parameters.custpage_charge;
            var shipTrackingNum = context.request.parameters.custpage_track_quote;
            var shipTruck = context.request.parameters.custpage_truck_company;
            var releaseDatePost = context.request.parameters.custpage_release_date;

            var charged = false;
            var releaseditemArrayObj = JSON.parse(releaseditemArrayString);

            // ... (rest of your POST logic)
            var WrfieldLookUp = search.lookupFields({
                type: 'customrecord_kb_warehouse_re',
                id: postRecordID,
                columns: ['custrecord_kb_wr_number']
            });
            
              var warehouseChild_CustomSearchList = search.create({
                    type: "customrecord_kb_warehouse_re",
                    filters: [
                      ["internalid", "anyof", postRecordID],
                    ],
                    columns: [
                      { name: "custrecord_kb_wr_number" },
                    ],
                  });
            
                  var warehouseChild_CustomSearchResult = warehouseChild_CustomSearchList.runPaged({ pageSize: 10 });
                  var warehouseChild_CustomSearchCount = warehouseChild_CustomSearchResult.count;
                  var warehouseChild_CustomSearchListResult = warehouseChild_CustomSearchList.run().getRange({ start: 0, end: 10 });
            
                  var wrNumber = warehouseChild_CustomSearchListResult[0].getValue({ name: "custrecord_kb_wr_number" })
            
                     var warehouse_List = search.create({
                    type: "customrecord_kb_warehouse_custom_item_re",
                 filters: [
                      ["custrecord_kb_wh_receipt_link", "anyof", postRecordID],
                    ],
                  });
                  var warehouse_Result = warehouse_List.runPaged({ pageSize: 1000 });
                  var warehouse_Count = warehouse_Result.count;
            
                      for(var i = 0 ; i < releaseditemArrayObj.length  ; i++)
                      {
                        var whRecordChild = record.create({
                   type: 'customrecord_kb_warehouse_custom_item_re',
                   isDynamic: true                       
               });
                        
                 whRecordChild.setValue({
                fieldId: 'custrecord_kb_progress_status',
                value: '2' ,
                ignoreFieldChange: true
            });
                     whRecordChild.setValue({
                fieldId: 'custrecord_kb_wh_item',
                value: releaseditemArrayObj[i].itemName,
                ignoreFieldChange: true
            });
                        ////////////////DATE UPDATE ///////////////////
            
                        whRecordChild.setValue({
                fieldId: 'custrecord_kb_action_date',
                value: convertDateStringToDate(releaseDatePost) ,
                ignoreFieldChange: true
            });
                        //////////////////////////////////
                    whRecordChild.setValue({
                fieldId: 'custrecord_kb_wh_quantity',
                value: '-' + releaseditemArrayObj[i].itemRelQty, 
                ignoreFieldChange: true
            });
                          whRecordChild.setValue({
                fieldId: 'custrecord_kb_wh_receipt_link',
                value: postRecordID,
                ignoreFieldChange: true
            });
                     
                          whRecordChild.setValue({
                fieldId: 'custrecord_sa_wr_type',
                value: '2',
                ignoreFieldChange: true
            });
                    
              whRecordChild.setValue({
                fieldId: "custrecord_sa_cr_no",
                value:  "CR-" + wrNumber +  "-" + (warehouse_Count + 1 + i) ,
                ignoreFieldChange: true
            });
                        if(charged == false)
                        {
                         whRecordChild.setValue({
                fieldId: "custrecord_sa_cr_chrg",
                value: shipCharge  ,
                ignoreFieldChange: true
            });
                    charged = true ;
                        }
            
                        
            
                          whRecordChild.setValue({
                fieldId: "custrecord_sa_trck_co",
                value: shipTruck  ,
                ignoreFieldChange: true
            });
                          whRecordChild.setValue({
                fieldId: "custrecord_sa_cr_trck_no",
                value: shipTrackingNum  ,
                ignoreFieldChange: true
            });
            
            //////////////////////////////////Set VOlume item /////////////////////////////////////
                          whRecordChild.setValue({
                fieldId: "custrecord_kb_wh_length",
                value: releaseditemArrayObj[i].itemLength ,
                ignoreFieldChange: true
            });
                        whRecordChild.setValue({
                fieldId: "custrecord_kb_wh_width",
                value: releaseditemArrayObj[i].itemWidth ,
                ignoreFieldChange: true
            });
                        whRecordChild.setValue({
                fieldId: "custrecord_kb_wh_height",
                value: releaseditemArrayObj[i].itemHeigth ,
                ignoreFieldChange: true
            });
                         whRecordChild.setValue({
                fieldId: "custrecord_kb_bin",
                value: releaseditemArrayObj[i].itemBin ,
                ignoreFieldChange: true
            });
            
                       
            
                   var savedrec = whRecordChild.save()
            
                        
                var newFeatureRecord = record.load({
                type: 'customrecord_kb_warehouse_custom_item_re',
                   id: savedrec,
                   isDynamic: true                       
               });
                       newFeatureRecord.save() 
                      
                    
                        
                      }

            var html = '<script> opener.location.reload(); window.close() </script>';
            context.response.write({ output: html });
        }
    }

    return {
        onRequest: onRequest,
    };
});
