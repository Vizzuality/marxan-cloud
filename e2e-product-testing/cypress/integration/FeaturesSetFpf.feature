Feature: Set FPF

  @happypath
  Scenario: Set individual FPF
    Given the user is in Features tab 2/2
    When the user changes the value of the FPF of one feature
    Then the new FPF is displayed for that feature

  @happypath
  Scenario: Set block FPF
    Given the user is in Features tab 2/2
    When the user changes the value in the section 'ALL FPF'
    Then the FPF of all the features display the new value
