# AsyncHandler

[![npm version](https://badge.fury.io/js/asynchandler.svg)](https://www.npmjs.com/package/asynchandler)

This library provides a generic interface which you can use for classes,
so they can easily be combined using composite patterns.
An `AsyncHandler` implementation has 3 functions: `canHandle`, `handle`, and `handleSafe`.

`canHandle` is used to determine if a class supports a given input.
In case it does not, it should throw an error.
If a `canHandle` call succeeds, the `handle` function can be called to perform the necessary action.
`handleSafe` is a utility function that combines the above two steps into one.

For example, assume you want to handle an HTTP request,
and have a separate class for every HTTP method.
In the `canHandle` call for each of those,
they would check if the method is the correct one and throw an error if this is not the case.
In the `handle` call, they could then perform the necessary action for this method,
knowing that the request has the correct method.

This library comes with several utility composite handlers that can be used to combine such handlers into one.
These have the same interface, so from the point of view of the caller,
a single HTTP request class, and a composite handler that combines all the HTTP request classes,
look and perform the same.

## Composite handlers

Below is an overview of all composite handlers provided in this library.

### AsyncHandler

The main interface. Although in practice this is actually an abstract class.
This way it can provide a default `canHandle` implementation that always succeeds,
and a `handleSafe` implementation that calls `canHandle`, and then `handle` if the first succeeds.

### BooleanHandler

Takes as input one or more handlers that return a boolean.
This handler will return `true` if any of the input handlers can handle the input and return `true`.

### CachedHandler

Caches the result of the source handler in a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).
The input is used as the key to cache with.
Input field names can also be provided to only use a subset of the input.

### ParallelHandler

Runs the `handleSafe` function of all its source handlers simultaneously.
The `canHandle` of this handler will always succeed.

### ProcessHandler

A handler made for worker threads.
It can be used to only run the source handler depending on if it is executed on the primary or a worker thread.

### SequenceHandler

Runs all its handlers sequentially and returns the result of the last one that can handle the input.
The `canHandle` of this handler will always succeed.

### StaticHandler

A handler that always succeeds and returns the provided value.

### StaticThrowHandler

A handler that always throws the provided error.
It can be configured to always succeed `canHandle` and only throw when `handle` is called,
or to throw in both cases.

### UnionHandler

An abstract class that combines the results of all its source handlers in some way.
How these are combined is determined by the abstract `combine` function.
It can be configured to ignore handlers that do not support the input,
and to ignore errors.

#### ArrayUnionHandler

A `UnionHandler` that combines and flattens the results of its source handlers into a single array.

### WaterfallHandler

This handler will call the `handle` function of the first source handler where the `canHandle` call succeeds.

## Utility

Besides the composite handlers, some utility functions and classes are provided.

### findHandler

A function that returns the first handler from a list of handlers where `canHandle` succeeds.
Throws an error if no such handler can be found.

### filterHandlers

Filters a list of handlers to only return those where `canHandle` succeeds.
Throws an error if this would be an empty list.

### ErrorFactory

An interface for a factory that can create errors.
This can be used in combination with a `StaticThrowHandler`.

#### BaseErrorFactory

An `ErrorFactory` that creates a standard Error.

#### ClassErrorFactory

An `ErrorFactory` that reuses the constructor of the input Error.
