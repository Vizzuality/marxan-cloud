Feature: View pre-run gap Analysis
    Scenario: Open gap analysis (default view all features)
        Given the user is in Analysis tab

        When the user opens the 'View gap Analysis' modal
        Then the gap analysis displays all the features as a bar graph and on map

    Scenario: Gap analysis view selected features
        Given the user has opened the gap analysis 
        When the user selects on the open eye icon on the features bar graph
        Then the eye is crossed out and the layer is hidden in the map
    
    Scenario: Close gap analysis
        Given the user has opened the gap analysis
        When the user clicks on 'Close gap analysis'
        Then the gap analysis is no longer visible

Feature: Download gap analysis
    Scenario: download gap analysis
        Given the user is in the Analysis tab
        When the user clicks on 'Download'
        Then the user downloads a pdf with the gap analysis to his/her local machine