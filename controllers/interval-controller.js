//Defining Helpers as to move repetitive functions 
var utilities = require('../utilities/helpers');
/* Function To clean the array 
 * 
 * @param {type} deleteValue
 * @returns {Array.prototype}
 * Deletes empty elements
 * 
 */
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
/* Function to Validate the Input Parameters 
 * 
 * @param {type} data
 * @returns {errors|validateParams.output}
 * Include array should not be blank
 * Exclude Array can be blank
 * Include and exclude array both should contain valid numbers
 */
var validateParams = function(data) {
    
    var output = {
        errors: [],
        valid: false,
        include_ranges: [],
        exclude_ranges: []
    };
    if (data.include == undefined) {
        output.errors.push("Please enter Include Range");
        return output;
    }
    var include_ranges = data.include.split(/[,-]+/);
    if (include_ranges.length == 0 || include_ranges.some(isNaN)) {
        errors.push("Include Ranges should contain only valid ranges like: 1-10, 50-100..etc.,");
        return errors;
    }
    output.valid = true;
    if (data.exclude == undefined) return output;
    var exclude_ranges_isvalid = data.exclude.split(/[,-]+/);
    if (exclude_ranges_isvalid.some(isNaN)) {
        errors.push("Exclude Ranges should contain only valid ranges like: 1-10, 50-100..etc.,");
        return errors;
    }
    /* if (exclude_ranges_isvalid.some(v => v < 0) || include_ranges.some(v => v < 0)) {
        errors.push("Include and Exclude Should Only contain Positive Integers");
        return errors;
    } */
    var exclude_ranges = data.exclude.split(",");
    /* Clean the exclude array to make all valid ranges */
    for (var i = 0; i < exclude_ranges.length; i++) {
        var range = exclude_ranges[i].split('-');
        if (parseInt(range[0]) > parseInt(range[1])) {
            output.exclude_ranges[i] = range[1] + "-" + range[0];
        } else {
            output.exclude_ranges[i] = exclude_ranges[i];
        }
    }
    var include_ranges = data.include.split(",");
    /* Clean the exclude array to make all valid ranges */
    for (var i = 0; i < include_ranges.length; i++) {
        var range = include_ranges[i].split('-');
        if (parseInt(range[0]) > parseInt(range[1])) {
            output.include_ranges[i] = range[1] + "-" + range[0];
        } else {
            output.include_ranges[i] = include_ranges[i];
        }
    }
    return output;
};
/* Function to Merge Ranges 
 * 
 * @param {type} arr
 * @param {type} callback
 * @returns {undefined}
 * 
 */
var eliminateInvalidRanges = function(arr, callback) {
    var new_arr = arr;
    function loopUntilUnique(mod_arr) {
        var to_compare = [];
        var curr_val = [];
        if (mod_arr.length > 1) {
            for (var pos = 0; pos < mod_arr.length; pos++) {
                to_compare = mod_arr[pos].split('-');
                for (var i = 0; i < mod_arr.length; i++) {
                    curr_val = mod_arr[i].split('-');
                    // check if least falls in the existing range
                    if ((pos != i) && (parseInt(to_compare[0]) >= parseInt(curr_val[0]) && parseInt(to_compare[0]) <= parseInt(curr_val[1]))) {
                        // the current pos falls in the range so merge the range
                        if (parseInt(to_compare[1]) >= parseInt(curr_val[1])) {
                            mod_arr[pos] = curr_val[0] + "-" + to_compare[1];
                        } else {
                            mod_arr[pos] = curr_val[0] + "-" + curr_val[1];
                        }
                        mod_arr.splice(i, 1);
                        loopUntilUnique(mod_arr);
                    }
                    else if ((pos != i) && (parseInt(to_compare[1])+1) == parseInt(curr_val[0])) {
                        // the range high of compare equals range low of current so merge
                        mod_arr[pos] = to_compare[0] + "-" + curr_val[0];
                        mod_arr.splice(i, 1);
                        loopUntilUnique(mod_arr);
                    }
                }
            }
        }
    }
    loopUntilUnique(arr);
    callback(new_arr);
};
function compareNumbers(a, b) {
    return parseInt(a) - parseInt(b);
};
/* API calls this function 
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 * Method type : POST
 * Request Params => "include", "exclude"
 * Expected output : JSON type
 */
