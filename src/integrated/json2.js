/*!
 * JSON in JavaScript
 *  Douglas Crockford
 *  http://www.JSON.org/json2.js
 *  2011-10-19
 *  Public Domain.
 */

/**
 * @fileOverview JSON 对象补缺
 */

/*
  http://www.JSON.org/json2.js
  2011-10-19

  Public Domain.

  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

  See http://www.JSON.org/js.html


  This code should be minified before deployment.
  See http://javascript.crockford.com/jsmin.html

  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
  NOT CONTROL.


  This file creates a global JSON object containing two methods: stringify
  and parse.

    JSON.stringify(value, replacer, space)
      value     any JavaScript value, usually an object or array.

      replacer  an optional parameter that determines how object
                values are stringified for objects. It can be a
                function or an array of strings.

      space     an optional parameter that specifies the indentation
                of nested structures. If it is omitted, the text will
                be packed without extra whitespace. If it is a number,
                it will specify the number of spaces to indent at each
                level. If it is a string (such as '\t' or '&nbsp;'),
                it contains the characters used to indent at each level.

      This method produces a JSON text from a JavaScript value.

      When an object value is found, if the object contains a toJSON
      method, its toJSON method will be called and the result will be
      stringified. A toJSON method does not serialize: it returns the
      value represented by the name/value pair that should be serialized,
      or undefined if nothing should be serialized. The toJSON method
      will be passed the key associated with the value, and this will be
      bound to the value

      For example, this would serialize Dates as ISO strings.

      Date.prototype.toJSON = function(key) {
        function f(n) {
          // Format integers to have at least two digits.
          return n < 10 ? '0' + n : n;
        }

        return this.getUTCFullYear()   + '-' +
           f(this.getUTCMonth() + 1) + '-' +
           f(this.getUTCDate())    + 'T' +
           f(this.getUTCHours())   + ':' +
           f(this.getUTCMinutes())   + ':' +
           f(this.getUTCSeconds())   + 'Z';
      };

      You can provide an optional replacer method. It will be passed the
      key and value of each member, with this bound to the containing
      object. The value that is returned from your method will be
      serialized. If your method returns undefined, then the member will
      be excluded from the serialization.

      If the replacer parameter is an array of strings, then it will be
      used to select the members to be serialized. It filters the results
      such that only members with keys listed in the replacer array are
      stringified.

      Values that do not have JSON representations, such as undefined or
      functions, will not be serialized. Such values in objects will be
      dropped; in arrays they will be replaced with null. You can use
      a replacer function to replace those with JSON values.
      JSON.stringify(undefined) returns undefined.

      The optional space parameter produces a stringification of the
      value that is filled with line breaks and indentation to make it
      easier to read.

      If the space parameter is a non-empty string, then that string will
      be used for indentation. If the space parameter is a number, then
      the indentation will be that many spaces.

      Example:

      text = JSON.stringify(['e', {pluribus: 'unum'}]);
      // text is '["e",{"pluribus":"unum"}]'


      text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
      // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

      text = JSON.stringify([new Date()], function(key, value) {
        return this[key] instanceof Date ?
          'Date(' + this[key] + ')' : value;
      });
      // text is '["Date(---current time---)"]'


    JSON.parse(text, reviver)
      This method parses a JSON text to produce an object or array.
      It can throw a SyntaxError exception.

      The optional reviver parameter is a function that can filter and
      transform the results. It receives each of the keys and values,
      and its return value is used instead of the original value.
      If it returns what it received, then the structure is not modified.
      If it returns undefined then the member is deleted.

      Example:

      // Parse the text. Values that look like ISO date strings will
      // be converted to Date objects.

      myData = JSON.parse(text, function(key, value) {
        var a;
        if (typeof value === 'string') {
          a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
          if (a) {
            return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
              +a[5], +a[6]));
          }
        }
        return value;
      });

      myData = JSON.parse('["Date(09/09/2001)"]', function(key, value) {
        var d;
        if (typeof value === 'string' &&
            value.slice(0, 5) === 'Date(' &&
            value.slice(-1) === ')') {
          d = new Date(value.slice(5, -1));
          if (d) {
            return d;
          }
        }
        return value;
      });


  This is a reference implementation. You are free to copy, modify, or
  redistribute.
*/

