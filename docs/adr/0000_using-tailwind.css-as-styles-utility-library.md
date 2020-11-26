# [FrontEnd] Using tailwind.css as styles utility library

* Date: 25 November 2020
* Status: accepted
* Deciders: Miguel Barrenechea, Javier Abia

## Context and problem statement

The set up of the Marxan project provide us with an opportunity to define an standard way to handle styles on a large project. Previous experiences show that style code-bases are hard to maintain and scale, since a lot of ad-hoc code needs to be written, and reusability is not easy to achieve due to cascading and nesting.

Having the chance to mimic the design UI kit on a [configuration file](https://tailwindcss.com/docs/theme) would give us the needed constrains and allow enough customization to ensure consistency through the platform. Tailwind would also allow us to create custom `CSS` whenever it is needed.

Production optimization techniques would also allow to ship less code to the end user.

## Considered options

* Component based stylesheets.
* Bootstrap
* Styled-components
* Tailwind

## Decision outcome

We will use tailwind as the `CSS` utility library to styles all the component on the platform.
In cases where components need modifier styles we would go for the approach of passing props that then would conditionally use the needed styles.

For example a button should look something like this:

`<Button size="xs" type="primary">Enable</Button>`

We think that would ease dev on-boarding since complexity gets hidden behind 'usual' React props and tailwind knowledge could be gained progressively.

## References

[Reusable tailwind components](https://www.smashingmagazine.com/2020/05/reusable-react-components-tailwind/)