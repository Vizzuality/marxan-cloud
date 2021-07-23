Feature: Sign up
  Creating an account won't be fully testable via Cypress only,
  as we'd need to get the user activated and this will involve an email step

  Scenario: Not accepted terms and conditions
    Given the user is in 'Sign up' page
    And the user has introduced his/her information
    But the user hasn't accepted the Terms of service
    When the user clicks 'Sign up'
    Then the user gets a notification on screen

  Scenario: Accepted terms and conditions
    Given the user is in 'Sign up' page
    And the user has introduced his/her information
    And the user has accepted the Terms of service
    When the user clicks 'Sign up'
    Then an email is sent to the email provided

  Scenario: Already registered
    Given the user is in 'Sign up' page
    And the user has introduced his/her information
    And the user has accepted the Terms of service
    And the user is already registered
    When the user clicks 'Sign up'
    Then the user gets a notification on screen to 'Sign In'

  Scenario: correct email introduced
    Given the user has received a 'Sign up' validation email
    When the user clicks on the provided link
    Then the user's account is validated
