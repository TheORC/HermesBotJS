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
  * Asstablish the connection to the database.
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

  getConnectionSettings () { return this.connectionSettings; }
  connection() { return this.connection; }

  /**
  * Reset the clauses for the next database request.
  */
  resetQuery() {
    this.selectClause  = [];
    this.whereClause = {};
  }

  escapeFieldName(str) {
    return '`' + str.replace('.','`.`') + '`';
  }

  mergeObjects(a, b){

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

  // Takes a dataset and creates a SQL query.
  buildDataString(dataSet, separator, clause) {
    if(!clause){
      clause = 'WHERE';
    }

    let queryString = '', y = 1;

    if(!separator){
      separator = ', ';
    }

    let useSeperator = true;
    let datasetSize = this.getSetSize(dataSet);

    for(var key in dataSet){
      // Make sure the set has the item
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

  getSetSize(set){
    let size = 0;
    for(let key in set){
      if(set.hasOwnProperty(key)){
        size++;
      }
    }
    return size;
  }

  select(fieldNames) {

    if(!fieldNames){
      throw new Error('Select required a field name(s) to be specified.');
    }

    if(Object.prototype.toString.call(fieldNames) === '[object Array]') {
      for(let i = 0; i < fieldNames.length; i++){
        this.selectClause.push(fieldNames[i].trim());
      }
    }
    else if(typeof(fieldNames) === 'string') {
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
  * {
  *   value: target
  * }
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

  async insert(tableName, dataSet, responseCallback, verb, querySuffix) {

    if(typeof verb === 'undefined'){
      verb = 'INSERT';
    }

    if(Object.prototype.toString.call(dataSet) !== ['object Array']) {

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

    } else {
      throw new Error('Batch inserts are not implemented yet.');
    }
  }

  async get(tableName) {
    if(typeof(tableName) === 'string'){

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

    } else {
      throw new Error('Get a tableName as type string.');
    }
  }

  disconnect () {
    return this.connection.end();
  }

}

module.exports.DatabaseAdaptar = DatabaseAdaptar;
