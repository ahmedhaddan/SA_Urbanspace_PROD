/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(["N/ui/serverWidget", "N/log", "N/record"], function (
  serverWidget,
  log,
  record
) {

  
  function beforeLoadInvoiceButton(context) {
    if (context.type === context.UserEventType.VIEW) {
      var form = context.form;
      var invoiceCreateButton = form.addButton({
        id: "custpage_create_button",
        label: "Create Invoice",
        functionName: "callSuitelet",
      });
      form.clientScriptModulePath = "SuiteScripts/kb_invoice_call_suitelet_cs.js";
    }

    
  }



  



  return {
    beforeLoad: beforeLoadInvoiceButton,
  
  
  };
});
