# Intro

Error handling may be hard, since we may not even be aware what kind of 
errors may come. This code-guide is meant to describe how we decided to 
handle errors.

Please review small application within `./01-entry-point` first before 
further reading - try to mimic user flow - starting with controller.

# Issues

Try to answer the questions:

* How much time did you need to understand what results can main method yield?
* Do you know what errors underlying services can throw?
* Is it clear what error means for the whole process? (for example: if third 
  party service throws or return `undefined`, is it clear what does it mean?)
* Is it fine to return HTTP's `BadRequest` if some internal things break up? 
  Is it giving any real information to the consumer?
* If you were to use the module, would it be easy to understand (and handle) 
  its points of failures?

Of course those questions *could* be answered given some context - asking 
other team members, having a real implementation and enough time to analyse 
code.

What if I told you it can not be necessary to invest that much time to 
answer those questions and handle few additional issues that arisen?

# How to handle the issues?

First let's try to figure out if we can modify the code to clearly state the 
module (and services) API - like in SDK but without reading documentation 
other than code itself. Meet one of the functional programming principle: 
Monad. We won't be digging too much into actual handling it in a functional 
way for this very moment.

In our case, we will use `Either` type amplifier. This construction isn't 
complex and you may already have created similar code.

```typescript
type Either<E, A> = Left<E> | Right<A>
```

`Right` - indicates that the (returned) value is ...right (correct).
`Left` - convention dictates that it is used for failure.

Thus, we could leverage the explicit return type like:

`someFunction(): Promise<Either<SomeErrorTypes, ReturnValue>>`

Please jump into `02-module-contract` to see how the application changed 
before further reading.

# Errors - but what errors?

Now, the signatures changed:

```typescript
doSomething() : Promise<Either<MagicActionErrors, MagicActionSuccess>> {};
get(): Promise<Either<ThirdPartyErrors, Result>> {}

// and "facade" as well:
doComposedAction(): Promise<
Either<ComposedActionError, OperationSubmitted>
> {}
```
Now, by just reading the signatures, we know what can go wrong, errors may 
have descriptive names, as well as the outcome.

Let's now talk about errors - what those can be? We have a couple of options:
* `Error` instances
* `enum`s
* `Symbol`s

Each of those has its pros and cons, so let's go through them briefly:

`Error`
* (+) seems right, as it is error
* (+) can contain stack trace (but do consumer care?)
* (-) can contain stack trace (aren't we leaking details to end user?)
* (-) messy to handle for particular kind (`instanceof`)
* (-) the `instanceof` may not work if error comes from library (in 
  particular applies to NestJS's Http exceptions)

`enum`
* (+) straightforward to create
* (-) in theory union is possible but not easy to handle (see `enum-union`)
* (-) may contain clashes with values (see `enum-union`)

`Symbol`
* (+) straightforward to create
* (+) easy union
* (+) no clashes

Choice is debatable but for brevity, `Symbol` seems to be the best option 
out of mentioned above. Let's now head to `03-errors-contract` to see 
"refactor" result that more closely tells, what kind of issues we can meet 
while using our module.

# Errors union & serialization

As per code, our internal services' errors become:

```typescript
export type MagicActionErrors = typeof forbidden | typeof unknownError | typeof invalidEmail;
export type ThirdPartyErrors = typeof notReachable | typeof timeout;

// and facade remains exactly the same
export type ComposedActionError = MagicActionErrors | ThirdPartyErrors;
```

Now, how we should map those errors to end user? It depends a lot on context,
purpose, end users audience and many other factors. It is recommended to 
create specialized service to handle those in given layer (like HTTP) - it 
is also good place to include i18n and such. Some straightforward example is 
available in `serializer.ts` - of course it would be even further improved 
to reduce `switch`s boilerplate.

In the end, our controller is now really "only" controlling flow:
```typescript
async doThings() {
    const result = await this.facade.doComposedAction();
    this.serializer.map(result);
  }
```

# What if the code throws instead returning Left?

It cannot be helped. The good thing is that it means this error was not 
really expected and will bubble up till the top (so for common application, 
will result in `InternalServerException`). 

Unless there is some specific case that business requires some 
rollback/compensate action, we don't have to care tho - at least at code 
level. Such error of course should be investigated.

# Is it always necessary?

Not really. If the structure is shallow, uses internal service that is dead 
simple (for example: `(): Promise<User | undefined?`) it may be pretty 
obvious what it does (as long as it does not have complicated conditions 
under the hood).

Consider using it when things may be not *really* obvious.

# Other cons?

* more code (to document possible outcomes - is it a con?)
* more code to handle results
* ... more?

Given the cost of the above, it seems very little when compared to our 
future us or other team members trying to figure out how to use the 
module/service.
