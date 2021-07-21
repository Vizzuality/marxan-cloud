Feature: cost surface

  Scenario: Upload correct cost surface shp
    Given the user is in Analysis tab
    When the user uploads a correct shapefile for the cost surface
    Then the file appears on the screen

  Scenario: Upload incorrect cost surface shp
    Given the user is in Analysis tab
    When the user uploads an incorrect shapefile for the cost surface
    Then the user receives an error message on screen
