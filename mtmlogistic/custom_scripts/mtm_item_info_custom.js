var arr_inner_carton = [
    "inner_carton_length",
    "inner_carton_width",
    "inner_carton_height",
    "inner_carton_net_weight",
    "inner_carton_gross_weight",
    "inner_carton_volume"
];

frappe.ui.form.on("MTM Item Info", {
    onload:  function(frm) {
        frm.trigger('qty_per_inner');
    },
    qty_per_inner:  function(frm, cdt, cdn) {
        if(frm.doc.qty_per_inner>=1){
            $.each(arr_inner_carton , function(index, field) { 
                if(frappe.model.get_value(cdt, cdn, field)==0){
                    frm.set_value(field, "");
                }
            });
        }else{
            $.each(arr_inner_carton , function(index, field) { 
                console.log(frappe.model.get_value(cdt, cdn, field));
                if(!frappe.model.get_value(cdt, cdn, field)){
                    frm.set_value(field, 0);
                }
            });            
        }
    },
    pack_length:  function(frm) {
        count_pack_volume(frm);
    },
    pack_width:  function(frm) {
        count_pack_volume(frm);
    },
    pack_height:  function(frm) {
        count_pack_volume(frm);
    },
    inner_carton_length:  function(frm) {
        frm.trigger('qty_per_inner');
        count_inner_carton_volume(frm);
    },
    inner_carton_width:  function(frm) {
        frm.trigger('qty_per_inner');
        count_inner_carton_volume(frm);
    },
    inner_carton_height:  function(frm) {
        frm.trigger('qty_per_inner');
        count_inner_carton_volume(frm);
    },
    inner_carton_net_weight:  function(frm) {
        frm.trigger('qty_per_inner');
    },
    inner_carton_gross_weight:  function(frm) {
        frm.trigger('qty_per_inner');
    },
    inner_carton_volume:  function(frm) {
        frm.trigger('qty_per_inner');
    },
    outer_carton_length:  function(frm) {
        count_outer_carton_volume(frm);
    },
    outer_carton_width:  function(frm) {
        count_outer_carton_volume(frm);
    },
    outer_carton_height:  function(frm) {
        count_outer_carton_volume(frm);
    }
});

var count_pack_volume = function(frm){
    let volume = count_volume(frm.doc.pack_length, frm.doc.pack_width, frm.doc.pack_height);
    cur_frm.set_value("pack_volume", volume);
}

var count_inner_carton_volume = function(frm){
    let volume = count_volume(frm.doc.inner_carton_length, frm.doc.inner_carton_width, frm.doc.inner_carton_height);
    cur_frm.set_value("inner_carton_volume", volume);
}

var count_outer_carton_volume = function(frm){
    let volume = count_volume(frm.doc.outer_carton_length, frm.doc.outer_carton_width, frm.doc.outer_carton_height);
    cur_frm.set_value("outer_carton_volume", volume);
}

var count_volume = function(length, width, height ){
    return flt(length)/1000 * flt(width)/1000 * flt(height)/1000;
}

