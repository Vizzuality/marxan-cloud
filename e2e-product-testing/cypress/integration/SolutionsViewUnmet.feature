@unmet_targets
Feature: View unmet targets

  Scenario: Move from Solutions to Features
    Given the user is in the Solutions tab
    And there are features that don't meet their target
    When the user clicks 'Go to features'
    Then the user is taken to the Feature tab

  @happypath
  Scenario: View features with unmet targets
    Given the user has run marxan
    And there are unmet targets
    And the user is in the Feature tab
    When the user click on 'Features that don't meet your targets'
    Then only the features that don't meet the target are shown on display
