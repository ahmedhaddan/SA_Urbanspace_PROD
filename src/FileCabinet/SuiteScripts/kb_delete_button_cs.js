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
  function beforeLoad(context) {
    if (context.type === context.UserEventType.VIEW) {
      var form = context.form;
      var invoiceCreateButton = form.addButton({
        id: "custpage_approve_button",
        label: "Delete Pro-Forma SO's",
        functionName: "onButtonClick",
      });
      form.clientScriptModulePath = "SuiteScripts/KB_delete_RecordRelated_cs.js";
    }


  }

  return {
    beforeLoad: beforeLoad,
  };
});
