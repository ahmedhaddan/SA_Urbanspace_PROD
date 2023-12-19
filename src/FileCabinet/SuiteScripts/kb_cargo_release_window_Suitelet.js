/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["N/ui/serverWidget", "N/record", "N/format", "N/https", "N/url", "N/redirect", "N/log", "N/cache"], function (
    serverWidget,
    record,
    format,
    https,
    url,
    redirect,
    log,
    cache
) {
    function onRequest(context) {
        if (context.request.method === "GET") {
            // Retrieve parameters from the URL
            var recordId = context.request.parameters.param1;
            var recordtype = context.request.parameters.param2;
            var recordItemArray = context.request.parameters.param3;
            var userId = context.request.parameters.param4;
            var recordWRNum = context.request.parameters.param5;
            var recordClient = context.request.parameters.param6;
            var recordProject = context.request.parameters.param7;

            // Parse the item array
            var listItem = recordItemArray.split(',');
            log.debug('Debug Entry', 'size of data: ' + recordItemArray);
            var listItemArray = JSON.parse(listItem);
            log.debug('Debug Entry', 'size of data: ' + JSON.stringify(listItemArray));

            // Create the form
            var form = serverWidget.createForm({ title: "Cargo Release", hideNavBar: true });

            // Add fields to the form
            // ... (your existing code for adding fields)

            var itemObjectTextField = form.addField({
                id: "custpage_item_obj",
                type: serverWidget.FieldType.RICHTEXT,
                label: "itemObj",
              });
             
        
               itemObjectTextField.defaultValue = JSON.stringify(listItemArray);
              itemObjectTextField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
                var recordIdField = form.addField({
                id: "custpage_recordid",
                type: serverWidget.FieldType.TEXT,
                label: "RecordID",
              });
        recordIdField.defaultValue = recordId;
               recordIdField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
              
              var corgoClientField = form.addField({
                id: "custpage_client",
                type: serverWidget.FieldType.SELECT,
                label: "Client",
                source: "Customer"
              });
        
               corgoClientField.defaultValue = recordClient;
              corgoClientField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        
              var cargoProjectField = form.addField({
                id: "custpage_project",
                type: serverWidget.FieldType.SELECT,
                label: "Project",
                source:'customrecord_cseg_kb_projects'
              });
               cargoProjectField.defaultValue = recordProject;
           cargoProjectField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
              
        
              var cargoWrNumField = form.addField({
                id: "custpage_wr_number",
                type: serverWidget.FieldType.TEXT,
                label: "WR#"
              });
        
              cargoWrNumField.defaultValue = recordWRNum;
               cargoWrNumField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        
              var cargoReleasByField = form.addField({
                id: "custpage_rel_by",
                type: serverWidget.FieldType.SELECT,
                label: "Released By",
                source : "Employee"
               
              });
        
                    cargoReleasByField.defaultValue = userId;
        
               cargoReleasByField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        
        
              var sublist = form.addSublist({
                id: 'custpage_cargo_sublist',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Client Items'
              });
        
              var itemIsRel = sublist.addField({
                id: 'custpage_release_check',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Release'
              });
        
              itemIsRel.isMandatory = true;
        
              var itemField = sublist.addField({
                id: 'custpage_item',
                type: serverWidget.FieldType.TEXT,
                label: 'Item'
              });
        
             
        
        itemField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
              
        
        
            
        
            var itemProgress =  sublist.addField({
                id: 'custpage_release_status',
                type: serverWidget.FieldType.SELECT,
                label: 'Status',
                source: "customlist_kb_progress_status"
              });
        
              itemProgress.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
              
        
             var itemQuantity = sublist.addField({
                id: 'custpage_qty',
                type: serverWidget.FieldType.INTEGER,
                label: 'Qty'
              });
        
              
              itemQuantity.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
            var itemRelQuantity =  sublist.addField({
                id: 'custpage_qty_release',
                type: serverWidget.FieldType.INTEGER,
                label: 'Qty to Release'
              });
        
        
              itemRelQuantity.isMandatory = true;
        
              /////////////////SUBLIST H L W ///////////////////////////////////////////////////////////
              
              var itemL = sublist.addField({
                id: 'custpage_item_length',
                type: serverWidget.FieldType.FLOAT,
                label: 'L'
              });
        itemL.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
              var itemW = sublist.addField({
                id: 'custpage_item_width',
                type: serverWidget.FieldType.FLOAT,
                label: 'W'
              });
              itemW.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        
              var itemH = sublist.addField({
                id: 'custpage_item_height',
                type: serverWidget.FieldType.FLOAT,
                label: 'H'
              });
              itemH.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
              
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
             var itemBIN = sublist.addField({
                id: 'custpage_bin',
                type: serverWidget.FieldType.SELECT,
                label: 'BIN',
                source: "customlist_kb_lot_numbers"
              });
        
               
              itemBIN.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        var cargoItemArry = [];
var mergedMap = {};

for (var i = 0; i < listItemArray.length; i++) {
  var currentItem = listItemArray[i];
  var key = currentItem.itemBin + "_" + currentItem.itemName;

  if (mergedMap[key]) {
    mergedMap[key].itemQty += parseInt(currentItem.itemQty);
  } else {
    mergedMap[key] = { 
      itemName: currentItem.itemName,
      itemStatus: currentItem.itemStatus,
      itemQty: parseInt(currentItem.itemQty),
      itemBin: currentItem.itemBin,
      itemRel: currentItem.itemRel,
      itemL: currentItem.itemLen,
    itemW : currentItem.itemWid,
    itemH: currentItem.itemHei,
    };
  }
}

for (var key in mergedMap) {
  cargoItemArry.push(mergedMap[key]);
}

      for (var i=0 ; i<cargoItemArry.length ; i++)
        {
          sublist.setSublistValue({
    id: 'custpage_item_length',
    line: i,
    value: cargoItemArry[i].itemL,
  });
          sublist.setSublistValue({
    id: 'custpage_item_width',
    line: i,
    value: cargoItemArry[i].itemW,
  });
          sublist.setSublistValue({
    id: 'custpage_item_height',
    line: i,
    value: cargoItemArry[i].itemH,
  });
         
           sublist.setSublistValue({
    id: 'custpage_item',
    line: i,
    value: cargoItemArry[i].itemName,
  });
           sublist.setSublistValue({
    id: 'custpage_qty',
    line: i,
    value: cargoItemArry[i].itemQty.toString(),
  });
               sublist.setSublistValue({
    id: 'custpage_release_status',
    line: i,
    value: cargoItemArry[i].itemStatus,
  });
          if(cargoItemArry[i].itemBin != "" )
          {
          sublist.setSublistValue({
    id: 'custpage_bin',
    line: i,
    value: cargoItemArry[i].itemBin,
  });
          }
          
        }
            // Add the sublist to the form
            // ... (your existing code for adding the sublist)

            // Process the item array and set sublist values
            // ... (your existing code for processing the item array)

            // Cache the item array
            var myCache = cache.getCache({
                name: 'myLargeDataCache',
                scope: cache.Scope.PRIVATE
            });
            myCache.put({
                key: 'myLargeDataKey',
                value: JSON.stringify(listItemArray),
                ttl: 300
            });


                 
      form.addSubmitButton({ label: "Next", container: 'billdate' });
      


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

            // Add buttons and scripts to the form
            // ... (your existing code for adding buttons and scripts)

            context.response.writePage(form);
        } else {
            try {
                
                    log.debug({
                    title: 'Debug Entry', 
                    details: 'INITIATED CORRECT ' 
                });
                      var ClientId = context.request.parameters.custpage_client;
                      var WrNum = context.request.parameters.custpage_wr_number;
                      var itemObj = context.request.parameters.custpage_item_obj;
                      var sublist = context.request.parameters.sublistValue;
                      var postRecordId = context.request.parameters.custpage_recordid;
                      var projectName = context.request.parameters.custpage_project;
                
                    var myCache = cache.getCache({
                          name: 'myLargeDataCache',
                          scope: cache.Scope.PRIVATE
                      });
                      var myLargeDataString = myCache.get({
                          key: 'myLargeDataKey'
                      });
                      var myLargeDataObject = JSON.parse(myLargeDataString);
                
                   
                        // Retrieve the sublist values using the getSublistValue() method
                  var sublistValues = [];
                  var lineCount = context.request.getLineCount({
                    group: 'custpage_cargo_sublist' // Sublist internal ID
                  });
                   
                      var  isTrue = false;
                 
                  for (var line = 0; line < lineCount; line++) {
                     
                
                    var itemObjPost = {
                      itemName : context.request.getSublistValue({group: 'custpage_cargo_sublist', name: 'custpage_item',line: line}) ,
                      itemReleaseCheck : context.request.getSublistValue({group: 'custpage_cargo_sublist', name: 'custpage_release_check',line: line})  ,
                      itemRelQty : context.request.getSublistValue({group: 'custpage_cargo_sublist', name: 'custpage_qty_release',line: line})  ,
                      itemLength : context.request.getSublistValue({group: 'custpage_cargo_sublist', name: 'custpage_item_length',line: line})  ,
                      itemWidth : context.request.getSublistValue({group: 'custpage_cargo_sublist', name: 'custpage_item_width',line: line})  ,
                      itemHeigth : context.request.getSublistValue({group: 'custpage_cargo_sublist', name: 'custpage_item_height',line: line}) ,
                      itemBin : context.request.getSublistValue({group: 'custpage_cargo_sublist', name: 'custpage_bin',line: line}) ,
                    }
                    if(itemObjPost.itemReleaseCheck == 'T')
                    {
                      isTrue = true;
                    }
                
                    sublistValues.push(itemObjPost);
                  }
                
                         
              
                      
                   if (!isTrue) {
                         var html =  '<script> alert("No Item Selected, Please select at least one item to release ")</script><script> opener.location.reload(); window.close() </script>';
                          context.response.write({ output: html });
                     return;
                     
                    }
               //   var sublistValueText = JSON.stringify(sublistValues)

              var cacheKey = 'sublistDataKey'; // Choose a unique key for your data
var myCache = cache.getCache({
    name: 'myLargeDataCache',
    scope: cache.Scope.PUBLIC
});
myCache.put({
    key: cacheKey,
    value: JSON.stringify(sublistValues),
    ttl: 900 // Time-to-live in seconds. Adjust as needed.
});
              var cachedValue = myCache.get({
    key: cacheKey
});
                  log.debug({
                    title: 'Debug Entry', 
                    details: 'Value is: ' + cachedValue
                });
                    
                   
                        log.debug({
                    title: 'Debug Entry', 
                    details: 'here is done: '
                });
                
                // Handle POST request
                // Retrieve parameters from the request
                // ... (your existing code for retrieving parameters)

                // Process the sublist values
                // ... (your existing code for processing the sublist values)

                // Redirect to another Suitelet
                var redirectUrl = "/app/site/hosting/scriptlet.nl?script=666&deploy=1" +
                    "&param1=" + encodeURIComponent(ClientId) +
                    "&param2=" + encodeURIComponent(WrNum) +
                    "&param4=" + encodeURIComponent(cacheKey) +
                    "&param5=" + encodeURIComponent(postRecordId) +
                    "&param6=" + encodeURIComponent(projectName);

             // sublistValueText
                redirect.redirect({
                    url: redirectUrl
                });

                context.response.write('Success!');
            } catch (error) {
                context.response.write('Error: ' + error.message);
            }
        }
    }

    return {
        onRequest: onRequest
    };
});
