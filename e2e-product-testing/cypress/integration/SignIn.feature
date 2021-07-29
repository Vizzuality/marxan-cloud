Feature: Sign in

  @happypath
  Scenario: correct email and password
    Given the user is in 'Sign in' page
    When the user introduces a correct email and password
    Then the user is sent to Project Dashboard

  Scenario: wrong email or password
    Given the user is in 'Sign in' page
    When the user introduces an incorrect email or password
    Then the user gets a notification on screen

  Scenario: recover password email
    Given the user is in 'Sign in' page
    And The user has forgotten his/her password
    When the user introduces his email
    Then an email with instructions is sent to the email provided

  Scenario: not registered email
    Given the user is in 'Sign in' page
    When the user introduces an email that is not registered
    Then the user gets a notification on screenF