module.exports.filterRanges = function(req, res) {
    //Send the Request Parameters for validations
    var filteredList = validateParams(req.body);
    //If Required Parameters are not valid send the response 
    if (!filteredList.valid) {
        res.json({
            message: 'Not a Valid Request',
            error: filteredList.errors
        });
    } else {
        //Check if there are any exclude ranges
        if (filteredList.exclude_ranges.length == 0) {
            // There are no exclude ranges straight away return include array as range
            var response = [include_least + "-" + include_highest];
            res.status(200);
            res.json({
                status: true,
                data: response
            });
        }
        /* Filter the Includ array to make it a valid ranges also merge the ranges
         * Making the array cleaner is important for the search
        */
        eliminateInvalidRanges(filteredList.include_ranges, function(cleaned_include_arr) {
            /* Filter the exclude array to make it a valid ranges also merge the ranges
            * Making the array cleaner is important for the search
            */
            eliminateInvalidRanges(filteredList.exclude_ranges, function(cleaned_exclude_arr) {
                //fltr_arr will be used for preparing output
                var fltr_arr = [];
                //Sort the array in ascending order so that sequence will not be disturbed
                cleaned_include_arr.sort(compareNumbers);
                var include_ln = cleaned_include_arr.length;
                for (var j = 0; j < include_ln; j++) {
                    cleaned_exclude_arr.sort(compareNumbers);
                    cleaned_exclude_arr.clean("");
                    var new_include_arr = cleaned_include_arr[j].split("-").map(x => parseInt(x));
                    //Set the highest and least of the range and also their temp vars used for resetting
                    var include_least_in = include_least = parseInt(new_include_arr[0]);
                    var include_highest_in = include_highest = parseInt(new_include_arr[1]);
                    //To check if exclude has any influence or not
                    var flag = false;
                    var exclude_ln = cleaned_exclude_arr.length;
                    //Starting the Exclude array loop to compare input ranges
                    for (var i = 0; i < exclude_ln; ++i) {
                        var ranges = cleaned_exclude_arr[i].split("-").map(x => parseInt(x));
                        var ranges_next = [];
                        var high_flag = false;
                        var set_extra = '';
                        var set_extra_least = '';
                        if (cleaned_exclude_arr[i + 1] != undefined) {
                            ranges_next = cleaned_exclude_arr[i + 1].split("-").map(x => parseInt(x));
                        }
                        //check if least element in range falls in the sequence
                        if (parseInt(ranges[0]) > include_least_in && parseInt(ranges[0]) < include_highest_in) {
                            //range least falls in the sequence exclude the range
                            fltr_arr.push(include_least_in + "-" + (ranges[0] - 1));
                            //Set the flag as exclude influenced
                            flag = true;
                            //check if  highest element of range falls in the sequnce
                            if (parseInt(ranges[1]) > include_least_in && parseInt(ranges[1]) < include_highest_in) {
                                //range high falls in the sequence exclude the range
                                high_flag = true;
                                include_least_in = ranges[1] + 1;
                                //check if next range exists
                                if (ranges_next[0] != undefined) {
                                    //Next range exist so check if it falls in the sequence
                                    if (parseInt(ranges_next[0]) > include_least_in && parseInt(ranges_next[0]) < include_highest_in) {
                                        //Next range also falls in the sequence
                                        include_highest_in = ranges_next[0] - 1;
                                        //check if next of next range exists
                                        if (cleaned_exclude_arr[i + 2] == undefined) {
                                            var extra_el_l = ranges_next[1] + 1;
                                            if (parseInt(ranges_next[1]) > include_least_in && parseInt(ranges_next[1]) < include_highest_in) {
                                                //Next range high also falls in the sequence
                                                extra_el_l = ranges_next[1] - 1;
                                            }
                                            set_extra_least = extra_el_l + "-" + include_highest;
                                        }
                                    }
                                }
                                fltr_arr.push(include_least_in + "-" + include_highest_in);   
                            }
                            if (set_extra_least != '') { 
                                fltr_arr.push(set_extra_least);
                            }
                        }
                        //Similarly check if range high falls in the sequence
                        if ((parseInt(ranges[1]) > include_least_in && parseInt(ranges[1]) < include_highest_in) && !high_flag) {
                            //range high falls in the sequence exclude the range
                            include_least_in = ranges[1] + 1;
                            //check if  range high falls in the sequnce
                            if (ranges_next[0] != undefined && parseInt(ranges[1]) )  {
                                //Next range exist so check if it falls in the sequence
                                if (parseInt(ranges_next[0]) > include_least_in && parseInt(ranges_next[0]) < include_highest_in) {
                                    //Next range least also falls in the sequence
                                    //include_least_in = ranges_next[0] - 1;
                                    //check if next of next range exists
                                    if (cleaned_exclude_arr[i + 2] == undefined) {
                                        var extra_el_l = '';
                                        if (parseInt(ranges_next[1]) > include_least_in && parseInt(ranges_next[1]) < include_highest_in) {
                                            //Next range high also falls in the sequence
                                            extra_el_l = ranges_next[1] + 1;
                                        }
                                        set_extra = extra_el_l + "-" + include_highest_in;
                                    }
                                }
                                if (parseInt(ranges_next[0]) < include_highest_in) {
                                    //Next range high falls in the sequence
                                    include_highest_in = ranges_next[0]-1;
                                }
                                /*check if current include highest is greater than the current exclude high and greater than next exclude high
                                if (include_highest_in > parseInt(ranges_next[1]) && include_highest_in > ranges_next[0]) {
                                    include_highest_in
                                }*/
                            }
                            flag = true;
                            fltr_arr.push(include_least_in + "-" + include_highest_in);
                            if (set_extra != '') fltr_arr.push(set_extra);
                        }
                    }
                    //There is no exclude array or the include doesn't fall under any exclude range directly push include
                    if (exclude_ln == 0 && !flag) {
                        fltr_arr.push(include_least + "-" + include_highest);
                    }
                }
                res.status(200);
                res.json({
                    status: true,
                    data: fltr_arr
                });
            });
        });
    }
};


/* Function to FIZZBUZZ
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 * Method type : GET
 * Request Params => NOTHING
 * Expected output : JSON
 */
module.exports.printFizzBuzz = function(req, res) {
    var output = [];
    var is_three_multiple, is_five_multiple;
    for(var i=1; i<=100; i++) {
        is_three_multiple = (i%3==0) ? true : false;
        is_five_multiple = (i%5==0) ? true : false;
        if(is_three_multiple && is_five_multiple) {
            output.push('FizzBuzz'); 
        } else if(is_three_multiple) {
            output.push('Fizz'); 
        } else if(is_five_multiple) {
            output.push('Buzz'); 
        } else {
            output.push(i); 
        }
    }
    res.status(200);
    res.json({
        status: true,
        data: output
    });
};