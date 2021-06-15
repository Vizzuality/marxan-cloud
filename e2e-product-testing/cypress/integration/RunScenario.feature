Feature: Boundary length modifier
    Scenario: Modify boundary length modifier with correct value
        Given the user is in the Run Scenario modal
        When the user writes a value between the max and min allowed
        Then the new value appears in the blm box
    Scenario: Modify boundary length modifier with incorrect value
        Given the user is in the Run Scenario modal
        When the user writes a value outside of the max and min allowed
        Then the user gets a notification on screen

Feature: Number of repetitions
    Scenario: Modify number of repetitions with correct value
        Given the user is in the Run Scenario modal
        When the user writes a value between the max and min allowed
        Then the new value appears in the 'number of repetitions' box
    Scenario: Modify number of repetitions with incorrect value
        Given the user is in the Run Scenario modal
        When the user writes a value outside of the max and min allowed
        Then the user gets a notification on screen

Feature: Advanced settings
    Scenario: Open advanced settings
        Given the user is in the Run Scenario modal
        When the user opnes the Advanced Setting modal
        Then a modal appears with all the possible values the user can mofify and their allowed ranges
    Scenario: Modify with correct value
        Given the user is in the 'Advanced Settings' modal
        When the user writes a value between the max and min allowed
        Then the new value appears in the corresponding box
    Scenario: Modify with incorrect value
        Given the user is in the 'Advanced Settings' modal
        When the user writes a value outside of the max and min allowed
        Then the user gets a notification on screen

Feature: Run Marxan
    Scenario: run marxan
        Given the user is in the Run Scenario modal
        When the user selects 'Run Scenario'
        Then the user is sent to the Project dashboard to view the status of the Scenario