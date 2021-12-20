# Export 

1. `Project-pieces required to export resolver` - https://vizzuality.atlassian.
net/browse/MARXAN-832

Currently, the pieces are "hardcoded". `ProjectMetadata` and `ProjectConfig` 
should always be there. For release 1, we planned only full project export 
and metadata of its scenarios - nothing more, till full flow is implemented 
and tested - so the main scope of this is to return relevant pieces if they 
are available for given project.

1. This task may be connected/prefixed with https://vizzuality.atlassian.net/browse/MARXAN-833 - which is designed to do the same for underlying 
scenarios, thus `ResourcePiecesAdapter` could use standalone 
`ScenarioPiecesAdapter` to return relevant Pieces (including 
ScenarioMetadata) for later extension of scenario details.

2. Guard for not allowing any changes while export is ongoing:
   https://vizzuality.atlassian.net/browse/MARXAN-838
This actually is "more" for the whole project/scenarios - while frontend 
   blocks UI while there are any pending asynchronous jobs, API does not 
   block it - so there should be a mechanism to prevent any edit/creation as 
   long as there are any jobs running

3. Similar to the above -  https://vizzuality.atlassian.net/browse/MARXAN-837 - export should be not allowed to request while 
   there are any other asynchronous jobs. Most likely those two overlaps 
   with single functionality.
4. https://vizzuality.atlassian.net/browse/MARXAN-1102 - mainly error 
   handling to mark Async Job as failed 
5. https://vizzuality.atlassian.net/browse/MARXAN-871 - currently Export 
   metadata is persisted in memory
6. https://vizzuality.atlassian.net/browse/MARXAN-1123 - currently, if 
   creating final archive failed, process will be "pending forever" - more 
   details in task description
7. https://vizzuality.atlassian.net/browse/MARXAN-1128 - ACL for 
   export/getting archive
8. https://vizzuality.atlassian.net/browse/MARXAN-1129 - allowing to 
   get export archive - currently implemented for brevity, see task description 
9. https://vizzuality.atlassian.net/browse/MARXAN-1130 - getting archive 
   requires export it - again it was implemented for fast MVP. Details for 
   improvement in task.
10. Create tasks to implement each of piece-export properly - see 
    `api/apps/geoprocessing/src/export/pieces-exporters` exporters. May 
    require using Shapefile service and getting through database schema. 
11. https://vizzuality.atlassian.net/browse/MARXAN-1145 - error handling in 
    case any of the exported pieces fail
12. https://vizzuality.atlassian.net/browse/MARXAN-1146 - Spike - to figure 
    out parallel processing of exported pieces
13. Export state repository - https://vizzuality.atlassian.
	net/browse/MARXAN-871 & https://vizzuality.atlassian.net/browse/MARXAN-1147

14. Wrapping up task:
https://vizzuality.atlassian.net/browse/MARXAN-875 to ensure the zip is 
    produced/valid - currently it "works" but due to  all the tasks above, it 
    may break anytime

# Import

Import pieces resolver - https://vizzuality.atlassian.net/browse/MARXAN-834
upon reading archive content (unpacked?) it should resolve which pieces (and 
in what order) should be requested to import.

Similar to export project/scenario pieces - https://vizzuality.atlassian.net/browse/MARXAN-835 for resolving pieces to import within given Import

No other tasks are created for now till the base flow is implemented. What 
are the tasks and how to implement them is the team tasks. Note the `Import` 
domain to see how it is supposed to work - as well as look at the graphs.

# Notes 
* exporting `Scenario` alone is not supported yet - should be implemented 
  later (see development plan)
