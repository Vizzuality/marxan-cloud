Feature: Create New Scenario
    @happypath
    Scenario: create scenario inside platform
        Given the user is on the Project landing page (Marxan 03a)
        And the user selects 'Create Scenario +'
        And the user selects 'Marxan' (default)
        When the user Saves
        Then the a new scenario appears in the Project landing page
    Scenario: create scenario from upload
        Given the user is on the Project landing page (Marxan 03a)
        And the user selects 'Upload New Scenario'
        When the user uploads correct files
        Then a new Scenario appears in the Project landing page