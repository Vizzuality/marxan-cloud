Feature: Include planning units

  Scenario: upload correct lock-in shp
    Given the user is in the Analysis tab
    And the user has selected 'Include areas'
    And the user has selected 'Upload shapefile'
    When the user uploads a correct shapefile
    Then the area is displayed on the map and as a removable modal

  Scenario: upload incorrect lock-in shp
    Given the user is in the Analysis tab
    And the user has selected 'Include areas'
    And the user has selected 'Upload shapefile'
    When the user uploads an incorrect shapefile
    Then the user gets an error on screen

  @happypath
  Scenario: draw lock-in area over map
    Given the user is in the Analysis tab
    And the user has selected 'Include areas'
    And the user has selected 'Draw a shape on map'
    When the user draws on the map
    Then the area is displayed on the map and as a removable modal

  @happypath
  Scenario: select individual lock-in planning units on map
    Given the user is in the Analysis tab
    And the user has selected 'Include areas'
    And the user has selected 'Select planning units'
    When the user selects planning units on the map
    Then the area is displayed on the map and as a removable modal

  @happypath
  Scenario: remove lock-in selection
    Given the user is in the Analysis tab
    And the user has selected 'Include areas'
    And the user has added some areas to include
    When the user clicks 'Clear' on a selected areas to include
    Then the selected included area is removed form the map and the modal
