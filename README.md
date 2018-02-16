# mediaQueryResponse

mediaQueryResponse is a vanilla JS module that lets you register mediaQueries and subscribe to changes in them.


## Todo
- [x] Improve RC5 to v1.0.0
- [x] Release v1.0.0
- [ ] get constructive criticism 
- [ ] improve documentation


## Usage

Reference a shorter alias with `var mqr = mediaQueryResponse;`

### Registering queries 
```
// Use with integers
mediaQueryResponse.registerQuery("xl", 1440);
mediaQueryResponse.registerQuery("lg", 960);
mediaQueryResponse.registerQuery("md", 768);

// or any other mediaQuery that may change during runtime
mediaQueryResponse.registerQuery("handheld", "(max-width: 800px)");
mediaQueryResponse.registerQuery("landscape", "(orientation: landscape)");
```

### Subscribing to changes
Have some functions,
```
function any(data) {
    console.log("any", data);
}
function largeOne (data) {
    console.log("largeOne", data);
}
function largeTwo (data) {
    console.log("LargeTwo", data);
}
function mediumAndExtralarge (data) {
    console.log("mediumAndExtralarge", data);
}
```
then subscribe a (list of) function(s) to a (list of) query(s), returning tokens for handlers.
```
var largeTokens = mediaQueryResponse.subscribe("lg", [largeOne, largeTwo]);
var mediumAndExtralargeTokens = mediaQueryResponse.subscribe(["md", "xl"], mediumAndExtralarge);
```
Note that "any" does not have to be registered first but fires on every possible change.
```
var anyToken = mediaQueryResponse.subscribe("any", any);
```

### Unsubscribing
Unsubscribe by giving the previously aquired tokens
```
mediaQueryResponse.unsubscribe(largeTokens);
```

### Changing/deleting queries
Change mediaQueries if you need.
```
mediaQueryResponse.changeQuery("lg", 992);
mediaQueryResponse.changeQuery("xl", "(screen and (min-width: 992px))");
```
Or completely clear them
```
mediaQueryResponse.clearQuery("xl", false);
```

### Example of returned data  
```
Object {
  label: "any",
  matches: false,
  query: "(max-width: 800px)",
  token: "0",
  trigger: "handheld"
}
```