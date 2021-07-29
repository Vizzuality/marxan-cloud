@solutions_table
Feature: View solutions table

  @happypath
  Scenario: Open solutions modal
    Given the user is in the Solutions tab
    When the user clicks on 'View solutions table'
    Then the solution table modal opens on screen

  @happypath
  Scenario: View all solutions
    Given the user is in the solutions table modal
    When the user does not select the 'View 5 most different solutions'
    Then the user sees all the solutions ordered by run number

  Scenario: View 5 most different solutions
    Given the user is in the solutions table modal
    When the user selects the 'View 5 most different solutions'
    Then the user sees the 5 most different solutions ordered by run number

  @happypath
  Scenario: View solutions on map
    Given the user is in the solutions table modal
    When the user marks a solution in the 'View on map' column
    Then the solution is shown on the map
