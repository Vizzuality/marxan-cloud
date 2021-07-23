Feature: Set targets

  @happypath
  Scenario: Set individual target
    Given the user is in Features tab 2/2
    When the user changes the value of the target of one feature
    Then the new target is displayed for that feature

  @happypath
  Scenario: Set block target
    Given the user is in Features tab 2/2
    When the user changes the value in the section 'ALL TARGETS'
    Then the target of all the features display the new value
