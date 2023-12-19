/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

// define(["N/ui/serverWidget", "N/log", "N/record"], function (
define(["N/ui/serverWidget", "N/log", "N/record", 'N/runtime'], function (
  serverWidget,
  log,
  record,
  runtime
) {
  function beforeLoad(context) {

    try {

      // var userRole = runtime.getCurrentUser().role;
      // log.debug('userRole', userRole);
      var roleCenter = runtime.getCurrentUser().roleCenter;
      log.debug('roleCenter', roleCenter);
      if (roleCenter === 'CUSTOMER') return;

      
      if (context.type === context.UserEventType.VIEW) {
        var form = context.form;
        var invoiceCreateButton = form.addButton({
          id: "custpage_approve_button",
          label: "Proforma SO",
          functionName: "callSuitelet",
        });
        form.clientScriptModulePath = "SuiteScripts/kb_proforma_so_cs_suitelet_call.js";
      }
  
    } catch (error) {
      log.error('Error in beforeLoad', error);
    }
    
  }
  



  return {
    beforeLoad: beforeLoad,
   
  };
});
