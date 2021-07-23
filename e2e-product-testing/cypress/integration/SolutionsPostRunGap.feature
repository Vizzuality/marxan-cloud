@run_gap_analysis @happypath
Feature: View post-run gap Analysis

  Scenario: Open gap analysis (default view all features, graph)
    Given the user is in Solutions tab
    When the user opens the 'View run gap analysis' modal
    Then the gap analysis displays all the features as a bar graph

  Scenario: Open gap analysis (default view all features, map)
    Given the user is in Solutions tab
    When the user opens the 'View run gap analysis' modal
    Then the gap analysis displays all the features on a map

  Scenario: Gap analysis view selected features
    Given the user has opened the gap analysis
    When the user selects on the open eye icon on the features bar graph
    Then the eye is crossed out and the layer is hidden in the map

  Scenario: Close gap analysis
    Given the user has opened the gap analysis
    When the user clicks on 'Close gap analysis'
    Then the gap analysis is no longer visible
