/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/task', 'N/runtime', 'N/search'],
	(record, task, runtime, search) => {

    // const afterSubmit = ({newRecord, type}) => {
    const afterSubmit = (scriptContext) => {
		try {
			if (runtime.executionContext == 'MAPREDUCE') return;
			if (scriptContext.type != 'delete') {
				createPO(scriptContext);
			}
		} catch (error) {
			log.error(error.message, error);
		}
    }


	const createPO = (scriptContext) => {
        try {
			   
			const {type, newRecord} = scriptContext;
			log.audit(`${type}`, `${newRecord.type}:${newRecord.id}`);

            const 
            sublistId = 'item',
            lineCount = newRecord.getLineCount({sublistId});
			let SalesOrder = newRecord;		
			let customer = SalesOrder.getValue('entity');	
            let department = SalesOrder.getValue('department');
            let salesrep = SalesOrder.getValue('salesrep');
            let itemId = newRecord.id;
            let SalesOrderLines = [];

            for (var line = 0; line < lineCount; line++) {

                let temp = SalesOrder.getSublistValue(sublistId, 'item', line);
				
                let item_create_po = SalesOrder.getSublistValue(sublistId, 'custcol_nsts_create_po', line);

                // let tmpPrefVend = SalesOrder.getSublistValue(sublistId, 'custcol_kb_preferred_vendor', line);

				let itemQuantity = SalesOrder.getSublistValue(sublistId, 'quantity', line);

                let itemAmt = SalesOrder.getSublistValue(sublistId, 'amount', line);

				let item_ship_to = SalesOrder.getSublistValue(sublistId, 'shipaddress', line);

                let item_ship_method = SalesOrder.getSublistValue(sublistId, 'shipmethod', line);

                let item_location = SalesOrder.getSublistValue(sublistId, 'location', line);

                

				var prefVendor = '';
					prefVendor = getPrefVendor(temp);
				
				if (isEmpty(prefVendor)) { continue; }

                log.debug(line, `item_create_po: ${item_create_po}, prefVendor: ${prefVendor}`);

                if (item_create_po && prefVendor) {
					let item_linkedpo = SalesOrder.getSublistValue(sublistId, 'custcol_nsts_linked_po', line);

                    log.debug('item_linkedpo', item_linkedpo);
                    if (!item_linkedpo) {                    
                        SalesOrderLines.push({
							supplier: prefVendor,
							customer,
                            department,
                            salesrep,
                            itemId,
							item: temp,
							itemQuantity, itemAmt, item_ship_to, item_ship_method, item_location,
                        });
                    }
                }
            }
            log.audit('Summary: SalesOrderLines', SalesOrderLines);

            if (SalesOrderLines.length > 0) {
                let SalesOrderData = {
                    salesorder: {
                        id: SalesOrder.id,
                        lines: SalesOrderLines
                    },
                }
                log.debug('SalesOrderData', SalesOrderData);

                let scriptTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_kb_create_po_mr',
                });
                    scriptTask.params = {
                        ['custscriptmr_salesorder_data']: SalesOrderData,   // Push to array
                    };
                let taskId = scriptTask.submit();
                let taskStatus = task.checkStatus(taskId);
                log.debug(taskStatus, taskId);
            }
            
        } catch (error) {
            log.error(error.message, error);
        }
    }

	
	const getPrefVendor = (tmp) => {
		var tierPriceSearch = search.create({
			type: "item",
			filters: [
				["internalidnumber","equalto",tmp]
			],
			columns: [
				search.createColumn({name: "itemid", label: "Item"}),
				search.createColumn({name: "salesdescription", label: "Description"}),
				search.createColumn({name: "othervendor", label: "Preferred Vendor"})
			]
		});
		tierPriceSearch.run()
			.each((result) => {
				log.debug('SearchResult', result)
				pVendor = result.getValue('othervendor');
				return true;
			});
		return pVendor;
	}

	const isEmpty = (value) => {
		if (value === null) 			{ return true; } 
		else if (value === undefined) 	{ return true; } 
		else if (value === '') 			{ return true; } 
		else if (value === ' ') 		{ return true; } 
		else if (value === 'null') 		{ return true; } 
		else { return false; }
	}


    return { 
		afterSubmit 
	}

    
});
