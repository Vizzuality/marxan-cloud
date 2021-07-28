Feature: Feature processing

  @happypath
  Scenario: Feature processing
    Given the user is in Feature tab 2/2
    When the user clicks 'Continue'
    Then the user is sent to the Project dashboard to view the status of the Scenario
