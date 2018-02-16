#mediaQueryResponse

mediaQueryResponse is a vanilla JS module that lets you register mediaQueries and subscribe to changes in them.

##Todo
- [x] Improve RC5 to v1.0.0
- [x] Release v1.0.0
- [ ] get constructive criticism 
- [ ] improve documentation

##Usage

Reference a shorter alias with `var mqr = mediaQueryResponse;`

####Registering queries 
```
mediaQueryResponse.registerQuery("xl", 1440);
mediaQueryResponse.registerQuery("lg", 960);
mediaQueryResponse.registerQuery("md", 768);
mediaQueryResponse.registerQuery("handheld", "(max-width: 800px)");
mediaQueryResponse.registerQuery("landscape", "(orientation: landscape)");
```

####Subscribing to changes
```
function any(event) {
    console.log("any", event);
}
function largeOne (event) {
    console.log("largeOne", event);
}
function largeTwo (event) {
    console.log("LargeTwo", event);
}
function mediumAndExtralarge (event) {
    console.log("mediumAndExtralarge", event);
}

var anyToken = mediaQueryResponse.subscribe("any", any);
var largeTokens = mediaQueryResponse.subscribe("lg", [largeOne, largeTwo]);
var mediumAndExtralargeTokens = mediaQueryResponse.subscribe(["md", "xl"], mediumAndExtralarge);
```

####Unsubscribing
```
mediaQueryResponse.unsubscribe(largeTokens);
```

####Changing/deleting queries
```
mediaQueryResponse.changeQuery("lg", 992);
mediaQueryResponse.changeQuery("xl", "(screen and (min-width: 992px))");

mediaQueryResponse.clearQuery("xl", false);

```

####Callback 
```
Object {
  label: "any",
  matches: false,
  query: "(max-width: 800px)",
  token: "0",
  trigger: "handheld"
}
```