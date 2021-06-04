Feature: Sign up
    Creating an account won't be fully testable via Cypress only, 
    as we'd need to get the user activated and this will involve an email step

    Scenario: Not accepted terms and conditions
        Given the user is in 'Sign up' page
        And the user has introduced his/her information
        But the user hasn't accepted the Terms of service
        When the user clicks 'Sign up'
        Then the user gets a notifciation on screen
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
        And the user is alredy registered
        When the user clicks 'Sign up'
        Then the user gets a notifciation on screen to 'Sign In'

Feature: validate account
    Scenario: correct email introduced
        Given the user has received a 'Sign up' validation email
        When the user clicks on the provided link
        Then the user's account is validated

Feature: Sign in
    Scenario: correct email and password
        Given the user is in 'Sign in' page
        When the user introduces a correct email and password
        Then the user is sent to Project Dashboard
    Scenario: wrong email or password
        Given the user is in 'Sign in' page
        When the user introduces an incorrect email or password
        Then the user gets a notifciation on screen
    Scenario: recover password email
        Given the user is in 'Sign in' page
        And The user has forgotten his/her password
        When the user introduces his email
        Then an email with instructions is sent to the email provided
    Scenario: not registered email
        Given the user is in 'Sign in' page
        When the user introduces an email that is not registered
        Then the user gets a notifciation on screenF
