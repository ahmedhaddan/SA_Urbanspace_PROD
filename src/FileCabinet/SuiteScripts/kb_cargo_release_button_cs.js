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
  
    /////User Event Script Create Button on view mode
    function beforeLoad(context) {
      
      if (context.type === context.UserEventType.VIEW) {
        var form = context.form;
        var invoiceCreateButton = form.addButton({
          id: "custpage_create_button",
          label: "Cargo Release",
          functionName: "callSuitelet",
        });
        form.clientScriptModulePath = "SuiteScripts/kb_cargo_release_Suitelet_call.js";
      }
  
      
    }
  
  
  
    
  
  
  
    return {
      beforeLoad: beforeLoad,
    
    
    };
  });
  