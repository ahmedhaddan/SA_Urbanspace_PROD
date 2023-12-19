/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/runtime', 'N/search' ],

function(record, runtime, search) {


	function beforeLoad(scriptContext) {
		try {
			var sform = scriptContext.form 
			
		} catch (error) {
			log.error(error.name, 'msg: ' + error.message + ' stack: '
					+ error.stack);
		}
	}

	function beforeSubmit(scriptContext) {
		try {
			if (scriptContext.type != scriptContext.UserEventType.DELETE) {
				createPO(scriptContext);
			}
		} catch (error) {
			log.error(error.name, 'msg: ' + error.message + ' stack: '
					+ error.stack);
		}
	}

	function createPO(scriptContext) {
		var sales_order = scriptContext.newRecord;		
		var so_customer = sales_order.getValue({
			fieldId:'entity'
		});		

		var line_count = sales_order.getLineCount({
			sublistId : 'item'
		});


		for (var i = 0; i < line_count; i++) {
				var temp= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'item',
				line : i
			});
				var item_create_po= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_nsts_create_po',
				line : i
			});

				var item_linkedpo= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_nsts_linked_po',
				line : i
			});

				var tmpPrefVend= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_kb_preferred_vendor',
				line : i
			});
				var itemQuantity= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'quantity',
				line : i
			});
				var itemAmt= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'amount',
				line : i
			});
				var item_ship_to= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'shipaddress',
				line : i
			});
				var item_ship_method= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'shipmethod',
				line : i
			});
				var item_location= sales_order.getSublistValue({
				sublistId : 'item',
				fieldId : 'location',
				line : i
			});
			var prefVendor='';
			prefVendor=getPrefVendor(temp);
          	// if(isEmpty(prefVendor.pVendor)){return;}
          	if(isEmpty(prefVendor.pVendor)){continue;}

			log.debug('Preferred Vendor:', prefVendor.pVendor);
			log.debug('TMP Preferred Vendor:', tmpPrefVend);

			if(item_create_po==true){
			 var newRecord = record.create({
                        type: record.Type.PURCHASE_ORDER,
                        isDynamic: false,
                    });
                    newRecord.setValue({
                        fieldId:'entity',
                        value:prefVendor.pVendor
                    })

                    newRecord.setValue({
                        fieldId:'shipto',
                        value:so_customer
                    })

                    newRecord.setValue({
                        fieldId:'shipaddresslist',
                        value:item_ship_to
                    })
                    newRecord.setValue({
                        fieldId:'shipmethod',
                        value:item_ship_method
                    })

                    /*newRecord.setValue({
                        fieldId:'location',
                        value:item_location
                    });*/

                        newRecord.setSublistValue({
                            sublistId:'item',
                            fieldId:'item',
                            line:0,
                            value:temp
                        })

                        newRecord.setSublistValue({
                            sublistId:'item',
                            fieldId:'quantity',
                            line:0,
                            value:itemQuantity
                        })
 

                 if(!item_linkedpo){
                  var poid=newRecord.save();
                  log.debug('poid',poid);

                  if(poid){
                  	sales_order.setSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_nsts_linked_po',
						line : i,
						value:poid
					});
					sales_order.setSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_nsts_create_po',
						line : i,
						value:false
					});
                  }
              }

			}
	

		};

	}

	function getPrefVendor(tmp){
 

			var tierPriceSearch = search.create({
			   type: "item",
			   filters:
			   [
			      ["internalidnumber","equalto",tmp]
			   ],
			   columns:
			   [
				  search.createColumn({name: "itemid", label: "Item"}),
			      search.createColumn({name: "salesdescription", label: "Description"}),
			      search.createColumn({name: "othervendor", label: "Preferred Vendor"})
			   ]
			});

			tierPriceSearch.run().each(function(result) {
				log.debug('SearchResult', result)
	            pVendor = result.getValue({
	                name: 'othervendor'
	                });
	            return true;
	        });

		return {
	        pVendor: pVendor
	    };
	}

	function onlyUnique(value, index, self) { 
	    return self.indexOf(value) === index;
	}

	function afterSubmit(scriptContext) {
		try {
		} catch (error) {
			log.error(error.name, 'msg: ' + error.message + ' stack: '
					+ error.stack);
		}
	}
	function isEmpty(value) {
                if (value === null) {
                    return true;
                } else if (value === undefined) {
                    return true;
                } else if (value === '') {
                    return true;
                } else if (value === ' ') {
                    return true;
                } else if (value === 'null') {
                    return true;
                } else {
                    return false;
                }
            }

	return {
		beforeLoad : beforeLoad,
		beforeSubmit : beforeSubmit,
		afterSubmit : null,
		createPO:createPO
	};

});