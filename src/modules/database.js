"use strict";

/**
* Bassed on
* https://github.com/martintajur/node-mysql-activerecord/blob/dependabot/npm_and_yarn/mysql-2.17.1/index.js
*/

const mysql = require('mysql');

/***
* Controlls the interface to the database.
*/
class DatabaseAdaptar {

  constructor(settings) {

    // Reset the clauses
    this.resetQuery();

    this.connectionSettings = this.initializeConnection(settings);
    this.connection = new mysql.createConnection(this.connectionSettings);
  }

  /**
   * Extracts default values for the database connections.
   *
   * @param {object} settings Settings to include with the defualt.
   * @returns {object} Default settings.
   */
  initializeConnection(settings) {
    if(settings.server) { settings.host = settings.server; }
    if(settings.username) { settings.user = settings.username; }
    if(!settings.port) {settings.port = 3306; }
    if(!settings.user) { settings.user = ''; }
    if(!settings.password){ settings.password = ''; }

    if(!settings.host)     { throw new Error('Unable to create database connection.  No host given.'); }
    if(!settings.database) { throw new Error('Unable to create database connection. No database given.'); }

    return settings;
  }

  /**
   * Returns the settings used for the current connection.
   *
   * @returns {object} Current connection settings.
   */
  getConnectionSettings () {
    return this.connectionSettings;
  }

  /**
   * Returns the current database connection.
   *
   * @returns {Connection} The active connection.
   */
  connection() {
    return this.connection;
  }

  /**
   * Resets the query options.  Called after a query is
   * completed.
   */
  resetQuery() {
    this.selectClause  = [];
    this.whereClause = {};
  }

  /**
   * Safely escape a string so it can be used in an SQL query.
   *
   * @param {type} str String to be escaped.
   * @returns {str} The escaped string.
   */
  escapeFieldName(str) {
    return '`' + str.replace('.','`.`') + '`';
  }


  /**
   * Merges two objects together.  Objects from `b` are added
   * to object `a`.
   *
   * @param {object} a First object.
   * @param {object} b Second object
   *
   * @returns {object} Merged objects.
   */
  mergeObjects(a, b) {

    if(typeof(a) === 'undefined' || typeof(b) === 'undefined'){
      throw new Error('Unable to merge an undefined object');
    }

    for(let key in b){
      if(b.hasOwnProperty(key)){
        a[key] = b[key];
      }
    }
    return a;
  }

  /**
   * Returns the size of a set.
   *
   * @param {object} set The set to measure.
   *
   * @returns {int} The length of the set.
   */
  getSetSize(set){
    let size = 0;
    for(let key in set){
      if(set.hasOwnProperty(key)){
        size++;
      }
    }
    return size;
  }

  /**
   * Takes an object set and converts it into an SQL string.
   *
   * @param {object} dataSet   Dataset to be convered.
   * @param {str} separator Seperator used between set items.
   * @param {str} clause    The type of sql string.
   *
   * @returns {str} Description
   */
  buildDataString(dataSet, separator, clause) {

    if(!clause) {
      clause = 'WHERE';
    }

    if(!separator) {
      separator = ', ';
    }

    let queryString = '', y = 1;
    let useSeperator = true;
    let datasetSize = this.getSetSize(dataSet);

    for(var key in dataSet){
      if(dataSet.hasOwnProperty(key)){

        useSeperator = true;

        // Check to see if there is a value with this key
        if(dataSet[key] === null) {
          queryString += this.escapeFieldName(key) + (clause === 'WHERE' ? "is NULL" : "=NULL");
        }
        // If its not an object, it will be a string
        else if(typeof(dataSet[key]) !== 'object'){
          queryString += this.escapeFieldName(key) + "=" + mysql.escape(dataSet[key]);
        }
        // Check for a list or another set
        else if(typeof(dataSet[key]) === 'object' && Object.prototype.toString.call(dataSet[key]) === '[object Array]' && dataSet[key].length){
          queryString += this.escapeFieldName(key) + ' in ("' + dataSet[key].join('", "')  + '")';
        }
        else{
          useSeperator = false;
          datasetSize = datasetSize - 1;
        }

        if(y < datasetSize && useSeperator){
          queryString += separator;
          y++;
        }
      }
    }

    if(this.getSetSize(dataSet) > 0){
      queryString = ' ' + clause + ' ' + queryString;
    }

    return queryString;
  }

