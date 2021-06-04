Feature: Select Protected Areas  
    Scenario: Add WDPA from platform
        Given the user is on the Protected Areas tab 1/2
        When the user selects and saves the protected areas he/her wants to add
        Then the selected pas show on the map with no threshold applied
    Scenario: Add PAs from upload
        Given the user is on the Protected Areas tab 1/2
        When the user Uploads a correct shp
        Then the selected pas show on the map with no threshold applied

Feature: Set Protected Areas threshold
    Scenario: Set threshold
    Given the user is on the Protected Areas tab 2/2
    When the users sets a threshold value and saves
    Then the map shows the result of crossing PAs and PUs areas at the thresholod value