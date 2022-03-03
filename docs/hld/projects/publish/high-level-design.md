# Project publishing - High Level Design

* According to the
  [design](https://www.figma.com/file/p2R8McgbBALAQcdhcklTjq/Marxan-Visual_V03?node-id=7721%3A10470)
  the published project can have its own:

	* name
	* description
	* tags
	* creators
	* scenario thumbnail

* User can see frequency maps, but not features
  ([refs](https://vizzuality.atlassian.net/browse/MARXAN-864?focusedCommentId=13137))

* We shouldn’t need to show protected areas for public projects in public view
  (non-authenticated users)
  ([refs](https://vizzuality.atlassian.net/browse/MARXAN-863?focusedCommentId=13138))

* Users will only be able to publish an entire project: there is no option to
  only make public a subset of a project's scenarios. However, users may
  typically create several "draft" scenarios during the lifecycle of a
  conservation project, which they would likely not consider as ready to be
  shared. In these cases, users will:
  * clone the project they wish to publish, specifying which scenarios to
    include in the cloned copy, and then
  * publish the cloned project, which will then include only the scenarios they
    wish to make public
  * (users could also clone the entire set of scenarios and manually delete any
    scenarios they don't wish to make public)
  * if further work is then carried out in scenarios of the _original_ project
    and users wish to make this new/updated conservation planning work public,
    they may choose to delete the cloned project, create a new clone (again,
	possibly selecting only a subset of its scenarios) and than make this new
	clone public: at this stage, the public project will have all the most
	recent scenarios, copied over from the "original" project.
  * as a corollary of the above, any new scenarios created in a published
    project will be publicly visible; any scenarios deleted from a published
    project will, likewise, become unavailable from the public view.
# To be decided

Some things still need spikes/analysis/decisions. As they may not be
straightforward, we should consider writing down all pros/cons of all possible
solutions that the team can come up with, finally making a decision and
describing why a given solution was picked (and others were discarded).

* Handling scenario thumbnail

	* since users should be allowed to choose which scenario of the project to
	  use for thumbnails, if the scenario chosen (as "highlight", let's say) is
	  deleted, we may either want to prevent deletion (I'd say this is not
	  desirable) or ask the user to pick another scenario to highlight before
	  deleting it, or fall back to no map

	* if project doesn't have any scenarios, only planning area should be shown

	* if users share a project that already has scenarios, should we prevent the
	  project from being shared until at least one scenario has reached some
	  kind of "completeness" in terms of configuration?

	* for public and private projects

		* how will thumbnails be generated? (possibly by using the webshot
		  service)

		* where will the thumbnails be stored? (can we access them through a
		CDN?)

* should we focus on SEO of public project pages?
