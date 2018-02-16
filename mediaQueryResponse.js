/*!
 * mediaQueryResponse (MQR) v1.0.0
 *
 * A module that lets scripts register and subscribe to mediaQueries,
 * monitors and subsequently publishes to changes subscribers.
 *
 *
 * == Subscribe/Publish Architecture
 * Provides a subscribe/unsubscribe-service for other scripts and publishes changes.
 *
 * == Revealing Module Pattern
 * Gives control over which variables/methods to expose by returning them.
 *
 * == Dependencies
 * Depends on the Browsers matchMedia-API, will complain and not work but will not error if not found.
 *
 * @author: Sebastian Wolfertz (https://github.com/Enkrod)
 * @license: MIT
 */


var mediaQueryResponse = (function () {

    //*********************
    //********************
    // Private Properties
    //********************
    //*********************

    //== Configuration
    var _config = {
        enabled: true,
        debug: false
    };

    //== storage object for mediaQueries and subscribers
    var _mediaQueries = {
            "any": {
                subscribers: {}
            }
        },
        _labelByToken = {},
        _labelByQuery = {},
        _lastUid = -1;


    //******************
    //*****************
    // Private Methods
    //*****************
    //******************

    // Checks is a variable is undefined
    function _isDefined(variable) {
        return typeof(variable) !== "undefined";
    }

    // Executes a response with parameters if it is a function
    function _runResponse(response, parameter) {
        if (typeof(response) === "function") {
            response(parameter);
        } else {
            console.warn("mediaQueryResponse: Not a function:", response);
        }
    }

    // Forms a mediaQuery-string from an integer or a query string
    function _getQueryString(short) {
        // check if short is integer
        if (typeof short === typeof 123 && (short % 1) === 0) {
            return "screen and (min-width: " + short + "px)";
        }
        if (typeof short === "string") {
            return short;
        }
        console.warn("mediaQueryResponse: Query does not parse!", short);
        return false;
    }

    // Checks if mediaQueryResponse is enabled and complains if disabled
    function _isEnabled() {
        if (!matchMedia) {
            console.warn("mediaQueryResponse: No matchMedia-API found - mediaQueryResponse won't work!");
            return false;
        }
        if (!_config.enabled) {
            if (_config.debug) {
                console.warn("mediaQueryResponse: Disabled!");
            }

            return false;
        }
        return true;
    }

    // Publishes a mediaQuery change to all subscribers
    function _publish(label, trigger, event) {
        var param, response, token, subscribers;
        subscribers = _mediaQueries[label].subscribers;
        for (token in subscribers) {
            if (subscribers.hasOwnProperty(token)) {
                response = subscribers[token];
                param = {matches: event.matches, query: event.media, label: label, token: token, trigger: trigger};
                if (_config.debug) {
                    console.log("mediaQueryResponse: debugging", response, param);
                }
                _runResponse(response, param);
            }
        }
    }


    //*****************
    //****************
    // Public Methods
    //****************
    //*****************

    //****************
    // Administrators
    //****************

    // MQR can be shut down from outside
    function shutdown() {
        _config.enabled = false;
        return true;
    }

    // Debugging-mode can be changed from the outside.
    function debug(dbg) {
        if (_isDefined(dbg)) {
            if (typeof(dbg) === typeof(true)) {
                _config.debug = dbg;
                console.log("mediaQueryResponse: Debugging set to: \"" + dbg + "\".");
                return _config.debug;
            } else {
                console.warn("mediaQueryResponse: Debugging-state cannot be set, needs to be boolean or undefined:", dbg);
                return false;
            }
        } else {
            _config.debug = !_config.debug;
            console.log("mediaQueryResponse: Debugging toggled: \"" + _config.debug + "\".");
            return _config.debug;
        }
    }


    //**********
    // Services
    //**********

    // Registers a mediaQuery and sets up publishing service for later subscribers
    function registerQuery(label, short) {

        if (!_isEnabled()) {
            return false;
        }

        var query = _getQueryString(short);

        if (_isDefined(_labelByQuery[query])) {
            console.warn("mediaQueryResponse: Query \"" + query + "\" already registered, instead of registering \"" + label + "\" use existing Query: \"" + _labelByQuery[query] + "\".");
            return false;
        }
        if (_isDefined(_mediaQueries[label])) {
            console.warn("mediaQueryResponse: Query \"" + label + "\" already registered.");
            return false;
        }

        _mediaQueries[label] = {
            query: query,
            api: window.matchMedia(query),
            subscribers: {},
            call: function (event) {
                _publish(label, label, event);
                _publish("any", label, event);
            }
        };
        _mediaQueries[label].api.addListener(_mediaQueries[label].call);
        _labelByQuery[query] = label;

        return true;
    }

    // Change an existing query to a new queryString
    function changeQuery(label, short) {
        if (!_isEnabled()) {
            return false;
        }

        // Build new query
        var newQuery = _getQueryString(short);

        // Has the label been registered at all?
        if (!_isDefined(_mediaQueries[label])) {
            console.warn("mediaQueryResponse: Query \"" + label + "\" not registered.");
            return false;
        }
        // Has the new querystring already a label?
        if (_isDefined(_labelByQuery[newQuery])) {
            console.warn("mediaQueryResponse: Cannot change Query \"" + label + "\" to \"" + newQuery + "\" already registered by \"" + _labelByQuery[newQuery] + "\".");
            return false;
        }

        // Remove old lookup
        delete _labelByQuery[_mediaQueries[label].query];

        // Remove old listener
        _mediaQueries[label].api.removeListener(_mediaQueries[label].call);


        // Store new lookup
        _labelByQuery[newQuery] = label;

        // Overwrite storage-object properties
        _mediaQueries[label].query = newQuery;
        _mediaQueries[label].api = window.matchMedia(newQuery);

        // Create new listener
        _mediaQueries[label].api.addListener(_mediaQueries[label].call);

        return true;
    }

    // Clear a query, delete all labels, tokens, queries and subscriptions
    function clearQuery(label, safeMode) {

        if (!_isEnabled()) {
            return false;
        }

        safeMode = (_isDefined(safeMode)) ? safeMode : true;

        // Has the query been registered at all?
        if (!_isDefined(_mediaQueries[label])) {
            console.warn("mediaQueryResponse: Query \"" + label + "\" not registered.");
            return false;
        }

        // Does it still have subscribers?
        for (var token in _mediaQueries[label].subscribers) {
            if (_mediaQueries[label].subscribers.hasOwnProperty(token)) {

                // Has subscribers, is it in safeMode?
                if (safeMode) {
                    console.warn("mediaQueryResponse: Query \"" + label + "\" has subscribers and safeMode is ON. Not cleared.");
                    return false;
                }

                unsubscribe(token);
            }
        }
        _mediaQueries[label].api.removeListener(_mediaQueries[label].call);
        delete _labelByQuery[_mediaQueries[label].query];
        delete _mediaQueries[label];

        return true;
    }

    // Subscribe a (list of) function(s) to a (list of) query(s), returning tokens for handlers
    function subscribe(label, response, tokens) {
        tokens = _isDefined(tokens) ? tokens : [];
        if (Array.isArray(label)) {
            for (var i = 0; i < label.length; i++) {
                tokens = subscribe(label[i], response, tokens);
            }
            return tokens;
        } else if (Array.isArray(response)) {
            for (var j = 0; j < response.length; j++) {
                tokens = subscribe(label, response[j], tokens);
            }
            return tokens;
        } else {
            if (_mediaQueries.hasOwnProperty(label)) {
                var token = ++_lastUid;
                _mediaQueries[label].subscribers[token] = response;
                tokens.push(token);
                _labelByToken[token] = label;
            } else {
                console.warn("mediaQueryResponse: Query for \"" + label + "\" undefined, please register a query through: mediaQueryResponse.registerQuery(\"" + label + "\", 'SomeQuery').");
                tokens.push(false);
            }
            return tokens;
        }
    }

    // Unsubscribe a (list of) token(s)
    function unsubscribe(token) {
        if (Array.isArray(token)) {
            for (var i = 0; i < token.length; i++) {
                unsubscribe(token[i]);
            }
        } else {
            if (_mediaQueries.hasOwnProperty(_labelByToken[token])) {
                delete _mediaQueries[_labelByToken[token]].subscribers[token];
                delete _labelByToken[token];
            } else {
                console.warn("mediaQueryResponse: Cannot unsubscribe from non-existent token \"" + token + "\".");
                return false;
            }
        }
    }


    //***************************************
    //**************************************
    // Reveal public properties and methods
    //**************************************
    //***************************************

    return {
        //== Methods
        // Administrators
        debug: debug,
        shutdown: shutdown,
        // Services
        registerQuery: registerQuery,
        clearQuery: clearQuery,
        changeQuery: changeQuery,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    };
})
();