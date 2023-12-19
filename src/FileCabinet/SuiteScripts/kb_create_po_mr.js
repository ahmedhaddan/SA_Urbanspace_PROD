/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/runtime', 'N/search'],
    (record, runtime, search) => {

        const getInputData = (inputContext) => {
            try {
                log.debug('-- getInputData --');
                let SalesOrderData = runtime.getCurrentScript().getParameter('custscriptmr_salesorder_data');
                log.debug('SalesOrderData', SalesOrderData);
                let SalesOrderList = [SalesOrderData];
                log.debug('SalesOrderList', SalesOrderList);
                return SalesOrderList;
            } catch (error) {
                log.error('ERROR: getInputData', error);
            }
        }


        const reduce = (reduceContext) => {
            try {
                log.debug('-- reduce --');
                let reduceValues = JSON.parse(reduceContext.values);

                log.debug(`reduce DATA ${reduceContext.key}`, reduceValues);

                let key = reduceContext.key;
				let SalesOrderData = JSON.parse(reduceContext.values);
				let {salesorder} = SalesOrderData;
                log.audit(`key:${key}, salesorder:${salesorder.id}  Data`, SalesOrderData);

				let SalesOrderLines = salesorder.lines;
                log.debug(`SalesOrderLines: ${SalesOrderLines.length}`, SalesOrderLines);
                
                // Group data by Supplier
                let GroupResult = groupByKey({
                    list: SalesOrderLines, 
                    property: 'supplier'
                })
                log.debug(`GroupResult`, GroupResult);

                let results = [];       // To write results of supplier and PO
                for (let supplier in GroupResult) {
                    let SalesOrderData = GroupResult[supplier];
                    log.debug(`supplier to process: ${supplier}`, SalesOrderData);
                    let purchaseOrderId = makePurchaseOrder({
						salesorder: salesorder.id,
                        supplier, SalesOrderData
                    }) || '';      
                    log.debug('Purchase Order Create', purchaseOrderId);
                    if (purchaseOrderId)
                    results.push({supplier, purchaseOrderId});
                } 
                log.debug(`results: supp, PO`, results);

                reduceContext.write({
                    key: salesorder.id,
                    value: results
                });	
               
            } catch (error) {
                log.error('ERROR: reduce', error);
            }
        }

        
        const summarize = ({mapSummary, reduceSummary, output}) => {
            try {
                log.debug('-- summarize --');
                mapSummary.errors.iterator().each((key, error) => {
                    log.error(`Map Error for key: ${key}`, error); return true;
                });
                reduceSummary.errors.iterator().each((key, error) => {
                    log.error(`Reduce Error for key: ${key}`, error); return true;
                });

                // Get results of created POs then update in SalesOrder
                let results = [];
                output.iterator().each((salesorder, SalesOrderData) => {
                    log.debug(`salesorder: ${salesorder}`, `SalesOrderData: ${SalesOrderData}`);
                    let updatedInvoiceId = updateSalesOrder({salesorder, SalesOrderData});      
                    results.push(updatedInvoiceId)
                    return true;
                });
                log.audit('results', results);
        
            } catch (error) {
                log.error('ERROR: summarize', error);
            }
        }

        const makePurchaseOrder = (options) => {
            try {
                log.debug('makePurchaseOrder', options);

                const {supplier, SalesOrderData, salesorder} = options,
                type = 'purchaseorder',
                PurchaseOrder = record.create({ type, isDynamic: true });

                // PurchaseOrder.setValue('externalid', `sointernalidhere_${supplier}`);    
                PurchaseOrder.setValue('entity', supplier); 

              //////UPDATE////////////////////////
               PurchaseOrder.setValue('department', SalesOrderData[0].department); 	
               PurchaseOrder.setValue('custbody_kb_sales_rep', SalesOrderData[0].salesrep);
               PurchaseOrder.setValue('custbody_kb_so_link', SalesOrderData[0].itemId);
             log.debug('sales', SalesOrderData[0].itemId);
               /////////////
                PurchaseOrder.setValue('shipto', SalesOrderData[0].customer); 	
                PurchaseOrder.setValue('shipaddresslist', SalesOrderData[0].item_ship_to);
                // PurchaseOrder.setValue('shipmethod', SalesOrderData[0].item_ship_method); 

                log.audit(`SalesOrderData: ${SalesOrderData.length} lines`, SalesOrderData);

                for (let i in SalesOrderData) {
                    let SalesOrderLines = SalesOrderData[i],
                    {item, subscription} = SalesOrderLines;
                    log.debug(`SalesOrderLines ${i}`, SalesOrderLines);                

                    PurchaseOrder.selectNewLine('item');
                    PurchaseOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: SalesOrderLines.item
                    });
                    PurchaseOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: SalesOrderLines.itemQuantity
                    });

              
                  
                    // PurchaseOrder.setCurrentSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'amount',
                    //     value: Number(SalesOrderLines.itemAmt)
                    // });
                    PurchaseOrder.commitLine('item');
                }

                let purchaseOrderId = PurchaseOrder.save({
                    enableSourcing : true,
                    ignoreMandatoryFields : true 
                });
                log.audit(`Purchase Order ID`, `${type}:${purchaseOrderId}`);
                return purchaseOrderId;    	
            } catch (error) {
                log.error('ERROR: makePurchaseOrder', error);
                // throw new Error(`makePurchaseOrder: ${error.name}. ${error.message}`);
            }
        }

        const updateSalesOrder = (options) => {
            log.debug(`updateSalesOrder: options`, options);

            try {
                const {salesorder, SalesOrderData} = options,
                SalesOrder = record.load({
                    type: 'salesorder',
                    id: salesorder,
                }),
                lineCount = SalesOrder.getLineCount('item');
                log.debug('salesorder lineCount', lineCount);
                for (let i = 0; i < lineCount; i++) {
                    let item_create_po = SalesOrder.getSublistValue('item', 'custcol_nsts_create_po', i);
                    if (item_create_po) {
						
						// let prefVendor = SalesOrder.getSublistValue('item', 'custcol_kb_preferred_vendor', i);
						let item = SalesOrder.getSublistValue('item', 'item', i);
						let prefVendor = getPrefVendor(item);
                        log.debug(`${i}`, `prefVendor: ${prefVendor}`);

                        // Find matching supplier in the results from created POs
                        let findSupplier = eval(SalesOrderData).find( ({supplier}) => supplier == prefVendor);
                        log.debug('findSupplier', findSupplier);
                        if (findSupplier) {
							SalesOrder.setSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_nsts_linked_po',
								value : findSupplier.purchaseOrderId,
								line : i
							});
							SalesOrder.setSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_nsts_create_po',
								value : false,
								line : i
							});
						}
                        
                    }
                }
                let updatedInvoiceId = SalesOrder.save();
                log.audit('updatedInvoiceId', updatedInvoiceId);
                return updatedInvoiceId; 
            } catch (error) {
                log.error('ERROR: updateSalesOrder', error);
                throw new Error(`updateSalesOrder: ${error.name}. ${error.message}`);
            }
        }

		
		const groupByKey = ({list, property, value, parseObject = false}) => {
			return list.reduce((group, obj) => {
				if (parseObject)
				obj = JSON.parse(obj);
				const key = obj[property];
				if (!group[key]) {
					group[key] = [];
				}
				// Add value or object to list for given keys
				group[key].push(value? obj[value]:obj);
				return group;
			}, {});
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
	



        return {getInputData, 
			// map, 
			reduce, summarize}

    });
