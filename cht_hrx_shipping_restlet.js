/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime'], function (record, search, runtime) {
    function get(context) {

        const { request, response } = context;
        const script = runtime.getCurrentScript();
        const hrxSGLN = script.getParameter({
            name: 'custscript_hrx_sgln_2'
        });

        log.error(`Start request => `, request);
        log.error(`Debug context`, context);  

        let createdFromidArray = new Array();

        let NS_IF_ID = new Array();
        let DELIVERY_IDS = new Array();

        let customer_idArray = new Array();

        let postdata_array = new Array();

        let state_licence_number;
        let seller_licence_number;

        let itemfulfillmentSearchObj 


        if(context.itemFulfillmentId){

            log.emergency('Filter itemFulfillmentId => ', context.itemFulfillmentId);

            
            itemfulfillmentSearchObj = search.create({
                type: "itemfulfillment",
                filters:
                    [
                        ["type", "anyof", "ItemShip"],
                        "AND",
                        ["internalid", "anyof", context.itemFulfillmentId],
                        "AND",
                        ["custbody_cht_hrx_shipping_event_create", "is", "F"],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({
                            name: "internalid",
                            join: "createdFrom",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "customerMain",
                            label: "Internal ID"
                        }),
                        search.createColumn({ name: "custbody_statelicensenumber", label: "State License Number" }),
                        search.createColumn({ name: "custbody_herculesstate", label: "Hercules State License Number" }),
                        search.createColumn({ name: "custbody_pacejet_tracking_link", label: "Pacejet Tracking Link" }),
                        // search.createColumn({ name: "custbody_hrx_epcis_serial_numbers", label: "Serial Numbers" }),

                    ]
            });

        }
        else{
            log.emergency('Add Filter Trandate => ', context.date);

            itemfulfillmentSearchObj = search.create({
                type: "itemfulfillment",
                filters:
                    [
                        ["type", "anyof", "ItemShip"],
                        "AND",                       
                        ["custbody_cht_hrx_shipping_event_create", "is", "F"],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({
                            name: "internalid",
                            join: "createdFrom",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "customerMain",
                            label: "Internal ID"
                        }),
                        search.createColumn({ name: "custbody_statelicensenumber", label: "State License Number" }),
                        search.createColumn({ name: "custbody_herculesstate", label: "Hercules State License Number" }),
                        search.createColumn({ name: "custbody_pacejet_tracking_link", label: "Pacejet Tracking Link" }),
                        // search.createColumn({ name: "custbody_hrx_epcis_serial_numbers", label: "Serial Numbers" }),
                    ]
            });  

            if(context.date){
               

                // if(context.date == '4-Sep-2024'){
                //     itemfulfillmentSearchObj.filters.push(search.createFilter(
                //         'internalid',
                //         null,
                //         'anyof',
                //         [15376916]
                //     ));

                // }
              
                // else if(context.date == '15-Oct-2024'){  
                //     itemfulfillmentSearchObj.filters.push(search.createFilter(
                //         'internalid',
                //         null,
                //         'anyof',
                //         [15399691]
                //     ));

                // }

                itemfulfillmentSearchObj.filters.push(search.createFilter(
                    'trandate',
                    null,
                    'within',
                    context.date,
                    context.date
                ));   

                log.error('Filter Item Fulfillment => ', context.date);   

            }
        }
        


        var searchResultCount = itemfulfillmentSearchObj.runPaged().count;
        log.debug("itemfulfillmentSearchObj result count", searchResultCount);
        itemfulfillmentSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results

            NS_IF_ID.push(result.getValue({ name: "internalid", label: "Internal ID" }));
            DELIVERY_IDS.push({ itemFulfillmentId: result.getValue({ name: "internalid", label: "Internal ID" }), pacejetLink: result.getValue({ name: "custbody_pacejet_tracking_link", label: "Pacejet Tracking Link" }) });


            createdFromidArray.push(result.getValue({
                name: "internalid",
                join: "createdFrom",
                label: "Internal ID"
            }))
            customer_idArray.push(result.getValue({
                name: "internalid",
                join: "customerMain",
                label: "Internal ID"
            }))
            
            // state_licence_number = result.getValue({ name: "custbody_statelicensenumber", label: "State License Number" });
            // seller_licence_number = result.getValue({ name: "custbody_herculesstate", label: "Hercules State License Number" });
            
            return true;
        });

        /*
        itemfulfillmentSearchObj.id="customsearch1698667801212";
        itemfulfillmentSearchObj.title="Custom Transaction Search 9 (copy)";
        var newSearchId = itemfulfillmentSearchObj.save();


        */


        log.debug("createdFromid", createdFromidArray)

        log.debug("customer_id", customer_idArray);

        log.debug("NS_IF_ID", NS_IF_ID)


        for (var i = 0; i < NS_IF_ID.length; i++) {


            var createdFromid = createdFromidArray[i];
            var customer_id = customer_idArray[i];
            var serialno_array = new Array();
            var serial_no;

            var customrecord_wmsts_serialentrySearchObj = search.create({
                type: "customrecord_wmsts_serialentry",
                filters:
                    [
                        ["custrecord_wmsts_ser_ordno", "anyof", createdFromid]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "id", label: "ID" }),
                        search.createColumn({ name: "scriptid", label: "Script ID" }),
                        search.createColumn({ name: "custrecord_wmsts_ser_no", label: "SERIAL NO" })
                    ]
            });
            var searchResultCount = customrecord_wmsts_serialentrySearchObj.runPaged().count;
            log.debug("customrecord_wmsts_serialentrySearchObj result count", searchResultCount);
            customrecord_wmsts_serialentrySearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                serial_no = result.getValue({ name: "custrecord_wmsts_ser_no", label: "SERIAL NO" });

                serialno_array.push(serial_no)

                log.debug("SERIAL NUMBER", serial_no)



                return true;
            });



            var addressdetail_obj = new Object();

            var owning_party_address = new Object();
            var location_address = new Object();

            var addressdetail_objlist = new Array();

            var destinationListobj = new Object();

            var destinationList = new Array();

            var hrx_id = ''; 


            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid", "anyof", customer_id]
                    ],
                columns:
                    [
                        search.createColumn({  
                            name: "custrecord80",
                            join: "Address",
                            label: "SGLN"
                        }),
                        
                        // search.createColumn({
                        //     name: "addressid",
                        //     join: "Address",
                        //     label: "addressid"
                        // }),

                        search.createColumn({
                            name: "address",
                            join: "Address",
                            label: "Address"
                        }),
                        // search.createColumn({
                        //     name: "addr1",
                        //     join: "Address",
                        //     label: "Address1"
                        // }),
                        // search.createColumn({
                        //     name: "addr2",
                        //     join: "Address",
                        //     label: "Address2"
                        // }),
                        search.createColumn({
                            name: "city",
                            join: "Address",
                            label: "City"
                        }),
                        search.createColumn({
                            name: "state",
                            join: "Address",
                            label: "State/Province"
                        }),
                        search.createColumn({
                            name: "zipcode",
                            join: "Address",
                            label: "Zip Code"
                        }),
                        search.createColumn({
                            name: "countrycode",
                            join: "Address",
                            label: "Country Code"
                        }),
                        search.createColumn({
                            name: "address",
                            join: "Address",
                            label: "Address"
                        }),
                        search.createColumn({
                            name: "addressee",
                            join: "Address",
                            label: "Addressee"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "{entityid}",
                            label: "Formula (Text)"
                        })
                    ]
            });

            // customerSearchObj.filters.push(search.createFilter({
            //     name: 'custrecord80',
            //     join: "Address",
            //     operator : search.Operator.CONTAINS,
            //     value: "."
            // }));   

            var searchResultCount = customerSearchObj.runPaged().count;
            log.emergency("customerSearchObj result count", searchResultCount);

            log.emergency(`Debug id: customer_id => `, customer_id);

            var customerAddressObj;




            var customerRec = record.load({
                type: `customer`,
                id: customer_id,
                isDynamic: true
            });

            if(customer_id && searchResultCount){
                customerAddressObj = sourceAddressFields(customerRec);
                log.error(`Debug Customer Object`, ...[customerRec.id, customerRec.type]);   
                log.error(`Source Customer Address Object`, customerAddressObj['shipping']);
            } 

            customerSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results

                hrx_id = result.getValue({
                    name: "formulatext",
                    formula: "{entityid}",
                    label: "Formula (Text)"
                });

                //Push owning_party type - Sold-to (Owning party)
                if(!isEmpty(customerAddressObj['isCorporate'])){    
                    destinationList.push({
                        "recipient_sgln": customerAddressObj['isCorporate'].custpage_sgln,
                        "recipient_type": "owning_party"
                    });

                    log.debug(`Push "recipient_type": "owning_party"`, customerAddressObj['isCorporate']);


                    owning_party_address.attention = customerAddressObj['isCorporate'].custpage_addressattention;
                    owning_party_address.name = customerAddressObj['isCorporate'].custpage_addressee;

                    owning_party_address.sgln = result.getValue({
                        name: "custrecord80",
                        join: "Address",
                        label: "SGLN"
                    });

                    owning_party_address.address1 = customerAddressObj['isCorporate'].custpage_address1;
                    owning_party_address.address2 = customerAddressObj['isCorporate'].custpage_address2;

                    owning_party_address.city = customerAddressObj['isCorporate'].custpage_city;
                    owning_party_address.state = customerAddressObj['isCorporate'].custpage_states;
                    owning_party_address.zipcode = customerAddressObj['isCorporate'].custpage_zip;
                    owning_party_address.countryCode = customerAddressObj['isCorporate'].custpage_country;
                }   

                //Push Ship-to (Location/ addressDetails)
                if(!isEmpty(customerAddressObj['shipping'])){
                    addressdetail_obj.attention = customerAddressObj['shipping'].custpage_addressattention;
                    addressdetail_obj.name = customerAddressObj['shipping'].custpage_addressee;

                    // addressdetail_obj.sgln = result.getValue({
                    //     name: "custrecord80",
                    //     join: "Address",
                    //     label: "SGLN"
                    // });

                    addressdetail_obj.sgln = customerAddressObj['shipping'].sgln;
                    addressdetail_obj.address1 = customerAddressObj['shipping'].custpage_address1;
                    addressdetail_obj.address2 = customerAddressObj['shipping'].custpage_address2;

                    addressdetail_obj.city = customerAddressObj['shipping'].custpage_city;
                    addressdetail_obj.state = customerAddressObj['shipping'].custpage_states;
                    addressdetail_obj.zipcode = customerAddressObj['shipping'].custpage_zip;
                    addressdetail_obj.countryCode = customerAddressObj['shipping'].custpage_country;

                    //Mapped Location Address
                    location_address.attention = customerAddressObj['shipping'].custpage_addressattention;
                    location_address.name = customerAddressObj['shipping'].custpage_addressee;
                    location_address.sgln = customerAddressObj['shipping'].sgln;
                    location_address.address1 = customerAddressObj['shipping'].custpage_address1;
                    location_address.address2 = customerAddressObj['shipping'].custpage_address2;
                    location_address.city = customerAddressObj['shipping'].custpage_city;
                    location_address.state = customerAddressObj['shipping'].custpage_states;
                    location_address.zipcode = customerAddressObj['shipping'].custpage_zip;
                    location_address.countryCode = customerAddressObj['shipping'].custpage_country;
                    
                  

                    // destinationListobj.recipient_sgln = customerAddressObj['shipping'].custpage_sgln;
                    // destinationListobj.recipient_type = "location"; //Ship-to (Location)

                    destinationList.push({
                        "recipient_sgln": customerAddressObj['shipping'].custpage_sgln,
                        "recipient_type": "location"
                    })
                }
                else{
                       addressdetail_obj.name = result.getValue({
                            name: "addressee",
                            join: "Address",
                            label: "Addressee"
                        });

                        addressdetail_obj.state = result.getValue({
                            name: "state",
                            join: "Address",
                            label: "State/Province"
                        })


                        addressdetail_obj.zipcode = result.getValue({
                            name: "zipcode",
                            join: "Address",
                            label: "Zip Code"
                        });

                        addressdetail_obj.countryCode = result.getValue({
                            name: "countrycode",
                            join: "Address",
                            label: "Country Code"
                        });

                        addressdetail_obj.city = result.getValue({
                            name: "city",
                            join: "Address",
                            label: "City"
                        });
                }

                addressdetail_obj.address = result.getValue({
                    name: "address",
                    join: "Address",
                    label: "Address"

                });  

                //destinationList.push(destinationListobj); //Push Owning Party
                //destinationListobj.recipient_type = "location"; //Ship-to (Location)



                addressdetail_objlist.push(addressdetail_obj);
                return true;
            });

         
            log.debug("addressdetail_objlist", addressdetail_objlist);
            log.debug("destinationList", destinationList);


            //POST DATA **************************************************************************************************************************
            try{
                let today = new Date();
                log.debug("today", today)

                let sscc_array = new Array();
                let serialsPerSSCC = {};
                let deliverynum = (DELIVERY_IDS.length) ? DELIVERY_IDS.filter(prop => prop.itemFulfillmentId == `${NS_IF_ID[i]}`) : ``;

                var customrecord_pacejet_package_infoSearchObj = search.create({
                    type: "customrecord_pacejet_package_info",
                    filters:
                        [
                            ["custrecord_pacejet_package_sscc", "isnotempty", ""],
                            "AND",
                            ["custrecord_pacejet_transaction_link", "anyof", NS_IF_ID[i]]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({ name: "scriptid", label: "Script ID" }),
                            search.createColumn({ name: "custrecord_pacejet_transaction_link", label: "PJ Package Transaction Link" }),
                            search.createColumn({ name: "custrecord_pacejet_package_id", label: "Package ID" }),
                            search.createColumn({ name: "custrecord_pacejet_package_contents", label: "Contents" }),
                            search.createColumn({ name: "custrecord_pacejet_package_tracking", label: "Tracking Number" }),
                            search.createColumn({ name: "custrecord_pacejet_package_tracking_link", label: "Tracking Link" }),
                            search.createColumn({ name: "custrecord_pacejet_package_weight", label: "Weight" }),
                            search.createColumn({ name: "custrecord_pacejet_package_sscc", label: "SSCC" })
                        ]
                });
                var searchResultCount = customrecord_pacejet_package_infoSearchObj.runPaged().count;
                log.debug("customrecord_pacejet_package_infoSearchObj result count", searchResultCount);
                customrecord_pacejet_package_infoSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    // sscc_array.push(result.getValue({ name: "custrecord_pacejet_package_sscc", label: "SSCC" }));
                    let sscc = result.getValue({ name: "custrecord_pacejet_package_sscc", label: "SSCC" });
                    let pacejetPackageContents = result.getValue({ name: "custrecord_pacejet_package_contents", label: "SSCC" });
                    let serialObj = {};
                    let currentSerialNum = (!isEmpty(pacejetPackageContents)) ? trimArrayValues(pacejetPackageContents.replace(/:1/g, '').trim().split(',')) : [];   

                    // let currentSerialNum[sscc] = (!isEmpty(pacejetPackageContents)) ? pacejetPackageContents.replace(/:1/g, '').trim().split(',') : [];   

                    log.audit(`Debug Pacejet Package Contents`, pacejetPackageContents);
                    log.audit(`Debug currentSerialNum => SSCC: ${sscc}`, currentSerialNum);  

                    sscc_array.push(sscc);  
                    // serialsPerSSCC[sscc] = serialsPerSSCC.push(currentSerialNum);

                    if(!isEmpty(currentSerialNum)){
                        try{
                            serialsPerSSCC[sscc] = currentSerialNum;     
                            log.audit(`Debug currentSerialNum => SSCC: ${sscc}`, serialsPerSSCC[sscc]);  

                        }
                        catch(e){ log.audit(`UNHANDLED_ERROR `, JSON.stringify({message: e.message, stack: e.stack })) }
                    } 


                    return true;
                });


                let invoicenum;
                let salesnum;
                let salesOrderId;
                let pedigree_Number_ = new Array();

                /**************************************************** #START GETTING PEDIGREE NUMBERS (PER INVOICE) *************************************************/ 
                try{
                    let invoiceSearchObj = search.create({
                        type: "invoice",
                        filters:
                            [
                                ["type", "anyof", "CustInvc"],
                                "AND",
                                ["custbody_related_fulfillments", "anyof", NS_IF_ID[i]],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "tranid", label: "Document Number" }),
                                search.createColumn({ name: "createdfrom", label: "Sales Order" }),

                                search.createColumn({ name: "custbody_herculesstate", label: "Hercules State License Number" }), //Hercules State License
                                search.createColumn({ name: "custbody_statelicensenumber", label: "State License Number" }), //Customer State License

                                search.createColumn({
                                    name: "name",
                                    join: "CUSTRECORD_PEDIGREE_INVOICE_REF",
                                    label: "Name"
                                })
                            ] 
                    });

                    let searchResultCount = invoiceSearchObj.runPaged().count;
                    log.error("invoiceSearchObj result count", searchResultCount);

                    invoiceSearchObj.run().each(function (result) {
                        // .run().each has a limit of 4,000 results
                        state_licence_number = result.getValue({ name: "custbody_statelicensenumber", label: "State License Number" });
                        seller_licence_number = result.getValue({ name: "custbody_herculesstate", label: "Hercules State License Number" }); 

                        invoicenum = result.getValue({ name: "tranid", label: "Document Number" });
                        salesnum = result.getText({ name: "createdfrom", label: "Sales Order" }); 
                        salesOrderId = result.getValue({ name: "createdfrom", label: "Sales Order" }); 
                        pedigree_Number = result.getValue(search.createColumn({
                            name: "name",
                            join: "CUSTRECORD_PEDIGREE_INVOICE_REF",
                            label: "Name"
                        }));
                        pedigree_Number_.push(pedigree_Number)
                       
                        return true;
                    });

                    // let pedigreeSearchObj = search.create({
                    //     type: "customrecord_pedigree",
                    //     filters:
                    //         [
                    //             ["custrecord_pedigree_sonum", "anyof", salesOrderId]
                    //         ],
                    //     columns:
                    //         [
                    //             search.createColumn({ name: "name", label: "name" }),
                    //             search.createColumn({ name: "custrecord_pedigree_lot_number", label: "pedigree lotnum" }),
                    //             search.createColumn({ name: "custrecord_pedigree_expiration_date", label: "pedigree expdate" }),
                                
                    //         ] 
                    // });

                    // let pedigreeSearchCount = pedigreeSearchObj.runPaged().count;
                    // log.error(`Pedigree Search Count`, pedigreeSearchCount);

                    // if(pedigreeSearchObj){
                    //      pedigreeSearchObj.run().each(function (result) {
                            
                    //         log.error(`Debug loop => pedigree`, result);
                    //         pedigree_Number = result.getValue({ name: "name", label: "namer" });

                    //         pedigree_Number_.push(pedigree_Number);
                    //         return true;
                    //     });
                    // }


                    log.error("pedigree_Number_", pedigree_Number_);
                }
                catch(e){
                    log.error(`Unhandled Error getting the pedigree Numbers`, {message: e.message, stack: e.stack });
                }
                /**************************************************** #END GETTING PEDIGREE NUMBERS ******************************************************************/
                
                let dataTime = new Date();
                let salesOrderPO;

                if(salesOrderId){
                    salesOrderPO = search.lookupFields({
                      type: 'salesorder',
                      id: salesOrderId, 
                      columns: ['otherrefnum'],
                    }).otherrefnum;

                    log.emergency('Debug Sales Order PO# => ', salesOrderPO);
                }

                salesnum = (salesOrderPO) ? salesOrderPO : salesnum.replace(`Sales Order #`, ``);   

                log.debug("dateTime", dataTime);
                log.debug(`Pacejet Link => ${NS_IF_ID[i]}`, deliverynum);
                

                if (Object.keys(deliverynum).length > 0 ) {
                    log.debug(`Delivery Number => has value`, (deliverynum != null));
                    deliverynum = (deliverynum[0].pacejetLink != null) ? deliverynum[0].pacejetLink.split('=')[1] : deliverynum[0];
                    log.debug(`Delivery Number => ${NS_IF_ID[i]}`, deliverynum);
                }

                try{
                    postdata = {
                        "NS_IF_ID": NS_IF_ID[i],
                        "serial_numbers": serialsPerSSCC, 
                        "sscc": sscc_array,
                        "hrx_number": hrx_id,
                        "order_number": salesnum,  
                        // "buyer_licence_number": state_licence_number,
                        // "seller_licence_number": seller_licence_number, 
                        "invoicenum": invoicenum,
                        "deliverynum": deliverynum,

                        // "pedigree_Number": pedigree_Number_,
                        "event_time": dataTime,
                        "event_timezone_offset": "+00:00",
                        "sourceList": [
                            {

                                // "source_sgln": SGLNS[NS_IF_ID].SGLN, 
                                "source_sgln": hrxSGLN,
                                "source_type": "owning_party"
                            },

                            {
                                "source_sgln": hrxSGLN,  
                                "source_type": "location"
                            }
                        ],

                        "destinationList": getUniqueRecipients(destinationList)
                        ,
                        "addressDetails": {
                      
                        }  
                    };

                    //IF Owning Party or Corporate Address is not Empty
                    if((!isEmpty(customerAddressObj['isCorporate']))){
                        postdata.addressDetails.owning_party = {
                            "name": customerAddressObj['isCorporate'].custpage_addresslabel,
                            "attention": customerAddressObj['isCorporate'].custpage_addressattention,
                            "address1": customerAddressObj['isCorporate'].custpage_address1,
                            "address2": customerAddressObj['isCorporate'].custpage_address2,
                            "city": customerAddressObj['isCorporate'].custpage_city,
                            "state": customerAddressObj['isCorporate'].custpage_states,
                            "zipcode": customerAddressObj['isCorporate'].custpage_zip,
                            "country": customerAddressObj['isCorporate'].custpage_country,
                            "sgln": customerAddressObj['isCorporate'].custpage_sgln
                        }
                    }


                    if((!isEmpty(customerAddressObj['shipping']))){
                        postdata.addressDetails.location = {
                            "name": customerAddressObj['shipping'].custpage_addresslabel,
                            "attention": customerAddressObj['shipping'].custpage_addressattention,
                            "address1": customerAddressObj['shipping'].custpage_address1,
                            "address2": customerAddressObj['shipping'].custpage_address2,
                            "city": customerAddressObj['shipping'].custpage_city,
                            "state": customerAddressObj['shipping'].custpage_states,
                            "zipcode": customerAddressObj['shipping'].custpage_zip,
                            "country": customerAddressObj['shipping'].custpage_country,
                            "sgln": customerAddressObj['shipping'].custpage_sgln
                        }
                    }
                }
                catch(e){
                    log.emergency(`Error pushing the Shipping Information Data=> ${NS_IF_ID[i]}`, {stack: e.stack, message: e.message });
                }

                

                postdata_array.push(postdata);
            }
            catch(e){
                log.emergency(`Unhandled Error => Creation of Post Data Object => NS IF ID: ${NS_IF_ID[i]}`, {message: e.message, stack: e.stack });
            }

            

        }


        log.debug("response", postdata_array);
        log.error('#[END] POST PAYLOAD RESPONSE', script.getRemainingUsage()); 



        return JSON.stringify(postdata_array)
    }


    //Get Unique Destination list
    const getUniqueRecipients = (data) => {
        const uniqueRecipients = data.reduce((acc, item) => {
            const key = `${item.recipient_sgln}|${item.recipient_type}`; // Create a unique key for each combination

            if (!acc.some(recipient => `${recipient.recipient_sgln}|${recipient.recipient_type}` === key)) {
                acc.push({ recipient_sgln: item.recipient_sgln, recipient_type: item.recipient_type });
            }

            return acc;
        }, []);

        return uniqueRecipients;
    };



    function isEmpty(stValue){
        return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
    }


    function trimArrayValues(arr) {
        return arr.map(value => value.trim());
    }


     /**
     * Function definition to be triggered before record is loaded.
     * @param {object} Entity Record (Customer/Vendor)
    */
    function sourceAddressFields(entityRec){
       try{
           
           log.error('[START] => Building Address Field Object for the current Customer/Vendor', true);
           var addressFldObj = {};
           var addressSublistId = 'addressbook';
           var isChild = entityRec.getText('custentity_parentandchild')
  

           //Get Parent Object

           if (isChild == 'Child'){
            var parent_id = entityRec.getValue('parent')
            log.debug('847', isChild)
            var childObjParent = record.load({
                type: `customer`,
                id: parent_id,
                isDynamic: true

            });  

            var addressCountParent = childObjParent.getLineCount({ sublistId: addressSublistId });
            
            for (var lctr = 0; lctr < addressCountParent; lctr++) {

                if(childObjParent.getSublistValue({ sublistId: addressSublistId, fieldId: 'id', line: lctr })){

                    var addressID = childObjParent.getSublistValue({ sublistId: addressSublistId, fieldId: 'internalid', line: lctr });
                    var addressLabel = childObjParent.getSublistValue({ sublistId: addressSublistId, fieldId: 'label', line: lctr });
                    var addressbookaddress_key = childObjParent.getSublistValue({ sublistId: addressSublistId, fieldId: 'addressbookaddress_key', line: lctr });
                    var defaultbilling = childObjParent.getSublistValue({ sublistId: addressSublistId, fieldId: 'defaultbilling', line: lctr });
                    var defaultshipping = childObjParent.getSublistValue({ sublistId: addressSublistId, fieldId: 'defaultshipping', line: lctr });
                    addressID = addressbookaddress_key;   

                        var addressRec = record.load({
                            type: 'address',
                            id: addressID,
                            isDynamic: false,

                        });
                        var corporate = addressRec.getValue('custrecord_hrx_is_corporate_address')
                        log.debug('defaultCorporate', corporate)
                        log.debug('defaultCorporate', corporate + " "+ parent_id)
          

                        if(corporate == true || corporate == 'T'){



                            addressFldObj['isCorporate'] = {


                                "custpage_addresslabel": addressRec.getValue('addressee'),
                                "custpage_addressattention": addressRec.getValue('attention'),
                                "custpage_addressee": addressRec.getValue('addressee'),
                                "custpage_address1": addressRec.getValue('addr1'),
                                "custpage_address2": addressRec.getValue('addr2'),
                                "custpage_city": addressRec.getValue('city'),
                                "custpage_states": addressRec.getValue('state'),
                                "custpage_country": addressRec.getValue('country'),
                                "custpage_zip": addressRec.getValue('zip'),
                                "custpage_sgln": addressRec.getValue('custrecord80')

                             };

                        }
                            log.debug('878',addressFldObj['isCorporate'])
                }          

            }

           }

           var addressCount = entityRec.getLineCount({ sublistId: addressSublistId });

           log.error('[START] => addressCount', addressCount); 

           if(addressCount){

                for (var lctr = 0; lctr < addressCount; lctr++) {
                    if(entityRec.getSublistValue({ sublistId: addressSublistId, fieldId: 'id', line: lctr })){

                         var addressID = entityRec.getSublistValue({ sublistId: addressSublistId, fieldId: 'internalid', line: lctr });
                         var addressLabel = entityRec.getSublistValue({ sublistId: addressSublistId, fieldId: 'label', line: lctr });
                         var addressbookaddress_key = entityRec.getSublistValue({ sublistId: addressSublistId, fieldId: 'addressbookaddress_key', line: lctr });
                         var defaultbilling = entityRec.getSublistValue({ sublistId: addressSublistId, fieldId: 'defaultbilling', line: lctr });
                         var defaultshipping = entityRec.getSublistValue({ sublistId: addressSublistId, fieldId: 'defaultshipping', line: lctr });

                         addressID = addressbookaddress_key;   

                         // log.error(`[Context => ${lctr}] addressbookaddress_key [${entityRec.getSublistValue({ sublistId: addressSublistId, fieldId: 'label', line: lctr })}]`, addressbookaddress_key);  
                         // log.error(`addressID | addressbookaddress_key`, JSON.stringify({addressID: addressID,  addressbookaddress_key: addressbookaddress_key})); 

                        try{
                            if(addressID || addressbookaddress_key){  

                              var addressRec = record.load({
                                  type: 'address',
                                  id: addressbookaddress_key,
                                  isDynamic: false,
                              });

                              var isCorporate = search.lookupFields({
                                type: 'address',
                                id: addressbookaddress_key, 
                                columns: ['custrecord_hrx_is_corporate_address']
                              }).custrecord_hrx_is_corporate_address;



                              if(addressRec){
                                   // log.emergency('ADDRESS_REC[${addressbookaddress_key}] Object=>', addressRec);
                                   if(defaultbilling == true && defaultshipping == true){

                                      addressFldObj['billing_shipping'] = {
                                          //"custpage_addresslabel": addressLabel,
                                         "custpage_addresslabel": addressRec.getValue('addressee'),
                                          // "custpage_addresstype": '4',
                                          // "custpage_addressid": addressID,
                                          // "addressbookaddress_key": addressbookaddress_key,
                                          // "defaultBilling": defaultbilling,
                                          // "defaultShipping": defaultshipping,
                                          // "corporateAddress": isCorporate,
                                          
                                          "custpage_addressattention": addressRec.getValue('attention'),
                                          "custpage_addressee": addressRec.getValue('addressee'),
                                          "custpage_address1": addressRec.getValue('addr1'),
                                          "custpage_address2": addressRec.getValue('addr2'),
                                          "custpage_city": addressRec.getValue('city'),
                                          
                                          "custpage_states": addressRec.getValue('state'),
                                          
                                          "custpage_country": addressRec.getValue('country'),
                                          "custpage_zip": addressRec.getValue('zip'),
                                          "custpage_sgln": addressRec.getValue('custrecord80')
                                       };
                                   }

                                   if(defaultbilling == true || defaultbilling == 'T'){

                                      addressFldObj['billing'] = {

                                          //"custpage_addresslabel": addressLabel,
                                        "custpage_addresslabel": addressRec.getValue('addressee'),
                                          // "custpage_addresstype": '2',
                                          // "custpage_addressid": addressID,
                                          // "addressbookaddress_key": addressbookaddress_key,
                                          // "defaultBilling": defaultbilling,
                                          // "defaultShipping": defaultshipping,
                                          // "corporateAddress": isCorporate,
                                          
                                          "custpage_addressattention": addressRec.getValue('attention'),
                                          "custpage_addressee": addressRec.getValue('addressee'),
                                          "custpage_address1": addressRec.getValue('addr1'),
                                          "custpage_address2": addressRec.getValue('addr2'),
                                          "custpage_city": addressRec.getValue('city'),
                                          
                                          "custpage_states": addressRec.getValue('state'),
                                          
                                          "custpage_country": addressRec.getValue('country'),
                                          "custpage_zip": addressRec.getValue('zip'),
                                          "custpage_sgln": addressRec.getValue('custrecord80')
                                       };

                                   }
                                
                                   if(defaultshipping == true || defaultshipping == 'T'){

                                      addressFldObj['shipping'] = {
                                          // "custpage_addresstype": '1',

                                          //"custpage_addresslabel": addressLabel,
                                          "custpage_addresslabel": addressRec.getValue('addressee'),
                                          // "custpage_addressid": addressID,
                                          // "addressbookaddress_key": addressbookaddress_key,
                                          // "defaultBilling": defaultbilling,
                                          // "defaultShipping": defaultshipping,
                                          // "corporateAddress": isCorporate,
                                          
                                          "custpage_addressattention": addressRec.getValue('attention'),
                                          "custpage_addressee": addressRec.getValue('addressee'),
                                          "custpage_address1": addressRec.getValue('addr1'),
                                          "custpage_address2": addressRec.getValue('addr2'),
                                          "custpage_city": addressRec.getValue('city'),
                                          
                                          "custpage_states": addressRec.getValue('state'),

                                          "custpage_country": addressRec.getValue('country'),
                                          "custpage_zip": addressRec.getValue('zip'),
                                          "custpage_sgln": addressRec.getValue('custrecord80')
                                       };
                                   }
                                
                                   
                                   if((isCorporate == true || isCorporate == 'T') && (isChild == 'Parent')){

                                      addressFldObj['isCorporate'] = {
                                          // "custpage_addresstype": '3',
                                          "custpage_addresslabel": addressRec.getValue('addressee'),
                                          //"custpage_addresslabel": addressLabel,
                                          // "custpage_addressid": addressID,
                                          // "addressbookaddress_key": addressbookaddress_key,
                                          // "defaultBilling": defaultbilling,
                                          // "defaultShipping": defaultshipping,
                                          // "corporateAddress": isCorporate,
                                          
                                          "custpage_addressattention": addressRec.getValue('attention'),
                                          "custpage_addressee": addressRec.getValue('addressee'),
                                          "custpage_address1": addressRec.getValue('addr1'),
                                          "custpage_address2": addressRec.getValue('addr2'),
                                          "custpage_city": addressRec.getValue('city'),
                                          
                                          "custpage_states": addressRec.getValue('state'),

                                          "custpage_country": addressRec.getValue('country'),
                                          "custpage_zip": addressRec.getValue('zip'),
                                          "custpage_sgln": addressRec.getValue('custrecord80')
                                       };
                                   }

                                   //If Shipping and Corporate Address is the same
                                    
                                   if((isCorporate == true || isCorporate == 'T') && (defaultshipping == true || defaultshipping == 'T') && (isChild == 'Parent')){
                                      addressFldObj['isCorporate'] = {
                                          // "custpage_addresstype": '3',
                                          //"custpage_addresslabel": addressLabel,
                                          "custpage_addresslabel": addressRec.getValue('addressee'),
                                          // "custpage_addressid": addressID,
                                          // "addressbookaddress_key": addressbookaddress_key,
                                          // "defaultBilling": defaultbilling,
                                          // "defaultShipping": defaultshipping,
                                          // "corporateAddress": isCorporate,
                                          
                                          "custpage_addressattention": addressRec.getValue('attention'),
                                          "custpage_addressee": addressRec.getValue('addressee'),
                                          "custpage_address1": addressRec.getValue('addr1'),
                                          "custpage_address2": addressRec.getValue('addr2'),
                                          "custpage_city": addressRec.getValue('city'),
                                          
                                          "custpage_states": addressRec.getValue('state'),

                                          "custpage_country": addressRec.getValue('country'),
                                          "custpage_zip": addressRec.getValue('zip'),
                                          "custpage_sgln": addressRec.getValue('custrecord80')
                                       };
                                   }

                                   //If Billing and Corporate Address is the same

                                   if((isCorporate == true || isCorporate == 'T') && (defaultbilling == true || defaultbilling == 'T') && (isChild == 'Parent')){  
                                      addressFldObj['isCorporate'] = {
                                          // "custpage_addresstype": '3',
                                          //"custpage_addresslabel": addressLabel,
                                         "custpage_addresslabel": addressRec.getValue('addressee'),
                                          // "custpage_addressid": addressID,
                                          // "addressbookaddress_key": addressbookaddress_key,
                                          // "defaultBilling": defaultbilling,
                                          // "defaultShipping": defaultshipping,
                                          // "corporateAddress": isCorporate,
                                          
                                          "custpage_addressattention": addressRec.getValue('attention'),
                                          "custpage_addressee": addressRec.getValue('addressee'),
                                          "custpage_address1": addressRec.getValue('addr1'),
                                          "custpage_address2": addressRec.getValue('addr2'),
                                          "custpage_city": addressRec.getValue('city'),
                                          
                                          "custpage_states": addressRec.getValue('state'),

                                          "custpage_country": addressRec.getValue('country'),
                                          "custpage_zip": addressRec.getValue('zip'),
                                          "custpage_sgln": addressRec.getValue('custrecord80')
                                       };
                                   }
                              }
                           }

                           // log.error(`[Update obj => ${lctr}]`, addressFldObj);
                        }
                        catch(e){
                            log.error('Unhandled error found in executing => for loop function', JSON.stringify(e.message));
                            log.error('Stack error  => for loop function', JSON.stringify(e.stack));  
                        }
                         
                    }
                }
           }

           log.error(`[return addressFldObj => ]`, addressFldObj);

           // log.error('Debug => addressFldObj to return', addressFldObj);  
           return addressFldObj;
       }
       catch(e){ 
          log.error('[UNHANDLED_ERROR] function: sourceAddressFields', JSON.stringify(e));
       }
    }

    function getInternalIdByName(name, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].name === name) {
                return array[i].internalId;
            }
        }
        // If name not found
        return null;
    } 

    function getInternalIdByShortName(name, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].short_state_name === name) {
                return array[i].internalId;
            }
        }
        // If name not found
        return null;
    }  


    function post(context) {
        log.debug("context", context);

        var response_body = context;

        log.debug("response", response_body[0].NS_IF_ID)

        var if_rec = record.load({ type: "itemfulfillment", id: response_body[0].NS_IF_ID, isDynamic: true })

        if_rec.setValue("custbody_cht_hrx_shipping_event_create", true);

        if_rec.save({ ignoreMandatoryFields: true });
    }


    function parseData(dataString) {
        // Remove the outer single quotes from the string representation
        let cleanedData = dataString.replace(/^'|'$/g, '');

        log.emergency('Debug Parse Data', dataString);
        log.emergency('Debug cleanedData Data', cleanedData);
        
        // Parse the cleaned string into a JSON object
        let parsedData = JSON.parse(cleanedData); //ORIGINAL

        // let parsedData = JSON.parse(dataString.toString());
        
        return parsedData;
    } 

    /*
    purchaseorderSearchObj.id="customsearch1688395628133";
    purchaseorderSearchObj.title="Custom Transaction Search 5 (copy)";
    var newSearchId = purchaseorderSearchObj.save();
    */






    return {
        get: get,
        post: post
    };
});