  /**
   * This method is used to determine which columns should be
   * selected from a table.
   *
   * @param {object Array} fieldNames An array of column names to be selected.
   *
   * @returns {this}
   */
  select(fieldNames) {

    if(!fieldNames){
      throw new Error('Select required a field name(s) to be specified.');
    }

    if(Object.prototype.toString.call(fieldNames) === '[object Array]') {
      for(let i = 0; i < fieldNames.length; i++){
        this.selectClause.push(fieldNames[i].trim());
      }
    } else if(typeof(fieldNames) === 'string') {
      var selectFieldNames = fieldNames.split(',');
      for(let i = 0; i < selectFieldNames.length; i++){
        this.selectClause.push(selectFieldNames[i].trim());
      }
    }
    else {
      throw new Error('Select field names needs to be an array or a string.');
    }

    return this;
  }

  /**
   * This method is used to determine where conditions for selected columns.
   *
   * @param {str} whereSet The value to check
   * @param {object Array} whereValue A list of possible options.
   *
   * @returns {this}
   */
  where(whereSet, whereValue) {

    if(typeof(whereSet) === 'object' && typeof(whereValue) === 'undefined'){
      this.whereClause = this.mergeObjects(this.whereClause, whereSet);
    }

    else if((typeof(whereSet) === 'string' || typeof(whereSet) === 'number') && typeof(whereValue) !== 'undefined'){
      this.whereClause[whereSet] = whereValue;
    }

    else if((typeof(whereSet) === 'string' || typeof(whereSet) === 'number') && typeof(whereValue) === 'object' && Object.prototype.toString.call(whereValue) === '[object Array]'){
      this.whereClause[whereSet] = whereValue;
    }

    else {
      throw Error('Unknown where statment.');
    }

    return this;
  }


  /**
   * Inserts values into the database.
   *
   * @param {str} tableName         Name of the table
   * @param {object} dataSet          Set of data being inserted
   * @param {str} verb             The verb to use if there is one
   * @param {str} querySuffix      The suffix to use if there  is one
   *
   * @returns {obj} SQL query results
   */
  async insert(tableName, dataSet, verb, querySuffix) {

    if(typeof verb === 'undefined'){
      verb = 'INSERT';
    }

    if(typeof(querySuffix) === 'undefined'){
      querySuffix = '';
    }

    if(typeof(querySuffix) !== 'string'){
      querySuffix = '';
    }

    if(typeof(tableName) !== 'string'){
      throw new Error('Insert table name must be a string.');
    }

    var combinedQuery = verb + ' into ' + this.escapeFieldName(tableName) + this.buildDataString(dataSet, ', ', 'SET');

    if(querySuffix !== ''){
      combinedQuery = combinedQuery + ' ' + querySuffix;
    }

    let results = await new Promise((resolve, reject) => {
      this.connection.query(combinedQuery, (err, info) => {
        if(err){ reject(err); }
        resolve(info);
      });
    });

    this.resetQuery();
    return results;
  }

  /**
   * This method is called when information needs to be retreieved from
   * the database.
   *
   * @param {str} tableName Name of table to select from
   *
   * @returns {object} The results of the get request
   */
  async get(tableName) {

    if(typeof(tableName) !== 'string') {
      throw new Error('Get a tableName as type string.');
    }

    let combinedQuery = 'SELECT ' + (this.selectClause.length === 0 ? '*' : this.selectClause.join(',')) + ' FROM ' + this.escapeFieldName(tableName) + this.buildDataString(this.whereClause, ' AND ', 'WHERE');

    console.log(combinedQuery);

    let results = await new Promise((resolve, reject) => {
      this.connection.query(combinedQuery, (err, info) => {
        if(err) { reject(err); }
        resolve(info);
      });
    });

    this.resetQuery();
    return results;
  }

  /**
   * Deletes a row from the given table.
   *
   * @param {str} tableName Name of table to delete from
   *
   * @returns {this}
   */
  async delete(tableName) {

    if(typeof(tableName) !== 'string'){
      throw new Error('delete: Table name must be a string.');
    }

    let combinedQuery = 'DELETE FROM ' + this.escapeFieldName(tableName) + this.buildDataString(this.whereClause, ' AND ', 'WHERE');
    let results = await new Promise((resolve, reject) => {
      this.connection.query(combinedQuery, (err, info) => {
        if(err) {reject(err);}
        resolve(info);
      });
    });

    return results;
  }


  /**
   * Disconnect from the database.  This should be called
   * after the connection has been used.
   *
   * @returns {obj} The connection
   */
  disconnect () {
    return this.connection.end();
  }
}

module.exports.DatabaseAdaptar = DatabaseAdaptar;
