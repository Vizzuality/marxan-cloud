# High Level Design

* According to the [design](https://www.figma.com/file/hq0BZNB9fzyFSbEUgQIHdK/Marxan-Visual_V02?node-id=4684%3A7130) the
  published project can have its own:
	* name
	* description
	* tags
	* creators
	* scenario thumbnail
* User can see frequency maps, but not
  features ([refs](https://vizzuality.atlassian.net/browse/MARXAN-864?focusedCommentId=13137))
* We shouldn’t need to show protected areas for public projects in public view (non-authenticated
  users) ([refs](https://vizzuality.atlassian.net/browse/MARXAN-863?focusedCommentId=13138))

# To be declared

Things that still need some spike/analysis/decision. As they may not be straightforward, we should consider writing down
all pros/cons of all possible solutions that team can come up with, finally making a decision and describing why given
solution was picked (and others were discarded).

* Handling scenario thumbnail
	* since users should be allowed to choose which scenario of the project to use for thumbnails, if the scenario
	  chosen (as "highlight", let's say) is deleted, we may either want to prevent deletion (I'd say this is not
	  desirable) or ask the user to pick another scenario to highlight before deleting it, or fall back to no map
	* if project doesn't have any scenarios, only planning area should be shown
	* if users share a project that already has scenarios, should we prevent the project from being shared until at
	  least one scenario has reached some kind of "completeness" in terms of configuration?
	* for public and private projects
		* how thumbnail will be generated? (some job to run headless chrome and render tile?)
		* where the thumbnail will be stored? (can we access it through cdn?)
* what happens if someone adds another scenario to already published project? Is it also public?
* should we care about SEO of public project page?    
