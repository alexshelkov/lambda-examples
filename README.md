An examples for [lambda-mdl](https://github.com/alexshelkov/lambda).

- Simple cache package 
- Logger transport which logs to Slack
- Integration with Yup and Superstruct which allow validating requests
- Demonstration of how use router may to pick validation service based on request

Cache
=====

Using Package to implement Caching mechanism, if cache is found then 
service return fail, so other services may be skipped. Combined with fail handler 
which return success result it allow to shortcut the request flow and not trigger
unnecessary middlewares and handlers.  
