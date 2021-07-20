Feature: Modify unmet targets

  @happypath
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

  @happypath
  Scenario: Increase FPF in one feature
    Given the user has run marxan
    And there are unmet targets
    And the user is in the Feature tab
    When the user increases the FPF in the one feature
    Then the new FPF set by the user appears only for that feature


