@unmet_targets
Feature: View unmet targets
    Scenario: Move from Solutions to Features
        Given the user is in the Solutions tab
        And there are features that don't meet their target
        When the user clicks 'Go to features'
        Then the user is taken to the Feature tab
    Scenario: View features with unmet targets
        Given the user has run marxan
        And there are unmet targets
        And the user is in the Feature tab
        When the user click on 'Features that don't meet your targets'
        Then only the features that don't meet the target are shown on display

Feature: Modify unmet targets
    Scenario: Mark as met
        Given the user has run marxan
        And there are unmet targets
        And the user is in the Feature tab
        When the user selects 'Mark as met' on a feature
        Then that feature does not appear as unmet in the list
    Scenario: Increase FPF in all features at once
        Given the user has run marxan
        And there are unmet targets
        And the user is in the Feature tab
        When the user increases the FPF in the 'Change FPF in all not met features' box
        Then the new FPF set by the user appears in all the unmet features
    Scenario: Increase FPF in one feature
        Given the user has run marxan
        And there are unmet targets
        And the user is in the Feature tab
        When the user increases the FPF in the one feature
        Then the new FPF set by the user appears only for that feature

@solutions_table
Feature: View solutions table
    Scenario: Open solutions modal
        Given the user is in the Solutions tab
        When the user clicks on 'View solutions table'
        Then the solution table modal opens on screen
    Scenario: View all solutions
        Given the user is in the solutions table modal
        When the user does not select the 'View 5 most different solutions'
        Then the user sees all the solutions ordered by run number
    Scenario: View 5 most different solutions
        Given the user is in the solutions table modal
        When the user selects the 'View 5 most different solutions'
        Then the user sees the 5 most different solutions ordered by run number
    Scenario: View solutions on map
        Given the user is in the solutions table modal
        When the user marks a solution in the 'View on map' column
        Then the solution is shown on the map

Feature: Order solutions table
    Scenario: Order solutions by run
        Given the user is in the solutions table modal
        When the user selects 'Order by: Run numbers'
        Then the solutions are ordered by run number (lowest to highest)
    Scenario: Order solutions by score
        Given the user is in the solutions table modal
        When the user selects 'Order by: Score'
        Then the solutions are ordered by score (lowest to highest)
    Scenario: Order solutions by cost
        Given the user is in the solutions table modal
        When the user selects 'Order by: Cost'
        Then the solutions are ordered by cost (lowest to highest)
    Scenario: Order solutions by planning units
        Given the user is in the solutions table modal
        When the user selects 'Order by: Planning Units'
        Then the solutions are ordered by planning units (lowest to highest)
    Scenario: Order solutions by missing values
        Given the user is in the solutions table modal
        When the user selects 'Order by: Missing values'
        Then the solutions are ordered by missing values (lowest to highest)

Feature: Download solutions table
    Scenario: Download complete solutions table
        Given the user is in the solutions table modal
        When the user selects 'Download solutions'
        Then the user receives a bundle zip with all the result files in his/her local machine

@run_gap_analysis
Feature: View post-run gap Analysis
    Scenario: Open gap analysis (default view all features)
        Given the user is in Solutions tab
        When the user opens the 'View run gap analysis' modal
        Then the gap analysis displays all the features as a bar graph and on map
    Scenario: Gap analysis view selected features
        Given the user has opened the gap analysis 
        When the user selects on the open eye icon on the features bar graph
        Then the eye is crossed out and the layer is hidden in the map
    Scenario: Close gap analysis
        Given the user has opened the gap analysis
        When the user clicks on 'Close gap analysis'
        Then the gap analysis is no longer visible

Feature: Download gap analysis
    Scenario: download gap analysis
        Given the user is in the Solutions tab
        When the user clicks on 'Download'
        Then the user downloads a pdf with the gap analysis to his/her local machine

@download_files
Feature: Download files
    Scenario: Download input files
        Given the user is in the Solutions tab
        When the user clicks on 'Download Input files'
        Then the user receives a bundle zip with all the input files in his/her local machine 

@map_layers
Feature: View map layers
    Scenario: View layers on map
        Given the user is in the Solutions tab
        When the user has the open eye icon on any layer
        Then that layer is visible on the map
    Scenario: Hide layers on map
        Given the user is in the Solutions tab
        When the user has the crossed eye icon on any layer
        Then that layer is not visible on the map

@re-run
Feature: Re-reun scenario
    Given the user is in the Solutions tab
    When the user clicks Re-Run scenario
    Then the user is taken to the 'Run Scenario' modal

@step_by_step_planning
(**we need to revise all the names here**)
Feature: Stepwise planning modal
    Scenario: Open stewise planning modal
        Given the user is in the Solutions tab
        When the user clicks 'Schedule Scenario' 
        Then the user is taken to the Schedule scenario modal
    Scenario: Create new Stepwise plan
        Given the user is in the 'Stepwise planning' modal
        When the user selects 'New Schedule +'
        Then a new scheduling window opens with the sceanrio map preloaded

Feature: Step actions
    Scenario: Select planning units of a step
        Given the user is in the Stepwise planning modal
        And the user is in a step (currently names tier)
        When the user selects planning units to include
        Then the planning units appear on the map in a different color
    Scenario: Save selection of planning units
        Given the user is in the Stepwise planning modal
        And the user is in a step (currently names tier)
        And the user has selected some planning units
        When the user saves the selection
        Then the Step appears in the Stepwise modal
    Scenario: Remove selection of planning units
        Given the user is in the Stepwise planning modal
        And the user is in a step (currently names tier)
        And the user has selected some planning units
        When the user cancles the selection
        Then the selection disapears from the map
     Scenario: Add description to the step
        Given the user is in the Stepwise planning modal
        And the user is in a step (currently names tier)
        When the user writes a description
        Then the description appears in the box
    Scenario: Remove step
        Given the user is in the Stepwise planning modal
        When the user removes a step
        Then the step disapears from the modal

Feature: Run step_by_step plan
    Scenario: run stewise plan
        Given the user is in the Stepwise planning modal
        And the user has added at least one step
        When the user clicks on 'Run schedule'
        Then the new scenario is run and the results presented inside the Schedule modal


