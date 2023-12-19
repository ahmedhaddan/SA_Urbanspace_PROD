/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record'], function(record) {
  
  function afterSubmit(context) {
    try {


      var myArray = [
       10506, 10505, 10504, 10502, 10503,
  10501, 10498, 10500, 10499, 10496, 10497, 10495, 10494, 10492, 10493,
  10491, 10490, 10489, 10488, 10487, 10486, 10485, 10483, 10482, 10484,
  10481, 10480, 10479, 10478, 10477, 10475, 10476, 10473, 10474, 10472,
  10471, 10469, 10468, 10467, 10466, 10465, 10463, 10464, 10458
      ];
      
      for(var i=0 ; i<myArray.length ; i++)
      {
      // Load the custom record
      var customRecord = record.load({
        type: 'customrecord_kb_warehouse_custom_item_re', // Replace with your custom record type ID
        id: myArray[i],
      });

      var l = customRecord.getValue({
    fieldId: 'custrecord_kb_wh_length'
}); 
      var w = customRecord.getValue({
    fieldId: 'custrecord_kb_wh_width'
}); 
      var h =  customRecord.getValue({
    fieldId: 'custrecord_kb_wh_height'
}); 
      var qty =  customRecord.getValue({
    fieldId: 'custrecord_kb_wh_quantity'
}); 
        var volume = l*w*h
        var extvolum = qty*volume

                customRecord.setValue({
    fieldId: 'custrecord_kb_wh_volume',
    value: volume,
    ignoreFieldChange: true
});


        customRecord.setValue({
    fieldId: 'custrecord_kb_wh_extended_volume',
    value: extvolum,
    ignoreFieldChange: true
});


      
      // Save the custom record
      customRecord.save();

     }
      log.debug('Success', 'Custom record updated successfully.');
    } catch (e) {
      log.error('Error', e.message);
    }
  }
  
  return {
    afterSubmit: afterSubmit
  };
  
});
