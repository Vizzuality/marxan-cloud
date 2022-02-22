# Requirements

Every feature comes from the needs. Our job, as engineers, is to understand 
how the process works for business in real life, what are the limitations 
and the problem to solve.

Don't be fooled with `requirements on table` - in perfect world, we shall 
try to challenge the given to know more.

Our initial task is to fully understand what we will be building, what is
the purpose and how this will improve users/product. Consider some questions 
below which are helpful to ask:

* `why` this at all?
* `how` will this affect the product and the users?
* `how` will we measure success?
* `what` is the added value?
* `how` will people use it?

The above is just a shallow version of Domain Driven Design process which 
helps business and software to meet at same level - and model software.

At this very stage of understanding the need, design shouldn't likely come 
first - as UX is something that could be explained as "how to meet the User 
and the Business needs". Sure it helps to visualise things but, in the end, 
UI/UX will likely not be suitable until we understand the needs and real 
life process.

Does it mean we should always force Event Storming (or similar) sessions? Of 
course not. We may have no expert in place, we may have trouble reaching 
Stakeholders/Product Owner. We can still develop software but bear in mind - 
we have more chances to build wrong things (even if they would be built in a 
correct way).

❗ Regardless how we managed to gather the understanding, everything should be 
noted in `brief.md` document within the repository to ensure we have a 
single source of truth.

# Bringing High Level Design document

Once we have main knowledge noted down, we can start preparing HLD document 
which will describe how we will be taking care of the implementation on 
really *high level*. What does it mean? As we are working with multiple 
teams that need to work in cooperation/parallel, we should agree on main 
points in advance to avoid surprises.

For example within this project:
* part of the process will be asynchronous, so we may agree which parts in 
  the process and how we will handle it (websockets, polling...).
* we will have some GeoJSON handling - so let's declare what are the 
  consumable shapes or limitations (size, features, collections...)
* public project changes required endpoints switching - so declaring what 
  are the shapes of the new one is a good thing to add
* public project needed the thumbnail generation which isn't straightforward, 
  so team could conduct a spike (investigation) before writing it down to 
  the document, how it will be implemented (frontend exposing some page, api 
  crawling through it with headless browser, uploading the screenshot somewhere)
* what data will be stored/calculated where (session, localstorage, jwt, 
  database...)

To sum up, such document may describe important matters like needed `spikes`,
the contract between teams (like backend and frontend, may be more!) and 
main assumptions that have high impact on implementation.

# Preparing development plan

Once we know the scope and main assumptions, we can identify spikes, core 
parts of the implementation and MVP-like approach to deliver fast, we can 
write down the initial plan how we will carry out the feature on a high level.

# Low level design document

Once the above are done, each team can start preparing more details, 
depending on the needs. It may include what/where will be stored 
(localStorage/session/in memory; database/redis), which libraries should be 
used (if any).

It is also a great moment to code down the main abstractions the team will 
be coding around: `domain`, `application`/`use cases`. The main purpose is 
that we build first the `core` of the feature focusing on `logic` rather 
than on implementation details (how we persist things, connect with 3rd 
party...) - those parts can be filled later, working in parallel by the 
whole team, if prepared correctly.

# Next?

Now we are ready to create JIRA tasks filling the gaps for each 
implementation step, as well as estimating them - as they are really 
granular, it should help a lot with poker planning or any other methodology.

As quite the effort was already made for analysing the feature, one may say 
the rest is just a formal thing - and it isn't far from the truth (assuming 
we weren't wrong anywhere) - right now, most obstacles are removed, main 
entry points are in place, every discussion is settled.

# Why?

Why bother much? Think of `development process funnel`. The fewer 
mistakes/unknowns we make at the very beginning, the least they 
propagate down the stream. The later we find the issue, the harder it is to 
change plans and the more it costs to undo.

But it still can happen. 

The process above helps to reduce the risk but more importantly - allows the 
team to understand product and needs.

Is this process always applicable? Maybe not - if we need a quick MVP on some feature, it may 
be skipped to just deliver something really quick to verify some idea. Don't 
blindly stick to process - as the Agile Manifesto says, processes are for us,
not the other way around.