/* jslint evil: true, regexp: true */

/*
  members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
  call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
  getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
  lastIndex, length, parse, prototype, push, replace, slice, stringify,
  test, toJSON, toString, valueOf
*/

(function() {
  'use strict';

//==================================================[JSON 补缺]
  /*
   * 除 json2.js 提供的方法外，还为 JSON 对象添加了 toString 方法，以配合 typeOf 方法返回预期的值。
   *
   * 补缺对象：
   *   JSON
   *
   * 补缺方法：
   *   Date.prototype.toJSON
   *   String.prototype.toJSON
   *   Number.prototype.toJSON
   *   Boolean.prototype.toJSON
   */

  /**
   * JSON 对象。
   * @name JSON
   * @namespace
   */

//--------------------------------------------------[JSON.toString]
  // IE8 的较低子版本中使用内置的 JSON.stringify 方法处理表单控件的空值时有 BUG。
  // http://tech.groups.yahoo.com/group/json/message/1268
  if (!window.JSON || navigator.isIE8) {
    window.JSON = {
      toString: function() {
        return '[object JSON]';
      }
    };
  }

//--------------------------------------------------[String/Boolean/Number/Date.prototype.toJSON]
  /**
   * 将字符串转换为 JSON 格式的字符串。
   * @name String.prototype.toJSON
   * @function
   * @returns {string} 转换后的字符串。
   */

  /**
   * 将布尔值转换为 JSON 格式的字符串。
   * @name Boolean.prototype.toJSON
   * @function
   * @returns {string} 转换后的字符串。
   */

  /**
   * 将数字转换为 JSON 格式的字符串。
   * @name Number.prototype.toJSON
   * @function
   * @returns {string} 转换后的字符串。
   */

  /**
   * 将日期转换为 JSON 格式的字符串。
   * @name Date.prototype.toJSON
   * @function
   * @returns {string} 转换后的字符串。
   */

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {

    Date.prototype.toJSON = function(key) {

      return isFinite(this.valueOf())
          ? this.getUTCFullYear() + '-' +
          f(this.getUTCMonth() + 1) + '-' +
          f(this.getUTCDate()) + 'T' +
          f(this.getUTCHours()) + ':' +
          f(this.getUTCMinutes()) + ':' +
          f(this.getUTCSeconds()) + 'Z'
          : null;
    };

    String.prototype.toJSON = Boolean.prototype.toJSON = Number.prototype.toJSON = function(key) {
      return this.valueOf();
    };
  }

//--------------------------------------------------[JSON.stringify]
  /**
   * 将 ECMAScript 值转换为 JSON 格式的字符串。
   * @name JSON.stringify
   * @function
   * @param {*} value 要转换的 ECMAScript 值，通常是 Object 或 Array 类型，也可以是 String、Boolean、Number、Date 类型或者 null。
   * @param {Function|Array} [replacer] 用来更改/过滤转换结果的函数或数组。
   *   <dl>
   *     <dt>如果是函数，则：</dt>
   *     <dd>
   *       该函数将在解析要转换的 ECMAScript 值中每一个键值对之前被调用，传入两个参数 key 和 value，并使用其返回值代替 value 进行转换。如果返回 undefined，则正在处理的这个键值对将被从转换结果中删除。
   *       该函数第一次被调用（如果要转换的 ECMAScript 值的类型是 String、Boolean、Number、Date 或为 null 时则是唯一一次被调用）时，传入的 key 是空字符串，value 是要转换的 ECMAScript 值。
   *       该函数被调用时 this 的值为当前传入的 key 和 value 所属的 ECMAScript 对象，可能为 Object 或 Array。
   *     </dd>
   *     <dt>如果是数组，则：</dt>
   *     <dd>
   *       该数组只能包含字符串，本方法会仅对 key 出现在数组中的部分进行转换。
   *     </dd>
   *   </dl>
   * @param {string|number} [space] 为使 JSON 字符串更易读而将其换行，并在每行内容之前加入的前缀。
   *   如果是字符串，则直接加入这个字符串作为前缀。若字符串的长度超过 10，则仅保留前 10 个字符。
   *   如果是数字，则加入对应数目的空格符。若数字大于 10，则只使用 10 个空格符。
   *   如果未指定该值，或者该值为 '' 或小于 1 的数字，则 JSON 字符串不会换行。
   * @returns {string} 转换后的字符串。
   */

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
      },
      rep;

  function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
      var c = meta[a];
      return typeof c === 'string'
          ? c
          : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }

  function str(key, holder) {

    // Produce a string from holder[key].

    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
        typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }

    // What happens next depends on the value's type.

    switch (typeof value) {
      case 'string':
        return quote(value);

      case 'number':

        // JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

        // If the value is a boolean or null, convert it to a string. Note:
        // typeof null does not produce 'null'. The case is included here in
        // the remote chance that this gets fixed someday.

        return String(value);

      // If the type is 'object', we might be dealing with an object or an array or
      // null.

      case 'object':

        // Due to a specification blunder in ECMAScript, typeof null is 'object',
        // so watch out for that case.

        if (!value) {
          return 'null';
        }

        // Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

        // Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {

          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.

          v = partial.length === 0
              ? '[]'
              : gap
              ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
              : '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }

        // If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === 'string') {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {

          // Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0
            ? '{}'
            : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }

  // If the JSON object does not yet have a stringify method, give it one.

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function(value, replacer, space) {

      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

      // If the space parameter is a number, make an indent string containing that
      // many spaces.

      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }

      // If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
        indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }

      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.

      return str('', {'': value});
    };
  }

