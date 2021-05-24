/**
 * This is a simple no-op stub type declaration file for
 * https://github.com/SeyZ/jsonapi-serializer
 *
 * @debt we should be using
 * `https://www.npmjs.com/package/@types/jsonapi-serializer`, but this does not
 * currently support using arbitrarily-named keys that are needed to describe
 * relationships in `SerializerOptions`.
 *
 * > [...] You can define an attribute as an option if you want to define some
 * > relationships [...]
 * > (https://github.com/SeyZ/jsonapi-serializer#available-serialization-option-opts-argument)
 *
 * Ideally, we should extend the upstream DefinitelyTyped declaration to support
 * TS mapped types, with key names restricted to attribute names listed in the
 * `attributes` prop.
 */
declare module 'jsonapi-serializer';
