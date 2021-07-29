@happypath
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
