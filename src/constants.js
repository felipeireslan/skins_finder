'use strict';

const   moment          = require('moment-timezone'),
        decode          = require('unescape'),
        axios           = require('axios'),
        DEFAULT_TIMEOUT = 30000;

const constants = {
    getCurrentDate: getCurrentDate,

    decodeText: decodeText,

    makeHTTPRequest: makeHTTPRequest
};

/**
 * getCurrentDate()
 * 
 * @param {Number | String} param 
 * 
 * @return {Date}
 */
function getCurrentDate(param) {
    const now = moment((param) ? new Date(param) : new Date());
    let _date_str_parts = now.tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss').split(' '),
        _date_str = _date_str_parts[0],
        _hour_str = _date_str_parts[_date_str_parts.length - 1];

    let _date_parts = (_date_str.split('-').length === 1) ? _date_str.split('/') : _date_str.split('-'),
        _day = Number(_date_parts[_date_parts.length - 1]),
        _month = Number(_date_parts[1]),
        _year = Number(_date_parts[0]),
        _hour_parts = _hour_str.split(':'),
        _hour = Number(_hour_parts[0]),
        _minute = Number(_hour_parts[1]),
        _second = Number(_hour_parts[_hour_parts.length - 1]);
    
    return new Date(Date.UTC(_year, ((_month - 1) < 0) ? 0 : (_month - 1), _day, _hour, _minute, _second));
};

function decodeText(text) {
    text = decode(text)
    return text.replace(/\s*\<.*?\>\s*/g, '')
};

/**
 * Make HTTP Request
 * 
 * @param {Sring} url 
 * @param {String} method 
 * @param {Object} headers 
 * @param {Object} data 
 * 
 * @return {Promise}
 */
function makeHTTPRequest(url, method, headers, data, response_type) {
    let axiosParams = {
        url: url,
        timeout: DEFAULT_TIMEOUT,
        method: method,
        headers: headers
    };

    if (data) axiosParams['data'] = data;

    if (response_type) axiosParams['responseType'] = response_type;

    return axios(axiosParams);
};

module.exports = constants;