Feature: Add features modal

  @happypath
  Scenario: Open features modal
    Given the user is on the Features tab 1/2
    When the user selects 'Add features +'
    Then the modal to add features opens

  @happypath
  Scenario: Add features from inside platform
    Given the user is on Add features modal (Marxan 06b)
    When the user selects 'Add' on the features he/she wants to add and Saves
    Then the features are added to the Features tab 1/2

  Scenario: Upload features with incorrect shp
    Given the user is on Add features modal (Marxan 06b)
    And the user has an incorrect shapefile
    When the user uploads his/her shp via 'Upload your own features'
    Then the user gets an error message

  Scenario: Upload features with correct shp
    Given the user is on Add features modal (Marxan 06b)
    And the user has a correct shapefile
    When the user uploads his/her shp via 'Upload your own features'
    Then the features are added to the Features tab 1/2

  @happypath
  Scenario: Search features from inside platform with correct keywords
    Given the user is on Add features modal (Marxan 06b)
    When the user uses the search bar and types a keyword that matches a feature
    Then only the features that match the keyword are shown

  Scenario: Search features from inside platform with incorrect keywords
    Given the user is on Add features modal (Marxan 06b)
    When the user uses the search bar and types a keyword that does not matches any feature
    Then no features are shown

