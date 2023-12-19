/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
 define(['N/ui/serverWidget','N/search','N/record','N/redirect'],

 function(serverWidget,search,record,redirect) {
 
     function onRequest(context) {
         if (context.request.method === 'GET') {
             // Create the form
             var form = serverWidget.createForm({
                 title: 'Custom Suitelet Form'
             });

           form.clientScriptModulePath = 'SuiteScripts/kb_cs_cargo_suitelet_field_change.js';

           
             // Add fields to the main page of the form
            var customerDropdown = form.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.SELECT,
            label: 'Select a Customer'
        });


           var customerSearch = search.create({
    type: 'customrecord_kb_warehouse_re',
    columns: [
        search.createColumn({
            name: 'custrecord_kb_warehouse_customer',
            summary: search.Summary.GROUP
        })
    ],
    filters: []
}).run().each(function(result) {
    customerDropdown.addSelectOption({
        value: result.getValue({
            name: 'custrecord_kb_warehouse_customer',
            summary: search.Summary.GROUP
        }),
        text: result.getText({
            name: 'custrecord_kb_warehouse_customer',
            summary: search.Summary.GROUP
        })
    });
    return true;
});

           var projectField = form.addField({
            id: 'custpage_project',
            type: serverWidget.FieldType.SELECT,
            label: 'Project', 
             source: 'customrecord_cseg_kb_projects'
        });


            var chargeField = form.addField({
            id: 'custpage_charge',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Charge'
        });
            var trakingNumberField = form.addField({
            id: 'custpage_traking_quote',
            type: serverWidget.FieldType.TEXT,
            label: 'TRAKING# / QUOTE#'
        });

            var truckCompanyField = form.addField({
            id: 'custpage_truck_company',
            type: serverWidget.FieldType.SELECT,
            label: 'TRUCK COMPANY',
              source: 'customlist_sa_cr_trck_co_lst'
        });
           var damageNoteField = form.addField({
             id: 'custpage_note',
             type:  serverWidget.FieldType.TEXTAREA,
             label: 'DAMAGE NOTE'
             
           })
             var releaseDateField = form.addField({
            id: 'custpage_release_date',
            type: serverWidget.FieldType.DATE,
            label: 'RELEASE DATE'
        });
        releaseDateField.defaultValue = new Date();  



           
           /////////////////SUBLIST FIELD //////////////////////////////////////////
           

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
        
              // itemIsRel.isMandatory = true;
        
              var itemField = sublist.addField({
                id: 'custpage_item',
                type: serverWidget.FieldType.TEXT,
                label: 'Item'
              });
        
             
        
        itemField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
             var WrNumberField = sublist.addField({
                id: 'custpage_wrnumber',
                type: serverWidget.FieldType.TEXT,
                label: 'WR-Number'
              });
        
             
        
        WrNumberField.updateDisplayType({
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
        
              // itemRelQuantity.isMandatory = true;

        var itemBin =  sublist.addField({
            id: 'custpage_bin',
            type: serverWidget.FieldType.SELECT,
            label: 'BIN',
            source: 'customlist_kb_lot_numbers'  
        });

                   
        itemBin.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

////////////////////HIDDEN SUBLIST FIELD /////////////////////////////////7


             var linkField = sublist.addField({
                id: 'custpage_link',
                type: serverWidget.FieldType.TEXT,
                label: 'Link'
              });
        
        linkField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });

           
            var lengthField = sublist.addField({
                id: 'custpage_length',
                type: serverWidget.FieldType.FLOAT,
                label: 'L'
              });

        // lengthField.updateDisplayType({
        //     displayType: serverWidget.FieldDisplayType.DISABLED
        // });

                var widthField = sublist.addField({
                id: 'custpage_width',
                type: serverWidget.FieldType.FLOAT,
                label: 'W'
              });

        // widthField.updateDisplayType({
        //     displayType: serverWidget.FieldDisplayType.DISABLED
        // });

              var heigthField = sublist.addField({
                id: 'custpage_heigth',
                type: serverWidget.FieldType.FLOAT,
                label: 'H'
              });

        // heigthField.updateDisplayType({
        //     displayType: serverWidget.FieldDisplayType.DISABLED
        // });

           

           


           
             form.addSubmitButton({ label: "Submit & New"});
           
             context.response.writePage(form);
         }

else{

        var customerValue = context.request.parameters.custpage_customer;
        var projectValue = context.request.parameters.custpage_project ;
        var chargeValue = context.request.parameters.custpage_wrnumber ;
        var trakingNumValue = context.request.parameters.custpage_traking_quote ;
        var truckCompValue = context.request.parameters.custpage_truck_company ;
        var noteValue =  context.request.parameters.custpage_note ;
        var relDateValue = context.request.parameters.custpage_release_date ;

        var checkedLinesData = [];  // Array to store the data of checked lines

        // Determine the line count for the sublist
        var lineCount = context.request.getLineCount({
            group: 'custpage_cargo_sublist'
        });

        // Iterate over each line
        for (var i = 0; i < lineCount; i++) {
            var releaseCheckValue = context.request.getSublistValue({
                group: 'custpage_cargo_sublist',
                name: 'custpage_release_check',
                line: i
            });

            // Check if the checkbox is checked
            if (releaseCheckValue === 'T') {
                // Create an object with all the values from the line
                var lineData = {
                    item: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_item', line: i }),
                    status: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_release_status', line: i }),
                    qty: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_qty', line: i }),
                    qtyRelease: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_qty_release', line: i }),
                    bin: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_bin', line: i }),
                    link: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_link', line: i }),
                    length: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_length', line: i }),
                    width: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_width', line: i }),
                    height: context.request.getSublistValue({ group: 'custpage_cargo_sublist', name: 'custpage_heigth', line: i })
                };

                // Push the object to the array
                checkedLinesData.push(lineData);
            }
        }

        // Now, the checkedLinesData array contains the data of all lines where the "Release" checkbox is checked
        log.debug('Checked Lines Data', JSON.stringify(checkedLinesData));

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

   for(var i = 0 ; i < checkedLinesData.length  ; i++)
                      {
                        var whRecordChild = record.create({
                   type: 'customrecord_kb_warehouse_custom_item_re',
                   isDynamic: true                       
               });

                        whRecordChild.setValue({
                fieldId: 'custrecord_sa_wr_type',
                value: '2' ,
                ignoreFieldChange: true
            });

                            whRecordChild.setValue({
                fieldId: 'custrecord_kb_wh_receipt_link',
                value: checkedLinesData[i].link,
                ignoreFieldChange: true
            });
                     
                        
                 whRecordChild.setValue({
                fieldId: 'custrecord_kb_progress_status',
                value: '2' ,
                ignoreFieldChange: true
            });
                     whRecordChild.setValue({
                fieldId: 'custrecord_kb_wh_item',
                value: checkedLinesData[i].item,
                ignoreFieldChange: true
            });
                          whRecordChild.setValue({
                fieldId: "custrecord_kb_bin",
                value: checkedLinesData[i].bin,
                ignoreFieldChange: true
            });
                      
                    whRecordChild.setValue({
                fieldId: 'custrecord_kb_wh_quantity',
                value: '-' + checkedLinesData[i].qtyRelease, 
                ignoreFieldChange: true
            });

             whRecordChild.setValue({
                fieldId: "custrecord_kb_wh_length",
                value: checkedLinesData[i].length ,
                ignoreFieldChange: true
            });
            whRecordChild.setValue({
                fieldId: "custrecord_kb_wh_width",
                value: checkedLinesData[i].width ,
                ignoreFieldChange: true
            });
            whRecordChild.setValue({
                fieldId: "custrecord_kb_wh_height",
                value: checkedLinesData[i].height ,
                ignoreFieldChange: true
            });
                      var  volume =  checkedLinesData[i].length *  checkedLinesData[i].width *  checkedLinesData[i].height ; 
                      var extVolume = volume * ('-' + checkedLinesData[i].qtyRelease)  ; 

                            whRecordChild.setValue({
                fieldId: "custrecord_kb_wh_volume",
                value: volume ,
                ignoreFieldChange: true
            });

                            whRecordChild.setValue({
                fieldId: "custrecord_kb_wh_extended_volume",
                value: extVolume ,
                ignoreFieldChange: true
            });
            
              whRecordChild.setValue({
                fieldId: "custrecord_sa_cr_no",
                value:  "CR-",
                ignoreFieldChange: true
            });
                        
                   whRecordChild.setValue({
                fieldId: "custrecord_sa_cr_trck_no",
                value: trakingNumValue  ,
                ignoreFieldChange: true
            });      
                        
              whRecordChild.setValue({
                fieldId: "custrecord_sa_trck_co",
                value: truckCompValue  ,
                ignoreFieldChange: true
            });

              whRecordChild.setValue({
                fieldId: "custrecord_sa_cr_chrg",
                value: chargeValue  ,
                ignoreFieldChange: true
            });
            
                   var savedrec = whRecordChild.save()
            
            ////////////////UPDATE WAREHOUSE///////////////////////////////            
                var wrParentRecord = record.load({
                type: 'customrecord_kb_warehouse_re',
                   id: checkedLinesData[i].link,     
                   isDynamic: true,
               });

                          wrParentRecord.setValue({
                fieldId: "custrecord_kb_receipt_processing_status",
                value: 4  ,
               ignoreFieldChange: true           
            });
                        
                       wrParentRecord.save() 
                      
                    
                        
                      }
  redirect.toSuitelet({
        scriptId: 'customscriptkb_sl_cargorrelease_path',
        deploymentId: 'customdeploy1'
    });
}
       
       
     }
 
     return {
         onRequest: onRequest
     };
 });
 