//--------------------------------------------------[JSON.parse]
  /**
   * 将 JSON 格式的字符串转换为 ECMAScript 值。
   * @name JSON.parse
   * @function
   * @param {string} text 要转换的 JSON 格式的字符串。
   * @param {Function} [reviver] 用来过滤或更改转换结果的函数。
   *   该函数将在解析 text 中每一个键值对之后被调用，传入两个参数 key 和 value，并使用其返回值代替 value 作为最终值。如果返回 undefined，则正在处理的这个键值对将被从转换结果中删除。
   *   该函数最后一次被调用（如果 text 表示的是一个 String、Boolean、Number 类型的值或 null 时则是唯一一次被调用）时，传入的 key 是空字符串，value 是已从 text 转换到 ECMAScript 值的结果。
   *   该函数被调用时 this 的值为当前传入的 key 和 value 所属的 ECMAScript 对象，可能为 Object 或 Array。
   * @returns {*} 转换后的 ECMAScript 值。
   */

  // If the JSON object does not yet have a parse method, give it one.

  if (typeof JSON.parse !== 'function') {
    JSON.parse = function(text, reviver) {

      // The parse method takes a text and an optional reviver function, and returns
      // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

        // The walk method is used to recursively walk the resulting structure so
        // that modifications can be made.

        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }

      // Parsing happens in four stages. In the first stage, we replace certain
      // Unicode characters with escape sequences. JavaScript handles many characters
      // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
        text = text.replace(cx, function(a) {
          return '\\u' +
              ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }

      // In the second stage, we run the text against regular expressions that look
      // for non-JSON patterns. We are especially concerned with '()' and 'new'
      // because they can cause invocation, and '=' because it can cause mutation.
      // But just to be safe, we want to reject all unexpected forms.

      // We split the second stage into 4 regexp operations in order to work around
      // crippling inefficiencies in IE's and Safari's regexp engines. First we
      // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
      // replace all simple value tokens with ']' characters. Third, we delete all
      // open brackets that follow a colon or comma or that begin the text. Finally,
      // we look to see that the remaining characters are only whitespace or ']' or
      // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
          .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.

        j = eval('(' + text + ')');

        // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.

        return typeof reviver === 'function'
            ? walk({'': j}, '')
            : j;
      }

      // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
    };
  }

})();
